import Vue from 'vue'
import Router from 'vue-router'

import Index from '../views/Index.vue'
import Scroller from '../views/Scroller.vue'
import PullAndReach from '../views/PullAndReach.vue'
import Click from '../views/Click.vue'
import Snapping from '../views/Snapping.vue'
import SnappingComponents from '../views/SnappingComponents.vue'
import SnappingLayout from '../views/SnappingLayout.vue'
import Paging from '../views/Paging.vue'
import MouseWheel from '../views/MouseWheel.vue'


Vue.use(Router)

export default new Router({
  routes: [
    { path: '/', component: Index },
    { path: '/scroller', component: Scroller },
    { path: '/refresh', component: PullAndReach },
    { path: '/click', component: Click },
    { path: '/snapping', component: Snapping },
    { path: '/paging', component: Paging },
    { path: '/mousewheel', component: MouseWheel },
    { path: '/snapping-components', component: SnappingComponents },
    { path: '/snapping-layout', component: SnappingLayout },

  ]
})
