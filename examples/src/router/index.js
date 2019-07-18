import Vue from 'vue'
import Router from 'vue-router'

import Index from '../views/Index.vue'
import ScrollerDefault from '../views/ScrollerDefault.vue'
import PullAndReach from '../views/PullAndReach.vue'
import Click from '../views/Click.vue'
import Snap from '../views/Snap.vue'
import SnapComponents from '../views/SnapComponents.vue'
import NestingLayout from '../views/NestingLayout.vue'
import CeilingLayout from '../views/CeilingLayout.vue'
import Paging from '../views/Paging.vue'
import MouseWheel from '../views/MouseWheel.vue'
import Input from '../views/Input.vue'

Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', component: Index },
    { path: '/scroller', component: ScrollerDefault },
    { path: '/refresh', component: PullAndReach },
    { path: '/click', component: Click },
    { path: '/snap', component: Snap },
    { path: '/paging', component: Paging },
    { path: '/mousewheel', component: MouseWheel },
    { path: '/snap-components', component: SnapComponents },
    { path: '/nesting', component: NestingLayout },
    { path: '/input', component: Input },
    { path: '/ceiling', component: CeilingLayout }
  ]
})
