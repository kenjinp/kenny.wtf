---
title: Terrain Synth
featured: true
draft: false
githubLink: https://github.com/kenjinp/terrain-synth
webLink: https://terrain-synth.kenny.wtf
heroImage: /terrain-synth.png
heroImageAlt: "Terrain Synth project preview (example-based terrain generation)"
tags:
  - terrain-synth
  - procgen
  - machine-learning
  - graphics
description: Example-based Terrain Generation powered by real-earth datasets and machine-learning
---

# Terrain Synth

Terrain Synth is my project at [Recurse Center](https://recurse.com) for exploring AI and Machine Learning. It's a test bed where I can explore various graphical and procedural generation techniques in a space that's a bit more forgiving than a spherical planet.

It uses a custom GAN that I've trained on real-earth GIS datasets to output the terrain, and a couple of postprocessing techniques to generate mesh details.

I'm especially proud of the volumetric atmospheric scattering shader which powers the atmosphere, which creates beautiful god rays.

It uses the [Hello-Worlds](/projects/hello-worlds) javascript library to render the terrain.
