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
    },
    setSubtitles( state, value ){
      state.subtitle = value
    }
  },
  actions: {
    setPlayer( context, payload ){
      context.commit( 'setPlayer', payload.value )
    },
    setWaveform( context, payload ){
      context.commit( 'setWaveform', payload.value )
    },
    setSubtitles( context, payload ){
      context.commit('setSubtitles', payload.value )
    }
  },
  modules: {
  }
})
