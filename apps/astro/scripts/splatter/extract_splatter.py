"""Isolate each paint drop from `splatter_1.png` into its own file.

Finds 8-connected opaque components, crops each with a small padding, and
writes them to `splatter_2/drop_NNN.png` (ordered top-to-bottom, left-to-right).
Also writes `splatter_2/_preview.png` with bounding boxes for verification.

Run from the repo root:
    python3 apps/astro/scripts/splatter/extract_splatter.py

Requires: Pillow, numpy, scipy.
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

SRC = Path("apps/astro/public/assets/materials/splatter/splatter_1.png")
OUT_DIR = SRC.parent / "splatter_2"
PADDING = 2  # transparent pixels around each isolated drop
MIN_SIZE = 1  # keep every blob, even single-pixel speckle


def main() -> None:
    img = Image.open(SRC).convert("RGBA")
    arr = np.array(img)
    mask = arr[..., 3] > 0

    structure = np.ones((3, 3), dtype=int)  # 8-connectivity
    labeled, num = ndimage.label(mask, structure=structure)
    print(f"found {num} connected components")

    bboxes = ndimage.find_objects(labeled)
    sizes = ndimage.sum(mask, labeled, range(1, num + 1))

    # raster order (top-to-bottom, left-to-right) using bbox top-left
    order = sorted(
        range(num),
        key=lambda i: (bboxes[i][0].start, bboxes[i][1].start),
    )

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    for existing in OUT_DIR.glob("drop_*.png"):
        existing.unlink()
    preview_path = OUT_DIR / "_preview.png"
    if preview_path.exists():
        preview_path.unlink()

    preview = Image.new("RGBA", img.size, (32, 32, 32, 255))
    preview.alpha_composite(img)
    draw = ImageDraw.Draw(preview)
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None

    h, w = arr.shape[:2]
    kept = 0
    for new_idx, comp_i in enumerate(order, start=1):
        if sizes[comp_i] < MIN_SIZE:
            continue
        ys, xs = bboxes[comp_i]
        y0 = max(0, ys.start - PADDING)
        y1 = min(h, ys.stop + PADDING)
        x0 = max(0, xs.start - PADDING)
        x1 = min(w, xs.stop + PADDING)

        component_mask = labeled[y0:y1, x0:x1] == (comp_i + 1)
        crop = arr[y0:y1, x0:x1].copy()
        crop[~component_mask] = (0, 0, 0, 0)
        Image.fromarray(crop, mode="RGBA").save(
            OUT_DIR / f"drop_{new_idx:03d}.png", optimize=True
        )

        draw.rectangle((x0, y0, x1 - 1, y1 - 1), outline=(255, 64, 64, 255))
        draw.text((x0 + 1, max(0, y0 - 9)), str(new_idx), fill=(255, 200, 80, 255), font=font)
        kept += 1

    preview.save(preview_path)
    print(f"wrote {kept} drops to {OUT_DIR}")
    print(f"preview: {preview_path}")


if __name__ == "__main__":
    main()
