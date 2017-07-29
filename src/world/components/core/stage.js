import _ from 'lodash'
import * as THREE from 'three'
import { TweenLite } from 'gsap'
const DEFAULT_SIZE = 50 * 15
const SPEED = 0.8

const nameIndex = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F'
]

const SIDES = [
  {
    name: 'A',
    neighbors: {
      u: 'E',
      d: 'F',
      l: 'B',
      b: 'C',
      r: 'D'
    },
    y: 0,
    x: 0,
    z: 1,
    xRot: 0
  },
  {
    name: 'B',
    neighbors: {
      u: 'E',
      d: 'F',
      l: 'C',
      b: 'D',
      r: 'A'
    },
    y: 0,
    x: -1,
    z: 0,
    yRot: -(Math.PI / 2)
  },
  {
    name: 'C',
    neighbors: {
      u: 'E',
      d: 'F',
      l: 'C',
      b: 'D',
      r: 'A'
    },
    y: 0,
    x: 0,
    z: -1,
    yRot: (Math.PI / 2) * 2
  },
  {
    name: 'D',
    y: 0,
    x: 1,
    z: 0,
    yRot: Math.PI / 2
  },
  {
    name: 'E',
    y: 1,
    x: 0,
    z: 0,
    xRot: -(Math.PI / 2)
  },
  {
    name: 'F',
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
    // this.centerObject = centerObject || this.defaultCenterObject()
    this.add(this.centerObject)
    this.faces = {}
    this.selectedFaceIndex = 0
    this.makeSquare(DEFAULT_SIZE)
    // make offsets for different screen versions?
    this.rotation.x = -0.05 * (Math.PI / 2)
    this.position.y = 50
    this.canRotate = true
  }

  resetSquare () {
    console.log('reset square!')
    this.makeSquare(DEFAULT_SIZE)
  }

  defaultCenterObject () {
    let boxGeo = new THREE.BoxBufferGeometry(DEFAULT_SIZE, DEFAULT_SIZE, DEFAULT_SIZE)
    let boxColor = 0xf3928e
    let boxMat = new THREE.MeshStandardMaterial({color: boxColor, shading: THREE.FlatShading, roughness: 0.8, metalness: 0})
    let box = new THREE.Mesh(boxGeo, boxMat)
    return box
  }

  setContent (htmlContent) {
    if (htmlContent.length) {
      _.each(htmlContent, (content, index) => {
        // content = [].slice.call(content)
        console.log('content', content, content.item(1), content[1])
        if (index > nameIndex.length) { return }
        if (content.item(1) || content.item(0)) {
          this.replaceFace(nameIndex[index], content.item(1) || content.item(0))
        }
      })
    } else {
      console.log('WARNING no contnet', htmlContent)
      // this.makeObject(htmlContent)
    }
  }

  replaceFace (name, content) {
    let obj = this.faces[name]
    console.log('replace', obj, content)
    // this.square.remove(obj.name)
    for (var i = this.square.children.length - 1; i >= 0; i--) {
      let thing = this.square.children[i]
      if (thing.name && thing.name === obj.name) {
        this.square.remove(thing)
      }
    }
    // delete obj.content
    this.makeFace(content, obj.position, obj.rotation)
    // obj.element.remove()
    // content.remove()
    console.log('parent', _.get(obj, 'element.parentNode'), obj)
    if (_.get(obj, 'element.parentNode')) {
      obj.element.parentNode.removeChild(obj.element)
    }
  }

  makeFace (content, position, rotation, name) {
    // document.getElementById('faceHolder').append(content)
    let obj = new THREE.CSS3DObject(content)
    obj.name = _.keys(this.faces).length + '-face' || name
    obj.content = content
    obj.position.set(position.x, position.y, position.z)
    obj.rotation.set(rotation.x, rotation.y, rotation.z)
    this.faces[name] = obj
    this.square.add(obj)
  }

  makeSquare (size) {
    console.log('faces', this.faces)
    this.remove('square')

    _.each(this.faces, face => {
      let el = _.get(face, 'element')
      el.remove()
    })

    for (var i = this.children.length - 1; i >= 0; i--) {
      let obj = this.children[i]
      if (obj.name && obj.name === 'square') {
        console.log('removing square!', obj)
        this.remove(obj)
      }
    }
    let square = new THREE.Object3D()
    square.name = 'square'
    this.square = square
    this.square.add(this.defaultCenterObject())
    this.add(square)
    let half = size / 2
    _.each(SIDES, (side, index) => {
      let x = (side.x * half)
      let y = (side.y * half)
      let z = (side.z * half)
      let yRot = side.yRot
      let xRot = side.xRot
      let zRot = side.zRot
      let div = document.createElement('div')
      div.id = index + '-face'
      div.innerHTML = `<h1>${side.name}</h1>`
      div.className += 'square'
      document.body.append(div)
      console.log('PARENT ELEMENT', div.parentElement)
      let position = new THREE.Vector3(x, y, z)
      let rotation = new THREE.Vector3(xRot, yRot, zRot)
      this.makeFace(div, position, rotation, side.name)
    })
  }

  update (time) {
    // this.rotation.y += 0.001
  }

  rotateRight () {
    // let nextSquare = findNextSquare()
    this.selectedFaceIndex ++
    console.log(
      'stage right',
      this.rotation,
      this.faces[this.selectedFaceIndex + '-face'],
      SIDES[this.selectedFaceIndex]
    )
    if (!this.canRotate) {
      return
    }
    this.canRotate = false
    let rotation = this.square.rotation
    let goal = rotation.y - Math.PI / 2
    TweenLite.to(rotation, SPEED, {
      y: goal,
      overwrite: false,
      onComplete: () => {
        this.canRotate = true
        this.resetSquare()
      }
    })
  }

  rotateLeft () {
    this.selectedFaceIndex --
    console.log(
      'stage left',
      this.rotation,
      this.faces[this.selectedFaceIndex + '-face'],
      SIDES[this.selectedFaceIndex]
    )
    if (!this.canRotate) {
      return
    }
    this.canRotate = false
    let rotation = this.square.rotation
    let goal = rotation.y + Math.PI / 2
    TweenLite.to(rotation, SPEED, {
      y: goal,
      overwrite: false,
      onComplete: () => {
        this.canRotate = true
        this.resetSquare()
      }
    })
  }

  rotateUp () {
    if (!this.canRotate) {
      return
    }
    this.canRotate = false
    let rotation = this.square.rotation
    let goal = rotation.x + Math.PI / 2
    TweenLite.to(rotation, SPEED, {
      x: goal,
      overwrite: false,
      onComplete: () => {
        this.canRotate = true
        this.resetSquare()
      }
    })
  }

  rotateDown () {
    if (!this.canRotate) {
      return
    }
    this.canRotate = false
    let rotation = this.square.rotation
    let goal = rotation.x - Math.PI / 2
    TweenLite.to(rotation, SPEED, {
      x: goal,
      overwrite: false,
      onComplete: () => {
        this.canRotate = true
        this.resetSquare()
      }
    })
  }
}

export default Stage
