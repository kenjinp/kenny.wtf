<template>
  <div class="home">
    <!--
    <h1>{{ selectedContentName}}</h1>
    <h2>{{ selectedContentType }}</h2>
    <ul>
      <li v-for="contentType in contentTypes">
        <h3 v-bind:class="selectedContentType === contentType?  'selected' : '' ">
          {{ contentType }}
        </h3>
      </li>
    </ul>-->
    <!--<ContentCollection v-bind:contentTypeKey="selectedContentType" />-->
    <ContentCollection v-for="key in contentTypes" v-bind:contentTypeKey="key" />
  </div>
</template>

<script>
import ContentCollection from './ContentCollection.vue'
import { mapGetters, mapActions } from 'vuex'
export default {
  name: 'HomeView',
  components: { ContentCollection },
  computed: mapGetters([
    'contentTypes',
    'selectedContentType',
    'selectedContentName',
    'keyboardEvent',
    'swipeRight',
    'swipeLeft',
    'swipeUp',
    'swipeDown',
    'route'
  ]),
  data () {
    return {
      msg: 'Kenny (dot) wtf'
    }
  },
  mounted () {
    // if (route) {
    //   move cube and stuff
    // } else {
    //   change route to normal
    // }
    console.log('hello routes', this.$store.state.route.path)
    if (this.$store.state.route.path === '/') {
      this.chageRouteBasedOnSelectedContent()
    } else {
      // rerender cube based on path
    }
  },
  watch: {
    swipeRight (e) {
      this.decrementContentIndex()
      // this.rotateLeft()
    },
    swipeLeft (e) {
      this.incrementContentIndex()
      // this.rotateRight()
    },
    swipeUp (e) {
      this.incrementContentChildrenIndex()
      // this.rotateUp()
    },
    swipeDown (e) {
      this.decrementContentChildrenIndex()
      // this.rotateDown()
    },
    keyboardEvent (e) {
      switch (e.keyCode) {
        // left
        case 37:
          this.decrementContentIndex()
          // this.rotateLeft()
          break
        // up
        case 38:
          this.incrementContentChildrenIndex()
          // this.rotateUp()
          break
        // right
        case 39:
          this.incrementContentIndex()
          // this.rotateRight()
          break
        // down
        case 40:
          this.decrementContentChildrenIndex()
          // this.rotateDown()
          break
      }
    }
  },
  methods: mapActions([
    'decrementContentIndex',
    'decrementContentChildrenIndex',
    'incrementContentIndex',
    'incrementContentChildrenIndex',
    'chageRouteBasedOnSelectedContent',
    'rotateRight',
    'rotateLeft',
    'rotateUp',
    'rotateDown'
  ])
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

.selected {
  text-decoration: underline;
}

a {
  color: #42b983;
}
</style>
