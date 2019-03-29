<template>
  <div ref="container" class="vue-app-scroller__container">
    <div ref="content" class="vue-app-scroller__content">
      <div class="refresh--content" v-if="!!onPullRefresh" :class="{'active': refreshState !== 0}">
        <div class="refresh--content__icons">
          <spinner class="icon__spinner"  v-if="refreshState == 2" style="fill:#AAA;stroke:#AAA"></spinner>
          <arrow class="icon__arrow" v-else fillColor="#AAA"></arrow>
        </div>
        <div class="refresh--content__texts">
          <span class="refresh__text" v-if="refreshState == 0">下拉刷新</span>
          <span class="refresh__text" v-else-if="refreshState == 1">立即刷新</span>
          <span class="refresh__text" v-else-if="refreshState == 2">正在刷新</span>
        </div>
      </div>
      <div class="scroller--content">
        <slot name="scroller--content"></slot>
      </div>
      <div class="loading--content" v-if="!!onReachBottom" >
        <span v-if="showLoading" class="spinner-holder">
          <spinner class="icon__spinner" style="fill: #AAA;stroke: #AAA"></spinner>
        </span>
        <div v-else class="no-data-text"> 没有更多数据 </div>
      </div>
    </div>
  </div>
</template>
<script>
import Scroller from '../core/scroller.js'
import Spinner from './Spinner.vue'
import Arrow from './Arrow.vue'

export default {
  props:{
    data:{
      type:[Array,Object],
      description:'监听数据的变化'
    },
    onScroll:{
      type:[Function],
      description:'滚动事件处理函数'
    },
    onPullRefresh: {
      type:Function,
      description:'下拉刷新处理函数'
    },
    onReachBottom: {
      type:Function,
      description:'上拉加载处理函数'
    },
    scrollingX:{
      type:Boolean,
      default:false,
      description:'是否横向滚动'
    },
    scrollingY:{
      type:Boolean,
      default:false,
      description:'是否纵向滚动'
    },
    mousewheel:{
      type:Boolean,
      default:false,
      description:'是否开启鼠标滚动'
    },
    snapping:{
      type: [Boolean,Number,Object],
      default: false,
      description:'是否开启像素网格移动'
    },
    paging:{
      type: Boolean,
      default: false,
      description:'是否开启滑动分屏'
    },
    bouncing: {
      type: Boolean,
      default: true,
      description:'是否使用回弹效果'
    },
    animating: {
      type: Boolean,
      default: true,
      description:'是否使用动画'
    },
    duration: {
      type: Number,
      default: 250,
      description:'由 scrollTo 触发的动画持续时间 ms'
    }
  },
  components:{
    Spinner,
    Arrow
  },
  data(){
    return {
      scroller:null,      // Scroller 实例
      container:null, 
      content:null,
      showLoading: true,  // 显示 加载更多
      refreshState: 0,   // 0: pull to refresh, 1: release to refresh, 2: refreshing
    }
  },
  created(){

  },
  mounted(){
    // 得到需要的 dom
    this.container = this.$refs.container;
    this.content = this.$refs.content;
    // 实例化 Scroller
    this.scroller = new Scroller(this.content, {
      listenScroll:!!this.onScroll,       // 是否需要监听滚动事件
      isPullRefresh:!!this.onPullRefresh, //  是否启用下拉刷新事件
      isReachBottom:!!this.onReachBottom, // 是否启用上拉加载事件
      scrollingX: this.scrollingX,    // 开启横向滚动
      scrollingY: this.scrollingY,    // 开启纵向滚动
      mousewheel: this.mousewheel,     // 开启鼠标滚轮事件监听
      paging: this.paging,            // 是否开启分页
      snapping: this.snapping,        // 是否开启像素网格
      animating: this.animating,      // 使用动画效果
      animationDuration: this.duration,
      bouncing: this.bouncing         // 开启回弹效果
    });
    // 数据发生变化后更新 dom
    this.$watch('data',(newData,oldData)=>{
      this.scroller.setDimensions()
    },{ deep:true })
    // 根据是否绑定监听函数来判断是否调
    !!this.onScroll && this.onScrollHandler();
    !!this.onPullRefresh && this.onPullRefreshHandler();
    !!this.onReachBottom && this.onReachBottomHandler();
    !!this.snapping && this.setSnapping();
  },
  methods:{
    // 监听滚动事件处理
    onScrollHandler(){
      if(!!this.onScroll){
        this.scroller.on('scroll',(e)=>{
          this.onScroll(e)
        })
      }
    },
    // 下拉刷新处理
    onPullRefreshHandler(){
      if (!!this.onPullRefresh) {
        this.scroller.activatePullToRefresh(() => {
          this.refreshState = 1
        }, () => {
          this.refreshState = 0
        }, () => {
          this.refreshState = 2
          this.onPullRefresh(this.onPullRefreshDone)
        })
      }
    },
    onPullRefreshDone(){
      this.scroller.finishPullToRefresh()
    },
    // 上拉加载处理
    onReachBottomHandler(){
      if(!!this.onReachBottom){
        this.scroller.on('loading',(e)=>{
          if(e.hasMore){
            this.showLoading = true
            this.onReachBottom(e)
          }else{
            this.showLoading = false
          }
        })
      }
    },
    // 设置像素网格移动
    setSnapping(){
      if(!!this.snapping){
        if(typeof this.snapping === 'number'){
          this.scroller.setSnapSize(this.snapping,this.snapping)
        }else if(typeof this.snapping === 'object'){
          this.scroller.setSnapSize(this.snapping.width,this.snapping.height)
        }
      }
    }
  }
}
</script>
<style>
.vue-app-scroller__container{
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow: hidden;
}
.vue-app-scroller__content{
  width: 100%;
}
/* 下拉刷新 */
.vue-app-scroller__content .refresh--content {
  width: 100%;
  height: 44px;
  margin-top: -44px;
  text-align: center;
  font-size: 14px;
  color: #AAA;
  display:flex;
  align-items: center;
  justify-content: center;
}
.vue-app-scroller__content .refresh--content .refresh--content__icons{
  width: 18px;
  height: 18px;
}
.vue-app-scroller__content .refresh--content .refresh--content__icons .icon__arrow{
  width: 16px;
  height: 16px;
  -webkit-transform: translate3d(0,0,0) rotate(0deg);
  transform: translate3d(0,0,0) rotate(0deg);
  -webkit-transition: -webkit-transform .2s linear;
  transition: transform .2s linear;
}
.vue-app-scroller__content .refresh--content.active .refresh--content__icons .icon__arrow {
  -webkit-transform: translate3d(0,0,0) rotate(180deg);
  transform: translate3d(0,0,0) rotate(180deg);
}
.vue-app-scroller__content .refresh--content .refresh--content__icons .icon__spinner{
  width: 18px;
  height: 18px;
}
.vue-app-scroller__content .refresh--content .refresh--content__texts{
  margin-left: 5px;
}
.vue-app-scroller__content .refresh--content .refresh--content__texts .refresh__text{
  color: #69717d
}

/* 上拉加载 */
.vue-app-scroller__content .loading--content {
  width: 100%;
  height: 40px;
  text-align: center;
  font-size: 14px;
  line-height: 40px;
  color: #AAA;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vue-app-scroller__content .loading--content .spinner-holder{
  width: 18px;
  height: 18px;
}
.vue-app-scroller__content .loading--content .spinner-holder .icon__spinner{
  width: 18px;
  height: 18px;
  display: block;
}
.vue-app-scroller__content .loading--content .no-data-text{
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>
