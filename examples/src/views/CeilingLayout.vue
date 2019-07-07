<template>
  <div class="ceiling-layout">
    <nav-bar title="Ceiling Layout"></nav-bar>
    <div class="scroller-container">
      <div class="item-content scroll-y-bd border-bottom-1px">
        <div v-show="select>=0" ref="fixed_title" class="title fiexd">{{titles[select]}}</div>
        <vue-app-scroller
          ref="scroller"
          :scrollingY="true"
          :onScroll="onScroll"
          :data="itemsY">
          <div class="scroller-content">
            <template v-for="(item, index) in itemsY">
              <div ref="tab" class="title" :key="index">{{item.title}}</div>
              <div class="row" v-for="(value, key) in item.children" :class="{'grey-bg': key % 2 == 0}" :key="index+''+key">{{value}}</div>
            </template>
          </div>
        </vue-app-scroller>
      </div>
      <div class="keys border-top-1px">
        <template v-for="(item, index) in keys">
          <div class="key border-bottom-1px" :class="select == index ?'active':''" @click="clickNav(index)" :key="index">{{item}}</div>
        </template>
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
        scroller:null,
        titleFixedDom:null,
        showTitle:true,
        isClick:false,
        itemsY: [],
        keys:[],
        titles:[],
        tabsHeight:[],
        select:0
      }
    },
    mounted() {
      this.scroller = this.$refs.scroller;
      this.titleFixedDom = this.$refs.fixed_title;
      setTimeout(()=>{
        Array.from(this.$refs.tab).forEach(item=>{
          this.tabsHeight.push(item.offsetTop)
        })
      },30)

      let keys=[];
      let itemsY = []
      for (let i = 1; i <=10; i++) {
        keys.push(i);
        let children = [];
        let title = 'Title'+i
        this.titles.push(title);
        let random = Math.floor(Math.random() * (15 - 3)) + 3
        for (let s = 1; s <= random; s++) {
          children.push('ScrollerY.'+s )
        }
        itemsY.push({
          title: title,
          children:children
        })
      }
      this.itemsY = itemsY;
      this.keys = keys;
    },
    methods:{
      onScroll(e){
        if(!this.isClick){
          this.select = this.tabsHeight.filter(item=>item <= e.y).length-1
          let height1 = this.tabsHeight[this.select+1]-this.titleFixedDom.offsetHeight
          let height2 = this.tabsHeight[this.select+1]
          let y = (height1 <= e.y && e.y <= height2) ? (height1 - e.y) : 0;
          this.titleFixedDom.style.transform = `translate(0,${y}px)`
        }
      },
      clickNav(index){
        this.select = index
        this.isClick = true
        this.scroller.stopScroll();
        setTimeout(()=>{
          this.scrollTo(this.select)
        },10)

      },
      scrollTo(index){
        // scrollTo 执行时间为 默认 250毫秒
        this.scroller.scrollTo(0,this.tabsHeight[index],true)
        let timer = setTimeout(()=>{
          this.isClick = false
          clearTimeout(timer)
        },250)
      }
    }
  }
</script>
<style lang="stylus">
  .ceiling-layout
    .keys
      top 50%;
      margin-top:-(10*30/2)px;
      right 10px
      z-index 10
      position absolute;
      width 30px;
      height auto;
      background rgba(0,0,0,0.5);
      color #fff;
      .key
        width 30px;
        height 30px;
        line-height 30px;
        text-align center;
        &.active
          color yellow
    .scroll-y-bd
      height 100%;
      .title
        height 20px;
        width 100%;
        text-align left;
        line-height 20px;
        padding: 10px 0 10px 0px;
        text-indent 15px;
        background #ccc;
        font-size 16px;
        &.fiexd
          position absolute;
          top 0;
          left 0
          z-index 11
</style>
