const sharp = require("D:/tmp/proheadshot/node_modules/sharp");
const fs = require("fs");

// A page/tab shape with a note line — legible even at 16px.
const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 128 128">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4f8cff"/>
      <stop offset="100%" stop-color="#2f5fd4"/>
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="26" fill="url(#g)"/>
  <rect x="30" y="26" width="68" height="76" rx="7" fill="#ffffff"/>
  <rect x="42" y="40" width="44" height="7" rx="3.5" fill="#c8d4ea"/>
  <rect x="42" y="55" width="34" height="7" rx="3.5" fill="#c8d4ea"/>
  <rect x="42" y="70" width="44" height="7" rx="3.5" fill="#4f8cff"/>
  <circle cx="94" cy="92" r="18" fill="#ffb020" stroke="#ffffff" stroke-width="5"/>
</svg>`;

(async () => {
  const outDir = "D:/tmp/tabnotes/public/icon";
  fs.mkdirSync(outDir, { recursive: true });
  for (const size of [16, 32, 48, 96, 128]) {
    await sharp(Buffer.from(svg(size)), { density: 400 })
      .resize(size, size)
      .png()
      .toFile(`${outDir}/${size}.png`);
    console.log("wrote", size + ".png");
  }
})();
