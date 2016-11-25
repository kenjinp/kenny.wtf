<template>
  <div class="world">
  </div>
</template>

<script>
import TweenLite from 'gsap'
import * as _ from 'lodash'
import World from '../world'
// import store from '../store/store'
import { mapGetters } from 'vuex'

export default {
  name: 'WorldView',
  computed: mapGetters([ 'posts', 'emoji' ]),
  data () {
    return {
      pages: [],
      pageIndex: 0
    }
  },
  watch: {
    posts (pages) {
      if (pages.length) {
        let pages = [this.$parent.$el.firstElementChild]
        pages = _.concat(pages, _.map(this.$parent.$children[0].$children, (vue) => {
          return vue.$el
        }))
        _.each(pages, (page) => {
          let regexp = new RegExp('#([^\\s]*)', 'g')
          let name = page.id.replace(regexp, '')
          page.name = name
        })

        this.pages = pages
        // make world
        this.makeWorld()
        this.pageIndex = _.findIndex(this.pages, {name: this.$route.params.postSlug})
        this.toStage()
      }
    },
    $route (route) {
      this.pageIndex = _.findIndex(this.pages, {name: this.$route.params.postSlug})
      this.toStage()
    }
  },
  mounted () {
    // set events
    this.keyboardEvent = _.throttle(this.keyboardEvent, 850, { trailing: false })
    this.scrollEvent = _.throttle(this.scrollEvent, 1500, { trailing: false })
    this.touchMove = _.throttle(this.touchMove, 1000, { trailing: false })
    this.touchMove = this.touchMove.bind(this)
    this.touchStart = this.touchStart.bind(this)
    this.addEventListeners()
  },
  methods: {
    makeWorld () {
      this.world = new World(this.$el, this.pages)
      TweenLite.ticker.addEventListener('tick', () => {
        this.world.render()
      })
    },
    addEventListeners () {
      window.addEventListener('keyup', this.keyboardEvent, false)
      window.addEventListener('wheel', this.scrollEvent, true)
      document.addEventListener('touchmove', this.touchMove, false)
      document.addEventListener('touchstart', this.touchStart, false)
      document.addEventListener('mousemove', this.onMouseMove, false)
    },
    removeEventListeners () {
      window.removeEventListener('keyup', this.keyboardEvent, false)
      window.removeEventListener('wheel', this.scrollEvent, true)
      document.removeEventListener('touchmove', this.touchMove, false)
      document.removeEventListener('touchstart', this.touchStart, false)
      document.removeEventListener('mousemove', this.onMouseMove, false)
    },
    onResize () {
      // set world size
      // this.world.resize(this.$el.offsetWidth, this.$el.offsetHeight)
    },
    onMouseMove (event) {
      // move through world
      this.world.mouseMove(event.clientX, event.clientY)
    },
    /**
     * toStage
     * Move to specific stage in 3D World
     * @return {Void}
     */
    toStage () {
      this.world.moveToStage(this.pageIndex)
    },
    /**
     * nextStage
     * Move to the next stage
     * @return {Void}
     */
    nextStage () {
      console.log(this.pages[this.pageIndex + 1].name)
      this.$router.push(this.pages[this.pageIndex + 1].name)
    },
    /**
     * previousStage
     * Move to previous stage
     * @return {Void}
     */
    previousStage () {
      console.log(this.pages[this.pageIndex - 1].name)
      this.$router.push(this.pages[this.pageIndex - 1].name)
    },
    /**
     * keyboardEvent
     * Use keyboard to navigate stages
     * @param {Event} event - Event Object
     * @return {Void}
     */
    keyboardEvent (event) {
      if (event.which === 38) {
        this.previousStage()
      }
      if (event.which === 40) {
        this.nextStage()
      }
    },
    /**
     * scrollEvent
     * Allow scroll to navigate stages based on direction
     * @param {Event} event - Event Object
     * @return {Void}
     */
    scrollEvent (event) {
      if (event.deltaY < 0) {
        this.previousStage()
      } else if (event.deltaY + 1 > -0) {
        this.nextStage()
      }
    },
    /**
     * Allow Touch / Swipe to scroll
     * https://gregsramblings.com/2012/05/23/preventing-vertical-scrolling-bounce-using-javascript-on-ios-devices/
     */
    touchStart (event) {
      this.lastTouchX = event.touches[0].screenX
      this.lastTouchY = event.touches[0].screenY
    },
    touchMove (event) {
      let yMovement = event.touches[0].screenY - this.lastTouchY
      event.preventDefault()
      if (yMovement > 0) {
        this.previousStage()
      } else if (yMovement < 0) {
        this.nextStage()
      }
    }
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
