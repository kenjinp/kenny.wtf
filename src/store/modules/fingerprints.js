import FingerprintAPI from '../api/fingerprint'
const fingerprintAPI = new FingerprintAPI()
// import _ from 'lodash'

// initial state
const state = {
  fingerprints: []
}

// getters
const getters = {
  fingerprints: state => state.fingerprints
}

// actions
const actions = {

  async fetchFingerprints ({ commit }) {
    console.log('fetching fingerprints')
    commit('FETCH_FINGERPRINTS',
      await fingerprintAPI.allFingerprints
    )
  }
}

// mutations
const mutations = {
  FETCH_FINGERPRINTS (state, thing) {
    console.log(thing)
    state.fingerprints = thing
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
