"""Synthesized soundtrack for the 15s SUBSTRATE reel (no samples, no licensing).

Usage: python3 make_reel15_audio.py out.wav
Beats: 0–1.6 a drop of light falls and splashes · 1.6–7 the city (drone, shimmer, a deep bell)
7–9.5 push in on Ren · 9.5–13 pullback to the chip (rising whoosh) · 13 chip reveal hit · fade out.
"""
import sys
import wave

import numpy as np

SR = 44100
N = int(SR * 15.0)
t = np.arange(N) / SR
rng = np.random.default_rng(3)
noise = rng.uniform(-1, 1, N)
out = np.zeros((N, 2))


def env(start, decay, attack=0.005):
    e = np.zeros(N)
    m = t >= start
    x = t[m] - start
    e[m] = np.exp(-x / decay) * np.clip(x / attack, 0, 1)
    return e


def win(a, b, fade=0.3):
    return np.clip((t - a) / fade, 0, 1) * np.clip((b - t) / fade, 0, 1)


def sine(f):
    return np.sin(2 * np.pi * (np.cumsum(f) / SR if not np.isscalar(f) else f * t))


def lowpass(x, a):
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):  # one-pole filter
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def mono(x, pan=0.0):
    out[:, 0] += x * (1 - pan) / 2 * 2 ** 0.5
    out[:, 1] += x * (1 + pan) / 2 * 2 ** 0.5


# 0–1.6: falling drop (descending glint) and splash
mono(0.25 * sine(np.where(t < 1.0, 2400 - 1600 * t, 800)) * win(0.0, 1.0, 0.05))
mono(0.5 * sine(420) * env(1.0, 0.25) + 0.25 * noise * env(1.0, 0.06))
mono(0.3 * sine(210) * env(1.0, 0.8))

# 1.6–13: the city: low drone with a fifth, slow swell; wind through the spires
drone = (sine(55) + 0.6 * sine(82.4) + 0.3 * sine(110)) * (0.9 + 0.1 * sine(0.2))
mono(0.22 * drone * win(1.4, 13.2, 0.8))
wind = lowpass(noise, 0.02) * (0.6 + 0.4 * sine(0.3))
out[:, 0] += 0.5 * wind * win(1.6, 13.0, 1.0)
out[:, 1] += 0.5 * np.roll(wind, 4000) * win(1.6, 13.0, 1.0)

# deep bell when the city appears (inharmonic partials)
for f, a, d in ((65.4, 0.5, 4.0), (131.8, 0.3, 3.0), (178.0, 0.2, 2.2), (247.0, 0.12, 1.6), (392.0, 0.06, 1.0)):
    mono(a * sine(f) * env(1.6, d, 0.01))

# liquid-light shimmer: soft high glints panned left/right
for k in range(26):
    c = 1.9 + k * 0.42 + rng.uniform(0, 0.2)
    if c > 12.5:
        break
    f = rng.choice([1318.5, 1567.98, 1975.5, 2349.3, 2637.0])
    mono(0.05 * sine(f) * env(c, 0.5, 0.02), pan=rng.uniform(-0.8, 0.8))

# 7–9.5: low pulse as we push in on Ren
for k in range(4):
    mono(0.45 * sine(48) * env(7.0 + k * 0.62, 0.18))

# 9.5–13: pullback: rising filtered noise + rising tone
r = np.clip((t - 9.5) / 3.5, 0, 1) ** 2 * (t < 13.0)
mono(0.35 * lowpass(noise, 0.05 + 0.25 * 0.5) * r)
f_rise = 110 + 770 * np.clip((t - 9.5) / 3.5, 0, 1) ** 2
mono(0.12 * sine(f_rise) * r)

# 13: chip reveal: sub hit + bright open chord, long tail
mono(1.0 * sine(42) * env(13.0, 0.9) + 0.35 * noise * env(13.0, 0.12))
for f in (110.0, 164.8, 220.0, 329.6, 440.0, 659.3):
    mono(0.06 * sum(sine(f * n) / n for n in (1, 2, 3)) * env(13.0, 2.2, 0.02))

out *= np.clip((15.0 - t) / 0.6, 0, 1)[:, None]
out = np.tanh(out * 1.1)
out /= np.max(np.abs(out)) / 0.89
pcm = (out * 32767).astype(np.int16)
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print('wrote', sys.argv[1])
