// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import FastClick from 'fastclick'

import router from './router/index'
import VueAppScroller from '../../src/index'

Vue.config.productionTip = false

FastClick.attach(document.body)

Vue.use(VueAppScroller);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
