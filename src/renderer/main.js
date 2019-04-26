import Vue from 'vue';
import SuiVue from 'semantic-ui-vue';
import 'semantic-ui/dist/semantic.min.css'

import App from './App';
import router from './router';
import store from './store';

Vue.config.productionTip = false;
Vue.config.devtools = true;
Vue.use(SuiVue);
Vue.use(require('vue-electron'));
/* eslint-disable no-new */
new Vue({
  components: {
    App,
  },
  router,
  store,
  template: '<App/>',
}).$mount('#app');

/* Enable webpack hot reloading */
if (module.hot) {
  module.hot.accept();
}
