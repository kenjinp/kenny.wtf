<template>
  <div class="collection" ref="collection">
    <div class="content-index square" ref="contentIndex">
      <h1>{{ contentTypeKey }}</h1>
    </div>
    <div v-for="item in items" class="content square" ref="content">
      <Item v-bind:item="item"/>
    </div>
  </div>
</template>

<script>
import Item from './Item.vue'
import { mapActions } from 'vuex'

export default {
  name: 'ContentCollectionView',
  components: { Item },
  // Bad?
  computed: {
    items () {
      return this.$store.getters[this.contentTypeKey]
    }
  },
  created () {
    this.setItems()
  },
  watch: {
    contentTypeKey (val) {
      // change based on route instead, or trigger route change?
      this.setItems()
    }
  },
  methods: {
    setItems () {
      if (!this.$store.getters[this.contentTypeKey].length) {
        this.fetchContent(this.contentTypeKey)
      }
      this.items = this.$store.getters[this.contentTypeKey]
    },
    ...mapActions([
      'fetchContent'
    ])
  },
  props: [ 'contentTypeKey' ]
}
</script>

<!-- Add` "scoped" attribute to limit CSS to this component only -->
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

a {
  color: #42b983;
}
</style>
