import VueInfiniteScroller from './infinite-scroller/index';

function install(Vue) {
    if (install.installed) return;
    install.installed = true;
    Vue.component('vue-app-scroller', VueInfiniteScroller);
}

export default install;
