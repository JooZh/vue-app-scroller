import Scroller from './Scroller.vue'

function install (Vue) {
  if (install.installed) return
  install.installed = true
  Vue.component('vue-app-scroller', Scroller)
}

const VueAppScroller = {
  install: install,
  Scroller
}

if (typeof window !== undefined && window.Vue) {
  window.Vue.use(VueAppScroller)
}

export default VueAppScroller
