import RendererWEBGL from './components/core/rendererWEBGL'
import RendererCSS3D from './components/core/rendererCSS3D'

import SceneWEBGL from './components/core/sceneWEBGL'
import SceneCSS3D from './components/core/sceneCSS3D'

import Stage from './components/core/stage'

import Clock from './components/core/clock'
import Camera from './components/core/camera'
import Emitter from './components/helpers/emitter'
import * as THREE from 'three'
// import _ from 'lodash'
/*
 * World class
 */
class World {
  /**
   * Constructor function
   * @param {domElement} container - Canvas container
   * @constructor
   */
  constructor (container) {
    this.container = container
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

    // STAGE
    this.stage = {
      webgl: new Stage(new THREE.Vector3(0, 300, -500)),
      css3d: new Stage(new THREE.Vector3(0, 300, -500))
    }

    // SCENE
    this.scene = {
      webgl: new SceneWEBGL(this.renderer.webgl, this.camera, this.clock, this.stage.webgl),
      css3d: new SceneCSS3D(this.renderer.css3d, this.camera, this.stage.css3d)
    }
  }

  setContent (content) {
    console.log('SET CONTENT', content)
    // let stage = new Stage('thing', new THREE.Vector3(0, 60, 0))
    // this.scene.css3d.setContent(stage, content)
    this.stage.css3d.setContent(content)
  }

  rotateLeft () {
    console.log('rotating left')
    this.stage.webgl.rotateLeft()
    this.stage.css3d.rotateLeft()
  }

  rotateRight () {
    this.stage.webgl.rotateRight()
    this.stage.css3d.rotateRight()
  }

  rotateUp () {
    this.stage.webgl.rotateUp()
    this.stage.css3d.rotateUp()
  }

  rotateDown () {
    this.stage.webgl.rotateDown()
    this.stage.css3d.rotateDown()
  }

  /**
   * Render function
   * @return {void}
   */
  render () {
    this.camera.update(this.clock.delta)
    this.renderer.webgl.render(this.scene.webgl, this.camera)
    this.scene.webgl.render()
    this.renderer.css3d.render(this.scene.css3d, this.camera)
    this.scene.css3d.render()
  }

  /**
   * Move camera to stage
   * @param {integer} stage - Stage index
   * @return {void}
   */
  moveToStage (index) {
    let stage = this.stages[index]
    if (stage) {
      this.camera.moveTo(stage.position)
    }
  }

  /**
   * Start animation when entering route
   * @param {integer} stage - Stage index
   * @return {void}
   */
  startAnimate (index) {
    // const x = this.stages[index].position.x
    // const y = this.stages[index].position.y
    // const z = this.stages[index].position.z - 4000
    // this.camera.start(new THREE.Vector3(x, y, z), this.stages[index].position)
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
