/**
 * Builds both store packages, then verifies the artifacts the way a store
 * reviewer would.
 *
 *   node verify.cjs
 *
 * Runs Mozilla's own validator (web-ext lint) against the Firefox build, which
 * is the same check AMO runs on upload, and asserts the manifest invariants
 * that submissions have been rejected for before.
 */
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const out = (cmd, opts = {}) =>
  execSync(cmd, { encoding: "utf8", maxBuffer: 20 * 1024 * 1024, ...opts });

const fail = [];
const note = (ok, label, detail = "") => {
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${label}${detail ? "  " + detail : ""}`);
  if (!ok) fail.push(label);
};

console.log("=== building ===\n");

// Windows keeps a handle on a zip that was just copied or read, and WXT fails
// with a bare UNKNOWN error rather than retrying. Clear the previous artifacts
// first so the build is repeatable.
for (const f of fs.readdirSync(".output").filter((x) => x.endsWith(".zip"))) {
  try {
    fs.unlinkSync(path.join(".output", f));
  } catch {
    /* locked; the build below will report it */
  }
}

for (const cmd of ["npx wxt zip", "npx wxt zip -b firefox"]) {
  const hits = out(cmd + " 2>&1")
    .split("\n")
    .filter((l) => /\.zip|ERROR|×/i.test(l));
  console.log(hits.map((l) => "  " + l.trim()).join("\n"));
}

const version = JSON.parse(fs.readFileSync("package.json", "utf8")).version;
const zips = fs
  .readdirSync(".output")
  .filter((f) => f.endsWith(".zip"))
  .sort();

console.log(`\n=== artifacts (v${version}) ===\n`);
for (const f of zips) {
  console.log(`  ${f.padEnd(34)} ${fs.statSync(path.join(".output", f)).size} bytes`);
}

const ff = zips.find((f) => f.includes("firefox") && !f.includes("sources"));
const cr = zips.find((f) => f.includes("chrome"));
const src = zips.find((f) => f.includes("sources"));

console.log("\n=== manifest invariants ===\n");

const ffManifest = JSON.parse(out(`unzip -p ".output/${ff}" manifest.json`));
const gecko = ffManifest.browser_specific_settings.gecko;

note(ffManifest.version === version, "manifest version matches package.json", ffManifest.version);
note(
  !!gecko?.id,
  "gecko id present (AMO rejects unsigned submissions without it)",
  gecko?.id,
);
note(
  JSON.stringify(gecko?.data_collection_permissions) === '{"required":["none"]}',
  'data_collection_permissions is exactly required:["none"]',
);
note(
  !ffManifest.permissions.includes("sidePanel"),
  "no sidePanel permission in the Firefox build",
  ffManifest.permissions.join("+"),
);
note(!!ffManifest.sidebar_action, "sidebar_action present for Firefox");

const crManifest = JSON.parse(out(`unzip -p ".output/${cr}" manifest.json`));
note(crManifest.manifest_version === 3, "Chrome build is MV3");
note(crManifest.permissions.includes("sidePanel"), "Chrome build declares sidePanel");

console.log("\n=== background script ===\n");
const bg = out(`unzip -p ".output/${ff}" background.js`);
note(/sidebarAction/.test(bg), "Firefox background references sidebarAction");
note(/onClicked/.test(bg), "Firefox toolbar icon has a click listener bound");

console.log("\n=== web-ext lint (the validator AMO runs) ===\n");
let j;
try {
  const raw = out(
    "npx --yes web-ext lint --source-dir=.output/firefox-mv2 --output=json 2>&1",
    { stdio: ["ignore", "pipe", "ignore"] },
  );
  j = JSON.parse(raw.slice(raw.indexOf("{")));
} catch (e) {
  j = JSON.parse((e.stdout || "{}").slice((e.stdout || "").indexOf("{")));
}
note(j.errors.length === 0, "zero validator errors", `(${j.errors.length})`);
j.errors.forEach((m) => console.log("        •", m.code, "|", String(m.message).slice(0, 160)));

const manWarn = j.warnings.filter((m) => /MIN_VERSION/.test(m.code));
note(
  manWarn.length === 0,
  "no manifest-key / strict_min_version warnings",
  `(${manWarn.length})`,
);
const unsafe = j.warnings.filter((m) => m.code === "UNSAFE_VAR_ASSIGNMENT");
console.log(
  `  note  ${unsafe.length} UNSAFE_VAR_ASSIGNMENT warning(s) from React internals — expected, ignore`,
);

console.log("\n=== sources archive ===\n");
if (src) {
  const list = out(`unzip -l ".output/${src}"`);
  const junk = list.split("\n").filter((l) => /\.log|ziplog|node_modules/i.test(l));
  note(junk.length === 0, "no build logs or node_modules in the sources zip");
  note(/package-lock\.json/.test(list), "package-lock.json included (reproducible install)");
  note(/wxt\.config\.ts/.test(list), "wxt.config.ts included (build config)");

  // The reviewer builds from this archive. If it lags the shipped bundle, the
  // rebuild will not match what was submitted and the version is rejected.
  const srcRead = (f) => {
    try {
      return out(`unzip -p ".output/${src}" "${f}"`);
    } catch {
      return "";
    }
  };
  const srcHas = (f, needle) => srcRead(f).includes(needle);
  note(/from "\.\/browser"/.test(srcRead("lib/storage.ts")), "sources: storage uses the browser module");
  note(/from "\.\/browser"/.test(srcRead("lib/tabs.ts")), "sources: tabs uses the browser module");
  note(
    !/await chrome\.(tabs|storage)\./.test(srcRead("lib/storage.ts") + srcRead("lib/tabs.ts")),
    "sources: no bare chrome.* call sites remain",
  );
  note(
    srcHas("wxt.config.ts", 'strict_min_version: "142.0"'),
    "sources: strict_min_version matches the shipped manifest",
  );
  note(srcHas("package.json", `"version": "${version}"`), "sources: version matches");
} else {
  note(false, "sources zip produced");
}

console.log("\n" + "=".repeat(52));
if (fail.length) {
  console.log(`${fail.length} CHECK(S) FAILED:`);
  fail.forEach((f) => console.log("  •", f));
  process.exit(1);
}
console.log(`all checks passed — v${version} is ready to submit`);
