<template>
  <div class="paging">
    <nav-bar title="Paging"></nav-bar>
    <div class="scroller-container">
      <scroller  
        :scrollingY="true"
        :paging="true"
        :duration="duration"
        :data="items">
        <div v-for="(item, index) in items" class="row" :class="{'grey-bg': index % 2 == 0}" :key="index">
          {{ item }}
        </div>
      </scroller>
    </div>
  </div>
</template>
<style>
  
</style>
<script>
  import NavBar from './NavBar.vue'

  export default {
    components: {
      NavBar
    },

    data () {
      return {
        snapping: {
          width:50,
          height:50,
        },
        duration: 150,
        items: []
      }
    },

    mounted() {
      for (let i = 1; i < 100; i++) {
        this.items.push(i + ' - keep walking, be 2 with you.')
      }
    }
  }
</script>
