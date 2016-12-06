import Moon from './Moon'
import * as _ from 'lodash'
import * as THREE from 'three'

class GasGiant extends THREE.Object3D {
  /**
   * Constructor function
   * @constructor
   */
  constructor (stages) {
    super()

    this.rings = []
    this.moons = []
    this.modelLoader = new THREE.JSONLoader()
    this.material = new THREE.MeshStandardMaterial({
      color: 0xF6D169,
      shading: THREE.FlatShading,
      roughness: 1,
      metalness: 0
    })
    this.modelLoader.load('static/gasGiant.js', (geometry) => {
      this.body = new THREE.Mesh(geometry, this.material)
      this.body.scale.set(50, 50, 50)
      this.body.castShadow = true
      this.body.receiveShadow = true
      this.centroid = this.getCenterPoint(this.body)
      // this.makeOrbit(1000, [0, 0, 0])
      this.makeRings()
      this.add(this.body)
      this.moons.push(new Moon({
        mesh: '/static/planet2.json',
        color: 0xeef4f8,
        inclination: 35,
        radius: 1500,
        scale: 5,
        angularSpeed: 10,
        stages: stages
      }))

      this.moons.push(new Moon({
        mesh: '/static/planet.js',
        color: 0xeef4f8,
        inclination: 3,
        radius: 1000,
        scale: 2,
        angularSpeed: 10
      }))

      _.each(this.moons, this.add.bind(this))
    })
  }

  getCenterPoint (mesh) {
    var middle = new THREE.Vector3()
    var geometry = mesh.geometry

    geometry.computeBoundingBox()

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2

    mesh.localToWorld(middle)
    return middle
  }

  makeRings () {
    let ringMaterial = new THREE.MeshStandardMaterial({
      color: 0xE6A972,
      shading: THREE.FlatShading,
      roughness: 1,
      metalness: 0,
      side: THREE.DoubleSide
    })

    let rings = [
      [500, 600],
      [625, 650],
      [655, 720],
      [730, 800]
    ]

    for (let i = 0; i < rings.length; i++) {
      let ring = rings[i]
      if (ring) {
        let geometry = new THREE.RingBufferGeometry(ring[0], ring[1], 30, 1)
        let ringMesh = new THREE.Mesh(geometry, ringMaterial)
        ringMesh.position.set(this.centroid.x, this.centroid.y, this.centroid.z)
        ringMesh.castShadow = true
        ringMesh.receiveShadow = true
        this.add(ringMesh)
        this.rings.push(ringMesh)
      }
    }
  }

  /**
   * Update function
   * @param {number} time Time
   */
  update (time) {
    // Kald sub-objecters update here
  }
}

export default GasGiant
