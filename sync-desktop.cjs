/**
 * Keeps the desktop copies byte-identical to .output.
 *
 * A stale zip on the desktop is the easiest way to submit the wrong build, so
 * this compares checksums, copies only what differs, and reports what it did.
 */
const fs = require("fs");
const crypto = require("crypto");
const path = require("path");

const D = "C:/Users/lenovo/Desktop/TabNotes-Screenshots/";
const files = [
  "tabnotes-0.1.1-chrome.zip",
  "tabnotes-0.1.1-firefox.zip",
  "tabnotes-0.1.1-sources.zip",
];

const md5 = (f) => crypto.createHash("md5").update(fs.readFileSync(f)).digest("hex");

if (!fs.existsSync(D)) {
  fs.mkdirSync(D, { recursive: true });
  console.log("created", D);
}

for (const f of files) {
  const src = path.join(".output", f);
  if (!fs.existsSync(src)) {
    console.log(`MISSING in .output: ${f}`);
    continue;
  }
  const dst = path.join(D, f);
  const same = fs.existsSync(dst) && md5(src) === md5(dst);
  if (same) {
    console.log(`unchanged  ${f}`);
  } else {
    fs.copyFileSync(src, dst);
    console.log(`updated    ${f}  (${fs.statSync(dst).size} bytes)`);
  }
}

// Anything left on the desktop that no longer exists in .output is a trap.
const stale = fs
  .readdirSync(D)
  .filter((f) => /^tabnotes-.*\.zip$/.test(f) && !files.includes(f));
for (const f of stale) {
  fs.unlinkSync(path.join(D, f));
  console.log(`removed stale  ${f}`);
}

console.log("\ndesktop zip files now:");
for (const f of fs.readdirSync(D).filter((x) => x.endsWith(".zip"))) {
  console.log(" ", f, fs.statSync(D + f).size, "bytes");
}
