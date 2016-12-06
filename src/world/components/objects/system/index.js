import GasGiant from './gasGiant'
import * as THREE from 'three'

class System extends THREE.Object3D {
  /**
   * Constructor function
   * @constructor
   */
  constructor (stages) {
    super()
    this.jupiter = new GasGiant(stages)
    this.jupiter.rotation.set(90, 0, 180)
    this.add(this.jupiter)

    // this.jupiter.rotation.x = 180
    // this.jupiter.rotation.y = 30
  }

  /**
   * Update function
   * @param {number} time Time
   */
  update (time) {
    // Kald sub-objecters update here
  }
}

export default System
