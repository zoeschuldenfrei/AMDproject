// Builds SUBSTRATE.pptx: looping MP4 backgrounds, the reel as video, editable text on top.
// Run: node build_pptx.js && python3 postprocess.py   (postprocess adds autoplay/loop + Morph/Fade)
const path = require('path');
const fs = require('fs');
const pptxgen = require('pptxgenjs');

const here = __dirname, M = p => path.join(here, 'media', p);
const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in  (web deck px / 144 = inches, px * 0.5 = pt)
pres.title = 'SUBSTRATE: AMD Creative Pathways Final Pitch';
pres.author = 'Zoe Schuldenfrei, Nicholas Moffatt, Michael Badillo-Sanchez, Arnoldo Garza Cortes';

const THEME = {
  name: 'SUBSTRATE',
  headFontFace: 'Arial', bodyFontFace: 'Arial',
  colors: {
    dk1: '000000', lt1: 'E9F7F5', dk2: '020808', lt2: '9FB8B4',
    accent1: '2EE6FF', accent2: '39FF88', accent3: '1B1D1F', accent4: 'D9DCDF', accent5: '0A3A44', accent6: '0A3420',
    hlink: '2EE6FF', folHlink: '39FF88',
  },
};
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const INK = C.background1, MUTED = C.background2, CYAN = C.accent1, GREEN = C.accent2;
const px = v => v / 144; // web-deck pixels → inches

const b64 = (file, mime) => `${mime};base64,` + fs.readFileSync(file).toString('base64');
const POSTER = { strands: b64(M('bg-strands.jpg'), 'image/jpeg'), title: b64(M('bg-title.jpg'), 'image/jpeg'), close: b64(M('bg-close.jpg'), 'image/jpeg') };
const LOGO = b64(path.join(here, '..', '..', 'assets', 'amd-logo-white.png'), 'image/png');
const SUBSTER = b64(path.join(here, '..', 'subster.jpg'), 'image/jpeg');
const REEL = path.join(here, '..', '..', 'out', 'substrate-reel-15s.mp4');
const REEL_POSTER = b64(M('reel-poster.jpg'), 'image/jpeg');

// ---------- layouts ----------
pres.defineSlideMaster({ // content: eyebrow + title at fixed positions
  title: 'SUB_CONTENT',
  background: { color: '000000' },
  objects: [
    { placeholder: { options: { name: 'eyebrow', type: 'body', x: px(140), y: px(110), w: px(1640), h: 0.4, fontSize: 12, bold: true, charSpacing: 5, color: CYAN, margin: 0, valign: 'bottom', align: 'left' }, text: '' } },
    { placeholder: { options: { name: 'title', type: 'title', x: px(140), y: px(170), w: px(1640), h: 1.0, fontSize: 44, bold: true, color: INK, margin: 0, valign: 'top', align: 'left' }, text: '' } },
  ],
});
pres.defineSlideMaster({ title: 'SUB_STATEMENT', background: { color: '000000' }, objects: [] });
pres.defineSlideMaster({ title: 'SUB_ORIGINAL', background: { color: '1B1D1F' }, objects: [] }); // the "before": deliberately flat grey

// ---------- helpers ----------
function bg(slide, kind) { // full-bleed looping video background (autoplay + loop added in postprocess)
  slide.addMedia({ type: 'video', path: M(`bg-${kind}.mp4`), x: 0, y: 0, w: 13.333, h: 7.5, cover: POSTER[kind] });
}
function text(slide, runs, o) {
  slide.addText(runs, Object.assign({ isTextBox: true, margin: 0, fontFace: 'Arial', color: INK, valign: 'top' }, o));
}
function card(slide, name, x, y, w, h, line = CYAN) {
  slide.addShape(pres.shapes.RECTANGLE, { objectName: name, x, y, w, h, fill: { color: '020808', transparency: 8 }, line: { color: line, width: 1, transparency: 55 } });
}
const fill = (slide, eyebrow, titleRuns) => {
  slide.addText(eyebrow.toUpperCase(), { placeholder: 'eyebrow' });
  if (titleRuns) slide.addText(titleRuns, { placeholder: 'title' });
};

