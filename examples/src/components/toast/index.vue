<template>
  <transition name="toast">
    <div class="toast" v-if="isShow" @touchmove="cancelPageScroll">
      <div class="toast__box">
        <div class="toast__icon" v-if="icon" v-html="icon"></div>
        <div class="toast__text" v-if="content" v-html="content"></div>
      </div>
    </div>
  </transition>
</template>
<script>
export default {
  props: {
    small: {
      default: false,
      type: Boolean
    },
    icon: {
      default: "",
      type: String
    },
    content: {
      default: "",
      type: String
    }
  },
  data() {
    return {
      isShow: false
    };
  },
  methods: {
    cancelPageScroll(e){
      e.preventDefault()
    },
  }
};
</script>

<style lang="stylus">
.toast
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0);
  z-index: 99999;
  transition: opacity 0.3s;
  display flex;
  align-items center
  justify-content center
  &__box
    background rgba(0, 0, 0, 0.6);
    padding 10px 40px;
    border-radius 5px;
    color #fff;
    font-size 14px;
// 初始化动画样式
.toast-enter-active, 
.toast-leave-active {
  transition: all 0.3s;
  opacity: 1;
}
.toast-enter, 
.toast-leave-active {
  opacity: 0;
}
</style>