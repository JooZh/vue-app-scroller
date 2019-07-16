<template>
  <div class="snap">
    <nav-bar title="Snapping"></nav-bar>
    <div class="scroller-container">
      <div class="item-title border-bottom-1px">基本使用</div>
      <div class="item-content scroll-y-bd y1 border-bottom-1px">
        <div class="flex-box" v-for="(item,index) in Array(4)" :key="index" :class="index!==3?'border-right-1px':''">
          <vue-app-scroller
            :scrollingY="true"
            :snap="snap"
            :data="itemsY">
            <div class="row" v-for="(item, index) in itemsY" :class="{'grey-bg': index % 2 == 0}" :key="index">{{ item }}</div>
          </vue-app-scroller>
        </div>
      </div>
      <div class="item-title border-bottom-1px">横向滚动</div>
      <div class="item-content scroll-x-bd border-bottom-1px">
        <div class="flex-box" v-for="(item,index) in Array(3)" :key="item" :class="index!==2?'border-bottom-1px':''">
          <vue-app-scroller
            :scrollingX="true"
            :snap="snap"
            :data="itemsX">
            <div class="row" v-for="(item, index) in itemsX" :class="{'grey-bg': index % 2 == 0}" :key="index">{{ item }}</div>
          </vue-app-scroller>
        </div>
      </div>
      <div class="item-title border-bottom-1px">返回对应索引</div>
      <div class="item-show border-bottom-1px">
        <div>{{snapArray[0]}}</div>
        <div>{{snapArray[1]}}</div>
        <div>{{snapArray[2]}}</div>
        <div>{{snapArray[3]}}</div>
      </div>
      <div class="item-content scroll-y-bd y2 border-bottom-1px">
        <div class="flex-box" v-for="(item,index) in snapArray" :key="index">
          <vue-app-scroller
            snapAlign="select"
            :scrollingY="true"
            :snap="snap"
            :snapComplete="snapComplete"
            :snapSelect="item"
            :snapListIndex="index">
            <div class="row" v-for="(item, index) in itemsY" :key="index">{{ item }}</div>
          </vue-app-scroller>
        </div>
        <div class="shade"></div>
        <div class="indicator">
          <span class="border-bottom-1px border-top-1px"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import NavBar from './NavBar.vue'
  import dateTime from '../components/dataTime/index.js'
  export default {
    components: {
      NavBar
    },
    data () {
      return {
        snap:[90,40],
        itemsY: [],
        itemsX: [],
        snapArray:[],
      }
    },
    created () {
      let itemsY = []
      for (let i = 1; i <= 20; i++) {
        itemsY.push('ScrollerY.'+i )
      }
      this.snapArray=[1,2,0,6]
      let itemsX = []

      for (let i = 1; i <= 10; i++) {
        itemsX.push('ScrollerX.'+i)
      }
      setTimeout(()=>{
        this.itemsX = itemsX;
        this.itemsY = itemsY;
      },30)
    },
    mounted() {
    },
    methods:{
      snapComplete(e){
        let add = this.snapArray.concat([])
        this.snapArray.forEach((item,index) => {
          if(index === e.listIndex){
            add[index] = e.selectIndex
          }
        });
        this.snapArray = add
      }
    }
  }
</script>
<style lang="stylus">
  .snap
    .item-show
      height 18px;
      display flex;
      div
        flex 1;
        display flex
        align-items center
        justify-content center
        font-size 12px
        color #999
    .scroll-y-bd
      display flex
      &.y1
        height 120px;
      &.y2
        height 200px
        .flex-box
          .row
            font-size 14px;
      .flex-box
        flex 1
        position relative
        .row
          height 40px;
          padding 0;
          line-height 40px;
          display flex;
          align-items center;
          justify-content center;
          font-size 12px;
      .shade
        z-index: 3;
        transform: translateZ(0);
        background-image: linear-gradient(to bottom, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.6)), linear-gradient(to top, rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.6));
        background-position: top, bottom;
        background-size: 100% 80px;
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
    .scroll-x-bd
      height 120px;
      .flex-box
        height 40px;
        position relative
        display flex
        align-items center
        .row
          width 90px;
          float left;
          height 40px;
          padding 0;
          line-height 40px;
          display flex;
          align-items center;
          justify-content center;
          font-size 12px;
</style>
