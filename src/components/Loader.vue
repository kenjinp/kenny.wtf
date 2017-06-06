<template>
  <transition name="fade">
    <div class="mask" v-if="!loaded">
      <div class="loader">
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
        <div class="dot"></div>
      </div>
    </div>
  </transition>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Loader',
  computed: mapGetters([ 'posts' ]),
  data () {
    return {
      loaded: false
    }
  },
  watch: {
    posts () {
      setTimeout(() => {
        this.loaded = true
      }, 500)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mask  {
  position: absolute;
  width:100%; height: 100%;
  left: 0; top: 0;
  margin:0 auto;
  overflow:hidden;
  background-color: #4D4250;
}


.loader {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 200px;
  height: 200px;

  margin-top: -100px;
  margin-left: -100px;

  perspective: 600px;
  transform-style: perserve-3d;
}

.fadout {
  animation: fadeout 1s;
}

/* The dot */
.dot {
  position: absolute;
  top: 50%;
  left: 50%;

  width: 50px;
  height: 50px;

  margin-top: -50px;
  margin-left: -50px;

  border-radius: 100px;
  border: 5px solid #E6A972;

  transform-style: perserve-3d;
  transform: scale(0) rotateX(60deg);

  animation: dot 3s cubic-bezier(.67,.08,.46,1.5) infinite;
}

.dot:nth-child(2) { animation-delay: 200ms; }
.dot:nth-child(3) { animation-delay: 400ms; }
.dot:nth-child(4) { animation-delay: 600ms; }
.dot:nth-child(5) { animation-delay: 800ms; }
.dot:nth-child(6) { animation-delay: 1000ms; }
.dot:nth-child(7) { animation-delay: 1200ms; }
.dot:nth-child(8) { animation-delay: 1400ms; }

@keyframes dot {
  0% {
    opacity: 0;
    border-color: #F6D169;
    transform: rotateX(-45deg) translateX(-100px) scale(0.1);
  }
  40% {
    opacity: 1;
    transform: rotateX(0deg) rotateY(20deg) translateZ(0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translateX(100px) scale(0.1);
  }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .5s
}
.fade-enter, .fade-leave-active {
  opacity: 0
}
</style>
