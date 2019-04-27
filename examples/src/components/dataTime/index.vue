<template>
  <transition name="datetime">
    <div class="datetime" v-if="open">
      <div class="datetime-mask" @click="close" @touchmove="cancelPageScroll"></div>
      <div class="datetime-inner">
        <div class="datetime-title border-bottom-1px">
          <button class="datetime-title-btn cancel" v-text="cancel.text" @click="cancelClick(cancel.clickHandler)"></button>
          <span class="datetime-title-name" v-text="title"></span>
          <button class="datetime-title-btn confrim" v-text="confirm.text" @click="confirmClick(confirm.clickHandler)"></button>
        </div>
        <div class="datetime-content">
          <div class="flex-box" v-for="(item,index) in timeSpace" :key="index">
            <vue-app-scroller 
              snappingType="select"
              :scrollingY="true"
              :snapping="snapping"
              :snappingComplete="snappingComplete"
              :snappingSelect="currentSpace[index]"
              :snappingListIndex="index"
              :data="item">
              <div class="scroller-content">
                <div class="row" v-for="(value, key) in item" :key="key">{{ value }}</div>
              </div>
            </vue-app-scroller>
          </div>
          <div class="shade"></div>
          <div class="indicator">
            <span class="border-bottom-1px border-top-1px"></span>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>
<script>
import date from './date.js'
export default {
  props: {
    title: {
      type: String,
      default:'请选择',
      description:'选择器标题名称'
    },
    cancel: {
      type: Object,
      description:'取消文案及操作'
    },
    confirm: {
      type: Object,
      description:'确定文案及操作'
    },
    type: {
      type: String,
      description:'组件选择的类型'
    },
    beginTimeArr: {
      type: Array,
      description:'开始时间数组'
    },
    currentTimeArr:{
      type: Array,
      description:'当前选中时间数组'
    },
    overTimeArr: {
      type: Array,
      description:'结束时间数组'
    },
    propCurrentSpace:{
      type: Array,
      description:'选中的日期索引'
    },
    propTimeSpace:{
      type: Array,
      description:'所有日期序列数组'
    },
    formatText:{
      type: Array,
      description:'在数字末尾添加的文字'
    },
    stepMinutes:{
      type: Number,
      description:'分钟显示步长'
    },
    stepSeconds:{
      type: Number,
      description:'秒数显示步长'
    }
  },
  data() {
    return {
      open: false,
      snapping:[90,40],
      timeSpace:[[],[],[],[],[],[]],
      currentSpace:this.propCurrentSpace,
      currentTimeList:this.currentTimeArr,
      currentE:[0,0]
    };
  },
  created() {
    setTimeout(()=>{
      this.timeSpace = this.propTimeSpace;
    },30)
  },
  methods: {
    cancelPageScroll(e){
      e.preventDefault()
    },
    snappingComplete(e){
      // 判断是否是更新选择
      let currentE = [e.listIndex,e.selectIndex]
      if(currentE.toString() === this.currentE.toString()){
        return
      }
      let select = this.timeSpace[e.listIndex][e.selectIndex];
      this.currentTimeList[e.listIndex] = parseInt(select)
      this.currentE = currentE
      this.timeSpace = date.getTimeSpace(
        this.type,
        this.beginTimeArr,
        this.currentTimeList,
        this.overTimeArr,
        this.formatText,
        this.stepMinutes,
        this.stepSeconds
      )
    },
    // 点击取消
    cancelClick(callback) {
      callback();
      this.close();
    },
    // 点击确定
    confirmClick(callback){
      let backArray = this.currentTimeList.concat([])
      let backObj = this.parseDateTime(backArray)
      callback(backObj);
      this.close();
    },
    // 格式化日期组
    parseDateTime(backArray){
      // 格式化
      backArray = backArray.map(v=> v<10 ? `0${v}`:`${v}`);
      let formatArray = backArray.map((v,i)=>`${v+this.formatText[i]}`)
      let date = [];
      let time = [];
      // 先判断类型
      switch(this.type){
        case 'yyyy-mm-dd hh:mm:ss':
        case 'yyyy-mm-dd hh:mm':
        case 'yyyy-mm-dd hh':
        case 'yyyy-mm-dd':
          date = backArray.slice(0,3)
          time = backArray.slice(3)
          break;
        case 'hh:mm:ss':
        case 'hh:mm':
          time = backArray.concat([])
          break;
      }
      return {
        line:`${date.join('-')} ${time.join(':')}`.trim(),
        slash:`${date.join('/')} ${time.join(':')}`.trim(),
        format:formatArray.join('').trim(),
        point:`${date.join('.')} ${time.join(':')}`.trim(),
        array:backArray,
      }
    },
    // 关闭
    close(){
      this.open = false
    }
  }
};
</script>
<style lang="stylus">
.datetime
  position: relative;
  z-index: 999999;
  &-mask
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-color: rgba(0,0,0,0.5);
    z-index: 999;
    transition: opacity .3s;
  &-inner 
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height:auto;
    z-index: 1500;
    background-color: #FFF;
    transition: transform .25s;
    touch-action: none;
    will-change: transform;
  &-title
    height:40px;
    line-height: 40px;
    display: flex;
    &-btn
      flex:60px 0 0;
      padding:0;
      border:0;
      background:none;
      font-size:15px;
      font-weight:500;
      &.confrim
        color:red;
      &.cancel
        color:#999;
    &-name
      flex:1;
      font-size:16px;
      
      text-align :center;
      color :#484848
  &-content
    height 280px; 
    display flex;
    position relative
    .flex-box
      height 280px; 
      flex 1
      position relative
      .row
        height 40px;
        padding 0;
        line-height 40px;
        display flex;
        align-items center;
        justify-content center;
        font-size 15px;
    .shade
      z-index: 3;
      transform: translateZ(0);
      background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.6)), linear-gradient(to top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.6));
      background-position: top, bottom;
      background-size: 100% 120px;
      background-repeat: no-repeat;
      pointer-events: none;
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 100%;
    .indicator
      pointer-events: none;
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 100%;
      z-index: 4;
      display: flex;
      justify-content: center;
      flex-direction: column;
      span 
        display: block;
        width: 100%;
        height: 40px;
        position: relative;  





// 初始化动画样式
.datetime-enter-active,
.datetime-leave-active{
  transition: all 0.3s;
}
// .datetime-enter,
// .datetime-leave-active{
//   opacity: 0;
// }
.datetime-enter-active .datetime-mask,
.datetime-leave-active .datetime-mask{
  opacity: 1; 
}
.datetime-enter .datetime-mask,
.datetime-leave-active .datetime-mask{
  opacity: 0; 
}
.datetime-enter-active .datetime-inner,
.datetime-leave-active .datetime-inner{
  transform: translateY(0); 
}
.datetime-enter .datetime-inner,
.datetime-leave-active .datetime-inner{
  transform: translateY(100%); 
}
</style>
