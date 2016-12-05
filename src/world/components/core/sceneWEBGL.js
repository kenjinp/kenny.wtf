// import ObjectCloud from '../objects/objectCloud'
import Dots from '../objects/dots/index'
import Particles from '../objects/particles'
// import Stars from '../objects/stars/index'
// import randomInt from '../../utils/random-int'
// import * as _ from 'lodash'
// import PostProcessing from '../../postProcessing/postProcessing'
import * as THREE from 'three'

/**
 * Scene class
 */
class Scene extends THREE.Scene {
  /**
   * Constructor function
   * @param {Renderer} Renderer - Renderer instance
   * @param {Camera}   Camera   - Camera instance
   * @param {Clock}    Clock    - Clock instance
   * @param {Stages[]} Stages   - Stages
   */
  constructor (Renderer, Camera, Clock, Stages) {
    super()

    this.renderer = Renderer
    this.camera = Camera
    this.clock = Clock
    this.stages = Stages
    // this.postProcessing = new PostProcessing(this, this.renderer, this.camera)
    this.manager = new THREE.LoadingManager()
    this.modelLoader = new THREE.JSONLoader()

    this.createScene()
  }

  /**
   * CreateScene function
   * @return {void}
   */
  createScene () {
    this.stages.forEach((stage) => {
      this.add(stage)
    })

    // planet
    this.planet = null
    this.modelLoader.load('static/planet2.json', (geometry) => {
      // let planetColor = 0x88638c;
      let material = new THREE.MeshStandardMaterial({color: 0xEEF4F8, shading: THREE.FlatShading, roughness: 0.8, metalness: 0})
      this.planet = new THREE.Mesh(geometry, material)
      this.add(this.planet)
      this.planet.rotation.z = 50
      this.planet.scale.set(50, 50, 50)
      this.planet.position.set(0, 60, -100)
      this.planet.castShadow = true
      this.planet.receiveShadow = true
    })

    // Fog
    // this.fog = new THREE.Fog(0xffffff, 1300, 3500)

    // Add lights
    const ambient = new THREE.AmbientLight(0x4D4250)
    this.add(ambient)

    // Add dots
    this.dots = new Dots()
    this.position.z = -600
    this.position.y = 0
    this.add(this.dots)

    this.particles = new Particles()
    this.add(this.particles)

    // this.stars = new Stars()
    // this.add(this.stars)
    //
    // // Add boxes to World
    // this.objectCloud = new ObjectCloud()
    // this.objectCloud.z = -1000
    // this.add(this.objectCloud)
    //
    // // Add logo to home stage
    // var loader = new THREE.ObjectLoader(this.manager)
    // loader.load('/static/logo-object.json', (logo) => {
    //   logo.position.z = -1400
    //   logo.scale.multiplyScalar(500)
    //   this.stages[0].add(logo)
    // })

    /*
    var bbox = new THREE.BoundingBoxHelper(this.objectCloud, 0xff0000)
    bbox.update()
    this.add(bbox)
    */

    // const spot = new THREE.DirectionalLight(0xdfebff, 1.75) // 0xdfebff
    // spot.position.set(0, 0, -3000)
    // spot.position.multiplyScalar(1.3)
    // spot.intensity = 1
    // spot.castShadow = true
    // spot.shadowMapWidth = 1000
    // spot.shadowMapHeight = 1000
    // this.add(spot)
    // Spot light
    const spot = new THREE.DirectionalLight(0xdfebff, 1.75) // 0xdfebff
    spot.position.set(3000, 50, -600)
    spot.position.multiplyScalar(1.3)
    spot.intensity = 1
    spot.castShadow = true
    spot.shadowMapWidth = 1000
    spot.shadowMapHeight = 1000
    this.add(spot)

    // Shadow light
    // const shadowlight = new THREE.DirectionalLight(0xffffff, 0.3)
    // shadowlight.position.set(1000, 300, 2000)
    // shadowlight.castShadow = true
    // shadowlight.shadowDarkness = 0.04
    // this.add(shadowlight)
  }

  /**
   * Render function
   * @return {void}
   */
  render () {
    this.dots.update(this.clock.time)
    this.particles.update(this.clock.time)
    if (this.planet) {
      this.planet.rotation.y += 0.01
    }

    // this.postProcessing.update()
  }
}

export default Scene