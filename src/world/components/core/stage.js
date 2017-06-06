import _ from 'lodash'
import * as THREE from 'three'
import { TweenLite } from 'gsap'
const DEFAULT_SIZE = 50 * 15
const SPEED = 0.8

const SIDES = [
  {
    y: 0,
    x: 0,
    z: 1,
    xRot: 0
  },
  {
    y: 0,
    x: -1,
    z: 0,
    yRot: -(Math.PI / 2)
  },
  {
    y: 0,
    x: 0,
    z: -1,
    yRot: (Math.PI / 2) * 2
  },
  {
    y: 0,
    x: 1,
    z: 0,
    yRot: Math.PI / 2
  },
  {
    y: 1,
    x: 0,
    z: 0,
    xRot: -(Math.PI / 2)
  },
  {
    y: -1,
    x: 0,
    z: 0,
    xRot: Math.PI / 2
  }
]

class Stage extends THREE.Group {
  /**
   * Constructor function
   * @param {Vector3} position - Position in world
   * @constructor
   */
  constructor (position, centerObject) {
    super()
    this.position.set(position.x, position.y, position.z)
    this.centerObject = centerObject || this.defaultCenterObject()
    this.add(this.centerObject)
    this.faces = []
    this.makeSquare(DEFAULT_SIZE)
    this.rotation.x = -0.05 * (Math.PI / 2)
  }

  defaultCenterObject () {
    let boxGeo = new THREE.BoxBufferGeometry(DEFAULT_SIZE, DEFAULT_SIZE, DEFAULT_SIZE)
    let boxColor = 0xf3928e
    let boxMat = new THREE.MeshStandardMaterial({color: boxColor, shading: THREE.FlatShading, roughness: 0.8, metalness: 0})
    let box = new THREE.Mesh(boxGeo, boxMat)
    return box
  }

  setContent (htmlContent) {
    console.log('CONTENT ', htmlContent)
    this.replaceFace(0, htmlContent[0])
    // if (htmlContent.length) {
    //   _.each(htmlContent, content => this.makeObject(content))
    // } else {
    //   this.makeObject(htmlContent)
    // }
    // setTimeout(() => this.rotateRight(), 1000)
  }

  replaceFace (index, content) {
    let obj = this.faces[index]
    console.log(this.faces, obj)
    this.makeFace(content, obj.position, obj.rotation)
    this.remove(obj.name)
  }

  makeFace (content, position, rotation) {
    let obj = new THREE.CSS3DObject(content)
    obj.position.set(position.x, position.y, position.z)
    obj.rotation.set(rotation.x, rotation.y, rotation.z)
    this.faces.push(obj)
    this.add(obj)
  }

  makeSquare (size) {
    let half = size / 2
    _.each(SIDES, (side, index) => {
      let x = (side.x * half)
      let y = (side.y * half)
      let z = (side.z * half)
      let yRot = side.yRot
      let xRot = side.xRot
      let zRot = side.zRot
      let div = document.createElement('div')
      div.innerHTML = `<h1>${index}</h1>`
      div.className += 'square'
      let position = new THREE.Vector3(x, y, z)
      let rotation = new THREE.Vector3(xRot, yRot, zRot)
      this.makeFace(div, position, rotation)
    })
  }

  update (time) {
    // this.rotation.y += 0.001
  }

  rotateRight () {
    let rotation = this.rotation
    let goal = rotation.y - Math.PI / 2
    TweenLite.to(rotation, SPEED, {
      y: goal
    })
  }

  rotateLeft () {
    console.log('stage left', this)
    let rotation = this.rotation
    let goal = rotation.y + Math.PI / 2
    TweenLite.to(rotation, SPEED, {
      y: goal
    })
  }

  rotateUp () {
    let rotation = this.rotation
    let goal = rotation.x + Math.PI / 2
    TweenLite.to(rotation, SPEED, {
      x: goal
    })
  }

  rotateDown () {
    let rotation = this.rotation
    let goal = rotation.x - Math.PI / 2
    TweenLite.to(rotation, SPEED, {
      x: goal
    })
  }
}

export default Stage
