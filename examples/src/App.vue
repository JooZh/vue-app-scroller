<template>
  <div id="app" class="app-container">
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
</template>

<style>
.app-container{
  width: 100%;
  height: 100%;
}
.scroller-container{
  position: absolute;
  top:44px;
  left: 0;
  right: 0;
  bottom:0;
}
</style>
