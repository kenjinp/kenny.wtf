import Vuex from 'vuex'
import Vue from 'vue'
import * as getters from './getters'
import actions from './actions'
import content from './modules/content.js'
import page from './modules/page.js'
import browser from './modules/browser.js'
import world from './modules/world.js'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

const state = {
  display: 'world'
}

export default new Vuex.Store({
  state,
  actions,
  getters,
  modules: {
    content,
    page,
    browser,
    world
  },
  strict: debug
})
