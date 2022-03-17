<template>
  <div className="waveform" ref="waveform" />
</template>

<script>
import WFPlayer from 'wfplayer';

export default {
  name: 'Waveform',
  data: function(){
    return {
    }
  },
  mounted: function() {
        [...WFPlayer.instances].forEach((item) => item.destroy());

        const waveform = new WFPlayer({
            scrollable: true,
            useWorker: false,
            duration: 10,
            padding: 1,
            wave: true,
            pixelRatio: 2,
            container: this.$refs["waveform"],
            mediaElement: this.$store.state.player
        });

        this.$store.dispatch( 'setWaveform', {
            value: waveform
        })
        waveform.on( 'update', (data) => {
          this.$store.commit( "setRenderData", data)
        })
        waveform.load('/sample.mp3');
  },
  methods: {
  },
  watch: {
  }
}
</script>

<style scoped>
.waveform {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    user-select: none;
    pointer-events: none;
}
</style>
