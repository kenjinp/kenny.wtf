import contentful from 'contentful'

const client = contentful.createClient({
  accessToken: '60310cb898f4d18ae5d55a3981a2da1ed8cfe86390793543a0003c3495da2096',
  space: 'bs70dkbg52b2'
})

const POST_CONTENT_TYPE_ID = '2wKn6yEnZewu2SCCkus4as'

// initial state
const state = {
  posts: []
}

// getters
const getters = {
  posts: state => state.posts
}

// actions
const actions = {

  async fetchPosts ({ commit }) {
    commit('FETCH_POSTS',
      await client.getEntries({
        content_type: POST_CONTENT_TYPE_ID
      })
    )
  }
}

// mutations
const mutations = {
  FETCH_POSTS (state, { items }) {
    state.posts = items
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
