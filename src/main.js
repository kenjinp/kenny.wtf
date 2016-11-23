import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import store from './store/store'
import Router from 'vue-router'
import App from './components/App.vue'
// import HelloView from './components/Hello.vue'
import AboutView from './components/About.vue'
// import PostView from './components/Post.vue'

// install router
Vue.use(Router)

var routes = [
  {
    path: '/:postSlug',
    component: {},
    name: 'post'
  },
  {
    path: '/about',
    component: AboutView
  }
]

// routing
var router = new Router({
  routes: routes,
  scrollBehavior,
  mode: 'history',
  base: '/'
})

sync(store, router)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// scrollBehavior:
// - only available in html5 history mode
// - defaults to no scroll behavior
// - return false to prevent scroll
const scrollBehavior = (to, from, savedPosition) => {
  if (savedPosition) {
    // savedPosition is only available for popstate navigations.
    return savedPosition
  } else {
    const position = {}
    // new navigation.
    // scroll to anchor by returning the selector
    if (to.hash) {
      position.selector = to.hash
    }
    // check if any matched route config has meta that requires scrolling to top
    if (to.matched.some(m => m.meta.scrollToTop)) {
      // cords will be used if no selector is provided,
      // or if the selector didn't match any element.
      position.x = 0
      position.y = 0
    }
    // if the returned position is falsy or an empty object,
    // will retain current scroll position.
    return position
  }
}
