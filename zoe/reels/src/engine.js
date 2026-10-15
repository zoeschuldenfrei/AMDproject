// SUBSTRATE painterly engine.
// createEngine(canvas, opts) paints the heavy layers once, then renderFrame(t) draws any
// moment of Reel 1 as a pure function of time, which is exactly what Remotion needs.
//
// Visual rules (CLAUDE.md): near-black base, two light sources only: toxic green below
// (the Underlayer) and electric cyan above (the Spires). Painterly, tiny silhouettes,
// light that moves like liquid and smoke. Every reel ends: pull back → chip → AMD logo.

export const REEL1_SECONDS = 30;

const DISPLAY = "'Inter Display', Inter, 'Helvetica Neue', Arial, sans-serif";
export const FONTS_TO_LOAD = ["900 100px 'Inter Display'", "800 100px 'Inter Display'", "700 100px 'Inter Display'"];

const CYAN = [46, 230, 255], GREEN = [57, 255, 136], PALE = [233, 247, 245];

function rng(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${clamp(a)})`;
const fade = (t, a, b, f = 0.35) => clamp((t - a) / f) * clamp((b - t) / f);
const makeCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

function text(g, str, x, y, size, weight, color, o = {}) {
  g.save();
  g.font = `${weight} ${size}px ${DISPLAY}`;
  g.letterSpacing = (o.ls || 0) + 'px';
  g.textAlign = o.align || 'center';
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.blur || 30; }
  g.fillStyle = color; g.fillText(str, x, y);
  g.restore();
}

function brush(g, r, x0, y0, w, h, n, light) {
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * w, y = y0 + r() * h, len = 20 + r() * 90, a = (r() - 0.5) * 0.6 + Math.PI / 2;
    g.strokeStyle = light ? `rgba(160,235,235,${0.02 + r() * 0.05})` : `rgba(0,0,0,${0.08 + r() * 0.12})`;
    g.lineWidth = 2 + r() * 7; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
  }
}

// ---------- gothic spires ----------
function spirePoly(x, base, w, h, r) {
  const tiers = 3 + Math.floor(r() * 3), body = h * 0.72, left = [[x - w / 2, base]];
  let y = base, cw = w;
  for (let k = 0; k < tiers; k++) {
    const th = body / tiers * (1.15 - 0.1 * k);
    y -= th;
    const pw = cw * 0.12;
    left.push([x - cw / 2, y], [x - cw / 2 - pw * 0.3, y], [x - cw / 2 + pw * 0.4, y - th * 0.3], [x - cw / 2 + pw, y]);
    cw *= 0.7;
    left.push([x - cw / 2, y]);
  }
  left.push([x - cw * 0.12, y - h * 0.04]);
  const right = left.map(([px, py]) => [2 * x - px, py]).reverse();
  return { pts: [...left, [x, base - h], ...right], bodyTop: y };
}
function tracePoly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }

const WH = 2700; // side-view world height

function drawSpire(g, s, r, haze) {
  const { x, w, h, glass } = s, base = WH;
  const P = spirePoly(x, base, w, h, r);
  if (w > 150) { // side pinnacle + short flying buttresses
    const side = r() < 0.5 ? -1 : 1, px = x + side * w * 0.95, ph = h * 0.38;
    tracePoly(g, spirePoly(px, base, w * 0.28, ph, r).pts); g.fillStyle = '#06080A'; g.fill();
    g.strokeStyle = '#06080A'; g.lineWidth = 10;
    for (const k of [0.75, 0.95]) {
      const y0 = base - ph * k;
      g.beginPath(); g.moveTo(px, y0); g.quadraticCurveTo((px + x) / 2, y0 - 90, x + side * w * 0.32, y0 - 70); g.stroke();
    }
  }
  tracePoly(g, P.pts);
  if (glass) g.fillStyle = 'rgba(14,60,72,0.5)';
  else {
    const gr = g.createLinearGradient(0, base - h, 0, base);
    gr.addColorStop(0, '#0D242B'); gr.addColorStop(0.3, '#07090B'); gr.addColorStop(0.75, '#060807'); gr.addColorStop(1, '#0A1F15');
    g.fillStyle = gr;
  }
  g.fill();
  g.save(); g.clip();
  if (glass) {
    g.strokeStyle = rgba(CYAN, 0.18); g.lineWidth = 2;
    for (let mx = x - w / 2; mx < x + w / 2; mx += 14) { g.beginPath(); g.moveTo(mx, base - h); g.lineTo(mx, base); g.stroke(); }
    const rg = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
    rg.addColorStop(0, rgba(CYAN, 0)); rg.addColorStop(0.3, rgba(CYAN, 0.18)); rg.addColorStop(0.4, rgba(CYAN, 0)); rg.addColorStop(1, rgba(CYAN, 0.08));
    g.fillStyle = rg; g.fillRect(x - w / 2, base - h, w, h);
  }
  brush(g, r, x - w / 2, base - h, w, h, Math.round(w * h / 1800), false);
  brush(g, r, x - w / 2, base - h, w, h * 0.4, Math.round(w * h / 6000), true);
  for (let wy = P.bodyTop + 30; wy < base - 60; wy += 46 + r() * 30) { // lancet windows
    const span = w * (0.35 + 0.65 * clamp((wy - P.bodyTop) / (h * 0.6)));
    for (let wx = x - span / 2 + 10; wx < x + span / 2 - 10; wx += 16 + r() * 10) {
      if (r() < 0.55) continue;
      const ww = 5 + r() * 4, wh = 18 + r() * 22, low = wy > 1900;
      g.fillStyle = rgba(low ? GREEN : CYAN, (low ? 0.25 : 0.35) + r() * 0.5);
      g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx, wy - wh); g.lineTo(wx + ww / 2, wy - wh - ww); g.lineTo(wx + ww, wy - wh); g.lineTo(wx + ww, wy); g.fill();
    }
  }
  if (haze) { g.fillStyle = haze; g.fillRect(x - w, base - h - 10, w * 2, h + 10); }
  g.restore();
  g.save(); g.globalCompositeOperation = 'lighter';
  const rim = g.createLinearGradient(0, base - h, 0, base);
  rim.addColorStop(0, rgba(CYAN, glass ? 0.9 : 0.55)); rim.addColorStop(0.45, rgba(CYAN, 0.04));
  rim.addColorStop(0.8, rgba(GREEN, 0)); rim.addColorStop(1, rgba(GREEN, 0.35));
  g.strokeStyle = rim; g.lineWidth = glass ? 2.5 : 2; tracePoly(g, P.pts); g.stroke();
  g.restore();
}

function spireLayer(width, seed, count, hr, wr, glassP, haze, place) {
  const c = makeCanvas(width, WH), g = c.getContext('2d'), r = rng(seed);
  const n = Math.round(count * width / 1080), items = [];
  let hz = null;
  if (haze) { hz = g.createLinearGradient(0, 0, 0, WH); hz.addColorStop(0, haze[0]); hz.addColorStop(0.55, haze[1]); hz.addColorStop(1, haze[2]); }
  for (let i = 0; i < n; i++) items.push({ x: place ? place(r, i) : -100 + r() * (width + 200), w: lerp(wr[0], wr[1], r()), h: lerp(hr[0], hr[1], r()), glass: r() < glassP });
  items.sort((a, b) => b.h - a.h);
  for (const s of items) drawSpire(g, s, r, hz);
  return c;
}

// ---------- rivers of liquid cyan light ----------
function bez(p, u) {
  const v = 1 - u;
  return [0, 1].map(k => v * v * v * p[0][k] + 3 * v * v * u * p[1][k] + 3 * v * u * u * p[2][k] + u * u * u * p[3][k]);
}
function ribbon(g, pts, mul) {
  for (let k = 0; k < pts.length - 1; k++) {
    g.lineWidth = pts[k][2] * mul;
    g.beginPath(); g.moveTo(pts[k][0], pts[k][1]); g.lineTo(pts[k + 1][0], pts[k + 1][1]); g.stroke();
  }
}
function riverSet(width, seed, n, gap) {
  const r = rng(seed), rivers = [];
  for (let i = 0; i < n; i++) {
    const y0 = 520 + i * gap + r() * 80, ph = r() * 6, w = 20 + r() * 24, pts = [];
    const p = [[-250, y0 + r() * 80], [width * (0.22 + r() * 0.15), y0 - 170 + r() * 80], [width * (0.6 + r() * 0.15), y0 + 150 + r() * 80], [width + 250, y0 - 40 + r() * 100]];
    const steps = Math.round(160 * width / 1080);
    for (let k = 0; k <= steps; k++) { const u = k / steps; pts.push([...bez(p, u), w * (0.55 + 0.45 * Math.sin(u * Math.PI * 3 * width / 1080 + ph))]); }
    rivers.push({ pts, sp: (0.6 + r() * 0.6) * 1080 / width });
  }
  const falls = rivers.slice(0, 2).map(rv => { const q = rv.pts[Math.floor(rv.pts.length * (0.25 + r() * 0.5))]; return { x: q[0], y0: q[1], y1: q[1] + 500 + r() * 400, w: 8 + r() * 8 }; });
  const c = makeCanvas(width, WH), g = c.getContext('2d');
  g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
  g.filter = 'blur(26px)';
  for (const rv of rivers) for (let k = 8; k < rv.pts.length; k += 14) { // volumetric shafts
    const [x, y, w] = rv.pts[k], len = 700 + r() * 600, spread = w * (3 + r() * 3);
    const gr = g.createLinearGradient(0, y, 0, y + len);
    gr.addColorStop(0, rgba(CYAN, 0.08)); gr.addColorStop(1, rgba(CYAN, 0));
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - w, y); g.lineTo(x + w, y); g.lineTo(x + spread, y + len); g.lineTo(x - spread, y + len); g.fill();
  }
  for (const [blur, mul, a] of [[60, 5, 0.06], [20, 2.4, 0.14], [5, 1.4, 0.32]]) {
    g.filter = `blur(${blur}px)`; g.strokeStyle = rgba(CYAN, a);
    for (const rv of rivers) ribbon(g, rv.pts, mul);
    for (const f of falls) { g.lineWidth = f.w * mul; g.beginPath(); g.moveTo(f.x, f.y0); g.lineTo(f.x, f.y1); g.stroke(); }
  }
  g.filter = 'none';
  for (const rv of rivers) {
    g.strokeStyle = rgba(CYAN, 0.6); ribbon(g, rv.pts, 0.8);
    g.strokeStyle = 'rgba(225,253,255,0.7)'; ribbon(g, rv.pts, 0.3);
  }
  for (const f of falls) {
    const gr = g.createLinearGradient(0, f.y0, 0, f.y1);
    gr.addColorStop(0, 'rgba(225,253,255,0.8)'); gr.addColorStop(1, rgba(CYAN, 0));
    g.strokeStyle = gr; g.lineWidth = f.w; g.beginPath(); g.moveTo(f.x, f.y0); g.lineTo(f.x, f.y1); g.stroke();
  }
  return { rivers, glow: c };
}

// ---------- fog and smoke (tileable horizontally) ----------
function cloud(width, seed, count, color, yMin, yRange, rMin, rRange, blur) {
  const c = makeCanvas(width, 900), g = c.getContext('2d'), r = rng(seed);
  g.filter = `blur(${blur}px)`;
  for (let i = 0; i < Math.round(count * width / 1080); i++) {
    const x = r() * width, y = yMin + r() * yRange, rad = rMin + r() * rRange, a = color(r);
    for (const dx of [-width, 0, width]) {
      const rg = g.createRadialGradient(x + dx, y, 0, x + dx, y, rad);
      rg.addColorStop(0, a); rg.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = rg; g.fillRect(x + dx - rad, y - rad, rad * 2, rad * 2);
    }
  }
  g.filter = 'none';
  return c;
}

export function createEngine(cv, opts = {}) {
  const W = opts.W || 1080, H = opts.H || 1920, WW = 1080;
  const ctx = cv.getContext('2d');
  let logo = opts.logo || null;
  const FIG_X = 330, LEDGE_Y = 2140;

  // ---- side-view world (the ledge, the tilt, the pullback) ----
  const sky = (() => {
    const c = makeCanvas(WW, WH), g = c.getContext('2d'), r = rng(9);
    const gr = g.createLinearGradient(0, 0, 0, WH);
    gr.addColorStop(0, '#020304'); gr.addColorStop(0.3, '#061317'); gr.addColorStop(0.55, '#040707');
    gr.addColorStop(0.8, '#05110C'); gr.addColorStop(1, '#0A2416');
    g.fillStyle = gr; g.fillRect(0, 0, WW, WH);
    brush(g, r, 0, 0, WW, WH, 1300, true); brush(g, r, 0, 0, WW, WH, 1300, false);
    return c;
  })();
  const HAZE_FAR = ['rgba(40,110,118,0.62)', 'rgba(16,44,48,0.6)', 'rgba(24,86,58,0.55)'];
  const HAZE_MID = ['rgba(18,58,64,0.4)', 'rgba(6,18,20,0.3)', 'rgba(12,48,32,0.35)'];
  const far = spireLayer(WW, 1, 9, [1400, 2450], [90, 200], 0.25, HAZE_FAR);
  const mid = spireLayer(WW, 2, 6, [1100, 2050], [150, 280], 0.4, HAZE_MID);
  const near = (() => {
    const c = spireLayer(WW, 3, 2, [800, 1500], [220, 340], 0, null, (r, i) => i % 2 ? WW + 40 - r() * 160 : FIG_X + 260 + r() * 200);
    drawSpire(c.getContext('2d'), { x: FIG_X - 310, w: 300, h: 1250, glass: false }, rng(31), null); // the ledge's host spire
    return c;
  })();
  const riv = riverSet(WW, 77, 3, 300);
  const fogDark = cloud(WW, 5, 130, r => `rgba(6,30,18,${0.35 + r() * 0.25})`, 200, 650, 90, 260, 28);
  const fogGlow = cloud(WW, 6, 130, r => rgba(GREEN, 0.08 + r() * 0.08), 200, 650, 90, 260, 28);
  const smoke = cloud(WW, 8, 70, r => rgba(CYAN, 0.05 + r() * 0.06), 100, 700, 120, 300, 34);
  const traces = (() => {
    const c = makeCanvas(WW, 700), g = c.getContext('2d'), r = rng(21);
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 0; i < 60; i++) {
      let x = r() * WW, y = 60 + r() * 600;
      g.strokeStyle = rgba(GREEN, 0.25 + r() * 0.5); g.lineWidth = 2 + r() * 4;
      g.beginPath(); g.moveTo(x, y);
      for (let k = 0; k < 4; k++) {
        if (k % 2) { const d = 40 + r() * 80; x += d; y += (r() < 0.5 ? -1 : 1) * d; } else x += (r() < 0.5 ? -1 : 1) * (60 + r() * 200);
        g.lineTo(x, y);
      }
      g.stroke();
      g.fillStyle = rgba(GREEN, 0.8); g.beginPath(); g.arc(x, y, 5, 0, 7); g.fill();
    }
    return c;
  })();
  const paint = (() => { // hand-painted grain overlay
    const c = makeCanvas(W, H), g = c.getContext('2d'), r = rng(99);
    g.fillStyle = '#808080'; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9000; i++) {
      const x = r() * W, y = r() * H, len = 6 + r() * 40, a = r() * Math.PI;
      g.strokeStyle = r() < 0.5 ? `rgba(255,255,255,${r() * 0.12})` : `rgba(0,0,0,${r() * 0.12})`;
      g.lineWidth = 1 + r() * 3;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len); g.stroke();
    }
    return c;
  })();
  const spores = Array.from({ length: 60 }, (_, i) => { const r = rng(300 + i); return [r() * 6000, 1700 + r() * 900, 0.2 + r() * 0.5, r() * 6]; });
  const drops = Array.from({ length: 36 }, (_, i) => { const r = rng(500 + i); return [r() * 3000, 400 + r() * 700, 300 + r() * 500, r()]; });

  // ---- the Underlayer rooftop run (wide world, horizontal camera) ----
  const RUN_SPEED = 560, RUN_X0 = 260, RUN_T0 = 8, RUN_T1 = 17;
  const RW = RUN_X0 + RUN_SPEED * (RUN_T1 - RUN_T0) + W + 400;
  const roofs = (() => {
    const r = rng(404), out = [];
    let x = -200, y = 1360;
    while (x < RW) { const len = 520 + r() * 420; out.push([x, x + len, y]); x += len + 150 + r() * 90; y = 1360 + (r() - 0.5) * 150; }
    return out;
  })();
  const farRun = spireLayer(Math.round(RW * 0.12 + W + 200), 41, 9, [1500, 2500], [100, 220], 0.25, HAZE_FAR);
  const rivRun = riverSet(Math.round(RW * 0.18 + W + 200), 88, 3, 260);
  const midRun = spireLayer(Math.round(RW * 0.3 + W + 200), 42, 5, [1200, 2000], [160, 300], 0.45, HAZE_MID);
  function house(g, r, x0, x1, top, bottom, rim) { // a gothic Underlayer house: gables, chimneys, green windows
    const w = x1 - x0;
    g.fillStyle = '#050807';
    g.beginPath(); g.moveTo(x0, bottom); g.lineTo(x0, top);
    const gables = Math.max(1, Math.round(w / 220));
    for (let k = 0; k < gables; k++) {
      const a = x0 + (w * k) / gables, b = x0 + (w * (k + 1)) / gables;
      g.lineTo(a, top); g.lineTo((a + b) / 2, top - (b - a) * 0.55); g.lineTo(b, top);
    }
    g.lineTo(x1, bottom); g.closePath(); g.fill();
    for (let k = 0; k < gables; k++) if (r() < 0.6) { // chimneys with heat haze
      const cx = x0 + w * (k + 0.2 + r() * 0.6) / gables;
      g.fillRect(cx, top - 120 - r() * 60, 14 + r() * 10, 160);
    }
    for (let y = top + 30; y < bottom; y += 60) for (let x = x0 + 18; x < x1 - 18; x += 34) {
      if (r() < 0.6) continue;
      g.fillStyle = rgba(GREEN, 0.15 + r() * 0.55);
      g.beginPath(); g.moveTo(x, y + 26); g.lineTo(x, y + 6); g.lineTo(x + 6, y); g.lineTo(x + 12, y + 6); g.lineTo(x + 12, y + 26); g.fill();
    }
    if (rim) { g.save(); g.globalCompositeOperation = 'lighter'; g.strokeStyle = rgba(CYAN, 0.3); g.lineWidth = 2; g.beginPath(); g.moveTo(x0, top); g.lineTo(x1, top); g.stroke(); g.restore(); }
  }
  const underRun = (() => { // mid-distance Underlayer: houses, towers, bridges over chasms
    const width = Math.round(RW * 0.6 + W + 200), c = makeCanvas(width, H), g = c.getContext('2d'), r = rng(51);
    let x = -100;
    const tops = [];
    while (x < width) { const w = 160 + r() * 260, top = 1080 + r() * 200; house(g, r, x, x + w, top, H, false); tops.push([x, x + w, top]); x += w + 60 + r() * 120; }
    g.strokeStyle = '#050807'; g.lineWidth = 8;
    for (let i = 0; i < tops.length - 1; i++) if (r() < 0.5) { // iron bridges
      const a = tops[i], b = tops[i + 1], y = Math.max(a[2], b[2]) + 80;
      g.beginPath(); g.moveTo(a[1] - 10, y); g.quadraticCurveTo((a[1] + b[0]) / 2, y + 50, b[0] + 10, y); g.stroke();
      g.lineWidth = 2; for (let k = a[1]; k < b[0]; k += 14) { g.beginPath(); g.moveTo(k, y + 10); g.lineTo(k, y - 24); g.stroke(); } g.lineWidth = 8;
    }
    const hz = g.createLinearGradient(0, 900, 0, H); hz.addColorStop(0, 'rgba(14,50,34,0.45)'); hz.addColorStop(1, 'rgba(10,40,24,0.25)');
    g.globalCompositeOperation = 'source-atop'; g.fillStyle = hz; g.fillRect(0, 0, width, H);
    return c;
  })();
  const roofRun = (() => { // the rooftops Ren runs along
    const c = makeCanvas(RW, H), g = c.getContext('2d'), r = rng(52);
    for (const [x0, x1, y] of roofs) house(g, r, x0, x1, y, H, true);
    return c;
  })();
  const roofAt = x => roofs.find(([a, b]) => x >= a && x <= b);
  function renPose(t) { // Ren's position along the rooftops, jumping every gap
    const x = RUN_X0 + RUN_SPEED * clamp(t - RUN_T0, 0, RUN_T1 - RUN_T0);
    const on = roofAt(x);
    if (on) return { x, y: on[2], air: false };
    const i = roofs.findIndex(([a]) => a > x), prev = roofs[i - 1], next = roofs[i];
    const u = (x - prev[1]) / (next[0] - prev[1]);
    return { x, y: lerp(prev[2], next[2], u) - Math.sin(u * Math.PI) * 140, air: true };
  }
  function drawRen(x, y, t, air, look = 0) { // tiny running silhouette; look>0 tilts the head up
    const s = 1.1, ph = t * 14;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#010202'; ctx.fillStyle = '#010202'; ctx.lineCap = 'round'; ctx.lineWidth = 6;
    const lean = air ? 0.2 : 0.35, legA = air ? 0.9 : Math.sin(ph) * 0.9, legB = air ? -0.5 : -Math.sin(ph) * 0.9;
    const hip = [0, -30], neck = [Math.sin(lean) * 26, -56];
    for (const a of [legA, legB]) { // legs
      const knee = [hip[0] + Math.sin(a) * 16, hip[1] + Math.cos(a) * 16];
      ctx.beginPath(); ctx.moveTo(...hip); ctx.lineTo(...knee); ctx.lineTo(knee[0] + Math.sin(a - 0.6) * 15, knee[1] + 15); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(...hip); ctx.lineTo(...neck); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(neck[0], neck[1] + 2); ctx.quadraticCurveTo(-24, -40 + Math.sin(ph * 0.5) * 6, -40 - (air ? 10 : 0), -28 + Math.sin(ph) * 6); ctx.lineTo(hip[0] - 4, hip[1]); ctx.fill(); // cloak
    ctx.beginPath(); ctx.arc(neck[0] + 3, neck[1] - 10 - look * 2, 9, 0, 7); ctx.fill(); // hooded head
    ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(CYAN, 0.75); ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(neck[0] + 3, neck[1] - 10 - look * 2, 9, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
    ctx.restore();
  }

  // ---- the chip: the city seen from above IS the die ----
  const PK = 3200, DIES = [[660, 520, 760, 840], [1780, 520, 760, 840], [880, 1520, 1440, 700]];
  const LINKS = [[[1040, 1360], [1040, 1520]], [[2160, 1360], [2160, 1520]], [[1420, 940], [1780, 940]]];
  const pkg = (() => {
    const c = makeCanvas(PK, PK), g = c.getContext('2d'), r = rng(55);
    g.fillStyle = '#06120C'; g.beginPath(); g.roundRect(40, 40, PK - 80, PK - 80, 60); g.fill();
    g.save(); g.clip();
    for (let i = 0; i < 2600; i++) { g.strokeStyle = `rgba(60,170,110,${r() * 0.05})`; g.lineWidth = 2; const y = r() * PK; g.beginPath(); g.moveTo(0, y); g.lineTo(PK, y + (r() - 0.5) * 20); g.stroke(); }
    g.lineCap = 'round';
    for (let i = 0; i < 420; i++) {
      const d = DIES[Math.floor(r() * 3)], side = Math.floor(r() * 4);
      const x = d[0] + r() * d[2], y = d[1] + r() * d[3];
      g.strokeStyle = rgba(GREEN, 0.08 + r() * 0.22); g.lineWidth = 3 + r() * 4;
      const tx = side === 0 ? 120 : side === 1 ? PK - 120 : x + (r() - 0.5) * 600;
      const ty = side === 2 ? 120 : side === 3 ? PK - 120 : y + (r() - 0.5) * 600;
      g.beginPath(); g.moveTo(x, y); g.lineTo((x + tx) / 2, y); g.lineTo(tx, ty); g.stroke();
    }
    g.restore();
    for (let i = 0; i < 60; i++) for (const [x, y] of [[100 + i * 50, 90], [100 + i * 50, PK - 90], [90, 100 + i * 50], [PK - 90, 100 + i * 50]]) { g.fillStyle = '#7E9188'; g.fillRect(x - 10, y - 10, 20, 20); }
    for (const [dx, dy, dw, dh] of DIES) {
      g.save(); g.beginPath(); g.rect(dx, dy, dw, dh); g.clip();
      g.fillStyle = '#030506'; g.fillRect(dx, dy, dw, dh);
      for (let x = dx; x < dx + dw; x += 22) { g.fillStyle = rgba(CYAN, (x - dx) % 110 < 22 ? 0.35 : 0.12); g.fillRect(x, dy, 2, dh); }
      for (let y = dy; y < dy + dh; y += 22) { g.fillStyle = rgba(CYAN, (y - dy) % 110 < 22 ? 0.35 : 0.12); g.fillRect(dx, y, dw, 2); }
      for (let i = 0; i < dw * dh / 260; i++) { const low = r() < 0.25; g.fillStyle = rgba(low ? GREEN : CYAN, 0.2 + r() * 0.6); g.fillRect(dx + r() * dw, dy + r() * dh, 3, 3); }
      g.filter = 'blur(40px)';
      for (let i = 0; i < 6; i++) { g.fillStyle = rgba(GREEN, 0.18); g.beginPath(); g.arc(dx + r() * dw, dy + r() * dh, 80 + r() * 120, 0, 7); g.fill(); }
      g.filter = 'blur(10px)'; g.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 3; i++) { g.strokeStyle = rgba(CYAN, 0.7); g.lineWidth = 10; g.beginPath(); g.moveTo(dx, dy + r() * dh); g.bezierCurveTo(dx + dw * 0.3, dy + r() * dh, dx + dw * 0.7, dy + r() * dh, dx + dw, dy + r() * dh); g.stroke(); }
      g.filter = 'none';
      for (let i = 0; i < dw * dh / 9000; i++) {
        const x = dx + r() * dw, y = dy + r() * dh, rg = g.createRadialGradient(x, y, 0, x, y, 14);
        rg.addColorStop(0, 'rgba(230,255,255,0.95)'); rg.addColorStop(1, rgba(CYAN, 0));
        g.fillStyle = rg; g.fillRect(x - 14, y - 14, 28, 28);
      }
      g.restore();
      g.strokeStyle = rgba(CYAN, 0.8); g.lineWidth = 6; g.strokeRect(dx, dy, dw, dh);
    }
    return c;
  })();

  // ---------- drawing ----------
  function drawFog(cy, t, wy, sp, aDark, aGlow, camX = 0) {
    const x = -(((t * sp + camX) % WW) + WW) % WW, y = wy - cy;
    ctx.globalAlpha = aDark; for (let k = 0; k * WW < W + WW; k++) ctx.drawImage(fogDark, x + k * WW, y);
    ctx.globalCompositeOperation = 'screen'; ctx.globalAlpha = aGlow;
    const x2 = -(((t * sp * 1.3 + camX) % WW) + WW) % WW;
    for (let k = 0; k * WW < W + WW; k++) ctx.drawImage(fogGlow, x2 + k * WW, y - 60);
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
  }
  function drawRiverFlow(rv, t, fr) {
    for (let j = 0; j < 7; j++) {
      const q = rv.pts[Math.floor(((t * rv.sp * 0.07 + j / 7) % 1) * (rv.pts.length - 1))], rad = q[2] * 2.2;
      const rg = ctx.createRadialGradient(q[0], q[1], 0, q[0], q[1], rad);
      rg.addColorStop(0, 'rgba(235,255,255,0.55)'); rg.addColorStop(1, rgba(CYAN, 0));
      ctx.fillStyle = rg; ctx.fillRect(q[0] - rad, q[1] - rad, rad * 2, rad * 2);
    }
    for (let j = 0; j < 8; j++) { const q = rv.pts[Math.floor(fr() * rv.pts.length)]; ctx.fillStyle = 'rgba(240,255,255,0.8)'; ctx.fillRect(q[0] + (fr() - 0.5) * q[2], q[1] + (fr() - 0.5) * q[2] * 0.6, 3, 3); }
  }
  function drawRivers(set, t, fr) {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 0.9 + 0.1 * Math.sin(t * 2); ctx.drawImage(set.glow, 0, 0); ctx.globalAlpha = 1;
    for (const rv of set.rivers) drawRiverFlow(rv, t, fr);
    for (const [x, y, len, ph] of drops) { const u = (t * 0.35 + ph) % 1; ctx.fillStyle = rgba(CYAN, 0.7 * (1 - u)); ctx.fillRect(x % set.glow.width, y + u * len, 2, 10); }
    ctx.restore();
  }
  function drawSmoke(t, y, camX = 0) {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const x = -(((t * 12 + camX) % WW) + WW) % WW;
    for (let k = 0; k * WW < W + WW; k++) ctx.drawImage(smoke, x + k * WW, y);
    ctx.restore();
  }
  function drawSpores(t, cy, camX = 0) {
    for (const [x, y, sp, ph] of spores) {
      const xx = ((x - camX) % 6000 + 6000) % 6000 + Math.sin(t + ph) * 20;
      if (xx > W) continue;
      ctx.fillStyle = rgba(GREEN, 0.5); ctx.fillRect(xx, y - ((t * sp * 120) % 700) - cy * 0.9, 3, 3);
    }
  }

  function drawCity(t, cy, reveal, fr, look) {
    ctx.drawImage(sky, 0, -cy * 0.3);
    ctx.drawImage(far, 0, -cy * 0.45);
    ctx.save(); ctx.translate(0, -cy * 0.55); drawRivers(riv, t, fr); ctx.restore();
    drawSmoke(t, 250 - cy * 0.5);
    drawFog(cy * 0.45, t, 1750, 18, 0.9, 0.9);
    ctx.drawImage(mid, 0, -cy * 0.7);
    drawFog(cy * 0.7, t, 1950, 30, 0.85, 0.8);
    ctx.drawImage(near, 0, -cy);
    if (reveal > 0) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = reveal; ctx.drawImage(traces, 0, 2230 - cy); ctx.restore(); }
    drawFog(cy, t, 2120, 46, 0.8 * (1 - 0.6 * reveal), 0.9);
    drawSpores(t, cy);
    drawLedge(t, cy, look);
  }

  function drawLedge(t, cy, look = 0) {
    const y = LEDGE_Y - cy, x1 = FIG_X - 170, x2 = FIG_X + 60;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.lineTo(x2 + 18, y - 10); ctx.lineTo(x2 + 44, y + 4);
    ctx.lineTo(x2 + 30, y + 24); ctx.lineTo(x2 - 10, y + 34); ctx.lineTo(x1 + 40, y + 120); ctx.lineTo(x1, y + 130); ctx.closePath();
    ctx.fillStyle = '#040505'; ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(CYAN, 0.45); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x1, y); ctx.lineTo(x2, y); ctx.lineTo(x2 + 18, y - 10); ctx.stroke();
    ctx.strokeStyle = rgba(GREEN, 0.35);
    ctx.beginPath(); ctx.moveTo(x2 + 30, y + 24); ctx.lineTo(x2 - 10, y + 34); ctx.lineTo(x1 + 40, y + 120); ctx.stroke();
    ctx.restore();
    // Ren standing at the ledge, cloak lifting in the updraft; hood tilts back when looking up
    const sway = Math.sin(t * 2.2) * 5, fx = FIG_X, fy = y, hx = -look * 4, hy = -look * 3;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(fx - 6 + hx, fy - 50 + hy); ctx.quadraticCurveTo(fx + hx * 2, fy - 66 + hy, fx + 6 + hx, fy - 50 + hy);
    ctx.lineTo(fx + 10, fy - 30); ctx.lineTo(fx + 12, fy);
    ctx.lineTo(fx - 8, fy); ctx.quadraticCurveTo(fx - 20 - sway, fy - 14, fx - 30 - sway * 2, fy - 8 + sway);
    ctx.quadraticCurveTo(fx - 16, fy - 30, fx - 10, fy - 42); ctx.closePath();
    ctx.fillStyle = '#010202'; ctx.fill();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = rgba(CYAN, 0.8); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(fx - 6 + hx, fy - 50 + hy); ctx.quadraticCurveTo(fx + hx * 2, fy - 66 + hy, fx + 6 + hx, fy - 50 + hy); ctx.lineTo(fx + 10, fy - 30); ctx.stroke();
    ctx.strokeStyle = rgba(GREEN, 0.5);
    ctx.beginPath(); ctx.moveTo(fx - 8, fy); ctx.quadraticCurveTo(fx - 20 - sway, fy - 14, fx - 30 - sway * 2, fy - 8 + sway); ctx.stroke();
    ctx.restore();
  }

  function drawRun(t, fr) {
    const p = renPose(t), camX = p.x - 360;
    let g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#020405'); g.addColorStop(0.35, '#061418'); g.addColorStop(0.65, '#050A08'); g.addColorStop(1, '#0A2416');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(farRun, -camX * 0.12, -900);
    ctx.save(); ctx.translate(-camX * 0.18, -320); drawRivers(rivRun, t, fr); ctx.restore();
    drawSmoke(t, -80, camX * 0.2);
    ctx.drawImage(midRun, -camX * 0.3, -780);
    drawFog(0, t, 760, 20, 0.85, 0.9, camX * 0.45);
    ctx.drawImage(underRun, -camX * 0.6, 0);
    drawFog(0, t, 1080, 36, 0.6, 1.0, camX * 0.8); // glow rising out of the chasms
    ctx.drawImage(roofRun, -camX, 0);
    drawRen(p.x - camX, p.y, t, p.air);
    drawFog(0, t, 1380, 60, 0.55, 0.7, camX * 1.3);
    drawSpores(t, 900, camX);
  }

  function drawChip(t, s, cx, cy) {
    ctx.fillStyle = '#020303'; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(s * 0.5, s * 0.5); ctx.translate(-cx * 2, -cy * 2);
    ctx.shadowColor = rgba(GREEN, 0.25); ctx.shadowBlur = 120;
    ctx.drawImage(pkg, 0, 0);
    ctx.shadowBlur = 0;
    if (logo) { // official AMD logo from reels/public/amd-logo.png
      const lw = 1100, lh = lw * logo.height / logo.width;
      ctx.drawImage(logo, PK / 2 - lw / 2, 2780 - lh / 2, lw, lh);
    } else { // ✏️ placeholder until the official logo file is added
      text(ctx, 'AMD', PK / 2, 2880, 300, 900, '#E6ECE8', { ls: 10 });
    }
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const [[x0, y0], [x1, y1]] of LINKS) {
      ctx.strokeStyle = rgba(CYAN, 0.9); ctx.lineWidth = 14; ctx.setLineDash([30, 50]); ctx.lineDashOffset = -t * 300;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    }
    ctx.setLineDash([]);
    ctx.restore();
  }

  // title-card type: bold, wide, glowing
  function card(str, y, a, size = 58, color = PALE, glowC = CYAN, ls = 12) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 18);
    text(ctx, str, W / 2, y, size, 800, rgba(color), { ls, glow: rgba(glowC, 0.7), blur: 26 });
    ctx.restore();
  }

  const small = makeCanvas(W / 4, H / 4), sctx = small.getContext('2d');
  function finish(fr) {
    sctx.clearRect(0, 0, small.width, small.height);
    sctx.filter = 'blur(6px)'; sctx.drawImage(cv, 0, 0, small.width, small.height); sctx.filter = 'none';
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.35; ctx.drawImage(small, 0, 0, W, H); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.55; ctx.drawImage(paint, 0, 0); ctx.restore();
    const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 1200; i++) { ctx.fillStyle = fr() < 0.5 ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.08)'; ctx.fillRect(fr() * W, fr() * H, 2, 2); }
  }

  // ---------- Reel 1: "Every city runs on something." (30s) ----------
  // 0–2.5 hook type · 2.5–8 tilt from the Spires to the Underlayer · 8–17 Ren runs the rooftops
  // 17–21 Ren at the ledge, looking up · 21–25 pullback: city → die → chip → AMD · 25–30 title card
  function renderFrame(t) {
    const fr = rng(Math.floor(t * 30) * 7919 + 13);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'; ctx.filter = 'none';
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);

    if (t < 2.5) {
      const u = clamp(t / 1.6), y = lerp(-40, 1500, u * u); // a drop of cyan light falls through the dark
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = rgba(CYAN, 0.9); ctx.lineWidth = 6; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(W / 2, y - 140 * u); ctx.lineTo(W / 2, y); ctx.stroke();
      if (t > 1.6) { const k = (t - 1.6) / 0.9; ctx.strokeStyle = rgba(GREEN, 0.8 * (1 - k)); ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(W / 2, 1500, 40 + k * 460, 8 + k * 60, 0, 0, 7); ctx.stroke(); }
      ctx.restore();
      const out = clamp((2.5 - t) / 0.3);
      card('EVERY CITY', 820, Math.min(1, 0.7 + t * 3) * out, 104, PALE, CYAN, 14);
      card('RUNS ON', 940, clamp((t - 0.45) / 0.25) * out, 104, PALE, CYAN, 14);
      card('SOMETHING.', 1060, clamp((t - 0.9) / 0.25) * out, 104, GREEN, GREEN, 14);
    } else if (t < 8) {
      const u = ease(clamp((t - 2.5) / 5.5)), cy = lerp(0, 640, u), z = lerp(1.0, 1.05, u);
      ctx.save(); ctx.translate(540, 1500); ctx.scale(z, z); ctx.translate(-540, -1500);
      drawCity(t, cy, 0, fr, 0);
      ctx.restore();
      ctx.fillStyle = `rgba(0,0,0,${clamp((3.0 - t) / 0.5)})`; ctx.fillRect(0, 0, W, H);
      card('THE SPIRES', 260, fade(t, 3.0, 5.0), 56, PALE, CYAN);
      card('THE UNDERLAYER', 1720, fade(t, 5.6, 7.8), 56, PALE, GREEN);
    } else if (t < 17) {
      drawRun(t, fr);
      ctx.fillStyle = `rgba(0,0,0,${clamp((8.25 - t) / 0.25)})`; ctx.fillRect(0, 0, W, H);
      card('REN', 300, fade(t, 9.2, 12.0), 150, PALE, CYAN, 40);
      card('COURIER · THE UNDERLAYER', 380, fade(t, 9.5, 12.0), 34, GREEN, GREEN, 8);
      card('HOT. SLOW. STUCK.', 300, fade(t, 13.0, 16.6), 60, PALE, GREEN);
    } else if (t < 21) {
      const z = lerp(1.05, 2.7, ease(clamp((t - 17) / 1.3)));
      ctx.save(); ctx.translate(540, 1500); ctx.scale(z, z); ctx.translate(-lerp(540, FIG_X, clamp((z - 1) / 1.7)), -1500);
      drawCity(t, 640, clamp((t - 19.6) / 0.9), fr, clamp((t - 17.8) / 0.6));
      ctx.restore();
      ctx.fillStyle = `rgba(0,0,0,${clamp((17.2 - t) / 0.2)})`; ctx.fillRect(0, 0, W, H);
      card('REN CAN SEE THE CURRENT.', 300, fade(t, 17.6, 20.8), 52);
    } else if (t < 25) {
      const a = clamp((t - 21) / 0.7);
      if (t < 22.1) {
        const z = lerp(2.7, 1.0, easeOut(a)), cy = lerp(640, 200, easeOut(a));
        ctx.save(); ctx.filter = `blur(${Math.round(a * 10)}px)`; ctx.translate(540, 1500); ctx.scale(z, z); ctx.translate(-lerp(540, FIG_X, clamp((z - 1) / 1.7)), -1500);
        drawCity(t, cy, 1 - a, fr, 1);
        ctx.restore();
      }
      const b = clamp((t - 21.5) / 0.6);
      if (b > 0) {
        const p = ease(clamp((t - 21.5) / 3.0)), s = 5.5 * Math.pow(0.5 / 5.5, p);
        ctx.save(); ctx.globalAlpha = b; drawChip(t, s, lerp(520, 800, p), lerp(470, 800, p)); ctx.restore();
      }
      card('EVERY CITY RUNS ON SOMETHING.', 300, fade(t, 22.4, 25.4), 50);
    } else {
      drawChip(t, 0.5 * (1 - 0.03 * clamp((t - 25) / 5)), 800, 800);
      const e = easeOut(clamp((t - 25.3) / 0.8));
      ctx.save(); ctx.globalAlpha = e; ctx.translate(0, (1 - e) * 30);
      text(ctx, 'SUBSTRATE', W / 2, 330, 124, 900, rgba(PALE), { ls: 24, glow: rgba(CYAN, 0.9), blur: 40 });
      text(ctx, 'THE CITY IS INSIDE THE CHIP', W / 2, 410, 32, 700, rgba(CYAN), { ls: 8 });
      ctx.strokeStyle = rgba(GREEN, 0.9); ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(290, 1560, 500, 90, 45); ctx.stroke();
      text(ctx, 'FIND THE CITY →', W / 2, 1618, 38, 800, rgba(GREEN), { ls: 4 });
      text(ctx, 'AN ANIMATED SERIES · COMING SOON', W / 2, 1740, 28, 700, 'rgba(233,247,245,0.7)', { ls: 6 });
      ctx.restore();
      card('EVERY CITY RUNS ON SOMETHING.', 300, clamp((25.4 - t) / 0.4), 50);
    }
    finish(fr);
    if (t > 29.4) { ctx.fillStyle = `rgba(0,0,0,${clamp((t - 29.4) / 0.6)})`; ctx.fillRect(0, 0, W, H); }
  }

  return { renderFrame, setLogo: img => { logo = img; } };
}
