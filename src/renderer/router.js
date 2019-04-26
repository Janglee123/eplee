import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/renderer/components/Home'
import Reader from '@/renderer/components/Reader'
Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/reader',
      component: Reader,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
})
