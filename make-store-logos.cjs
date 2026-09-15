/**
 * Edge wants a 300x300 store logo per language. The 512 icon resizes cleanly.
 */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const D = "C:/Users/lenovo/Desktop/TabNotes-Screenshots/";
const SRC = path.join(D, "icon-512.png");

(async () => {
  const meta = await sharp(SRC).metadata();
  console.log("source:", meta.width + "x" + meta.height);

  const out = path.join(D, "store-logo-300.png");
  await sharp(SRC).resize(300, 300).png({ compressionLevel: 9 }).toFile(out);
  console.log("wrote store-logo-300.png", fs.statSync(out).size, "bytes");

  console.log("\n--- all PNGs on the desktop ---");
  for (const f of fs.readdirSync(D).filter((x) => x.endsWith(".png"))) {
    const m = await sharp(D + f).metadata();
    console.log(" ", f.padEnd(26), m.width + "x" + m.height);
  }
  console.log("--- icon/ subfolder ---");
  for (const f of fs.readdirSync(path.join(D, "icon"))) {
    const m = await sharp(path.join(D, "icon", f)).metadata();
    console.log(" ", ("icon/" + f).padEnd(26), m.width + "x" + m.height);
  }
})();
