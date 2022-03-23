import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: () => import('../views/Home.vue'),
    meta: {
      needLogin: true //需要加校检判断的路由
    }
  },
  {
    path: '/table',
    name: 'Table',
    component: () => import('../views/Table.vue')
  },
  {
    path: '/form',
    name: 'Form',
    component: () => import('../views/Form.vue')
  },
  {
    path: '/config',
    name: 'Config',
    component: () => import('../views/Form.vue')
  },
  {
    path: '/tool',
    name: 'Tool',
    component: () => import('../views/Tool.vue')
  },
  {
    path: '/message',
    name: 'Message',
    component: () => import('../views/Message.vue')
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('../views/User.vue')
  },
  {
    path: '/link',
    name: 'Link',
    component: () => import('../views/Link.vue')
  },
  {
    path: '/error',
    name: 'Error',
    component: () => import('../views/Error.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

export default router
