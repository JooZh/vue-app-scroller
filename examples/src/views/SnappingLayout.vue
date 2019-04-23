<template>
  <div class="snapping-layout">
    <nav-bar title="Snapping Layout"></nav-bar>
    <div class="scroller-container">
      <!-- <div class="item-title border-bottom-1px">时间选择器</div> -->
      <div class="buttons"> 
        <div class="button" @click="openDateTime1">吸顶效果</div>
        <div class="button" @click="openLayout2">定点开启</div>
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

      }
    },
    methods:{
      openDateTime1(){
        
      },
      openLayout2(){
        
      }
    }
  }
</script>
<style lang="stylus">
  .snapping-layout
    .buttons
      padding 20px;
      .button
        background #f0f0f0;
        height 40px;
        line-height 40px;
        border-radius 5px;
        text-align center
        font-size:15px;
        color:#454545;
        margin-bottom 10px;
</style>