// ---------- 1 · Title ----------
pres.addSection({ title: 'Opening' });
let s = pres.addSlide({ masterName: 'SUB_STATEMENT', sectionTitle: 'Opening' });
bg(s, 'title');
s.addImage({ data: LOGO, x: px(140), y: px(70), w: px(210), h: px(210) * 134 / 334, objectName: 'AMD logo' });
text(s, 'AMD CREATIVE PATHWAYS · FINAL PITCH', { x: px(140), y: px(380), w: 9, h: 0.4, fontSize: 12, bold: true, charSpacing: 8, color: CYAN, objectName: 'Eyebrow' });
text(s, 'SUBSTRATE', { x: px(140), y: px(430), w: 11, h: 1.6, fontSize: 100, bold: true, charSpacing: 18, glow: { size: 18, opacity: 0.45, color: '2EE6FF' }, objectName: 'Series title' });
text(s, [{ text: 'EVERY CITY RUNS ON ' }, { text: 'SOMETHING.', options: { color: GREEN } }], { x: px(140), y: 4.8, w: 10, h: 0.6, fontSize: 22, bold: true, charSpacing: 5, objectName: 'Tagline' });
text(s, 'ZOE SCHULDENFREI · NICHOLAS MOFFATT · MICHAEL BADILLO-SANCHEZ · ARNOLDO GARZA CORTES', { x: px(140), y: px(940), w: 11.5, h: 0.35, fontSize: 11, charSpacing: 2, color: MUTED, objectName: 'Team' });
s.addNotes('0:00–0:20. Open on the title. "Every city runs on something." Introduce the team.');

// ---------- 2 · The Original ----------
pres.addSection({ title: 'Before' });
s = pres.addSlide({ masterName: 'SUB_ORIGINAL', sectionTitle: 'Before' });
text(s, 'THE ORIGINAL', { x: px(140), y: px(180), w: 6, h: 0.4, fontSize: 12, bold: true, charSpacing: 8, color: '9A9FA5' });
text(s, '“AMD Powers What’s Next”', { x: px(140), y: px(230), w: 11, h: 1.0, fontSize: 46, bold: true, color: C.accent4 });
const orig = [['Format', 'One 2-minute corporate brand video'], ['Content', 'Exec interviews, offices, beauty shots, stock AI imagery'], ['Audience', 'Everyone at once'], ['Voice', 'Inspirational music, confident voice-over'], ['CTA', '“Visit AMD.com”'], ['Success', 'Views, engagement, sentiment']];
orig.forEach(([k, v], i) => {
  const col = i % 2, row = Math.floor(i / 2), x = px(140) + col * 5.7, y = px(420) + row * 0.95;
  s.addShape(pres.shapes.LINE, { x, y, w: 5.3, h: 0, line: { color: '5A5F65', width: 0.75 } });
  text(s, k.toUpperCase(), { x, y: y + 0.18, w: 1.5, h: 0.4, fontSize: 14, bold: true, charSpacing: 3, color: C.accent4 });
  text(s, v, { x: x + 1.6, y: y + 0.18, w: 3.7, h: 0.7, fontSize: 15, color: '9A9FA5' });
});
s.addNotes('0:20–0:45. The brief was polished and optimistic, but swap the logo and it could be any tech company.');

// ---------- 3 · What Was Wrong ----------
s = pres.addSlide({ masterName: 'SUB_CONTENT', sectionTitle: 'Before' });
bg(s, 'strands');
fill(s, 'What Was Wrong', [{ text: 'Polished. Optimistic. ' }, { text: 'Forgettable.', options: { color: CYAN } }]);
const wrong = [['Speaks to everyone', 'So it speaks to no one in particular.'], ['Tells, doesn’t show', 'Claims about innovation instead of a story people care about.'], ['Looks like every tech ad', 'Execs, offices and glowing chips are the category default.'], ['Wrong length', 'Too long for social, too generic for events.'], ['Passive CTA', '“Visit AMD.com” gives no reason to act.'], ['Vanity metrics', 'Views, not affinity or recall.']];
wrong.forEach(([h, d], i) => {
  const col = i % 3, row = Math.floor(i / 3), w = 3.65, x = px(140) + col * (w + 0.3), y = 2.3 + row * 2.35;
  card(s, `Problem ${i + 1}`, x, y, w, 2.15);
  text(s, String(i + 1).padStart(2, '0'), { x: x + 0.3, y: y + 0.28, w: 1, h: 0.3, fontSize: 11, bold: true, charSpacing: 4, color: GREEN });
  text(s, h.toUpperCase(), { x: x + 0.3, y: y + 0.6, w: w - 0.6, h: 0.6, fontSize: 15, bold: true, charSpacing: 1 });
  text(s, d, { x: x + 0.3, y: y + 1.25, w: w - 0.6, h: 0.8, fontSize: 14, color: MUTED });
});
s.addNotes('0:45–1:20. Say three out loud: audience, tell-don’t-show, CTA. AMD’s strength is that it’s invisible; the original tried to fix that by talking louder.');

