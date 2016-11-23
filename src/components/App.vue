<template>
  <div id="app">

    <!-- <img src="../assets/logo.png"> -->
    <div id="logo">
      {{ emoji }}
    </div>
    <h1>I don't know what to put here.</h1>
    <small>Maybe that will be enough?</small>
    <ul>
      <router-link
        v-for="slug in slugs"
        :to="{ name: 'post', params: { postSlug: slug.slug }}">
        {{ slug.title }}
      </router-link>
    </ul>
    <!-- <router-view
      class="view"
      keep-alive
      transition
      transition-mode="out-in">
    </router-view> -->
    <!-- main view -->
    <pages></pages>
    <world></world>
  </div>
</template>
<script>
import Pages from './Pages.vue'
import World from './World.vue'

import store from '../store/store'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AppView',
  computed: mapGetters([ 'emoji', 'posts', 'slugs', 'route' ]),
  components: { Pages, World },
  created () {
    console.log(this)
    this.sayHello()
    this.randomizeEmoji()
    this.fetchPosts()
    this.fetchFingerprints()
  },
  watch: {
    '$route': 'talkAboutRoutes'
  },
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
    talkAboutRoutes () {
      console.log('routes have changed', this.$route, this)
    },
    ...mapActions([
      'randomizeEmoji',
      'fetchPosts',
      'fetchFingerprints'
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
