<template>
  <div class="home-container">
    <vue-app-scroller :scrollingY="true">
      <div class="scroller-content">
        <h1 class="plugin-name">Vue-App-Scroller</h1>
        <p class="for-vue">for Vue.js 2.0</p>
        <router-link class="row grey-bg" tag="label" to="/scroller">
          <span class="left">Scroller</span>
          <div class="right">
            <span>【 基本功能 】</span>
            <img src="../assets/arrow-right.png" class="arrow-right">
          </div>  
        </router-link>
        <router-link class="row" tag="label" to="/refresh">
          <span class="left">PullRefresh & ReachBottom</span>
          <div class="right">
            <span>【 刷新功能 】</span>
            <img src="../assets/arrow-right.png" class="arrow-right">
          </div>
        </router-link>
        <router-link class="row grey-bg" tag="label" to="/click">
          <span class="left">Click</span>
          <div class="right">
            <span>【 点击事件 】</span>
            <img src="../assets/arrow-right.png" class="arrow-right">
          </div>
        </router-link>
        <router-link class="row" tag="label" to="/paging">
          <span class="left">Paging</span>
          <div class="right">
            <span>【 滑动分页 】</span>
            <img src="../assets/arrow-right.png" class="arrow-right">
          </div>
        </router-link>
        <router-link class="row grey-bg" tag="label" to="/snapping">
          <span class="left">Snapping</span>
          <div class="right">
            <span>【 滑动网格 】</span>
            <img src="../assets/arrow-right.png" class="arrow-right">
          </div>
        </router-link>
        <router-link class="row" tag="label" to="/snapping-components">
          <span class="left">Snapping Components</span>
          <div class="right">
            <span>【 滑动组件 】</span>
            <img src="../assets/arrow-right.png" class="arrow-right">
          </div>
        </router-link>
        <router-link class="row grey-bg" tag="label" to="/nesting">
          <span class="left">Nesting Layout</span>
          <div class="right">
            <span>【 嵌套滚动 】</span>
            <img src="../assets/arrow-right.png" class="arrow-right">
          </div>
        </router-link>
        <router-link class="row" tag="label" to="/ceiling">
          <span class="left">Ceiling Layout</span>
          <div class="right">
            <span>【 吸顶效果 】</span>
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
      </div>
    </vue-app-scroller>
  </div>
</template>

<script>
export default {
  
}
</script>
<style lang="stylus">
  .home-container
    position relative;
    width 100%
    height 100%
    .plugin-name
      margin: 0;
      padding-top: 40px;
      text-align: center;
      color: #666;
      font-style: normal;
      font-variant-ligatures: normal;
      font-variant-caps: normal;
      font-variant-numeric: normal;
      font-weight: normal;
      font-stretch: normal;
      font-size: 32px;
      line-height: 40px;
      margin-bottom: 10px;
    .for-vue 
      text-align: center;
      color: #666;
      margin-bottom: 30px;
    .plugin-name,.for-vue-js
      font-family: Candara, Calibri, Segoe, Segoe UI, Optima, Arial, sans-serif;
</style>
