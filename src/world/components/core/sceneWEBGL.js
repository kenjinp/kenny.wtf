import Particles from '../objects/particles'
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
   */
  constructor (Renderer, Camera, Clock, stage) {
    super()

    this.renderer = Renderer
    this.camera = Camera
    this.clock = Clock
    this.stage = stage
    this.createScene()
  }

  /**
   * CreateScene function
   * @return {void}
   */
  createScene () {
    // Add lights
    const ambient = new THREE.AmbientLight(0xf3928e)
    this.add(ambient)

    this.particles = new Particles()
    this.add(this.particles)

    const spot = new THREE.DirectionalLight(0xf3928e, 1.75) // 0xdfebff
    spot.position.set(0, -500, 500)
    spot.position.multiplyScalar(1.3)
    spot.intensity = 1
    spot.castShadow = true
    spot.shadowMapWidth = 1000
    spot.shadowMapHeight = 1000
    this.add(spot)
    console.log('CREATING SCNE WITH STAGE', this.stage)
    this.add(this.stage)
    // this.planetObject()
  }

  planetObject () {
    this.planet = null
    this.modelLoader = new THREE.JSONLoader()
    this.modelLoader.load('static/planet2.json', (geometry) => {
      let planetColor = 0xFFFFFF
      let material = new THREE.MeshStandardMaterial({color: planetColor, shading: THREE.FlatShading, roughness: 0.8, metalness: 0})
      this.planet = new THREE.Mesh(geometry, material)
      this.stage.add(this.planet)
      this.planet.rotation.z = 50
      this.planet.scale.set(50, 50, 50)
      this.planet.castShadow = true
      this.planet.receiveShadow = true

      var radius = 1000
      var segments = 64
      var material1 = new THREE.LineDashedMaterial({ color: 0x342e3d, linewidth: 1, dashSize: 20, gapSize: 50 })
      var geometry2 = new THREE.CircleGeometry(radius, segments)

      // Remove center vertex
      geometry2.vertices.shift()
      geometry2.computeLineDistances()
      this.orbit = new THREE.Line(geometry2, material1)
      this.orbit.rotation.set(90, 15, 45)
      this.stage.add(this.orbit)
    })
  }

  /**
   * Render function
   * @return {void}
   */
  render () {
    this.particles.update(this.clock.time)
    this.stage.update(this.clock.time)
  }
}

export default Scene
