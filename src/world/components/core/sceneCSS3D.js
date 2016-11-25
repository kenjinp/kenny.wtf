// import ObjectCloud from '../objects/objectCloud'
// import Dots from '../objects/dots/index'
// import PostProcessing from '../../postProcessing/postProcessing'
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
  constructor (Renderer, Camera, Stages, Pages) {
    console.log('stages', Stages)
    super()

    this.renderer = Renderer
    this.camera = Camera
    this.stages = Stages
    this.pages = Pages

    this.createScene()
  }

  /**
   * CreateScene function
   * @return {void}
   */
  createScene () {
    this.stages.forEach((s, i) => {
      const stage = s
      const obj = new THREE.CSS3DObject(this.pages[i])
      // obj.position.z = 0 // move a little in front
      stage.add(obj)
      this.add(stage)
    })
  }

  /**
   * Render function
   * @return {void}
   */
  render () {
    this.renderer.render(this, this.camera)
  }
}

export default Scene
