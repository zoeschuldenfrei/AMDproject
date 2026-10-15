"""Builds the self-contained deck: inlines the key art and (if present) the reel video.

Usage: python3 build_deck.py
Reads deck-src.html, keyart.jpg and ../out/substrate-reel-15s.mp4 (optional).
Writes index.html (open this in a browser) and artifact.html (same page, for publishing).
"""
import base64
import os
import re

here = os.path.dirname(os.path.abspath(__file__))
src = open(os.path.join(here, 'deck-src.html'), encoding='utf-8').read()


def data_uri(path, mime):
    with open(path, 'rb') as f:
        return f'data:{mime};base64,' + base64.b64encode(f.read()).decode()


keyart = data_uri(os.path.join(here, 'keyart.jpg'), 'image/jpeg')
src = src.replace('KEYART_SRC', keyart)
src = src.replace('LOGO_SRC', data_uri(os.path.join(here, '..', 'assets', 'amd-logo-white.png'), 'image/png'))

reel = os.path.join(here, '..', 'out', 'substrate-reel-15s.mp4')
if os.path.exists(reel):
    media = f'<video src="{data_uri(reel, "video/mp4")}" poster="{keyart}" loop playsinline preload="auto"></video>'
else:
    media = f'<img src="{keyart}" alt="SUBSTRATE key art: a tiny figure on a ledge below glowing cyan rivers"><div class="cap">Reel 01 · in production</div>'
src = src.replace('REEL_MEDIA', media)

open(os.path.join(here, 'index.html'), 'w', encoding='utf-8').write(src)

# Artifact version: the publisher adds its own doctype/html/head/body skeleton
art = re.sub(r'<!doctype html>\s*<html[^>]*>\s*<head>\s*', '', src, flags=re.I)
art = art.replace('<meta charset="utf-8">\n', '').replace('<meta name="viewport" content="width=device-width, initial-scale=1">\n', '')
art = re.sub(r'</head>\s*<body>\s*', '', art, flags=re.I)
art = re.sub(r'</body>\s*</html>\s*$', '', art, flags=re.I)
open(os.path.join(here, 'artifact.html'), 'w', encoding='utf-8').write(art)
print('built index.html', round(os.path.getsize(os.path.join(here, 'index.html')) / 1e6, 1), 'MB')
