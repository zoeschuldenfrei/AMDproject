"""Post-processes SUBSTRATE-pitch.pptx (written by build_pptx.js):

1. Background videos start automatically, muted, and loop; the reel starts automatically, with sound, and loops.
2. Transitions: Morph between the content slides that share the strands background, Fade elsewhere
   (Morph falls back to Fade in PowerPoint versions without it).
3. Identical media files are stored once (pptxgenjs embeds a copy per slide).

Usage: python3 postprocess.py
"""
import hashlib
import os
import re
import shutil
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, 'SUBSTRATE-pitch.pptx')
WORK = os.path.join(HERE, '_unpacked')

# transition used to ENTER each slide (1-based)
MORPH = {4, 5, 6, 7, 8, 9, 10}
BG_MS, REEL_MS = 8000, 15000

FADE = '<p:transition spd="slow"><p:fade/></p:transition>'
MORPH_XML = ('<mc:AlternateContent xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006">'
             '<mc:Choice xmlns:p159="http://schemas.microsoft.com/office/powerpoint/2015/09/main" Requires="p159">'
             '<p:transition spd="slow"><p159:morph option="byObject"/></p:transition></mc:Choice>'
             '<mc:Fallback>' + FADE + '</mc:Fallback></mc:AlternateContent>')


def timing(videos):
    """videos: [(spid, duration_ms, muted)]. All start with the slide and loop until it ends."""
    ids = iter(range(4, 1000))
    calls, nodes = '', ''
    for i, (spid, dur, muted) in enumerate(videos):
        a, b = next(ids), next(ids)
        calls += (f'<p:par><p:cTn id="{a}" presetID="1" presetClass="mediacall" presetSubtype="0" fill="hold" '
                  f'nodeType="{"afterEffect" if i == 0 else "withEffect"}"><p:stCondLst><p:cond delay="0"/></p:stCondLst>'
                  f'<p:childTnLst><p:cmd type="call" cmd="playFrom(0.0)"><p:cBhvr><p:cTn id="{b}" dur="{dur}" fill="hold"/>'
                  f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cBhvr></p:cmd></p:childTnLst></p:cTn></p:par>')
    for spid, dur, muted in videos:
        c = next(ids)
        vol = 'vol="0" mute="1"' if muted else 'vol="80000"'
        nodes += (f'<p:video><p:cMediaNode {vol}><p:cTn id="{c}" repeatCount="indefinite" fill="hold" display="0">'
                  f'<p:stCondLst><p:cond delay="indefinite"/></p:stCondLst></p:cTn>'
                  f'<p:tgtEl><p:spTgt spid="{spid}"/></p:tgtEl></p:cMediaNode></p:video>')
    return ('<p:timing><p:tnLst><p:par><p:cTn id="1" dur="indefinite" restart="never" nodeType="tmRoot"><p:childTnLst>'
            '<p:par><p:cTn id="2" fill="hold"><p:stCondLst><p:cond delay="indefinite"/><p:cond evt="onBegin" delay="0">'
            '<p:tn val="2"/></p:cond></p:stCondLst><p:childTnLst><p:par><p:cTn id="3" fill="hold"><p:stCondLst>'
            f'<p:cond delay="0"/></p:stCondLst><p:childTnLst>{calls}</p:childTnLst></p:cTn></p:par></p:childTnLst>'
            f'</p:cTn></p:par>{nodes}</p:childTnLst></p:cTn></p:par></p:tnLst></p:timing>')


def main():
    shutil.rmtree(WORK, ignore_errors=True)
    zipfile.ZipFile(SRC).extractall(WORK)
    media_dir = os.path.join(WORK, 'ppt', 'media')
    rels_dir = os.path.join(WORK, 'ppt', 'slides', '_rels')

    # 1) dedupe identical media
    first_by_hash, rename = {}, {}
    for name in sorted(os.listdir(media_dir)):
        h = hashlib.sha256(open(os.path.join(media_dir, name), 'rb').read()).hexdigest()
        if h in first_by_hash:
            rename[name] = first_by_hash[h]
            os.remove(os.path.join(media_dir, name))
        else:
            first_by_hash[h] = name
    for rel in os.listdir(rels_dir):
        p = os.path.join(rels_dir, rel)
        x = open(p, encoding='utf-8').read()
        for old, new in rename.items():
            x = x.replace(f'../media/{old}"', f'../media/{new}"')
        open(p, 'w', encoding='utf-8').write(x)

    # 2) per slide: autoplay/loop timing + transition
    slides_dir = os.path.join(WORK, 'ppt', 'slides')
    slide_files = sorted((f for f in os.listdir(slides_dir) if re.fullmatch(r'slide\d+\.xml', f)), key=lambda f: int(f[5:-4]))
    for f in slide_files:
        n = int(f[5:-4])
        p = os.path.join(slides_dir, f)
        x = open(p, encoding='utf-8').read()
        rels = open(os.path.join(rels_dir, f + '.rels'), encoding='utf-8').read()
        videos = []
        for pic in re.findall(r'<p:pic>.*?</p:pic>', x, flags=re.S):
            if '<a:videoFile' not in pic:
                continue
            spid = re.search(r'<p:cNvPr id="(\d+)"', pic).group(1)
            rid = re.search(r'<a:videoFile r:link="(rId\d+)"', pic).group(1)
            target = re.search(rf'Id="{rid}"[^>]*Target="([^"]+)"', rels) or re.search(rf'Target="([^"]+)"[^>]*Id="{rid}"', rels)
            cx = int(re.search(r'<a:ext cx="(\d+)"', pic).group(1))
            is_bg = cx > 11_000_000  # full-bleed = background loop
            videos.append((spid, BG_MS if is_bg else REEL_MS, is_bg))
        x = re.sub(r'<p:transition.*?</p:transition>|<p:transition[^>]*/>', '', x, flags=re.S)
        x = re.sub(r'<mc:AlternateContent.*?</mc:AlternateContent>', '', x, flags=re.S)
        x = re.sub(r'<p:timing>.*?</p:timing>', '', x, flags=re.S)
        extra = (MORPH_XML if n in MORPH else FADE) + (timing(videos) if videos else '')
        anchor = '</p:clrMapOvr>' if '</p:clrMapOvr>' in x else '</p:cSld>'
        x = x.replace(anchor, anchor + extra, 1)
        open(p, 'w', encoding='utf-8').write(x)
        print(f'slide {n}: {"morph" if n in MORPH else "fade"}, videos={[(v[0], "bg" if v[2] else "reel") for v in videos]}')

    # 3) repack (zip from inside the folder)
    os.remove(SRC)
    with zipfile.ZipFile(SRC, 'w', zipfile.ZIP_DEFLATED) as z:
        ct = os.path.join(WORK, '[Content_Types].xml')
        z.write(ct, '[Content_Types].xml')
        for root, _, files in os.walk(WORK):
            for name in files:
                full = os.path.join(root, name)
                arc = os.path.relpath(full, WORK)
                if arc == '[Content_Types].xml':
                    continue
                # videos are already compressed; store them as-is
                z.write(full, arc, compress_type=zipfile.ZIP_STORED if arc.endswith('.mp4') else zipfile.ZIP_DEFLATED)
    shutil.rmtree(WORK)
    print('deduped media:', len(rename), '| size:', round(os.path.getsize(SRC) / 1e6, 1), 'MB')


if __name__ == '__main__':
    main()
