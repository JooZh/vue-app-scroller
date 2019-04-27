<template>
  <div class="scroller-base">
    <nav-bar title="Scroller"></nav-bar>
    <div class="scroller-container">
      <div class="item-title border-bottom-1px">纵向滚动-监听滚动位置</div>
      <div class="item-content scroll-y-bd border-bottom-1px">
        <vue-app-scroller :scrollingY="scrollingY" :onScroll="scrollY" :data="itemsY">
          <div class="scroller-content">
            <div class="row" v-for="(item, index) in itemsY" :class="{'grey-bg': index % 2 == 0}" :key="index">{{ item }}</div>
          </div>
        </vue-app-scroller>
        <div class="info-position">{{ Y.x + ',' + Y.y }}</div>
      </div>
      <div class="item-title border-bottom-1px">横向滚动-监听滚动位置[1]</div>
      <div class="item-content scroll-x-bd border-bottom-1px">
        <div class="line">
          <vue-app-scroller :onScroll="scrollX" :scrollingX="true" :data="itemsX">
            <div class="lists">
              <div v-for="(item, index) in itemsX" class="list" :key="index">{{ item }}</div>
            </div>
          </vue-app-scroller>
        </div>
        <div class="line color">
          <vue-app-scroller :scrollingX="true" :data="itemsX">
            <div class="lists">
              <div v-for="(item, index) in itemsX" class="list" :key="index">{{ item }}</div>
            </div>
          </vue-app-scroller>
        </div>
        <div class="line">
          <vue-app-scroller :scrollingX="true" :data="itemsX">
            <div class="lists">
              <div v-for="(item, index) in itemsX" class="list" :key="index">{{ item }}</div>
            </div>
          </vue-app-scroller>
        </div>
        <div class="info-position">{{ X.x + ',' + X.y }}</div>
      </div>
    </div>
  </div>
</template>

<script>
  import NavBar from './NavBar.vue'

  export default {
    components: {
      NavBar
    },
    data () {
      return {
        scrollingY:true,
        isRefresh:false,
        itemsY: [],
        itemsX: [],
        Y:{
          x:0,
          y:0
        },
        X:{
          x:0,
          y:0
        }
      }
    },
    mounted() {
      let itemsY = []
      for (let i = 1; i < 20; i++) {
        itemsY.push(i + ' - keep walking, be 2 with you.')
      }
      this.itemsY = itemsY;

      let itemsX = []
      for (let i = 1; i <= 10; i++) {
        itemsX.push('ScrollerX.'+i)
      }
      this.itemsX = itemsX
    },
    methods:{
      scrollY(e){
        this.Y = e
      },
      scrollX(e){
        this.X = e
      }
    }
  }
</script>
<style lang="stylus">
  .scroller-base
    .scroll-y-bd
      height 250px;
      margin-bottom 30px;
    .scroll-x-bd
      .line
        width: 100%;
        height: 50px;
        position: relative;
        &.color
          background #f7f7f7;
        .lists
          .list
            padding 0 24px;
            height 50px;
            font-size 16px;
            line-height 50px;
            text-align center;
            display: inline-block 
</style>
