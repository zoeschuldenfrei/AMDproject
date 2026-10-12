#!/usr/bin/env bash
# Rebuilds zenith-reel04-flicker.mp4 from the HTML animation + synthesized audio.
# Needs: node + playwright (with Chromium), python3 + numpy, ffmpeg.
set -euo pipefail
cd "$(dirname "$0")"
WORK="${TMPDIR:-/tmp}/zenith-reel-build"
rm -rf "$WORK" && mkdir -p "$WORK/frames"

NODE_PATH="$(npm root -g)" node render.cjs reel04-flicker.html "$WORK/frames" 30 15
python3 make_audio.py "$WORK/audio.wav"

ffmpeg -y -loglevel error -framerate 30 -i "$WORK/frames/f%04d.jpg" -i "$WORK/audio.wav" \
  -c:v libx264 -pix_fmt yuv420p -crf 20 -preset slow \
  -c:a aac -b:a 192k -shortest -movflags +faststart zenith-reel04-flicker.mp4

# Poster frame for slides/thumbnails (the end card)
ffmpeg -y -loglevel error -i zenith-reel04-flicker.mp4 -ss 13.9 -frames:v 1 zenith-reel04-poster.jpg
echo "done: zenith-reel04-flicker.mp4"
