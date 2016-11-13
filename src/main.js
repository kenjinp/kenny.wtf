import Vue from 'vue'
import Router from 'vue-router'
import App from './components/App.vue'
import HelloView from './components/Hello.vue'
import AboutView from './components/About.vue'

// install router
Vue.use(Router)

var routes = [
  {
    path: '/',
    component: HelloView
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
var router = new Router({routes})

new Vue({
  router,
  ...App
}).$mount('#app')
