import { createStore } from 'vuex'

export default createStore({
  state: {
    player: null,
    loading: '',
    processing: 0,
    language: '',
    subtitle: [],
    waveform: null,
    playing: false,
    currentTime: 0,
    currentIndex: -1,
    renderData: {
      padding: 2,
      duration: 10,
      gridGap: 10,
      gridNum: 110,
      beginTime: -5,
    }
  },
  getters: {
  },
  mutations: {
    setPlayer( state, playerRef ){
      state.player = playerRef
    },
    setPlaying( state, value ){
      state.playing = value
    },
    setCurrentTime( state, value ){
      state.currentTime = value
    },
    setWaveform( state, value ){
      state.waveform = value
    },
    setRenderData( state, value ){
      state.renderData = value
    }
  },
  actions: {
    setPlayer( context, playload ){
      context.commit( 'setPlayer', playload.value )
    },
    setWaveform( context, playload ){
      context.commit( 'setWaveform', playload.value )
    }
  },
  modules: {
  }
})
