import { mapGetters } from 'vuex'
import _ from 'lodash'
import Vue from 'vue'
import Hammer from 'hammerjs'
export default Vue.extend({
  name: 'BrowserView',
  computed: mapGetters([ 'events' ]),
  template: '<div class="browser"></div>',
  created () {
    _.each(this.events, (val) => {
      this[val] = (event) => this.$store.dispatch(val, event)
    })
  },
  mounted () {
    // this.touchMove = this.touchMove.bind(this)
    // this.touchStart = this.touchStart.bind(this)
    this.addEventListeners()
  },
  methods: {
    // ...mapActions(events),
    addEventListeners () {
      let mc = new Hammer(this.$parent.$el, {})
      mc.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
      mc.on('swipeleft', e => this.swipeLeft(e.deltaX))
      mc.on('swiperight', e => this.swipeRight(e.deltaX))
      mc.on('swipeup', e => this.swipeUp(e.deltaX))
      mc.on('swipedown', e => this.swipeDown(e.deltaX))
      document.addEventListener('keydown',
        this.makeThrottledEvent('keyboardEvent', 300), false)
      window.addEventListener('wheel',
        this.makeThrottledEvent('scrollEvent', 800), true)
      document.addEventListener('touchmove',
        this.makeThrottledEvent('touchMove', 1000), false)
      document.addEventListener('touchstart', this.touchStart, false)
      document.addEventListener('mousemove', this.onMouseMove, false)
      window.addEventListener('resize', this.onResize)
    },
    removeEventListeners () {
      window.removeEventListener('keyup', this.keyboardEvent, false)
      window.removeEventListener('wheel', this.scrollEvent, true)
      document.removeEventListener('touchmove', this.touchMove, false)
      document.removeEventListener('touchstart', this.touchStart, false)
      document.removeEventListener('mousemove', this.onMouseMove, false)
      window.removeEventListener('resize', this.onResize)
    },
    makeThrottledEvent (name, throttle) {
      return _.throttle(this[name], throttle, { trailing: false })
    }
  }
})
