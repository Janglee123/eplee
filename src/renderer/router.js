import Vue from 'vue';
import Router from 'vue-router';
import Home from '@/renderer/components/Home';
import Reader from '@/renderer/components/Reader';
Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/reader/:id',
      name: 'Reader',
      component: Reader, // () => import('@/renderer/components/Reader'),
      props: true,
    },
    {
      path: '*',
      redirect: '/',
    },
  ],
});