// ---------- 4 · The Turn ----------
pres.addSection({ title: 'After' });
s = pres.addSlide({ masterName: 'SUB_STATEMENT', sectionTitle: 'After' });
bg(s, 'strands');
text(s, 'THE TURN', { x: px(140), y: 2.0, w: 6, h: 0.4, fontSize: 12, bold: true, charSpacing: 8, color: CYAN, objectName: 'Eyebrow' });
text(s, [{ text: 'Stop telling people what AMD powers.', options: { breakLine: true } }, { text: 'Show them the ground ', options: { color: CYAN, glow: { size: 12, opacity: 0.35, color: '2EE6FF' } } }, { text: 'they’re standing on.', options: { color: GREEN, glow: { size: 12, opacity: 0.35, color: '39FF88' } } }],
  { x: px(140), y: 2.5, w: 11.5, h: 2.6, fontSize: 54, bold: true, objectName: 'Statement' });
s.addNotes('1:20–1:40. So we stopped making an ad about AMD. We built a place that runs on AMD.');

// ---------- 5 · SUBSTRATE ----------
s = pres.addSlide({ masterName: 'SUB_CONTENT', sectionTitle: 'After' });
bg(s, 'strands');
fill(s, 'The New Concept', 'SUBSTRATE');
text(s, [{ text: 'A gothic-futuristic city whose people have no idea what their world really is. Every reel ends with the camera pulling back until we realize ' }, { text: 'the entire city is built on a processor.', options: { color: CYAN } }],
  { x: px(140), y: 2.3, w: 10.5, h: 1.3, fontSize: 20 });
const steps = [['THE SKYLINE', 'is circuitry', 'Towers are the chip’s architecture.'], ['THE RIVERS OF LIGHT', 'are data', 'Photons pouring between the spires.'], ['THE PULLBACK', 'reveals the chip', '…and the AMD logo. The brand reveal is the payoff.']];
steps.forEach(([k, h, d], i) => {
  const w = 3.45, x = px(140) + i * (w + 0.62), y = 4.2;
  card(s, `Step ${i + 1}`, x, y, w, 2.1);
  text(s, k, { x: x + 0.3, y: y + 0.3, w: w - 0.6, h: 0.3, fontSize: 11, bold: true, charSpacing: 4, color: CYAN });
  text(s, h.toUpperCase(), { x: x + 0.3, y: y + 0.65, w: w - 0.6, h: 0.45, fontSize: 18, bold: true, charSpacing: 2 });
  text(s, d, { x: x + 0.3, y: y + 1.15, w: w - 0.6, h: 0.8, fontSize: 14, color: MUTED });
  if (i < 2) text(s, '→', { x: x + w + 0.12, y: y + 0.75, w: 0.4, h: 0.5, fontSize: 24, bold: true, color: GREEN, align: 'center' });
});
s.addNotes('1:40–2:30. Arcane’s cinematic characters meet Roku City’s hidden world inside your tech. AMD never narrates: AMD is the ground the city stands on.');

