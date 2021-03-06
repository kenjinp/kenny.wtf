import {randomInt} from '../../../utils/random'
import * as THREE from 'three'

/**
 * DotsGeometry class
 */
class DotsGeometry extends THREE.Geometry {
  /**
   * Constructor function
   */
  constructor () {
    super()

    for (let i = 0; i < 315; i++) {
      var vertex = new THREE.Vector3()
      vertex.x = randomInt(-1000, 1000)
      vertex.y = randomInt(-1000, 1000)
      vertex.z = randomInt(-800, 800)
      this.vertices.push(vertex)
    }

    // Merge geometry
    // http://www.jbernier.com/merging-geometries-in-three-js
  }
}

export default DotsGeometry
