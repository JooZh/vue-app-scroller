<template>
  <div class="app-container">
    <scroller :scrollingY="true">
      <h1 class="plugin-name">Vue-App-Scroller</h1>
      <p class="for-vue">for Vue.js 2.0</p>
      <router-link class="row grey-bg" tag="label" to="/refresh">
        <span class="left">PullRefresh</span>
        <div class="right">
          <span>【 下拉刷新 】</span>
          <img src="../assets/arrow-right.png" class="arrow-right">
        </div>  
      </router-link>
      <router-link class="row" tag="label" to="/reach">
        <span class="left">ReachBottom</span>
        <div class="right">
          <span>【 上拉加载 】</span>
          <img src="../assets/arrow-right.png" class="arrow-right">
        </div> 
      </router-link>
      <router-link class="row grey-bg" tag="label" to="/listen">
        <span class="left">ListenScrolling</span>
        <div class="right">
          <span>【 监听滚动 】</span>
          <img src="../assets/arrow-right.png" class="arrow-right">
        </div>
      </router-link>
      <router-link class="row" tag="label" to="/snapping">
        <span class="left">Snapping</span>
        <div class="right">
          <span>【 网格移动 】</span>
          <img src="../assets/arrow-right.png" class="arrow-right">
        </div>
      </router-link>
      <router-link class="row grey-bg" tag="label" to="/paging">
        <span class="left">Paging</span>
        <div class="right">
          <span>【 滑动分页 】</span>
          <img src="../assets/arrow-right.png" class="arrow-right">
        </div>
      </router-link>
      <router-link class="row" tag="label" to="/pullandreach">
        <span class="left">PullAndReach</span>
        <div class="right">
          <span>【 刷新组合 】</span>
          <img src="../assets/arrow-right.png" class="arrow-right">
        </div>
      </router-link>
      <router-link class="row grey-bg" tag="label" to="/mousewheel">
        <span class="left">MouseWheel</span>
        <div class="right">
          <span>【 鼠标滚动 】</span>
          <img src="../assets/arrow-right.png" class="arrow-right">
        </div>
      </router-link>
      <router-link class="row" tag="label" to="/scrollerx">
        <span class="left">ScrollerX</span>
        <div class="right">
          <span>【 横向滚动 】</span>
          <img src="../assets/arrow-right.png" class="arrow-right">
        </div>
      </router-link>
    </scroller>
  </div>
</template>

<script>
export default {
  
}
</script>
<style>

</style>
