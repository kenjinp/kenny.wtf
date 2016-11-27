import * as THREE from 'three'

class Planet extends THREE.Object3D {
  /**
   * Constructor function
   * @constructor
   */
  constructor () {
    this.modelLoader.load('static/planet.js', (geometry) => {
      let material = new THREE.MeshStandardMaterial({color: 0x88638c, shading: THREE.FlatShading, roughness: 0.8, metalness: 0})
      this.planet = new THREE.Mesh(geometry, material)
      this.add(this.planet)
      this.planet.scale.set(50, 50, 50)
      this.planet.position.set(0, 60, -100)
      this.planet.castShadow = true
      this.planet.receiveShadow = true
      this.planet.orbitAngle = randomInt(0, 360)
      this.planet.orbitSpeed = 0.08
      this.planet.rotationSpeed = 0.001
      this.planet.orbitRadius = 800
      this.add(this.planet)
    })
  }

  /**
   * Update function
   * @param {number} time Time
   */
  update (time) {
  }
}

export default Stars
