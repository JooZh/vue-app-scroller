<template>
  <div class="paging">
    <nav-bar title="Paging"></nav-bar>
    <div class="scroller-container">
      <div class="item-title border-bottom-1px">纵向滚动</div>
      <div class="item-content scroll-y-bd border-bottom-1px">
        <scroller 
          :scrollingY="true"
          :paging="true"
          :data="itemsY">
          <div class="scroller-content">
            <div class="row" v-for="(item, index) in itemsY" :class="{'grey-bg': index % 2 == 0}" :key="index">{{ item }}</div>
          </div>
        </scroller>
      </div>
      <div class="item-title border-bottom-1px">横向滚动</div>
      <div class="item-content scroll-x-bd border-bottom-1px">
        <scroller 
          :scrollingX="true" 
          :paging="true"
          :bouncing = "false"
          :data="itemsX">
          <div ref="scrollerx" class="scroller-content">
            <div class="row" v-for="(item, index) in itemsX" :class="{'grey-bg': index % 2 == 0}" :key="index">{{ item }}</div>
          </div>
        </scroller>
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
        isRefresh:false,
        itemsY: [],
        itemsX: []
      }
    },
    mounted() {
      let itemsY = []
      for (let i = 1; i <= 5; i++) {
        itemsY.push('ScrollerY.'+i )
      }
      this.itemsY = itemsY;

      let itemsX = []
      for (let i = 1; i <= 5; i++) {
        itemsX.push('ScrollerX.'+i)
      }
      this.itemsX = itemsX;

      setTimeout(()=>{
        this.$refs.scrollerx.style.display = 'flex'
      },30)
    },
    methods:{
      scrollingComplete(){
        console.log('sss')
      }
    }
  }
</script>
<style lang="stylus">
  .paging
    .scroll-y-bd
      height 250px;
      .row
        height 250px;
        padding 0;
        line-height 250px;
        display flex;
        align-items center;
        justify-content center;
        font-size 30px;
    .scroll-x-bd
      height 200px;
      .scroller-content
        height 200px;
        .row
          height 100%;
          width 100%;
          padding 0;
          flex 1;
          display flex;
          align-items center;
          justify-content center;
          font-size 30px;
</style>
