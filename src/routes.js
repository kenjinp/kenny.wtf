import Router from 'vue-router'
import ExperimentsView from './components/Experiments.vue'
import ProjectsView from './components/Projects.vue'
import PostsView from './components/Posts.vue'
import Vue from 'vue'

Vue.use(Router)

const ROUTES = [
  {
    path: '/posts',
    component: PostsView
  },
  {
    path: '/posts/:postSlug',
    component: {},
    name: 'post'
  },
  {
    path: '/projects',
    component: ProjectsView
  },
  {
    path: '/experiments',
    component: ExperimentsView
  }
]

export default new Router({
  routes: ROUTES,
  scrollBehavior,
  mode: 'history',
  base: '/'
})

// scrollBehavior:
// - only available in html5 history mode
// - defaults to no scroll behavior
// - return false to prevent scroll
const scrollBehavior = (to, from, savedPosition) => {
  console.log('SCROLLBEHAVIOR', to, from, savedPosition)
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
