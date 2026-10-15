"""Synthesizes the 15s soundtrack for Reel 04 "The Flicker" (no samples, no licensing).

Usage: python3 make_audio.py out.wav
Cues line up with the scene timings in reel04-flicker.html.
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 15.0
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(7)
out = np.zeros(N)


def env(start, decay, attack=0.004):
    e = np.zeros(N)
    m = t >= start
    x = t[m] - start
    e[m] = np.exp(-x / decay) * np.clip(x / attack, 0, 1)
    return e


def window(a, b, fade=0.02):
    w = np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)
    return w


def sine(freq):
    if np.isscalar(freq):
        return np.sin(2 * np.pi * freq * t)
    return np.sin(2 * np.pi * np.cumsum(freq) / SR)


def sweep(start, length, f0, f1, amp):
    f = np.full(N, f0, dtype=float)
    m = (t >= start) & (t < start + length)
    f[m] = f0 * (f1 / f0) ** ((t[m] - start) / length)
    f[t >= start + length] = f1
    return amp * sine(f) * window(start, start + length, 0.03)


noise = rng.uniform(-1, 1, N)

# 0–2s: soft feed ambience that stutters, bit-crushes, then cuts
pad = sum(sine(f) + 0.5 * sine(f * 1.003) for f in (220.0, 261.6, 329.6)) * 0.05
pad *= np.clip(t / 0.3, 0, 1)
gate = np.where((t >= 1.0) & (np.floor((t - 1.0) / 0.07) % 2 == 1), 0.0, 1.0)
pad = np.where(t >= 1.0, np.round(pad * 6) / 6, pad) * gate
out += pad * window(0, 1.92)
out += noise * (rng.random(N) < 0.004) * 0.5 * window(1.0, 2.0)

# 2s: impact, then the city hum sinking as districts drain
out += 0.9 * sine(48) * env(2.0, 0.6) + 0.3 * noise * env(2.0, 0.08)
hum_f = 55 - 15 * np.clip((t - 2.6) / 2.4, 0, 1)
hum_a = 0.22 * (1 - 0.75 * np.clip((t - 2.6) / 2.4, 0, 1)) * (1 + 0.1 * sine(3))
out += (sine(hum_f) + 0.4 * sine(hum_f * 2)) * hum_a * window(2.0, 5.0, 0.05)
for d in (2.7, 3.1, 3.5, 3.9, 4.2, 4.5, 4.7):
    out += sweep(d, 0.35, 600, 60, 0.16)

# 5–9s: heartbeat under four glitch cuts
for k in range(6):
    tb = 5.0 + 0.75 * k
    out += 0.7 * sine(60) * env(tb, 0.09) + 0.5 * sine(55) * env(tb + 0.18, 0.09)
for c in (5.0, 6.0, 7.0, 8.0):
    out += 0.25 * noise * np.sign(sine(1200)) * window(c, c + 0.07, 0.005)
out += 0.12 * np.sign(sine(110)) * window(5.45, 5.8)            # scoreboard freeze buzz
out += sweep(6.0, 0.6, 900, 150, 0.12)                           # pod winding down
for b in (7.55, 7.75):
    out += 0.2 * sine(880) * window(b, b + 0.12, 0.005)          # signal lost
for k in range(7):
    c = 8.3 + k * 0.1
    out += 0.1 * sine(1500 + 150 * (k % 4)) * window(c, c + 0.04, 0.005)  # Pix chirps

# 9–12s: near silence, typing, glove hum, riser
out += 0.08 * (sine(220) + sine(330)) * np.clip((t - 9.3) / 2.7, 0, 1) * window(9.3, 12.0)
for k in range(24):
    out += 0.25 * noise * env(10.0 + k * 0.9 / 24, 0.005)
r = np.clip((t - 11.2) / 0.8, 0, 1) ** 2 * (t < 12.0)
out += 0.3 * noise * r + sweep(11.2, 0.8, 200, 1200, 1.0) * 0.15 * r

# 12s: the Core flares
out += 1.0 * sine(45) * env(12.0, 0.9) + 0.4 * noise * env(12.0, 0.15)
chord = np.zeros(N)
for f in (110.0, 164.8, 220.0, 277.2, 329.6, 440.0):
    chord += sum(sine(f * n) / n for n in range(1, 5))
out += 0.07 * chord * env(12.0, 2.5, attack=0.01)
out += 0.2 * (sine(55) + 0.4 * sine(110)) * window(12.0, 15.0, 0.05)
out *= np.clip((15.0 - t) / 0.6, 0, 1)

out = np.tanh(out * 1.2)
out /= np.max(np.abs(out)) / 0.89
pcm = (out * 32767).astype(np.int16)
stereo = np.column_stack([pcm, pcm]).ravel()

with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(stereo.tobytes())
print('wrote', sys.argv[1])
