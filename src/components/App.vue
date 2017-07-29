<template>
  <div id="app" v-bind:class="{ 'world-view': worldView }">
    <router-view
      class="view"
      keep-alive
      transition
      transition-mode="out-in">
    </router-view>
    <!-- <Home v-if='worldView' />
    <Browser v-if='worldView' />
    <World v-if='worldView' /></World> -->
  </div>
</template>
<script>
// import World from './World.vue'
// import Home from './Home.vue'
// import Browser from './Browser'
import store from '../store/store'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AppView',
  // components: { World, Browser, Home },
  computed: {
    // a computed getter
    worldView () {
      return false // this.$route.path !== '/resume'
    },
    ...mapGetters([ 'display' ])
  },
  created () {
    console.log(this.$route)
    this.sayHello()
    this.makeFavicon()
    this.redirect()
  },
  methods: {
    redirect () {
      // when we load the page, use q param to redirect
      // this is a cool hack to use github as a singlepage app with url links
      let page = this.$route.query.q
      if (page) {
        this.$router.push({ path: page, query: {} })
      } else {
        if (this.$route.path !== '/resume') {
          this.$router.push('/resume')
        }
      }
    },
    sayHello () {
      const styleHeader = [
        'color: #f3928e;',
        'font-family: sans-serif;',
        'font-weight: bold;',
        'font-size: 2em;'
      ].join(' ')
      const styleText = [
        'color: #f3928e;',
        'font-family: sans-serif;',
        'font-weight: bold;',
        'font-size: 1.1em;'
      ].join(' ')
      console.log('%cAchievement Unlocked!', styleHeader)
      console.log('%c( ͡° ͜ʖ ͡°)', styleText)
      console.log('%c Nice to see you here. You\'ve accessed the secret level!', styleText)
      console.log('%c make sure to tweet @kenny_pizza to claim your bragging rights', styleText)
    },
    ...mapActions([
      'makeFavicon'
    ])
  },
  store
}
</script>

<style>
html, body {
  background-color: #f3928e;
  margin: 0;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overflow: hidden;
}
.world-view {
  text-align: center;
  color: #eee;
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
}
.square {
  backface-visibility: hidden;
  height: 450px;
  width: 450px;
  border: 1em solid #eee;
}
.square:hover {
  background-color: blue;
}
</style>
