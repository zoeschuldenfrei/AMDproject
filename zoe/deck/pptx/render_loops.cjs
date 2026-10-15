// Renders the three seamless background loops to MP4 + a poster frame each.
// Usage: NODE_PATH="$(npm root -g)" node render_loops.cjs
const { chromium } = require('playwright');
const { execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');

const here = __dirname, out = path.join(here, 'media');
const FPS = 30, SECONDS = 8;
const keyart = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(here, '..', 'keyart.jpg')).toString('base64');

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(here, 'bg-loops.html'));
  await page.waitForFunction(() => window.ready);
  for (const mode of ['strands', 'title', 'close']) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'loop-'));
    await page.evaluate(([m, a]) => window.setup(m, m === 'strands' ? null : a), [mode, keyart]);
    for (let i = 0; i < FPS * SECONDS; i++) {
      const b64 = await page.evaluate(t => { window.frame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.92).split(',')[1]; }, i / FPS);
      fs.writeFileSync(path.join(tmp, `f${String(i).padStart(4, '0')}.jpg`), Buffer.from(b64, 'base64'));
    }
    const mp4 = path.join(out, `bg-${mode}.mp4`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, 'f%04d.jpg'),
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '27', '-preset', 'slow', '-an', '-movflags', '+faststart', mp4]);
    fs.copyFileSync(path.join(tmp, 'f0000.jpg'), path.join(out, `bg-${mode}.jpg`));
    fs.rmSync(tmp, { recursive: true });
    console.log('rendered', mp4, (fs.statSync(mp4).size / 1e6).toFixed(1) + ' MB');
  }
  await browser.close();
})();
