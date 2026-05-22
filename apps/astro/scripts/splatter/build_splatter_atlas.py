"""Pack `splatter_2/drop_*.png` into a single texture atlas + JSON metadata.

Produces:
  - splatter_atlas.png  (RGBA, tight shelf-packed)
  - splatter_atlas.json (atlasWidth/Height + per-tile {x,y,w,h, u0,v0,u1,v1, aspect})

Atlas is sampled with `flipY = false`, so tile UVs map directly from PIL pixel
coordinates (no Y inversion needed in shader).

Run from the repo root:
    python3 apps/astro/scripts/splatter/build_splatter_atlas.py

Requires: Pillow.
"""
from __future__ import annotations

import json
from pathlib import Path

from PIL import Image

SRC_DIR = Path("apps/astro/public/assets/materials/splatter/splatter_2")
OUT_PNG = Path("apps/astro/public/assets/materials/splatter/splatter_atlas.png")
OUT_JSON = Path("apps/astro/public/assets/materials/splatter/splatter_atlas.json")
GUTTER = 2  # transparent pixels between tiles to prevent mipmap bleed


def shelf_pack(rects: list[tuple[int, int, int]], max_width: int):
    """Bottom-left shelf packing.

    rects: list of (index, width, height).
    Returns dict[index] -> (x, y) and the final (atlasW, atlasH).
    """
    rects_sorted = sorted(rects, key=lambda r: -r[2])  # tallest first
    positions: dict[int, tuple[int, int]] = {}
    x = GUTTER
    y = GUTTER
    shelf_h = 0
    max_x_used = 0
    for idx, w, h in rects_sorted:
        if x + w + GUTTER > max_width:
            y += shelf_h + GUTTER
            x = GUTTER
            shelf_h = 0
        positions[idx] = (x, y)
        x += w + GUTTER
        shelf_h = max(shelf_h, h)
        max_x_used = max(max_x_used, x)
    atlas_w = max_x_used + GUTTER
    atlas_h = y + shelf_h + GUTTER
    return positions, atlas_w, atlas_h


def pick_best_width(rects: list[tuple[int, int, int]]) -> tuple[dict[int, tuple[int, int]], int, int]:
    total_area = sum((w + GUTTER) * (h + GUTTER) for _, w, h in rects)
    # candidate widths around sqrt(area), powers of two
    seed_w = max(32, int(total_area**0.5))
    candidates = []
    w = 32
    while w <= 2048:
        candidates.append(w)
        w *= 2
    candidates = [c for c in candidates if c >= seed_w // 2]

    best = None
    for max_w in candidates:
        positions, atlas_w, atlas_h = shelf_pack(rects, max_w)
        area = atlas_w * atlas_h
        if best is None or area < best[0]:
            best = (area, positions, atlas_w, atlas_h)
    assert best is not None
    return best[1], best[2], best[3]


def main() -> None:
    files = sorted(SRC_DIR.glob("drop_*.png"))
    if not files:
        raise SystemExit(f"no drop_*.png files in {SRC_DIR}")
    print(f"loading {len(files)} drops")

    imgs = [Image.open(f).convert("RGBA") for f in files]
    rects = [(i, im.width, im.height) for i, im in enumerate(imgs)]
    positions, atlas_w, atlas_h = pick_best_width(rects)

    print(f"atlas size: {atlas_w} x {atlas_h}  (area={atlas_w*atlas_h})")

    atlas = Image.new("RGBA", (atlas_w, atlas_h), (0, 0, 0, 0))
    tiles = []
    for i, im in enumerate(imgs):
        x, y = positions[i]
        atlas.paste(im, (x, y))
        tiles.append(
            {
                "name": files[i].stem,
                "x": x,
                "y": y,
                "w": im.width,
                "h": im.height,
                "u0": x / atlas_w,
                "v0": y / atlas_h,
                "u1": (x + im.width) / atlas_w,
                "v1": (y + im.height) / atlas_h,
                "aspect": im.width / im.height,
            }
        )

    atlas.save(OUT_PNG, optimize=True)
    OUT_JSON.write_text(
        json.dumps(
            {
                "atlasWidth": atlas_w,
                "atlasHeight": atlas_h,
                "flipY": False,
                "tiles": tiles,
            },
            indent=2,
        )
    )
    print(f"wrote {OUT_PNG} ({OUT_PNG.stat().st_size} bytes)")
    print(f"wrote {OUT_JSON} ({len(tiles)} tiles)")


if __name__ == "__main__":
    main()
