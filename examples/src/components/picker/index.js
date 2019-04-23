import Vue from 'vue';
import PickerComponent from './index.vue';

const PickerConstructor = Vue.extend(PickerComponent);
const init = (propsData) => {
  return new PickerConstructor({
    propsData
  }).$mount(document.createElement('div'));
};

// 无操作函数
const NOOP = function () {};
// 默认参数
const options = {
  confirmClick: NOOP,
  cancelClick: NOOP,
  cancelText: '取消',
  confirmText: '确定',
  data:[
    {key:'标题1',value:'205'},
    {key:'标题2',value:'206'},
    {key:'标题3',value:'207'},
    {key:'标题4',value:'208'}
  ]
};

const Picker = {
  open(params = {}) {
    // 合并参数
    for (let key in params) {
      if(params[key]){
        options[key] = params[key];
      }
    }
    // 初始化组件
    const instance = init({
      title: options.title,
      propData: options.data,
      confirm:{
        text: options.confirmText,
        clickHandler: options.confirmClick
      },
      cancel:{
        text: options.cancelText,
        clickHandler:options.cancelClick
      }
    });
    instance.open = options.open || true;
    document.body.appendChild(instance.$el);
    return instance;
  },
};
export default Picker;
