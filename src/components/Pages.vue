<template>
  <div class="pages">
    <posts
      v-for="post in posts"
      :post="post"
      ></posts>
  </div>
</template>

<script>
import Posts from './Post.vue'
// import store from '../store/store'
import { mapGetters } from 'vuex'

export default {
  name: 'PagesView',
  components: { Posts },
  computed: mapGetters([ 'posts' ]),
  data () {
    return {
      msg: 'Lol! This is hello.'
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
