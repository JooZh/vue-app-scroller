import Vue from 'vue';

import ToastComponent from './index.vue';

const ToastConstructor = Vue.extend(ToastComponent);
const init = (propsData) => {
    return new ToastConstructor({
        propsData
    }).$mount(document.createElement('div'));
};
// 默认参数
const options = {
    content:'提示',
    timeout:2000, 
  };
// 全局的局部加载器, 确保页面中多次使用都只会存在一个
var globalLoading = null;

const toast = {
    show(params = {}) {
        for (let key in params) {
            if(params[key]){
                options[key] = params[key];
            }
        }
        const instance = init(options);
        instance.isShow = params.isShow || true;
        setTimeout(function() {
            instance.isShow = false;
        }, params.timeout);

        document.body.appendChild(instance.$el);
    },
    // showLoading(options = {}) {
    //     options.small = true;
    //     options.icon = '<div class="dj-preloader dj-preloader--sm dj-preloader--animation"><div class="dj-preloader__rotater"></div></div>';
    //     if (typeof options.content == 'undefined') {
    //         options.content = '正在加载中';
    //     }

    //     this.closeLoading();
    //     globalLoading = init(options);
    //     globalLoading.isShow = options.isShow || true;

    //     document.body.appendChild(globalLoading.$el);
    //     return globalLoading;
    // },
    // closeLoading() {
    //     if (globalLoading) {
    //         globalLoading.isShow = false;
    //     }
    // }
};

export default toast;