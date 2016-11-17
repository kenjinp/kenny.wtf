<template>
  <div id="app">
    <!-- <img src="../assets/logo.png"> -->
    <div id="logo">
      {{ emoji }}
    </div>
    <h1>I don't know what to put here.</h1>
    <small>Maybe that will be enough?</small>
    <!-- main view -->
    <router-view
      class="view"
      keep-alive
      transition
      transition-mode="out-in">
    </router-view>
    <posts
      v-for="post in getPosts"
      :post="post"
      ></posts>
  </div>
</template>

<script>
import Posts from './Post.vue'

import store from '../store/store'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AppView',
  computed: mapGetters([ 'emoji', 'getPosts' ]),
  components: { Posts },
  created () {
    this.sayHello()
    this.randomizeEmoji()
    this.fetchPosts()
  },
  // data: {
  //   posts: store.getPosts()
  // },
  methods: {
    sayHello () {
      const styleHeader = [
        'color: #3545E5;',
        'font-family: sans-serif;',
        'font-weight: bold;',
        'font-size: 1.8em;'
      ].join(' ')
      const styleText = [
        'color: #3545E5;',
        'font-family: sans-serif;',
        'font-weight: bold;',
        'font-size: 1.1em;'
      ].join(' ')
      console.log('%cHowdy', styleHeader)
      console.log('%c( ͡° ͜ʖ ͡°)', styleText)
    },
    ...mapActions([
      'randomizeEmoji',
      'fetchPosts'
    ])
  },
  store
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#logo {
  font-size: 100px;
}
</style>