// ---------- 6 · Meet Subster ----------
s = pres.addSlide({ masterName: 'SUB_STATEMENT', sectionTitle: 'After' });
bg(s, 'strands');
s.addShape(pres.shapes.RECTANGLE, { x: px(140) - 0.02, y: 0.98, w: 5.64, h: 5.36, fill: { color: '000000' }, line: { color: CYAN, width: 1, transparency: 55 }, objectName: 'Subster frame' });
s.addImage({ data: SUBSTER, x: px(140), y: 1.0, w: 5.6, h: 5.32, objectName: 'Subster', altText: 'Subster: a small hooded robot with big cyan eyes, a green chest core and light rising from its raised hand' });
s.addShape(pres.shapes.RECTANGLE, { x: 6.85, y: 0.9, w: 5.9, h: 5.7, fill: { color: '000000', transparency: 12 }, line: { type: 'none' } });
text(s, 'MEET THE HERO', { x: 7.1, y: 1.15, w: 5, h: 0.35, fontSize: 12, bold: true, charSpacing: 8, color: CYAN });
text(s, 'SUBSTER', { x: 7.1, y: 1.5, w: 5.6, h: 1.1, fontSize: 64, bold: true, charSpacing: 3, glow: { size: 14, opacity: 0.4, color: '2EE6FF' }, objectName: 'Subster name' });
text(s, 'THE HOODED COURIER', { x: 7.1, y: 2.6, w: 5.6, h: 0.45, fontSize: 18, bold: true, charSpacing: 4 });
[['Sees the current', 'A courier from the Underlayer who can see the light and data no one else notices.', CYAN], ['Small against the city', 'Always tiny, always looking up. The audience’s way into the world.', GREEN], ['Carries the Seed', 'The new core that decides which half of the city grows, delivered to the Gate.', CYAN]].forEach(([h, d, c], i) => {
  const y = 3.3 + i * 1.05;
  text(s, h.toUpperCase(), { x: 7.1, y, w: 5.5, h: 0.32, fontSize: 12, bold: true, charSpacing: 4, color: c });
  text(s, d, { x: 7.1, y: y + 0.34, w: 5.5, h: 0.65, fontSize: 15 });
});
s.addNotes('Meet Subster, the Hooded Courier: an Underlayer robot who can see the current. Always tiny against the city, and the audience’s way into the world.');

// ---------- 7 · The Reels ----------
s = pres.addSlide({ masterName: 'SUB_CONTENT', sectionTitle: 'After' });
bg(s, 'strands');
fill(s, 'The Reels · 20–45s · TikTok, Reels, Shorts', [{ text: 'Story first. ' }, { text: 'The chip last.', options: { color: CYAN } }]);
const reels = [['Every city runs on something.', 'Subster runs the Underlayer rooftops. Hero teaser.'], ['The Current.', 'Subster sees the light rivers for the first time. Pure spectacle.'], ['The Seed.', 'The orb is stolen: a chase through the Spires.'], ['The Gate.', 'Subster before the ring vault. Cliffhanger + series title.']];
reels.forEach(([h, d], i) => {
  const y = 2.35 + i * 0.92;
  s.addShape(pres.shapes.LINE, { x: px(140), y, w: 7.4, h: 0, line: { color: INK, width: 0.75, transparency: 80 } });
  text(s, String(i + 1).padStart(2, '0'), { x: px(140), y: y + 0.17, w: 0.6, h: 0.3, fontSize: 11, bold: true, charSpacing: 4, color: GREEN });
  text(s, h, { x: px(140) + 0.7, y: y + 0.12, w: 6.7, h: 0.38, fontSize: 17, bold: true });
  text(s, d, { x: px(140) + 0.7, y: y + 0.48, w: 6.7, h: 0.35, fontSize: 14, color: MUTED });
});
text(s, [{ text: 'Every one ends the same way: ' }, { text: 'pull back → city is a chip → AMD.', options: { color: GREEN } }], { x: px(140), y: 6.2, w: 7.6, h: 0.45, fontSize: 15 });
s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.33, y: 0.83, w: 3.26, h: 5.84, rectRadius: 0.18, fill: { color: '000000' }, line: { color: CYAN, width: 1.5, transparency: 40 }, objectName: 'Phone frame' });
s.addMedia({ type: 'video', path: REEL, x: 9.4, y: 0.9, w: 3.12, h: 5.55, cover: REEL_POSTER });
s.addNotes('2:55–3:10. The reels aren’t trailers. Each one stands alone: one district, one character, one hook in the first second. The reel plays with sound.');

