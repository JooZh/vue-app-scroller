<template>
  <div>
    <nav-bar title="PullRefresh"></nav-bar>
    <div class="scroller-container">
      <scroller
        :scrollingY="true"  
        :onPullRefresh="refresh"
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
    },

    methods: {
      refresh(done) {
        if(!this.isRefresh){
          this.isRefresh = true
          setTimeout(() => {
            let items = []
            for (let i = 1; i <= 20; i++) {
              items.push(i + ' - keep walking, be 2 with you.')
            }
            this.items = items
            this.bottom = 20
            this.isRefresh = false
            done()
          }, 1500)
        }
      },

      onItemClick(index, item) {
        console.log(index)
      }
    }
  }
</script>
