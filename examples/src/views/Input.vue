<template>
  <div>
    <nav-bar title="Input"></nav-bar>
    <div class="scroller-container">
      <vue-app-scroller :scrollingY="true">
        <div
          v-for="(item, index) in items"
          class="row"
          :class="{'grey-bg': index % 2 == 0}"
          :key="'1'+index">
          {{ item }}
        </div>
        <div class="input grey-bg"><input type="text" value="" placeholder="input-text"></div>
        <div class="input"><input type="password" value="" placeholder="input-password"></div>
        <div
          v-for="(item, index) in items"
          class="row"
          :class="{'grey-bg': index % 2 == 0}"
          :key="'2'+index">
          {{ item }}
        </div>
        <div class="input grey-bg"><textarea type="text" value="" rows="3" placeholder="textarea"></textarea></div>
        <div class="input"><textarea type="text" value="" rows="3" placeholder="textarea"></textarea></div>
        <div
          v-for="(item, index) in items"
          class="row"
          :class="{'grey-bg': index % 2 == 0}"
          :key="'3'+index">
          {{ item }}
        </div>
      </vue-app-scroller>
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
      for (let i = 1; i <= 4; i++) {
        items.push(i + ' - keep walking, be 2 with you.')
      }
      this.items = items
    },

    methods: {

    }
  }
</script>
<style lang="stylus">
.input
  // height 40px
  padding 10px 20px;
  // line-height 40px
  input,textarea
    outline none;
    width 250px;
    -webkit-appearance: none;
</style>
