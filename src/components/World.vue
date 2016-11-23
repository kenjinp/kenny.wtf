<template>
  <div class="world">
  </div>
</template>

<script>
import TweenLite from 'gsap'
import throttle from 'lodash'
import World from '../world'

export default {
  name: 'WorldView',
  data () {
    return {
      msg: ''
    }
  },
  mounted () {
    // make world
    this.makeWorld()

    // set events
    this.keyboardEvent = throttle(this.keyboardEvent, 850, { trailing: false })
    this.scrollEvent = throttle(this.scrollEvent, 1500, { trailing: false })
    this.touchMove = throttle(this.touchMove, 1000, { trailing: false })
    this.touchMove = this.touchMove.bind(this)
    this.touchStart = this.touchStart.bind(this)
  },
  methods: {
    makeWorld () {
      this.world = new World(this.$el)

      TweenLite.ticker.addEventListener('tick', () => {
        // render
        // console.log('tick')
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
      // this.world.mouseMove(event.clientX, event.clientY)
    },
    /**
     * toStage
     * Move to specific stage in 3D World
     * @return {Void}
     */
    toStage () {
      this.world.moveToStage(this.$route.index)
    },
    /**
     * nextStage
     * Move to the next stage
     * @return {Void}
     */
    nextStage () {
      const index = this.$route.index
      this.$router.go({ name: this.routes[index + 1] })
    },
    /**
     * previousStage
     * Move to previous stage
     * @return {Void}
     */
    previousStage () {
      const index = this.$route.index
      this.$router.go({ name: this.routes[index - 1] })
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
