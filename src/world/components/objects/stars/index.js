import * as THREE from 'three'

class Stars extends THREE.PointCloud {
  /**
   * Constructor function
   * @constructor
   */
  constructor () {
    let starQty = 45000
    let geometry = new THREE.SphereGeometry(1000, 100, 50)

    let materialOptions = {
      size: 1.0,
      transparency: true,
      opacity: 0.7
    }

    let starStuff = new THREE.PointCloudMaterial(materialOptions)

    for (var i = 0; i < starQty; i++) {
      var starVertex = new THREE.Vector3()
      starVertex.x = Math.random() * 2000 - 1000
      starVertex.y = Math.random() * 2000 - 1000
      starVertex.z = Math.random() * 2000 - 1000

      geometry.vertices.push(starVertex)
    }

    super(geometry, starStuff)
  }

  /**
   * Update function
   * @param {number} time Time
   */
  update (time) {
  }
}

export default Stars
