/**
 * Renders each shot HTML with headless Chrome, then crops to exactly 1280x800.
 *
 * Chrome's --window-size includes the window frame, so the actual viewport
 * comes out smaller than requested (1258x702 on this machine) and the rest of
 * the PNG is padded with black. Opening a larger window and cropping back to
 * 1280x800 gives a pixel-exact store image.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CHROME =
  "C:\\Users\\lenovo\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";
const OUT = __dirname;

// Window frame overhead measured on this machine: viewport = window - 22x98.
const FRAME_W = 22;
const FRAME_H = 98;
const W = 1280;
const H = 800;

const shots = ["1-notes", "2-search", "3-edit", "4-sessions"];
const sharp = require("sharp");

(async () => {
  for (const name of shots) {
    const html = path.join(OUT, `shot-${name}.html`);
    const raw = path.join(OUT, `_raw-${name}.png`);
    const final = path.join(OUT, `shot-${name}.png`);

    execFileSync(
      CHROME,
      [
        "--headless=new",
        "--disable-gpu",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        "--force-color-profile=srgb",
        "--default-background-color=0b0e14ff",
        `--window-size=${W + FRAME_W},${H + FRAME_H}`,
        `--screenshot=${raw}`,
        "--allow-file-access-from-files",
        "--virtual-time-budget=4000",
        "file:///" + html.replace(/\\/g, "/"),
      ],
      { stdio: "ignore" },
    );

    const meta = await sharp(raw).metadata();
    if (meta.width < W || meta.height < H) {
      throw new Error(
        `${name}: rendered ${meta.width}x${meta.height}, need at least ${W}x${H}`,
      );
    }
    await sharp(raw)
      .extract({ left: 0, top: 0, width: W, height: H })
      .png({ compressionLevel: 9 })
      .toFile(final);
    fs.unlinkSync(raw);

    const size = fs.statSync(final).size;
    console.log(`${name}: ${meta.width}x${meta.height} -> ${W}x${H}  ${(size / 1024).toFixed(1)} kB`);
  }
  console.log("\nall shots are exactly 1280x800");
})();