// ---------- 8 · Audience Takeaway ----------
s = pres.addSlide({ masterName: 'SUB_CONTENT', sectionTitle: 'After' });
bg(s, 'strands');
fill(s, 'Audience Takeaway', '');
text(s, [{ text: '“AMD isn’t a logo at the end of an ad. ', options: { breakLine: true } }, { text: 'It’s the ground the whole city stands on.”', options: { color: CYAN, glow: { size: 10, opacity: 0.35, color: '2EE6FF' } } }], { x: px(140), y: 1.7, w: 6.0, h: 2.8, fontSize: 32, bold: true });
text(s, 'The brand reveal is the story’s payoff, so remembering the story means remembering AMD.', { x: px(140), y: 4.6, w: 5.8, h: 0.9, fontSize: 16, color: MUTED });
const kv = [['Audience', [{ text: 'Gen Z gamers, animation fans, creators. Narrow on purpose.' }]], ['Where', [{ text: 'TikTok, Instagram Reels, YouTube Shorts, gaming streams, events' }]], ['CTA', [{ text: '“Find the city”', options: { color: GREEN } }, { text: ' easter eggs + a streamer competition set inside SUBSTRATE' }]], ['Success', [{ text: 'Watch-through, shares, follows, creator participation, ' }, { text: 'brand recall', options: { color: CYAN } }]]];
kv.forEach(([k, v], i) => {
  const y = 1.75 + i * 1.12;
  s.addShape(pres.shapes.LINE, { x: 7.35, y, w: 5.0, h: 0, line: { color: INK, width: 0.75, transparency: 80 } });
  text(s, k.toUpperCase(), { x: 7.35, y: y + 0.2, w: 1.45, h: 0.35, fontSize: 12, bold: true, charSpacing: 4, color: CYAN });
  text(s, v, { x: 8.85, y: y + 0.17, w: 3.5, h: 0.85, fontSize: 14 });
});
s.addNotes('3:10–4:00. Ask someone afterwards "What does AMD power?" and they say "the whole city". That’s measurable with a brand-lift study.');

// ---------- 9 · What's Next ----------
s = pres.addSlide({ masterName: 'SUB_CONTENT', sectionTitle: 'After' });
bg(s, 'strands');
fill(s, 'What’s Next', '');
text(s, [{ text: 'The reels are the base.', options: { breakLine: true } }, { text: 'Creators build the city.', options: { color: CYAN } }], { x: px(140), y: px(170), w: 11.4, h: 1.4, fontSize: 40, bold: true, objectName: 'Title' });
const phases = [
  ['NOW · THE BASE', 'Sizzle reels', ['Build the world and the hook. Every reel ends on the same reveal: the city is the chip, and the chip is AMD.'], GREEN, false],
  ['NEXT · CREATORS ENTER', 'The streamer competition', ['Streamers compete inside SUBSTRATE: race the rooftops, hunt the hidden chips', 'Their runs become a short-form vertical series', '“Find the city” easter eggs pull fans in with them'], CYAN, true],
  ['FUTURE · CREATORS IN CANON', 'Ambassadors in the city', ['Famous streamers who already play on AMD, animated as characters in the series', 'Their audiences discover the city through someone they trust', 'The audience stops watching the city and starts living in it'], CYAN, true],
];
phases.forEach(([k, h, items, c, bullets], i) => {
  const w = 3.6, x = px(140) + i * (w + 0.42), y = 2.85;
  card(s, `Phase ${i + 1}`, x, y, w, 3.95, c);
  text(s, k, { x: x + 0.28, y: y + 0.3, w: w - 0.4, h: 0.3, fontSize: 10, bold: true, charSpacing: 1.5, color: c });
  text(s, h.toUpperCase(), { x: x + 0.28, y: y + 0.68, w: w - 0.5, h: 0.75, fontSize: 18, bold: true, charSpacing: 1 });
  text(s, items.map((t, j) => ({ text: t, options: Object.assign({ bullet: bullets ? { indent: 14 } : false, paraSpaceAfter: 6 }, j < items.length - 1 ? { breakLine: true } : {}) })), { x: x + 0.28, y: y + 1.5, w: w - 0.5, h: 2.3, fontSize: 14, color: MUTED });
  if (i < 2) text(s, '→', { x: x + w + 0.03, y: y + 1.7, w: 0.36, h: 0.5, fontSize: 22, bold: true, color: GREEN, align: 'center' });
});
s.addNotes('We built the base. The real goal is to hand the city to creators: a streamer competition, a vertical series of their runs, and eventually AMD streamer ambassadors animated into the show.');

