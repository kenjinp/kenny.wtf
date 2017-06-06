import * as THREE from 'three'

/**
 * Scene class
 */
class Scene extends THREE.Scene {
  /**
   * Constructor function
   * @param {Renderer}     Renderer - Renderer instance
   * @param {Camera}       Camera   - Camera instance
   * @param {Stages[]}     Stages   - Stages
   * @param {domElement[]} Pages    - Pages to add to stages
   */
  constructor (Renderer, Camera, Stage) {
    super()

    this.renderer = Renderer
    this.camera = Camera
    this.stage = Stage

    this.createScene()
  }

  /**
   * CreateScene function
   * @return {void}
   */
  createScene () {
    this.add(this.stage)
  }

  /**
   * Render function
   * @return {void}
   */
  render (time) {
    this.renderer.render(this, this.camera)
    this.stage.update(time)
  }
}

export default Scene
