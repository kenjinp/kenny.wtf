/*
 * The action is a function which determines what updates must be applied on a store.
 * The action cannot update the state directly. Instead it has to dispatch a mutation.
 */

import RandomEmoji from 'random-emoji'
import { createFavicon } from '../lib/favicon'
export default {
  randomizeEmoji ({ commit }) {
    let randomEmoji = RandomEmoji.random({ count: 1 })[0].character
    commit('RANDOMIZE_EMOJI', randomEmoji)
  },
  makeFavicon ({ commit }) {
    createFavicon()
  }
}
