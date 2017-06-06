// this module is for page actions? (like nav)
import _ from 'lodash'

// initial state
const state = {
  selectedIndex: 0
}

// getters
const getters =
  _.chain(state)
    .reduce((memo, value, key) => {
      memo[key] = state => state[key]
      return memo
    }, {})
    .extend({
      selectedContentType (state, getters) {
        let index = Math.abs(state.selectedIndex % getters.contentTypes.length)
        return getters.contentTypes[index]
      }
    })
    .value()

// actions
const actions = {
  decrementContentIndex ({ commit }) {
    commit('SET_SELECTED_INDEX', -1)
  },
  incrementContentIndex ({ commit }) {
    commit('SET_SELECTED_INDEX', +1)
  }
}

// mutations
const mutations = {
  SET_SELECTED_INDEX (state, value) {
    state.selectedIndex += value
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
