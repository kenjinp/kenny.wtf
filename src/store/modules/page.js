// this module is for page actions? (like nav)
import _ from 'lodash'
import router from '../../routes'

// initial state
const state = {
  selectedIndex: 0,
  selectedChildrenIndex: 0
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
      },
      selectedContentChildIndex (state, getters) {
        let contentLength = getters[getters.selectedContentType].length
        console.log('selection process', state.selectedChildrenIndex, contentLength, state.selectedChildrenIndex % contentLength)
        let index = Math.abs(state.selectedChildrenIndex % contentLength)
        return index
      },
      selectedContentName (sate, getters) {
        let type = getters.selectedContentType
        let index = getters.selectedContentChildIndex
        if (!index) { return null }
        let content = getters[type][index]
        console.log(content, _.get(content, 'fields.slug'), index)
        return _.get(content, 'fields.slug') ||
          _.get(content, 'fields.name') ||
          _.get(content, 'fields.title')
      }
    })
    .value()

// actions
const actions = {
  decrementContentIndex ({ commit, dispatch, getters }) {
    console.log('dec children', getters.selectedContentChildIndex)
    // dont rotate or change if in children indx
    if (!getters.selectedContentChildIndex) {
      commit('SET_SELECTED_INDEX', -1)
      dispatch('rotateLeft')
      dispatch('chageRouteBasedOnSelectedContent')
    }
  },
  decrementContentChildrenIndex ({ commit, dispatch }) {
    commit('SET_SELECTED_CHILDREN_INDEX', -1)
    dispatch('rotateDown')
    dispatch('chageRouteBasedOnSelectedContent')
  },
  incrementContentIndex ({ commit, dispatch, getters }) {
    // dont rotate or change if in children indx
    console.log('inc children', getters.selectedContentChildIndex)
    if (!getters.selectedContentChildIndex) {
      commit('SET_SELECTED_INDEX', +1)
      dispatch('rotateRight')
      dispatch('chageRouteBasedOnSelectedContent')
    }
  },
  incrementContentChildrenIndex ({ commit, dispatch }) {
    commit('SET_SELECTED_CHILDREN_INDEX', +1)
    dispatch('rotateUp')
    dispatch('chageRouteBasedOnSelectedContent')
  },
  chageRouteBasedOnSelectedContent ({commit, getters}) {
    let route = getters.selectedContentName
      ? getters.selectedContentType + '/' + getters.selectedContentName
      : getters.selectedContentType
    console.log('ROUTE', route, getters.selectedContentType, getters.selectedContentName)
    router.replace('/' + route)
  }
}

// mutations
const mutations = {
  SET_SELECTED_INDEX (state, value) {
    state.selectedIndex += value
  },
  SET_SELECTED_CHILDREN_INDEX (state, value) {
    state.selectedChildrenIndex += value
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
