---
title: Habitat
featured: true
draft: false
githubLink: https://github.com/kenjinp/habitat
heroImage: "/habitat.png"
webLink: https://habitat.kenny.wtf
tags:
  - hello-worlds
  - procgen
  - graphics
description: A vignette of an O'Neill orbital habitat using @hello-worlds/react and a playground for various graphics programming and land generation techniques
---

# Habitat

Habitat is an experiment to validate non-standard world topologies that come standard with the @hello-worlds library. It's inspired by scifi, especially the Cycler habitats featured in Kim Stanley Robinson's book _2313_, or O'Neill habitats featured in other works.

Making a world wrap around itself was the primary motivator behind the hello-worlds library. I wanted to make a game settings based inside a Hollow-Earth, basically an inverted sphere planet (such as featured in the opening intro to the _Game of Thrones_ tv show). I've had som success with that, but I got distracted by beautiful non-real-time renders of O'Neill habitats, and decided to create a "vignette" of what it might look like to have a real-time rendered virtual world inside such as setting.

Some considerations and bespoke solutions inside this project include (in various states of done-ness) a volumetric atmosphere solution which considers the shape of a cylinder, a cylinder-based camera solution, and an interesting down/upsampling pipeline to optimize performance of the ray-marched volumetric atmosphere.
