import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', component: () => import('../views/Index.vue') },
    { path: '/scroller', component: () => import('../views/ScrollerDefault.vue') },
    { path: '/refresh', component: () => import('../views/PullAndReach.vue') },
    { path: '/snap', component: () => import('../views/Snap.vue') },
    { path: '/snap-components', component: () => import('../views/SnapComponents.vue')  },
    { path: '/nesting', component: () => import('../views/NestingLayout.vue') },
    { path: '/ceiling', component: () => import('../views/CeilingLayout.vue') },
    { path: '/scroller-page', component: () => import('../views/ScrollPage.vue') }
  ]
})
