# Sizzle Reel 04: "The Flicker" (15s, 9:16)

**▶ [`zenith-reel04-flicker.mp4`](zenith-reel04-flicker.mp4)**: 1080×1920, 30 fps, with sound.
Poster frame: [`zenith-reel04-poster.jpg`](zenith-reel04-poster.jpg).

This is the motion version of Reel 4 from [`../04-sizzle-reels.md`](../04-sizzle-reels.md). Use it as the cold
open on slide 1, or play it on the reels slide.

| Time | Beat | Sound |
|---|---|---|
| 0:00–0:02 | A familiar video feed stutters, glitches and freezes ("is my phone lagging?") | Soft pad stutters, then cuts out |
| 0:02–0:05 | Zenith at night. Districts go dark one by one. *"Something is shutting Zenith down."* | Impact, sinking hum, power-down sweeps |
| 0:05–0:09 | Four 1-second cuts: Glowline scoreboard freezes, a Loop pod stops, a Pulse Quarter scan loses signal, Pix flickers | Heartbeat, glitch zaps |
| 0:09–0:12 | Vee in the dark, glove glowing brighter. *"Then we turn it back on."* | Near silence, typing, riser |
| 0:12–0:15 | The Core flares, a shockwave relights the city, end card: **ZENITH · Find the power. · Episode 1 now streaming** | Big hit and chord, hum returns |

## How it's made
Everything is code, so it's easy to edit and has no licensing issues:
- `reel04-flicker.html`: the animation (canvas). **Open it in a browser to watch a live looping preview.**
- `make_audio.py`: synthesizes the soundtrack (numpy).
- `render.cjs` + `build.sh`: render every frame in headless Chromium and mux to MP4 with ffmpeg.

To change text or timing: edit the HTML (each scene is a function, e.g. `scene2`), then run `./build.sh`.

## Limits of this version
It's a **motion mock**, not final animation. Characters are stylized silhouettes and the city is
generated from shapes. For the pitch that's an advantage: it shows pacing, hook, sound design and
the end card without pretending to be a finished production. If you have character art or a
music track, they can be dropped in. See `../ASSETS-WISHLIST.md`.
