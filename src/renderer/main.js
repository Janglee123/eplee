import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import VueElectron from 'vue-electron';
import VueBus from 'vue-bus';
import electronLocalshortcut from 'electron-localshortcut';
import App from './App';
import router from './router';
import store from './store';
import db from '@/shared/db';

Vue.config.productionTip = false;
Vue.config.devtools = true;

Vue.use(ElementUI);
Vue.use(VueElectron);
Vue.use(VueBus);
Vue.use(require('vue-electron'));

db.new('books');
Vue.prototype.$db = db;
Vue.prototype.$bind = electronLocalshortcut.register;
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
