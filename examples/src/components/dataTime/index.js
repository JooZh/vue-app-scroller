import Vue from 'vue';
import DateTimeComponent from './index.vue';
import date from './date.js';

const DateTimeConstructor = Vue.extend(DateTimeComponent);
const init = (propsData) => {
  return new DateTimeConstructor({
    propsData
  }).$mount(document.createElement('div'));
};

// 无操作函数
const NOOP = function () {};
// 可选类型
const dateTimeType = date.dateTimeType
// 默认参数
const options = {
  type: '', 
  beginTime:'',
  overTime:'',
  confirmClick: NOOP,
  cancelClick: NOOP,
  cancelText: '取消',
  confirmText: '确定',
  formatText: '',
  stepMinutes: 1,
  stepSeconds: 1
};
// 验证时间
const checkTime = function (type,timeStr){
  let isTrue= false;
  switch (type) {
    case 'yyyy-mm-dd hh:mm:ss':
      isTrue = date.checkTimeType.isFullDateTime(timeStr);
      break;
    case 'yyyy-mm-dd hh:mm':
      isTrue = date.checkTimeType.isDateTimeMinute(timeStr);
      break;
    case 'yyyy-mm-dd hh':
      isTrue = date.checkTimeType.isDateTimeHour(timeStr);
      break;
    case 'yyyy-mm-dd':
      isTrue = date.checkTimeType.isDateDay(timeStr);
      break;
    case 'yyyy-mm':
      isTrue = date.checkTimeType.isDateMonth(timeStr);
      break;
    case 'hh:mm:ss':
      isTrue = date.checkTimeType.isFullTime(timeStr);
      break;
    case 'hh:mm':
      isTrue = date.checkTimeType.isTime(timeStr);
      break;
  }
  if(!isTrue){
    throw new Error('传入时间格式不正确')
  }
}
// 验证参数
const checkParams = function(params){
  // 验证类型
  if(!params.type) {
    throw new Error('请指定类型 "type"')
  }else{
    matchType(params)
  }
  // 验证传入时间型格式
  if(params.beginTime){
    params.beginTime = params.beginTime.substr(0,params.type.length)
    checkTime(params.type,params.beginTime)
  }
  if(params.overTime){
    params.overTime = params.overTime.substr(0,params.type.length)
    checkTime(params.type,params.overTime)
  }
  //验证当前选中时间 
  if(params.currentTime){
    params.currentTime = params.currentTime.substr(0,params.type.length)
    checkTime(params.type,params.currentTime)
  }else{
    options.currentTime = date.getCurrentTime(params.type)
  }
}
// 当前选中时间必须在开始时间和结束时间中间
const checkTimeSlot = function(options){
  // 当前选中时间必须在开始时间和结束时间中间
  let bTime = options.beginTime.replace(/\.|\/|\-|\:|\s/g,'')
  let oTime = options.overTime.replace(/\.|\/|\-|\:|\s/g,'')
  let cTime = options.currentTime.replace(/\.|\/|\-|\:|\s/g,'')
  if(Number(cTime) < Number(bTime)){
    options.currentTime = options.beginTime
  } else if(Number(cTime) > Number(oTime)){
    options.currentTime = options.overTime
  }
}
// 匹配类型
const matchType = function(params){
  let type =  params.type.trim();
  let index = dateTimeType.findIndex(item => item.type === type );
  if(index === -1){
    throw new Error('传入类型不正确')
  }else{
    Object.assign(options,dateTimeType[index])
  }
}
// 转化为数组
const timeToArray = function(time){
  return time.replace(/\.|\/|\-|\:|\s/g,',').split(',').map(item=>Number(item));
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
    // 验证参数
    checkParams(params)
    // 合并参数
    for (let key in params) {
      if(params[key]){
        options[key] = params[key];
      }
    }
    // 当前选中时间必须在开始时间和结束时间中间
    checkTimeSlot(options)
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
      confirm:{
        text: options.confirmText,
        clickHandler:options.confirmClick
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
export default DateTime;
