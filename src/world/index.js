import RendererWEBGL from './components/core/rendererWEBGL'
import RendererCSS3D from './components/core/rendererCSS3D'

import SceneWEBGL from './components/core/sceneWEBGL'
import SceneCSS3D from './components/core/sceneCSS3D'

import Stage from './components/core/stage'

import Clock from './components/core/clock'
import Camera from './components/core/camera'
import Emitter from './components/helpers/emitter'
import * as THREE from 'three'
import * as _ from 'lodash'
/*
 * World class
 */
class World {
  /**
   * Constructor function
   * @param {domElement} container - Canvas container
   * @param {domElement[]} pages   - Dom elements to add to stages
   * @constructor
   */
  constructor (container, pages) {
    console.log('making world', container, pages)
    this.container = container
    this.stages = _.map(pages, (val, index) => {
      console.log(val, index)
      return new Stage('name' + index, new THREE.Vector3(0, index * 500, 0))
    })

    const width = this.container.offsetWidth
    const height = this.container.offsetHeight

    // CLOCK
    this.clock = new Clock()

    // RENDER
    this.renderer = {
      webgl: new RendererWEBGL(this.container),
      css3d: new RendererCSS3D(this.container)
    }

    // CAMERA
    this.camera = new Camera(width, height)
    this.camera.position.z = 1000

    // SCENE (Add stages info/data here too!)
    this.scene = {
      webgl: new SceneWEBGL(this.renderer.webgl, this.camera, this.clock, this.stages),
      css3d: new SceneCSS3D(this.renderer.css3d, this.camera, this.clock, this.stages)
    }
  }

  /**
   * Render function
   * @return {void}
   */
  render () {
    this.camera.update(this.clock.delta)

    this.scene.webgl.render()
    this.scene.css3d.render()
  }

  /**
   * Move camera to stage
   * @param {integer} stage - Stage index
   * @return {void}
   */
  moveToStage (index) {
    this.camera.moveTo(this.stages[index].position)
  }

  /**
   * Start animation when entering route
   * @param {integer} stage - Stage index
   * @return {void}
   */
  startAnimate (index) {
    const x = this.stages[index].position.x
    const y = this.stages[index].position.y
    const z = this.stages[index].position.z - 4000
    this.camera.start(new THREE.Vector3(x, y, z), this.stages[index].position)
  }

  /**
   * Resize
   * @param {integer} width  - Width
   * @param {integer} height - Height
   * @return {void}
   */
  resize (width, height) {
    Emitter.emit('resize', width, height)
  }

  /**
   * Mouse Move
   * @param {integer} x  - Position X
   * @param {integer} y - Position Y
   * @return {void}
   */
  mouseMove (x, y) {
    Emitter.emit('mousemove', x, y)
  }
}

export default World
