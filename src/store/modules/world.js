import TweenLite from 'gsap'
import World from '../../world'
let WORLD = null

const state = {
  worldInstance: null
}

const getters = {
  worldInstance: (state) => state.worldInstance
}

const actions = {
  makeWorld ({ commit }, context) {
    WORLD = new World(context)
    TweenLite.ticker.addEventListener('tick', () => {
      WORLD.render()
    })
    // commit('SET_WORLD', world)
  },
  setContent ({ commit }, content) {
    WORLD.setContent(content)
  },
  rotateLeft ({ commit }) {
    WORLD.rotateLeft()
  },
  rotateRight ({ commit }) {
    WORLD.rotateRight()
  },
  rotateUp ({ commit }) {
    WORLD.rotateUp()
  },
  rotateDown ({ commit }) {
    WORLD.rotateDown()
  }
}

// mutations
const mutations = {
  SET_WORLD (state, world) {
    state.worldInstance = world
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
