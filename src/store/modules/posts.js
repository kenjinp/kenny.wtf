import contentful from 'contentful'
import Markdown from 'markdown-it'
import _ from 'lodash'

const md = new Markdown('commonmark', { linkify: true })

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
  posts: state => state.posts,
  slugs: (state) => {
    return _.chain(state.posts)
      .map((item) => {
        if (item.fields && item.fields.slug && item.fields.title) {
          return {
            slug: item.fields.slug,
            title: item.fields.title
          }
        }
      })
      .without()
      .value()
  }
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
    let posts = _.map(items, (item) => {
      if (item.fields && item.fields.body) {
        item.fields.body = md.render(item.fields.body)
      }
      return item
    })
    state.posts = posts
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
