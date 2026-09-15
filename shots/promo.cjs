/**
 * Renders the 440x280 Chrome Web Store / Edge "small promo tile".
 * Same trick as render.cjs: oversize the window, then crop to exact pixels.
 */
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const CHROME =
  "C:\\Users\\lenovo\\AppData\\Local\\Google\\Chrome\\Application\\chrome.exe";
const OUT = __dirname;

const W = 440;
const H = 280;
const FRAME_W = 22;
const FRAME_H = 98;

const html = `<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="../entrypoints/sidepanel/style.css">
<style>
  :root{
    --bg:#0f1115; --bg-card:#171a21; --border:#262b36;
    --text:#e6e9ef; --text-muted:#8b93a7; --accent:#4f8cff; --star:#ffb020;
  }
  html,body{width:${W}px;height:${H}px;margin:0;overflow:hidden}
  body{
    position:relative; color:#e8ecf4;
    font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif;
    background:
      radial-gradient(420px 260px at 82% 8%, #1e2a44 0%, transparent 66%),
      #0b0e14;
  }
  .mark{position:absolute; left:30px; top:52px; display:flex; align-items:center; gap:11px}
  .mark img{width:38px; height:38px; border-radius:9px}
  .mark span{font-size:26px; font-weight:800; letter-spacing:-.03em}
  h1{position:absolute; left:30px; top:112px; margin:0;
     font-size:21px; line-height:1.3; letter-spacing:-.025em; font-weight:700; width:250px}
  h1 em{font-style:normal; color:#4f8cff}
  p{position:absolute; left:30px; top:196px; margin:0;
    font-size:11.5px; color:#8b95a7; width:250px; line-height:1.5}

  /* a sliver of the real panel, bleeding off the right edge */
  .peek{position:absolute; right:0; top:0; width:130px; height:280px;
        background:var(--bg); border-left:1px solid #262b36;
        display:flex; flex-direction:column; gap:6px; padding:10px 9px;
        box-shadow:-14px 0 40px rgba(0,0,0,.6)}
  .p{background:var(--bg-card); border:1px solid var(--border); border-radius:7px; padding:7px 8px}
  .p.now{border-color:var(--accent); background:rgba(79,140,255,.09)}
  .t{font-size:9.5px; font-weight:600; margin-bottom:3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
  .n{font-size:8.5px; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis}
  .bar{height:22px; border-radius:6px; background:var(--accent); margin-top:5px;
       display:flex; align-items:center; justify-content:center;
       font-size:10px; font-weight:700; color:#fff}
  .bar.ghost{background:var(--bg-card); border:1px solid var(--border); color:var(--text-muted)}
</style></head>
<body>
  <div class="mark"><img src="icon-mark.png" alt=""><span>TabNotes</span></div>
  <h1>Give every tab a note.<br><em>Find it by why.</em></h1>
  <p>Search what you wrote, not what the page was called.</p>

  <div class="peek">
    <div class="p now">
      <div class="t">Competitor Pricing</div>
      <div class="n">cite in Thursday deck</div>
    </div>
    <div class="p"><div class="t">wxt-dev/wxt</div><div class="n">bug repro after deploy</div></div>
    <div class="p"><div class="t">Cake recipe</div><div class="n">halve the sugar</div></div>
    <div class="p"><div class="t">Figma — Dashboard</div><div class="n">hand off to Chen</div></div>
    <div class="bar">Save</div>
    <div class="bar ghost">Sessions</div>
  </div>
</body></html>`;

fs.writeFileSync(path.join(OUT, "promo.html"), html, "utf8");
fs.copyFileSync(
  path.join(OUT, "..", "public", "icon", "128.png"),
  path.join(OUT, "icon-mark.png"),
);

const raw = path.join(OUT, "_raw-promo.png");
execFileSync(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--force-color-profile=srgb",
    `--window-size=${W + FRAME_W},${H + FRAME_H}`,
    `--screenshot=${raw}`,
    "--allow-file-access-from-files",
    "--virtual-time-budget=3000",
    "file:///" + path.join(OUT, "promo.html").replace(/\\/g, "/"),
  ],
  { stdio: "ignore" },
);

(async () => {
  const meta = await sharp(raw).metadata();
  await sharp(raw)
    .extract({ left: 0, top: 0, width: W, height: H })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, "promo-440x280.png"));
  fs.unlinkSync(raw);
  fs.unlinkSync(path.join(OUT, "icon-mark.png"));
  console.log(`promo: ${meta.width}x${meta.height} -> ${W}x${H}`);
})();
