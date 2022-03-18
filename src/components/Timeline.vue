<template>
  <div class="timelineContainer">
    <div v-for="(sub, key) in currentSubs" :key="key">
      <div
          :class="[ 'sub-item', key === currentIndex ? 'sub-highlight' : '' ]" :style="{
            'left': leftStyle(sub),
            'width': widthStyle(sub)
          }"
          @click="timelineOnClick(sub)"
          @dblclick="(e) => timelineOnDbClick(e, sub)"
      >
        <div class="sub-handle" :style="{ left: 0, width: '10px' }"></div>
        <div class="sub-text" :title="sub.text">
          <p>{{sub.text}}</p>
        </div>
        <div class="sub-handle" :style="{ right: 0, width: '10px' }"></div>
        <div className="sub-duration">{{ sub.duration }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import subtitleJSON from "@/sample.json";
import {getCurrentSubs, hasSub} from '@/utils';
import Sub from '@/lib/Sub';
import {mapState} from "vuex";

export default {
  name: 'Player',
  data: function () {
    return {
    }
  },
  mounted: function () {
    this.$store.dispatch( 'setSubtitles', {
      value: subtitleJSON.map((item) => new Sub(item))
    })
  },
  methods: {
    timelineOnClick: function (sub){
      if (this.player.duration >= sub.startTime) {
        this.player.currentTime = sub.startTime;
      }
    },
    timelineOnDbClick: function (e, sub){
      // const $subs = e.currentTarget;
      const index = hasSub(sub, this.subtitle);
      const previous = this.subtitle[index - 1];
      const next = this.subtitle[index + 1];
      if (previous && next) {
        const width = (next.startTime - previous.endTime) * 10 * this.gridGap;
        e.currentTarget.style.width = width + 'px';
        // $subs.style.width = width + 'px';
        // console.log( $subs.style.width )
        // const start = DT.d2t(previous.endTime);
        // const end = DT.d2t(next.startTime);
      }
    }
  },
  computed: {
    currentSubs: function () {
      return getCurrentSubs( this.subtitle, this.renderData.beginTime, this.renderData.duration);
    },
    gridGap: function () {
      return document.body.clientWidth / this.renderData.gridNum;
    },
    currentIndex: function () {
      return this.currentSubs.findIndex(
          (item) => item.startTime <= this.currentTime && item.endTime > this.currentTime,
      );
    },
    leftStyle: function () {
      return (sub) => {
        return (this.renderData.padding * this.gridGap + (sub.startTime - this.renderData.beginTime) * this.gridGap * 10) + 'px'
      }
    },
    widthStyle: function () {
      return (sub) => {
        return ((sub.endTime - sub.startTime) * this.gridGap * 10) + 'px'
      }
    },
    ...mapState([
        'player',
        'subtitle',
        'currentTime',
        'renderData'
    ])
  }
}
</script>

<style scoped>
.timelineContainer {
  position: absolute;
  z-index: 9;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.sub-item {
  position: absolute;
  top: 30%;
  left: 0;
  height: 40%;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #fff;
  font-size: 14px;
  cursor: move;
  user-select: none;
  pointer-events: all;
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.sub-item:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.sub-item.sub-highlight {
  background-color: rgba(33, 150, 243, 0.5);
  border: 1px solid rgba(33, 150, 243, 0.5);
}

.sub-item.sub-illegal {
  background-color: rgba(199, 81, 35, 0.5);
}

.sub-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  height: 100%;
  cursor: col-resize;
  user-select: none;
}

.sub-handle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sub-text {
  position: relative;
  z-index: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  word-break: break-all;
  white-space: nowrap;
  text-shadow: rgb(0 0 0) 1px 0px 1px, rgb(0 0 0) 0px 1px 1px, rgb(0 0 0) -1px 0px 1px,
  rgb(0 0 0) 0px -1px 1px;
  width: 100%;
  height: 100%;
}

.sub-text p {
  margin: 2px 0;
  line-height: 1;
}

.sub-duration {
  opacity: 0.5;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  text-align: center;
  font-size: 12px;
}
</style>
