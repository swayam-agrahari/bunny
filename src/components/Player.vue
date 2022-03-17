<template>
  <div class="player">
    <video src="/sample.mp4?t=1" ref="player" @click="onVideoClick" />
  </div>
</template>

<script>
import { isPlaying } from "@/utils";
export default {
  name: 'Player',
  data: function(){
    return {
      playerRef: null
    }
  },
  mounted: function() {
    this.playerRef = this.$refs["player"]

    this.$store.dispatch('setPlayer', {
      value: this.playerRef
    })

    this.loop();
  
  },
  methods: {
    onVideoClick: function(){
      if (this.playerRef) {
          if (isPlaying(this.playerRef)) {
              this.playerRef.pause();
          } else {
              this.playerRef.play();
          }
      }
    },
    loop: function(){
        window.requestAnimationFrame( () => {
            if (this.playerRef) {
                // Setting playing state
                this.$store.commit('setPlaying', isPlaying(this.playerRef))

                // Setting current time state
                this.$store.commit('setCurrentTime', this.playerRef.currentTime || 0 )
            }
            this.loop();
        });
    }
  }
}
</script>

<style scoped>
</style>
