import Vue from 'vue'
import { sync } from 'vuex-router-sync'
import store from './store/store'
import App from './components/App.vue'
import router from './routes'

sync(store, router)

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
