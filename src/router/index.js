import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import HelloTM from '@/components/HelloTM'
import VueResource from 'vue-resource'
Vue.use(Router)
Vue.use(VueResource)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/TM',
      name: 'HelloTM',
      component: HelloTM
    }
  ]
})
