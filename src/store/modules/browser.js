// this module is for browser events saved as state (bad idea?)
import _ from 'lodash'

const EVENTS = [
  'keyboardEvent',
  'scrollEvent',
  'touchMove',
  'touchStart',
  'onMouseMove',
  'onResize',
  'swipeRight',
  'swipeLeft'
]

// initial state
// note to self, state must ALWAYS be explicitly declared for each value before
// getters can be used!
const state =
  _.chain(EVENTS)
  .reduce((memo, value) => {
    memo[value] = null
    return memo
  }, {})
  .extend({
    events: EVENTS
  })
  .value()

// getters
const getters =
  _.chain(EVENTS)
    .reduce((memo, value) => {
      memo[value] = state => state[value]
      return memo
    }, {})
    .extend({
      events: state => state.events
    })
    .value()

// actions
const actions =
  _.chain(EVENTS)
    .reduce((memo, value) => {
      memo[value] = ({commit}, event, thing) => {
        commit('SET_' + value, event)
      }
      return memo
    }, {})
    .extend({
    })
    .value()

// mutations
const mutations =
  _.chain(EVENTS)
    .reduce((memo, value) => {
      memo['SET_' + value] = (state, event) => {
        state[value] = event
      }
      return memo
    }, {})
    .extend({
    })
    .value()

export default {
  state,
  getters,
  actions,
  mutations
}
