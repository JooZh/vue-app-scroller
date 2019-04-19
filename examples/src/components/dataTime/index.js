import Vue from 'vue';
import DateTimeComponent from './index.vue';
import date from './date.js';

const DateTimeConstructor = Vue.extend(DateTimeComponent);
const init = (propsData) => {
  return new DateTimeConstructor({
    propsData
  }).$mount(document.createElement('div'));
};

const NOOP = function () {};
// 可选类型
const dateTimeType = [
  {
    formatText:['年','月','日','时','分','秒'],
    type:'yyyy-mm-dd hh:mm:ss', 
  },{
    formatText:['年','月','日','时','分'],
    type:'yyyy-mm-dd hh:mm'
  },{
    formatText:['年','月','日','时'],
    type:'yyyy-mm-dd hh', 
  },{
    formatText:['年','月','日'],
    type:'yyyy-mm-dd', 
  },{
    formatText:['年','月'],
    type:'yyyy-mm', 
  },{
    formatText:['时','分','秒'],
    type:'hh:mm:ss', 
  },{
    formatText:['时','分'],
    type:'hh:mm', 
  }
];
// 默认参数
const options = {
  type: 'yyyy-mm-dd hh:mm:ss', 
  beginTime:'2010-01-01 00:00:00',
  overTime:'2059-12-31 23:59:00',
  onOkClick:  NOOP,
  onCancelClick:  NOOP,
  cancelText: '取消',
  confirmText: '确定',
  formatText: dateTimeType[1].formatText,
  stepMinutes: 1,
  stepSeconds: 1
};

// 验证时间格式
// const checkType = function(options){
//   let beginType = dateTimeType.findIndex(item => options.beginTime.length === item.length);
//   let currentType = dateTimeType.findIndex(item => options.currentTime.length === item.length);
//   let overType = dateTimeType.findIndex(item => options.overTime.length === item.length);
//   let notEmpty = beginType != -1 || overType != -1 || currentType != -1;
//   let sameType = beginType == overType && overType == currentType && beginType == currentType;
//   if(!(notEmpty && sameType)){
//     throw new Error('传入时间格式不正确')
//   }
// }
// 验证类型
const matchType = function(options){
  let type =  options.type.trim();
  let index = dateTimeType.findIndex(item => item.type === type );
  if(index === -1){
    throw new Error('传入时间类型不正确')
  }else{
    options.formatText = dateTimeType[index].formatText
  }
}

const timeToArray = function(time){
  return time.replace(/\-|\:|\s/g,',').split(',').map(item=>Number(item));
}
// 获取初始化日期数组
const getCurrentSpace = function(options){
  let begin = timeToArray(options.beginTime);
  let current = timeToArray(options.currentTime);
  let over = timeToArray(options.overTime);
  // 选中用的对应数组
  let currentSpace=[]; 
  // 显示用的二维数组
  let timeSpace = date.getTimeSpace(
    options.type,
    begin,
    current,
    over,
    options.formatText,
    options.stepMinutes,
    options.stepSeconds
  ); 
  // 得到选中的索引
  current.map((item,index)=>{
    let number = item < 10 ? `0${item}` : `${item}`;
    return number + options.formatText[index]
  }).forEach((item,index)=>{
    let findIndex = timeSpace[index].findIndex(value => item===value)
    currentSpace.push(findIndex)
  })

  return {
    currentSpace:currentSpace,
    timeSpace:timeSpace,
    beginTimeArr:begin,
    currentTimeArr:current,
    overTimeArr:over
  }
}

const DateTime = {
  open(params = {}) {
    // 验证传入类型格式
    // matchType(params)
    // 参数合并
    if(!params.currentTime){
      options.currentTime = date.getCurrentTime()
    }
    for (let key in params) {
      if(params[key]){
        options[key] = params[key];
      }
    }
    matchType(options)
    // 验证开始时间和结束时间的正确性， 还没做
    // checkType(options)
    // 获取初始化日期数组
    let spaceData = getCurrentSpace(options)
    // 初始化组件
    const instance = init({
      type: options.type,
      title: options.title,
      beginTimeArr: spaceData.beginTimeArr,
      currentTimeArr: spaceData.currentTimeArr,
      overTimeArr: spaceData.overTimeArr,
      propCurrentSpace: spaceData.currentSpace,
      propTimeSpace:spaceData.timeSpace,
      formatText:options.formatText,
      stepMinutes:options.stepMinutes,
      stepSeconds:options.stepSeconds,
      buttons: [{
        text: options.cancelText,
        clickHandler() {
          instance.open = false;
          options.onCancelClick.apply(this, arguments);
        }
      }, {
        text: options.confirmText,
        primary: true,
        clickHandler() {
          instance.open = false;
          options.onOkClick.apply(this, arguments);
        }
      }]
    });
    instance.open = options.open || true;
    document.body.appendChild(instance.$el);
    return instance;
  },
};
export default DateTime;
