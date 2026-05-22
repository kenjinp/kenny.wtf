# Splatter atlas pipeline

Tooling that produces the texture atlas sampled by `Stars.tsx`
(`CcnycPosterMay26`).

## Inputs / outputs

```
public/assets/materials/splatter/
  splatter_1.png            # source: single-channel splatter (alpha-only)
  splatter_2/               # one PNG per isolated paint drop
    drop_001.png … drop_NNN.png
    _preview.png            # bounding-box overlay for visual QA
  splatter_atlas.png        # packed atlas (committed)
  splatter_atlas.json       # tile metadata (committed)
```

## Workflow

1. **Extract** individual drops from `splatter_1.png` into `splatter_2/`:

   ```sh
   python3 apps/astro/scripts/splatter/extract_splatter.py
   ```

   Each 8-connected opaque blob becomes one PNG with 2 px transparent padding,
   ordered top-to-bottom / left-to-right.

2. **Pack** drops into the atlas + JSON:

   ```sh
   python3 apps/astro/scripts/splatter/build_splatter_atlas.py
   ```

   Shelf-packed (tallest-first) with a 2 px gutter between tiles. JSON entries
   give the pixel rect and pre-computed `u0,v0,u1,v1` UV bounds plus
   `aspect = w/h` for the renderer.

Both scripts must be run from the repo root.

Dependencies: `Pillow`, `numpy`, `scipy` for `extract_splatter.py`; just
`Pillow` for `build_splatter_atlas.py`. Use a venv:

```sh
python3 -m venv .venv-tools
.venv-tools/bin/pip install Pillow numpy scipy
.venv-tools/bin/python apps/astro/scripts/splatter/extract_splatter.py
.venv-tools/bin/python apps/astro/scripts/splatter/build_splatter_atlas.py
```
