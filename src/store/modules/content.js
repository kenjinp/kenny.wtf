import contentful from 'contentful'
// import Markdown from 'markdown-it'
import _ from 'lodash'

// const md = new Markdown('commonmark', { linkify: true })

const contentClient = contentful.createClient({
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN,
  space: process.env.CONTENTFUL_SPACE
})

// Unfortunately these keys are parsed before run time
// maybe better way to write these programatically?
const POST_CONTENT_TYPE_ID = process.env.CONTENTFUL_POSTS
const AUTHOR_CONTENT_TYPE_ID = process.env.CONTENTFUL_AUTHOR
const CATEGORY_CONTENT_TYPE_ID = process.env.CONTENTFUL_CATEGORY
const PROJECT_CONTENT_TYPE_ID = process.env.CONTENTFUL_PROJECT
const EXPERIMENT_CONTENT_TYPE_ID = process.env.CONTENTFUL_EXPERIMENT

const CONTENT_TYPES = {
  posts: POST_CONTENT_TYPE_ID,
  authors: AUTHOR_CONTENT_TYPE_ID,
  categories: CATEGORY_CONTENT_TYPE_ID,
  projects: PROJECT_CONTENT_TYPE_ID,
  experiments: EXPERIMENT_CONTENT_TYPE_ID
}

// initial state
const state =
  _.chain(CONTENT_TYPES)
    .reduce((memo, value, key) => {
      memo[key] = []
      return memo
    }, {})
    .extend({
      // special initial state
      contentTypes: _.keys(CONTENT_TYPES)
    })
    .value()

// getters
const getters =
  _.chain(CONTENT_TYPES)
    .reduce((memo, value, key) => {
      memo[key] = state => state[key]
      return memo
    }, {})
    .extend({
      contentTypes: state => state.contentTypes,
      // special getters
      postSlugs (state) {
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
    })
    .value()

// actions
const actions = {
  async fetchContent ({ commit }, contentTypeKey) {
    try {
      let contentType = _.get(CONTENT_TYPES, contentTypeKey)
      if (!contentType) {
        throw new Error('contentType not found with key of ', contentTypeKey)
      }
      let value = await contentClient.getEntries({
        content_type: contentType
      })
      if (value) {
        commit('SET_CONTENT', {
          contentTypeKey,
          value
        })
      }
    } catch (error) {
      console.error(error)
    }
  }
}

// mutations
const mutations = {
  SET_CONTENT (state, { value, contentTypeKey }) {
    let { items } = value
    // DO THIS IN VIEW NOT STORE!!!
    // let renderedItems = _.map(items, (item) => {
    //   if (_.get(item, 'fields.body')) {
    //     item.fields.body = md.render(item.fields.body)
    //   }
    //   return item
    // })
    state[contentTypeKey] = items
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
