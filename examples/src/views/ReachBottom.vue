<template>
  <div>
    <nav-bar title="ReachBottom"></nav-bar>
    <div class="scroller-container">
      <scroller
        :scrollingY="true"  
        :onReachBottom ="loadingMore"
        :data="items">
        <div
          v-for="(item, index) in items" 
          @click="onItemClick(index, item)"
          class="row" 
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
        isRefresh:false,
        items: []
      }
    },

    mounted() {
      let items = []
      for (let i = 1; i <= 20; i++) {
        items.push(i + ' - keep walking, be 2 with you.')
      }
      this.items = items
      this.bottom = 20
    },

    methods: {
      loadingMore(e) {
          setTimeout(() => {
            let start = this.bottom + 1
            let items = []
            if(this.bottom < 40){
              for (let i = start; i < start + 9; i++) {
                items.push(i + ' - keep walking, be 2 with you.')
              }
            }
            this.items = this.items.concat(items)
            this.bottom = this.bottom + 9
          }, 1500)
      },

      onItemClick(index, item) {
        console.log(index)
      }
    }
  }
</script>
