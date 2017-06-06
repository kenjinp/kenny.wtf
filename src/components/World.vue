<template>
  <div class="world">
  </div>
</template>

<script>
// import TweenLite from 'gsap'
// import World from '../world'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'WorldView',
  computed: mapGetters([ 'posts' ]),
  mounted () {
    let home = this.$parent.$children[0]
    let collection = home.$children[0]
    console.log('COLLECTION', collection)
    let $collection = collection.$refs.collection.children
    this.makeWorld(this.$el)
    this.setContent($collection)
  },
  methods: mapActions([ 'makeWorld', 'setContent' ])
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*
 * Mobile
 */
.world {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  backgorund-color: blue;
  overflow: hidden;
  /*// padding: $border-size $border-size ($nav-mobile-height + $border-size) $border-size;*/
  transform: translateZ(0);
  .world__inner {
    position: relative;
    width: 100%;
    height: 100%;
  }
}
</style>
