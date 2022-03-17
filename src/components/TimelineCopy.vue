<template>
  <div class="timelineContainer">
      <div v-for="sub in currentSubs" :key="sub.text">
        <div class='sub-item' :style="{
            'left': leftStyle(sub),
            'width': widthStyle(sub)
        }">
            <div className="sub-duration">{{sub.duration}}</div>
        </div>
      </div>
  </div>
</template>

<script>
import subtitleJSON from "@/sample.json";
import { getCurrentSubs } from '@/utils'
import Sub from '@/lib/Sub';
export default {
  name: 'Player',
  data: function(){
    return {
        currentSubs: null,
        gridGap: null,
        currentIndex: null,
        subtitle: null
    }
  },
  mounted: function() {
        this.subtitle = subtitleJSON.map((item) => new Sub(item))
        this.currentSubs = getCurrentSubs(this.subtitle, this.$store.state.renderData.beginTime, this.$store.state.renderData.duration);
        this.gridGap = document.body.clientWidth / this.$store.state.renderData.gridNum;
        this.currentIndex = this.currentSubs.findIndex(
            (item) => item.startTime <= this.$store.state.currentTime && item.endTime > this.$store.state.currentTime,
        );
        console.log( { ...this.$store.state.renderData } )
  },
  methods: {
  },
  computed: {
      leftStyle: function(){
          return (sub) => {
            return (this.$store.state.renderData.padding * this.gridGap + (sub.startTime - this.$store.state.renderData.beginTime) * this.gridGap * 10) + 'px'
          }
      },
      widthStyle: function(){
          return (sub) => {
              return ( (sub.endTime - sub.startTime) * this.gridGap * 10 ) + 'px'
          }
      }
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
