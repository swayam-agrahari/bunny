<template>
  <div class="footer">
    <div v-if="player">
      <waveform />
      <metronome />
      <timeline />
    </div>
  </div>
</template>

<script>
import Waveform from "@/components/Waveform.vue";
import Timeline from "@/components/Timeline.vue";
import Metronome from "@/components/Metronome";
import throttle from 'lodash/throttle';
import clamp from 'lodash/clamp';

import { mapState } from 'vuex';

export default {
  name: 'AppFooter',
  components: {
    Waveform,
    Metronome,
    Timeline
  },
  data: function(){
    return {
    }
  },
  mounted: function() {
    const onWheelThrottle = throttle(this.onWheel, 100);
    window.addEventListener('wheel', onWheelThrottle);
  },
  methods: {
    onWheel: function (event) {
      const deltaY = Math.sign(event.deltaY) / 3;
      const currentTime = clamp(this.currentTime + deltaY, 0, this.player.duration);
      this.$store.commit('setCurrentTime', currentTime )
      this.$store.state.waveform.seek(currentTime);
      }
  },
  computed: {
    ...mapState([
      'player',
      'currentTime',
      'renderData'
    ])
  }
}
</script>

<style scoped>
.footer {
  position: relative;
  display: flex; 
  flex-direction: column;
  height: 200px;
}
</style>
