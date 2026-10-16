# Repo rules (read first)

Zoe and Hillary share one Claude account and this repo. **Never assume which of them you're
talking to.** If it isn't clear from the conversation, ask before writing anything.

- Zoe's work → `zoe/`. Hillary's work → `hillary/`. `shared/` only for what both have agreed is team-wide.
- Never move or edit files in someone else's folder, and don't build on one person's work for the other unless asked.
- The brief below is **Zoe's**. When working with Zoe, the folders in section 3 (`references/`,
  `assets/`, `reels/`, `deck/`, `out/`) live under `zoe/`.

---

# AMD Creative Pathways – Final Pitch: SUBSTRATE

You are helping me (Zoe) build two things for my team's final pitch in the AMD Creative
Pathways fellowship:
1. Animated sizzle reels (real MP4 videos)
2. A beautiful, cinematic pitch deck

Read this whole file before doing anything. Reference images are in the `references/` folder.
Look at them for mood, but NEVER copy them. Everything we make must be original.

---

## 1. The assignment

### The original concept (the "before") – what AMD gave us
- Title: "AMD Powers What's Next"
- One 2-minute corporate brand video: exec + engineer interviews, office footage, product
  beauty shots, images of gaming/AI/data centers, on-screen innovation claims,
  inspirational music, confident voice-over
- Audience: everyone at once (customers, tech fans, business leaders, students, newcomers)
- Key message: AMD tech powers the products and experiences changing how people live and work
- Distribution: AMD.com, YouTube, social, events, internal presentations
- CTA: "Visit AMD.com"
- Success: views, engagement, positive sentiment

### What we're allowed to change
Audience, subject/angle, title + central idea, runtime, storytelling format, talent,
production approach, AMD's role, CTA, distribution/activation platform.

### The final presentation (5 minutes) must cover
1. What was wrong with the original concept
2. What the new concept is
3. What the audience would take away
4. Which program lessons changed our thinking (I will supply these)

### What was wrong with the original
- Audience too broad, so it speaks to no one
- Tells instead of shows: claims about innovation instead of a story people care about
- Looks like every other tech brand video
- 2 minutes is too long for social, too generic for events
- Passive CTA gives no reason to act
- Measures only vanity metrics, not affinity or recall

---

## 2. Our new concept: SUBSTRATE (replaces the earlier ZENITH work)

**Logline:** A gothic-futuristic city whose people have no idea what their world really is.
Every sizzle reel ends with the camera pulling back until we realize the entire city is
built on the surface of a processor. The skyline is circuitry. The rivers of light are data.
The city is inside the chip.

**Why it works:** AMD stops narrating its own greatness and becomes the ground everyone
stands on. The brand reveal IS the story's payoff. The audience discovers AMD's breadth by
exploring a world instead of being told about it.

**Format:** Short sizzle reels (20–45s) that tease an animated miniseries.

### The world
- **The Underlayer** – the old city on aging legacy silicon. Sickly green glow, fog, bridges
  over chasms, everything running hot and slow. People are scrappy, inventive, stuck.
- **The Spires** – the new city above, where light moves instead of electricity. Clean cyan
  rivers of photons pouring between glass towers. Impossible speed.
- The conflict is between the two levels; the hero moves between them.

### Characters and objects
- **Subster** (the Hooded Courier robot; previously called Ren) – a courier from the Underlayer who can *see the current* (the flow of light and
  data no one else notices). Often shown as a small silhouette at a ledge, looking up.
- **The Seed** – a glowing, stained-glass-like sphere that turns out to be a new core being
  born. Whoever decides where it's placed decides which half of the city grows.
- **The Gate** – a massive ring-shaped vault at the city's center (secretly a data center)
  where the Seed must be delivered.

### Visual rules (apply to EVERYTHING: reels and deck)
- Palette: near-black base, only two light sources:
  - Toxic green (#39FF88-ish, foggy) = the Underlayer, below
  - Electric cyan (#2EE6FF-ish, liquid) = the Spires, above
- Light is the hero: alive, liquid, moving like smoke
- Characters tiny against enormous architecture, usually in silhouette
- Painterly texture, NOT glossy plastic 3D, NOT generic corporate tech
- Every reel ends with the scale-jump reveal: pull back → city is a chip → AMD logo
- Typography: bold, cinematic, movie-title-card feel

### The sizzle reels
1. **"Every city runs on something."** Subster runs rooftops through the Underlayer; pullback
   reveals the chip. Hero teaser.
2. **"The Current."** Subster sees the light rivers for the first time. Pure spectacle, vertical.
3. **"The Seed."** The orb is stolen; chase through the Spires.
4. **"The Gate."** Subster stands before the ring vault. Cliffhanger + series title.

### Audience, CTA, distribution, success
- **Audience:** Gen Z gamers, animation fans, creators (narrow and specific on purpose)
- **Distribution:** TikTok, Instagram Reels, YouTube Shorts, gaming streams, events
- **CTA:** interactive, e.g. "Find the city" easter eggs, plus an optional streamer
  competition set inside SUBSTRATE (our team's earlier "AMD City" idea)
- **Success:** watch-through rate, shares, follows, creator participation, brand recall
  (people remembering AMD = the ground the city stands on)

---

## 3. How to build

### Folder layout (create it if missing)
- `references/` – my moodboard images (inspiration only)
- `assets/` – generated images/video clips I add from AI image/video tools
- `reels/` – the Remotion project for the sizzle reels
- `deck/` – the pitch deck
- `out/` – final rendered MP4s

### Sizzle reels
- Use **Remotion** to build the reels as code and render real MP4s
- Make vertical (1080x1920) versions for social; horizontal (1920x1080) if asked
- Use motion graphics: glowing light rivers, fog, skyline building district by district,
  kinetic typography, the pullback-to-chip reveal
- When I add images/clips to `assets/`, edit them into the reels
- Always tell me how to preview and download the results

### Pitch deck
- Build as a single self-contained web page (HTML/CSS/JS) I can present from a browser
- Keyboard navigation (arrow keys), smooth cinematic transitions, full-screen
- Structure: Title → The Original → What Was Wrong → The Turn → SUBSTRATE → The World →
  The Reels (embedded videos) → Audience Takeaway → Program Lessons → Close
- Follow the visual rules above exactly. It should feel like a film premiere, not a
  corporate slideshow

### Working style
- I'm not a coder. Explain steps simply and tell me exactly what to do
- Do one thing at a time and show me the result before moving on
- When I say I don't like something, ask what specifically, and offer 2–3 directions
