import {randomInt} from '../../../utils/random'
import * as THREE from 'three'

/**
 * DotsMaterial class
 * Return random material each time
 */
class DotsMaterial extends THREE.PointsMaterial {

  /**
   * Constructor function
   * @param {Int} particle The particle type to use
   */
  constructor (particle) {
    // Load textures
    const textureLoader = new THREE.TextureLoader()
    const sprite1 = textureLoader.load('/static/particles/particles1.png')
    const sprite2 = textureLoader.load('/static/particles/particlestwo.png')
    const sprite3 = textureLoader.load('/static/particles/particlesthree.png')
    const sprite4 = textureLoader.load('/static/particles/particlesfour.png')
    const sprite5 = textureLoader.load('/static/particles/particlesfive.png')
    const sprite6 = textureLoader.load('/static/particles/particlesix.png')
    const sprite7 = textureLoader.load('/static/particles/particleseven.png')
    const sprite8 = textureLoader.load('/static/particles/particleeight.png')
    const sprite9 = textureLoader.load('/static/particles/particlenine.png')

    const parameters = [
      sprite1,
      sprite2,
      sprite3,
      sprite4,
      sprite5,
      sprite6,
      sprite7,
      sprite8,
      sprite9
    ]

    particle = particle || randomInt(0, 8)

    super({
      map: parameters[particle],
      size: randomInt(5, 15),
      fog: true,
      rotation: Math.PI / 4,
      transparent: true
    })
  }

  /**
   * Update function
   * @param {number} time Time
   */
  update (time) {}

  /**
   * Generate Sprite
   * @return {canvas} canvas - Use in new THREE.CanvasTexture(this.generateSprite())
   *                           together with blending THREE.MultiplyBlending
   */
  generateSprite () {
    var canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    var context = canvas.getContext('2d')
    context.rotate(Math.PI / 4)
    var gradient = context.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2)
    gradient.addColorStop(0, 'rgba(0,0,255,1)')
    gradient.addColorStop(0.2, 'rgba(0,255,255,1)')
    gradient.addColorStop(0.4, 'rgba(255,255,200,1)')
    gradient.addColorStop(1, 'rgba(255,255,255,1)')
    context.fillStyle = gradient
    context.fillRect(0, 0, canvas.width, canvas.height)
    return canvas
  }
}

export default DotsMaterial
