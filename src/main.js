import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import store from './store/store'
import Router from 'vue-router'
import App from './components/App.vue'
import HelloView from './components/Hello.vue'
import AboutView from './components/About.vue'
import PostView from './components/Post.vue'

// install router
Vue.use(Router)

var routes = [
  {
    path: '/:post',
    component: PostView
  },
  {
    path: '/hello',
    component: HelloView
  },
  {
    path: '/about',
    component: AboutView
  }
]
// routing
var router = new Router({
  routes: routes,
  mode: 'history',
  base: '/'
})

sync(store, router)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
