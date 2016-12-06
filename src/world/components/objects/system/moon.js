import * as _ from 'lodash'
import * as THREE from 'three'

class Moon extends THREE.Object3D {
  /**
   * Constructor function
   * @constructor
   */
  constructor ({mesh, color, inclination, radius, scale, angularSpeed, rotation, stages}) {
    super()

    this.orbits = []
    this.modelLoader = new THREE.JSONLoader()
    this.stages = stages
    this.material = new THREE.MeshStandardMaterial({
      color: color,
      shading: THREE.FlatShading,
      roughness: 1,
      metalness: 0
    })
    this.modelLoader.load(mesh, (geometry) => {
      this.body = new THREE.Mesh(geometry, this.material)
      this.body.scale.set(scale, scale, scale)
      this.body.castShadow = true
      this.body.receiveShadow = true
      this.centroid = this.getCenterPoint(this.body)
      this.add(this.body)
      this.body.position.x = radius
      this.makeOrbit(radius, [0, 0, 0])
      this.setStages()
    })
    this.rotation.x = inclination
  }

  setStages () {
    if (this.stages) {
      this.parent.parent.parent.updateMatrixWorld()

      let vector = new THREE.Vector3()
      console.log('moon stage', this.stages, this)
      vector.setFromMatrixPosition(this.body.matrixWorld)
      console.log('maybey vettor', vector)
      _.each(this.stages, (stage) => {
        stage.position.set(vector)
        this.add(stage)
      })
    }
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

  getWorldPoint (mesh) {
    var middle = new THREE.Vector3()
    var geometry = mesh.geometry

    geometry.computeBoundingBox()

    middle.x = (geometry.boundingBox.max.x + geometry.boundingBox.min.x) / 2
    middle.y = (geometry.boundingBox.max.y + geometry.boundingBox.min.y) / 2
    middle.z = (geometry.boundingBox.max.z + geometry.boundingBox.min.z) / 2

    return middle
  }

  makeOrbit (radius, rotation) {
    let segments = 64
    let material = new THREE.LineDashedMaterial({
      color: 0xDEE2EA,
      linewidth: 1,
      dashSize: 20,
      gapSize: 50
    })
    let geometry = new THREE.CircleGeometry(radius, segments)
    geometry.vertices.shift()
    geometry.computeLineDistances()
    let orbit = new THREE.Line(geometry, material)
    orbit.rotation.set(rotation[0], rotation[1], rotation[2])
    orbit.position.set(this.centroid.x, this.centroid.y, this.centroid.z)
    this.add(orbit)
    this.orbits.push(orbit)
  }

  /**
   * Update function
   * @param {number} time Time
   */
  update (time) {
    // Kald sub-objecters update here

  }
}

export default Moon