// ---------- 10 · Program Lessons ----------
pres.addSection({ title: 'Close' });
s = pres.addSlide({ masterName: 'SUB_CONTENT', sectionTitle: 'Close' });
bg(s, 'strands');
fill(s, 'What Changed Our Thinking', 'Program Lessons');
const lessons = [
  ['AMD is already inside everything; you just can’t see it', 'Week 1 intros: learning AMD chips power healthcare, aerospace, robotics, gaming, and entertainment, from Pixar’s RenderMan to The Game Awards and the CES keynote'],
  ['Creativity exists to solve a real problem', 'The creative director session: the Air Force made a comedy web series about bowling leagues to boost morale, proof that entertainment can do serious work'],
  ['If it isn’t relatable, it doesn’t resonate', 'Session 3 with HunterLamin: every great brand project starts with “how does this connect with the audience?” and solves a business problem through strategy, social, and culture'],
];
lessons.forEach(([h, d], i) => {
  const y = 2.4 + i * 1.5;
  card(s, `Lesson ${i + 1}`, px(140), y, 11.4, 1.3);
  text(s, String(i + 1).padStart(2, '0'), { x: px(140) + 0.3, y: y + 0.28, w: 0.6, h: 0.4, fontSize: 16, bold: true, charSpacing: 3, color: GREEN });
  text(s, h, { x: px(140) + 1.0, y: y + 0.2, w: 10.1, h: 0.4, fontSize: 18, bold: true });
  text(s, d, { x: px(140) + 1.0, y: y + 0.6, w: 10.1, h: 0.62, fontSize: 14, color: MUTED });
});
s.addNotes('4:00–4:40. One sentence per lesson, with the moment it came from.');

// ---------- 11 · Close ----------
s = pres.addSlide({ masterName: 'SUB_STATEMENT', sectionTitle: 'Close' });
bg(s, 'close');
s.addImage({ data: LOGO, x: (13.333 - 1.6) / 2, y: 1.05, w: 1.6, h: 1.6 * 134 / 334, objectName: 'AMD logo' });
text(s, 'SUBSTRATE', { x: 0.5, y: 1.85, w: 12.333, h: 1.5, fontSize: 92, bold: true, charSpacing: 18, align: 'center', glow: { size: 18, opacity: 0.45, color: '2EE6FF' }, objectName: 'Series title' });
text(s, [{ text: 'EVERY CITY RUNS ON ' }, { text: 'SOMETHING.', options: { color: GREEN } }], { x: 0.5, y: 3.45, w: 12.333, h: 0.6, fontSize: 22, bold: true, charSpacing: 5, align: 'center', objectName: 'Tagline' });
s.addShape(pres.shapes.RECTANGLE, { x: (13.333 - 3.0) / 2, y: 4.35, w: 3.0, h: 0.62, fill: { color: '000000', transparency: 40 }, line: { color: CYAN, width: 1.5 }, objectName: 'CTA button' });
text(s, 'Find the city →', { x: (13.333 - 3.0) / 2, y: 4.35, w: 3.0, h: 0.62, fontSize: 16, bold: true, align: 'center', valign: 'middle' });
text(s, 'THANK YOU', { x: 0.5, y: 5.35, w: 12.333, h: 0.45, fontSize: 16, bold: true, charSpacing: 6, align: 'center' });
text(s, 'ZOE SCHULDENFREI · NICHOLAS MOFFATT · MICHAEL BADILLO-SANCHEZ · ARNOLDO GARZA CORTES', { x: 0.5, y: 5.85, w: 12.333, h: 0.4, fontSize: 12, charSpacing: 2, align: 'center', color: MUTED });
s.addNotes('4:40–4:50. The original said "AMD powers what’s next". We’d rather show it: a whole city of it. Thank you.');

(async () => {
  const out = path.join(here, 'SUBSTRATE-pitch.pptx');
  await pres.writeFile({ fileName: out });
  const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');
  await applyTheme(out, THEME);
  console.log('wrote', out);
})();
