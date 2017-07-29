<template>
  <div class="world">
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import _ from 'lodash'

export default {
  name: 'WorldView',
  computed: mapGetters([ 'posts' ]),
  mounted () {
    console.log('world mounted')
    this.makeWorld(this.$el)
    this.makeContent()
  },
  watch: {
    // update based on current url path?
    posts (posts) {
      // this.$nextTick(() => this.makeContent())
    }
  },
  methods: {
    makeContent () {
      let home = this.$parent.$children[0]
      let content = this.mapContent(home.$children)
      console.log('MakeContent', content)
      this.setContent(content)
    },
    // should content remap after every change?
    mapContent (collection) {
      return _.chain(collection)
        .map(collection => _.get(collection, '$el.children'))
        .compact()
        .value()
    },
    ...mapActions([ 'makeWorld', 'setContent' ])
  }
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
