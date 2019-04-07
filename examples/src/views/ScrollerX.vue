<template>
  <div>
    <nav-bar title="ScrollerX"></nav-bar>
    <div class="scroller-container">
      <scroller 
        :onScroll="scroll"
        :scrollingX="true"  
        :data="items">
        <div class="list">
          <div v-for="(item, index) in items" class="row" :class="{'grey-bg': index % 2 == 0}" :key="index">
            {{ item }}
          </div>
        </div>
      </scroller>
    </div>
    <div class="info-position">{{ x + ',' + y }}</div>
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
      for (let i = 1; i < 10; i++) {
        items.push(i + ' - keep walking, be 2 with you.keep walking, be 2 with youkeep walking, be 2 with youkeep walking, be 2 with youkeep walking')
      }
      this.items = items

    },
    methods:{
      scroll(e){
        this.x = e.x
        this.y = e.y
      }
    }
  }
</script>
<style>
  
</style>