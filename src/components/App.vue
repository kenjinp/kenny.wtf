<template>
  <div id="app">
    <img src="../assets/logo.png">
    <!-- main view -->
    <router-view
      class="view"
      keep-alive
      transition
      transition-mode="out-in">
    </router-view>
  </div>
</template>

<script>
import store from '../store/store'

export default {
  name: 'AppView',
  created () {
    this.sayHello()
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
    }
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
</style>
