<template>
  <div class="about">
    <h1>{{ msg }}</h1>
    <div v-for="post in posts" class="posts">
      <Post v-bind:post="post"></Post>
    </div>
  </div>
</template>

<script>
import Post from './Post.vue'
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'PostsView',
  components: { Post },
  computed: mapGetters([ 'posts' ]),
  created () {
    if (!this.posts.length) {
      this.fetchContent('posts')
    }
  },
  data () {
    return {
      msg: 'Lol! This is the posts page.'
    }
  },
  methods: {
    ...mapActions([
      'fetchContent'
    ])
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
