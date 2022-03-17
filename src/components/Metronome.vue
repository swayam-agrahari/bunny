<template>
  <div class="metro" @mousedown="onMouseDown" @mousemove="onMouseMove">
    <div
        class="template"
        v-if="this.player && !this.playing && drogStartTime && drogEndTime && drogEndTime > drogStartTime"
    ></div>
  </div>
</template>

<script>
import {mapState} from "vuex";
import subtitleJSON from "@/sample.json";
import Sub from "@/lib/Sub";
import DT from 'duration-time-conversion';

export default {
  name: "Metronome",
  data: function(){
    return {
      isDroging: false,
      drogStartTime: 0,
      drogEndTime: 0
    }
  },
  mounted: function() {
    document.addEventListener('mouseup', this.onDocumentMouseUp);
  },
  methods: {
    onDocumentMouseUp: function(){
      if (this.isDroging) {
        if (this.drogStartTime > 0 && this.drogEndTime > 0 && this.drogEndTime - this.drogStartTime >= 0.2) {
          const subtitle = subtitleJSON.map((item) => new Sub(item))
          const index = this.findIndex(subtitle, this.drogStartTime) + 1;
          const start = DT.d2t(this.drogStartTime);
          const end = DT.d2t(this.drogEndTime);
          console.log( index, start, end );
        }
      }
      this.isDroging = false;
      this.drogStartTime = 0;
      this.drogEndTime = 0;
    },
    onMouseDown: function (e){
      if (e.button !== 0) return;
      const clickTime = this.getEventTime(e);
      this.isDroging = true;
      this.drogStartTime = clickTime;
    },
    onMouseMove: function (e){
      if (this.isDroging) {
        if (this.playing) this.player.pause();
        this.drogEndTime = this.getEventTime(e);
      }
    },
    getEventTime: function(event){
          return (event.pageX - this.renderData.padding * this.gridGap) / this.gridGap / 10 + this.renderData.beginTime;
    },
    findIndex: function(subs, startTime) {
      return subs.findIndex((item, index) => {
        return (
            (startTime >= item.endTime && !subs[index + 1]) ||
            (item.startTime <= startTime && item.endTime > startTime) ||
            (startTime >= item.endTime && subs[index + 1] && startTime < subs[index + 1].startTime)
        );
      });
    }
  },
  computed: {
    gridGap: function (){
      return document.body.clientWidth / this.$store.state.renderData.gridNum;
    },
    leftStyle: function(){
      return (this.renderData.padding * this.gridGap + (this.drogStartTime - this.renderData.beginTime) * this.gridGap * 10) + 'px'
    },
    widthStyle: function(){
      return ((this.drogEndTime - this.drogStartTime) * this.gridGap * 10) + 'px'
    },
    ...mapState([
      'player',
      'playing',
      'renderData'
    ])
  }
}
</script>

<style scoped>
.metro {
  position: absolute;
  z-index: 8;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  cursor: ew-resize;
  user-select: none;
}

.template {
  position: absolute;
  top: 0;
  bottom: 0;
  height: 100%;
  background-color: rgba(76, 175, 80, 0.5);
  border-left: 1px solid rgba(76, 175, 80, 0.8);
  border-right: 1px solid rgba(76, 175, 80, 0.8);
  user-select: none;
  pointer-events: none;
}
</style>