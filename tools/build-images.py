#!/usr/bin/env python3
"""Build responsive AVIF / WebP / fallback variants for every image the site references.

Reads image paths from build-pages.mjs and index.html, writes variants to assets/opt/ and a
manifest (assets/opt/manifest.json) that optimize-html.mjs uses to rewrite <img> tags.
Needs Pillow 11.3+ (AVIF + WebP). Originals are never modified or deleted.
Run from the repo root:  python3 tools/build-images.py
"""
import json, os, re, sys
from PIL import Image, ImageOps, features

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "opt")
LADDER = [480, 800, 1200, 1600]
# Small fixed-size assets: widths chosen from their displayed size (1x / 2x / 3x).
OVERRIDE = {
    "assets/client/rooterman-wordmark.png": [132, 264, 396],
    "assets/client/rm-mascot.png": [112, 225],
    "assets/client/best-of-round-rock-2026.png": [116, 224, 280],
}
AVIF_Q, WEBP_Q, JPEG_Q = 50, 74, 78


def referenced():
    found = set()
    for name in ("build-pages.mjs", "index.html"):
        with open(os.path.join(ROOT, name), encoding="utf-8") as f:
            found.update(re.findall(r"assets/(?:client|generated|brand)/[A-Za-z0-9._-]+\.(?:png|jpe?g)", f.read()))
    return sorted(found)


def main():
    if not (features.check("avif") and features.check("webp")):
        sys.exit("Pillow build lacks AVIF or WebP support; nothing written.")
    os.makedirs(OUT, exist_ok=True)
    manifest, skipped, total = {}, [], 0
    for rel in referenced():
        src = os.path.join(ROOT, rel)
        if not os.path.exists(src):
            skipped.append(rel)
            continue
        im = Image.open(src)
        im.load()
        im = ImageOps.exif_transpose(im)  # phone photos carry their rotation in EXIF; bake it in
        alpha = im.mode in ("RGBA", "LA", "P") and ("transparency" in im.info or im.mode in ("RGBA", "LA"))
        im = im.convert("RGBA" if alpha else "RGB")
        w0, h0 = im.size
        widths = OVERRIDE.get(rel) or [w for w in LADDER if w < w0] + [min(w0, LADDER[-1])]
        widths = sorted(set(w for w in widths if w <= w0)) or [w0]
        stem = os.path.splitext(os.path.basename(rel))[0]
        fb_ext = "png" if alpha else "jpg"
        # Fallback <img src>: the variant nearest 800px wide (browsers without AVIF/WebP are rare).
        fb_w = min(widths, key=lambda w: abs(w - 800))
        for w in widths:
            h = round(h0 * w / w0)
            v = im if w == w0 else im.resize((w, h), Image.LANCZOS)
            v.save(os.path.join(OUT, f"{stem}-{w}.avif"), quality=AVIF_Q, speed=4)
            v.save(os.path.join(OUT, f"{stem}-{w}.webp"), quality=WEBP_Q, method=6)
            total += 2
            if w == fb_w:
                if alpha:
                    v.save(os.path.join(OUT, f"{stem}-{w}.png"), optimize=True)
                else:
                    v.save(os.path.join(OUT, f"{stem}-{w}.jpg"), quality=JPEG_Q, optimize=True, progressive=True)
                total += 1
        manifest[rel] = {"stem": stem, "w": w0, "h": h0, "widths": widths, "fallback": f"{stem}-{fb_w}.{fb_ext}"}
    # Favicon: the mascot at 64px and 180px instead of the 71 KB original.
    mascot = os.path.join(ROOT, "assets/client/rm-mascot.png")
    if os.path.exists(mascot):
        m = Image.open(mascot).convert("RGBA")
        for size in (64, 180):
            side = max(m.size)
            canvas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
            canvas.paste(m, ((side - m.size[0]) // 2, (side - m.size[1]) // 2))
            canvas.resize((size, size), Image.LANCZOS).save(os.path.join(OUT, f"favicon-{size}.png"), optimize=True)
            total += 1
    with open(os.path.join(OUT, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=1, sort_keys=True)
    size = sum(os.path.getsize(os.path.join(OUT, n)) for n in os.listdir(OUT))
    print(f"images: {len(manifest)} sources, {total} files written, {size // 1024} KB in assets/opt/")
    if skipped:
        print("SKIPPED (referenced but missing on disk):", ", ".join(skipped))


if __name__ == "__main__":
    main()
