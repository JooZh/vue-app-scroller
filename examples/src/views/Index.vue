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
    </scroller>
  </div>
</template>

<style>

  html, body {
    margin: 0;
    width: 100%;
    height: 100%;
  }
  * {
    box-sizing: border-box;
    font-family: Helvetica Neue, Helvetica, Arial, sans-serif;
  }
  .plugin-name {
    margin: 0;
    padding-top: 60px;
    text-align: center;
    color: #666;
    font-style: normal;
    font-variant-ligatures: normal;
    font-variant-caps: normal;
    font-variant-numeric: normal;
    font-weight: normal;
    font-stretch: normal;
    font-size: 32px;
    line-height: 48px;
    margin-bottom: 10px;
  }
  .for-vue {
    text-align: center;
    color: #666;
    margin-bottom: 40px;
  }

  .plugin-name,
  .for-vue-js {
    font-family: Candara, Calibri, Segoe, Segoe UI, Optima, Arial, sans-serif;
  }

  .row {
    display: flex;
    width: 100%;
    height: 50px;
    padding: 10px 0 10px 15px;
    font-size: 16px;
    line-height: 30px;
    color: #444;
    background-color: #fff;
    justify-content:space-between;
  }
  .row .right{
    display: flex;
    align-items: center;
  }
  .grey-bg {
    background-color: #eee;
  }
  .arrow-right {
    height: 16px;
    margin-right: 15px;
    margin-left: 5px;
  }

</style>
