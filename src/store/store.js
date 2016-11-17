import Vuex from 'vuex'
import Vue from 'vue'
import * as getters from './getters'
import * as mutations from './mutations'
import actions from './actions'
import posts from './modules/posts.js'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

// Create an object to hold the initial state when
// the app starts up
const state = {
  emoji: ''
}

export default new Vuex.Store({
  state,
  actions,
  mutations,
  getters,
  modules: {
    posts
  },
  strict: debug
})
