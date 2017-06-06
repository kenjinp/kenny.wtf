<template>
  <div id="app">
    <home></home>
    <router-view
      class="view"
      keep-alive
      transition
      transition-mode="out-in">
    </router-view>
    <Browser />
    <World v-if="display === 'world'"></World>
  </div>
</template>
<script>
// import Pages from './Pages.vue'
import World from './World.vue'
import Home from './Home.vue'
import Browser from './Browser'
import Loader from './Loader.vue'
import store from '../store/store'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'AppView',
  components: { Home, Loader, World, Browser },
  computed: mapGetters([ 'display' ]),
  created () {
    this.sayHello()
    this.makeFavicon()
  },
  methods: {
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
  text-align: center;
  color: #eee;
  position: absolute;
  left: 0;
  top: 0;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
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
