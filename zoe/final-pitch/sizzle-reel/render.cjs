// Steps reel04-flicker.html frame by frame in headless Chromium and saves JPEG frames.
// Usage: NODE_PATH="$(npm root -g)" node render.cjs <html> <outDir> [fps] [seconds]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const [, , htmlPath, outDir, fps = '30', seconds = '15'] = process.argv;
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.resolve(htmlPath) + '?render');
  await page.evaluate(() => document.fonts.ready);
  const n = Math.round(Number(fps) * Number(seconds));
  for (let i = 0; i < n; i++) {
    const b64 = await page.evaluate(([i, fps]) => {
      window.renderFrame(i / fps);
      return document.getElementById('c').toDataURL('image/jpeg', 0.95).split(',')[1];
    }, [i, Number(fps)]);
    fs.writeFileSync(path.join(outDir, `f${String(i).padStart(4, '0')}.jpg`), Buffer.from(b64, 'base64'));
  }
  await browser.close();
  console.log(`rendered ${n} frames to ${outDir}`);
})();
