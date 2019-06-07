import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  state: {
    theme: 'default',
  },
  getters: {
    theme: state => state.theme,
  },
  mutations: {
    setTheme: (state, theme) => {
      state.theme = theme;
    },
  },
});
