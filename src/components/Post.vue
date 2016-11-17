<template>
  <div class="post">
    <h2 v-html="post.fields.title"></h2>
    <div v-html="post.fields.body"></div>
  </div>
</template>

<script>
// import Markdown from 'markdown-it'
// const md = new Markdown({ html: false, linkify: true })

export default {
  name: 'PostView',
  props: [ 'post' ],
  data () {
    return {
      // title: this.post.fields ? md.render(this.post.fields.title) : '',
      // body: this.post.fields ? md.render(this.post.fields.body) : ''
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
