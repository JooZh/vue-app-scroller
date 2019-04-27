<template>
  <div class="nesting-layout">
    <nav-bar title="Nesting Layout"></nav-bar>
    <div class="scroller-container">
      <div class="item-content scroll-y-bd border-bottom-1px">
        <vue-app-scroller 
          ref="scroller" 
          :scrollingY="true" 
          :onScroll="onScroll"
          :data="itemsY">
          <div class="scroller-content">
            <div class="row" v-for="(item, index) in itemsY" :class="{'grey-bg': index % 2 == 0}" :key="'a'+index">{{ item }}</div>
            <div ref="tab1" class="in-scroller-tab">Tab1 Title</div>
            <div class="in-scroller-content border-bottom-1px border-top-1px">
                <vue-app-scroller 
                  ref="tab1scroller" 
                  :scrollingY="false" 
                  :bouncing="false"  
                  :onScroll="tab1Scroll"
                  :data="itemsYY">
                  <div class="scroller-content">
                    <div class="row" v-for="(item, index) in itemsYY" :class="{'grey-bg': index % 2 == 0}" :key="'b'+index">{{ item }}</div>
                  </div>
                </vue-app-scroller>
            </div>
            <div class="row" v-for="(item, index) in itemsY" :class="{'grey-bg': index % 2 == 0}" :key="'c'+index">{{ item }}</div>
            <!-- <div ref="tab2" class="in-scroller-tab">Tab2 Title</div>
            <div class="in-scroller-content border-bottom-1px border-top-1px">
                <scroller 
                  ref="tab2scroller" 
                  :scrollingY="false" 
                  :bouncing="false"  
                  :onScroll="tab2Scroll"
                  :data="itemsYY">
                  <div class="scroller-content">
                    <div class="row" v-for="(item, index) in itemsYY" :class="{'grey-bg': index % 2 == 0}" :key="'d'+index">{{ item }}</div>
                  </div>
                </scroller>
            </div>
            <div class="row" v-for="(item, index) in itemsY" :class="{'grey-bg': index % 2 == 0}" :key="'e'+index">{{ item }}</div> -->
          </div>
        </vue-app-scroller>
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
        tab1scroller:null,
        tab2scroller:null,
        tab1scrollerMaxHeight:0,
        tab2scrollerMaxHeight:0,
        tab1Top:0,
        tab2Top:0,
        itemsY: [],
        itemsYY:[],
        isNextDown:true,
        isBackTop:false,
        enabelScroller:true,
        enabelTab1Scroller:true,
        enabelTab2Scroller:true,
      }
    },
    mounted() {
      this.scroller = this.$refs.scroller
      this.tab1scroller = this.$refs.tab1scroller
      // this.tab2scroller = this.$refs.tab2scroller
      setTimeout(()=>{
        this.tab1Top = this.$refs.tab1.offsetTop
        // this.tab2Top = this.$refs.tab2.offsetTop
        this.tab1scrollerMaxHeight = this.tab1scroller.getAttr('maxHeightScrollY')
        // this.tab2scrollerMaxHeight = this.tab2scroller.getAttr('maxHeightScrollY')
      },100)
      let itemsY = []
      for (let i = 1; i <= 10; i++) {
        itemsY.push('ScrollerY.'+i )
      }
      let itemsYY = []
      for (let i = 1; i <= 30; i++) {
        itemsYY.push('maxHeightScrollY.'+i )
      }
      this.itemsY = itemsY;
      this.itemsYY = itemsYY;
      
    },
    methods:{
      onScroll(e){
        if((e.y > this.tab1Top) && this.enabelScroller){
          if(this.isNextDown){
            this.scroller.stopScroll()
            this.scroller.setAttr('enableScrollY',false)
            this.scroller.publish(0,this.tab1Top)
            this.tab1scroller.setAttr('enableScrollY',true)
            this.enabelScroller = false
            this.enabelTab1Scroller = true
            this.isNextDown = false
            this.isBackTop = true
          }
        }else if((e.y < this.tab1Top) && this.enabelScroller){
          if(this.isBackTop){
            this.scroller.stopScroll()
            this.scroller.setAttr('enableScrollY',false)
            this.scroller.publish(0,this.tab1Top)
            this.tab1scroller.setAttr('enableScrollY',true)
            this.enabelScroller = false
            this.enabelTab1Scroller = true
            this.isNextDown = true
            this.isBackTop = false
          }
        }
      },
      tab1Scroll(e){
        if(e.y >= this.tab1scrollerMaxHeight && this.enabelTab1Scroller){
          this.scroller.setAttr('enableScrollY',true)
          this.tab1scroller.setAttr('enableScrollY',false)
          this.enabelScroller = true
          this.enabelTab1Scroller = false
        }else if(e.y <= 0 && this.enabelTab1Scroller){
          this.scroller.setAttr('enableScrollY',true)
          this.tab1scroller.setAttr('enableScrollY',false)
          this.enabelScroller = true
          this.enabelTab1Scroller = false
        }
      },
      // tab2Scroll(e){
      //   if(e.y >= this.tab2scrollerMaxHeight && this.enabelTab2Scroller){
      //     this.scroller.setAttr('enableScrollY',true)
      //     this.tab2scroller.setAttr('enableScrollY',false)
      //     this.enabelScroller = true
      //     this.enabelTab2Scroller = false
      //   }else if(e.y <= 0 && this.enabelTab2Scroller){
      //     this.scroller.setAttr('enableScrollY',true)
      //     this.tab2scroller.setAttr('enableScrollY',false)
      //     this.enabelScroller = true
      //     this.enabelTab2Scroller = false
      //   }
      // }
    }
  }
</script>
<style lang="stylus">
  .nesting-layout
    .scroll-y-bd
      height 100%;
      .in-scroller-tab
        height 60px;
        width 100%;
        text-align center;
        line-height 60px
        background #ccc;
        font-size 24px;
      .in-scroller-content
        position relative
        height 400px;
        width 100%;
        font-size 24px;
        .emng
          position absolute 
          top 0
          left 0
          bottom 0
          right 0
          pointer-events none
    
</style>
