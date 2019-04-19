<template>
  <div class="nav-bar border-bottom-1px">
    <div class="btn-back" @click="back">
      <img class="arrow-back" src="../assets/arrow-back.png">
    </div>
    <div class="title" v-if="title">{{title}}</div>
  </div>
</template>


<script>
  export default {
    props: {
      title: {
        type: String
      },
      backTo: {
        type: String,
        default: '/'
      }
    },
    methods: {
      back () {
        this.$router.push(this.backTo)
      }
    }
  }
</script>
<style lang="stylus">
  .nav-bar
    width: 100%;
    height: 44px;
    background-color: #fff;
    position: relative;
    z-index: 1000;
    .btn-back 
      height: 100%;
      position: absolute;
      width 30px;
      top: 0;
      left: 0;
      display flex;
      justify-content center;
      align-items center
    .arrow-back
      width: 8px;
      height: 16px;
    .title
      width: 100%;
      text-align: center;
      font-size: 18px;
      line-height: 44px;
      color: #444;
</style>