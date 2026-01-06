---
title: Habitat
featured: true
draft: false
githubLink: https://github.com/kenjinp/habitat
heroImage: "/habitat.png"
heroImageAlt: "Habitat project preview (O'Neill cylinder orbital habitat vignette)"
webLink: https://habitat.kenny.wtf
tags:
  - hello-worlds
  - procgen
  - graphics
description: A vignette of an O'Neill orbital habitat using @hello-worlds/react and a playground for various graphics programming and land generation techniques
---

# Habitat

Habitat is an experiment to validate one of the non-standard world topologies that come standard with the @hello-worlds library. It's inspired by scifi, especially the Cycler habitats featured in Kim Stanley Robinson's book [_2312_](https://www.goodreads.com/book/show/11830394-2312), or O'Neill habitats featured in other works.

Making a world wrap around itself was the primary motivator behind the hello-worlds library. I wanted to make a game setting based inside a Hollow-Earth, basically an inverted-sphere planet (such as featured in the opening intro to the _Game of Thrones_ tv show). I've had some success with that, but I got distracted by beautiful non-real-time renders of O'Neill habitats, and decided to create a "vignette" of what it might look like to have a real-time rendered virtual world inside such as setting. After all, it should be much easier to create a virtual world when it's small and can be rolled-up, right???

Well, nope.

Some considerations and bespoke solutions inside this project include (in various states of done-ness) a volumetric atmosphere solution which considers the shape of a cylinder (atmosphere gets thinner towards the cylinder-center-line), a cylinder-based camera solution (you always point outwards), and an interesting down/upsampling pipeline to optimize performance of the ray-marched volumetric atmosphere (not related to the cylinder, but nevertheless awesome).

Some other thoughts about cylinder worlds à la O'Neill cylinders:

They wrap nicely along one axis, so you can use tiling terrains, especially as you can easily have land areas which are squares (which would not be true of Halo-type ring wolds, for example):
<img class="h-256 object-scale-down" src="/large-terrain.png" alt="A tiled terrain heightmap I prepared" />

Here's some more photos, I think it's a pretty project so far :)

A look at what realistic tiled heightmaps can get you:

<img class="h-256 object-scale-down" src="/habitat-screenshot-2.png" alt="A look at what realistic tiled heightmaps can get you " />

A look through the downsampled atmosphere shader:

<img class="h-256 object-scale-down" src="/habitat-screenshot-1.png" alt="A look through the downsampled atmosphere shader" />
