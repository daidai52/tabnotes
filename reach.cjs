const { execSync } = require("child_process");

const urls = [
  ["Edge dev portal", "https://partner.microsoft.com/dashboard/microsoftedge/public/login"],
  ["Microsoft partner", "https://partner.microsoft.com/"],
  ["Edge addons store", "https://microsoftedge.microsoft.com/addons/Microsoft-Edge-Extensions-Home"],
  ["login.live.com", "https://login.live.com/"],
  ["github.com (control)", "https://github.com"],
  ["api.github.com (control)", "https://api.github.com"],
];

for (const [name, url] of urls) {
  let line = "?";
  try {
    const r = execSync(
      `curl -sS -m 25 -k -o NUL -w "%{http_code}" -L "${url}" 2>&1`,
      { encoding: "utf8", shell: "cmd.exe" },
    );
    line = r.trim().split("\n").pop();
  } catch (e) {
    line = "ERR: " + String(e.message).split("\n")[0].slice(0, 60);
  }
  console.log(name.padEnd(26), line);
}
