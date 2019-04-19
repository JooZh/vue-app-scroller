<template>
  <div>
    <nav-bar title="Click"></nav-bar>
    <div class="scroller-container">
      <scroller :scrollingY="true" :data="items">
        <div 
          v-for="(item, index) in items" 
          class="row" 
          @click="clickHandle(index+1)" 
          :class="{'grey-bg': index % 2 == 0}"
          :key="index">
          {{ item }}
        </div>
      </scroller>
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
        items: [],
        x: 0,
        y: 0
      }
    },
    mounted() {
      let items = []
      for (let i = 1; i < 20; i++) {
        items.push(i + ' - keep walking, be 2 with you.')
      }
      this.items = items
    },
    methods:{
      clickHandle(e){
        alert('点击了：'+e)
      }
    }
  }
</script>

<style>
  
</style>
