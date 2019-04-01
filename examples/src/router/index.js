import Vue from 'vue'
import Router from 'vue-router'

import Index from '../views/Index.vue'
import PullRefresh from '../views/PullRefresh.vue'
import ReachBottom from '../views/ReachBottom.vue'
import ListenScroll from '../views/ListenScroll.vue'
import Snapping from '../views/Snapping.vue'
import Paging from '../views/Paging.vue'
import PullAndReach from '../views/PullAndReach.vue'
import MouseWheel from '../views/MouseWheel.vue'
import ScrollerX from '../views/ScrollerX.vue'


Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', component: Index },
    { path: '/refresh', component: PullRefresh },
    { path: '/listen', component: ListenScroll },
    { path: '/reach', component: ReachBottom },
    { path: '/snapping', component: Snapping },
    { path: '/paging', component: Paging },
    { path: '/pullandreach', component: PullAndReach },
    { path: '/mousewheel', component: MouseWheel },
    { path: '/scrollerx', component: ScrollerX }
  ]
})
