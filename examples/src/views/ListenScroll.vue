<template>
  <div>
    <nav-bar title="Smoothing Scroll"></nav-bar>
    <div class="scroller-container">
      <scroller 
        :onScroll="scroll"
        :scrollingY="true"  
        :data="items">
        <div v-for="(item, index) in items" class="row" :class="{'grey-bg': index % 2 == 0}" :key="index">
          {{ item }}
        </div>
      </scroller>
    </div>
    <div class="info-position">{{ x + ',' + y }}</div>
  </div>
</template>
<style>
  .info-position {
    position: fixed;
    right: 20px;
    bottom: 20px;
    width: 50px;
    height: 50px;
    color: #fff;
    font-size: 12px;
    line-height: 50px;
    border-radius: 25px;
    background-color: rgba(0,0,0,0.4);
    text-align: center;
  }
</style>
<script>
  import NavBar from './NavBar.vue'

  export default {
    props:{
      pos:{
        type:Object
      }
    },
    components: {
      NavBar
    },
    data () {
      return {
        items: [],
        x: 0,
        y: 0,
        timer: 0
      }
    },

    mounted() {
      let items = []
      for (let i = 1; i < 100; i++) {
        items.push(i + ' - keep walking, be 2 with you.')
      }
      this.items = items
    },
    methods:{
      scroll(e){
        // console.log(e)
        this.x = e.x
        this.y = e.y
      }
    },
    beforeDestroy() {
      clearInterval(this.timer)
    }
  }
</script>
