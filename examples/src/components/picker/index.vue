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
          <div class="flex-box">
            <vue-app-scroller
              snappingAlign="select"
              :scrollingY="true"
              :snapping="snapping"
              :snappingComplete="snappingComplete"
              :snappingSelect="0"
              :snappingListIndex="0"
              :data="data">
              <div class="scroller-content">
                <div class="row" v-for="(value, key) in data" :key="key">{{ value.key }}</div>
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
    propData:{
      type: Array,
      description:'所有的项'
    }
  },
  data() {
    return {
      open: false,
      snapping:[90,40],
      data:[],
      selectIndex:0,
    };
  },
  created() {
    setTimeout(()=>{
      this.data = this.propData;
    },30)
  },
  methods: {
    cancelPageScroll(e){
      e.preventDefault()
    },
    snappingComplete(e){
      this.selectIndex = e.selectIndex;
    },
    // 点击取消
    cancelClick(callback) {
      callback();
      this.close();
    },
    // 点击确定
    confirmClick(callback){
      let item = this.data[this.selectIndex]
      callback(item);
      this.close();
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
