<template>
  <div class="home">
    <!--<h1>{{ msg }}</h1>
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
    'keyboardEvent',
    'swipeRight',
    'swipeLeft'
  ]),
  data () {
    return {
      msg: 'Kenny (dot) wtf'
    }
  },
  watch: {
    swipeRight (e) {
      this.decrementContentIndex()
    },
    swipeLeft (e) {
      this.incrementContentIndex()
    },
    selectedContentType () {
      this.$router.push(this.selectedContentType)
    },
    keyboardEvent (e) {
      switch (e.keyCode) {
        // left
        case 37:
          this.decrementContentIndex()
          console.log('LEFT')
          this.rotateLeft()
          break
        // up
        case 38:
          this.rotateUp()
          break
        // right
        case 39:
          this.incrementContentIndex()
          console.log('RIGHT')
          this.rotateRight()
          break
        // down
        case 40:
          this.rotateDown()
          break
      }
    }
  },
  methods: mapActions([
    'decrementContentIndex',
    'incrementContentIndex',
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
