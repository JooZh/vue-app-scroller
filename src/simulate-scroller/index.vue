<template>
    <div ref="container" class="vue-app-scroller__container">
        <div
            ref="content"
            class="vue-app-scroller__content"
            @click.capture="onClickCapture"
        >
            <div
                v-if="!!onPullRefresh"
                class="refresh--content"
                :class="{ active: refreshState !== 0 }"
            >
                <div class="refresh--content__icons">
                    <spinner v-if="refreshState === 2" class="icon__spinner" style="fill:#AAA;stroke:#AAA"></spinner>
                    <arrow v-else class="icon__arrow" fillColor="#AAA"></arrow>
                </div>
                <div class="refresh--content__texts">
                    <span v-if="refreshState === 0" class="refresh__text">下拉刷新</span>
                    <span v-else-if="refreshState === 1" class="refresh__text">立即刷新</span>
                    <span v-else-if="refreshState === 2" class="refresh__text">正在刷新</span>
                </div>
            </div>
            <span v-else class="refresh-no"></span>
            <div class="scroller--content">
                <slot></slot>
            </div>
            <div v-if="!!onReachBottom" class="loading--content">
                <span v-if="showLoading" class="spinner-holder">
                    <spinner class="icon__spinner" style="fill: #AAA;stroke: #AAA"></spinner>
                </span>
                <div v-else class="no-data-text">没有更多数据</div>
            </div>
            <span v-else class="loading-no"></span>
        </div>
    </div>
</template>

<script>
import Scroller from './js/index';
// import Scroller from './ts/index';
import Spinner from '../components/Spinner';
import Arrow from '../components/Arrow';

export default {
    components: {
        Spinner,
        Arrow
    },
    props: {
        data: {
            type: [Array, Object, Number],
            description: '监听数据的变化',
            default: () => {}
        },
        scrollBar: {
            type: Boolean,
            required: false,
            description: '是否需要显示滚动条',
            default: true
        },
        scrollingX: {
            type: Boolean,
            required: false,
            description: '是否横向滚动',
            default: false
        },
        scrollingY: {
            type: Boolean,
            required: false,
            description: '是否纵向滚动',
            default: false
        },
        onScroll: {
            type: Function,
            required: false,
            description: '滚动事件处理函数',
            default: () => {}
        },
        onPullRefresh: {
            type: Function,
            required: false,
            description: '下拉刷新处理函数',
            default: () => {},
        },
        onReachBottom: {
            type: Function,
            required: false,
            description: '上拉触底事件',
            default: () => {}
        },
        onLoadMore: {
            type: Function,
            required: false,
            description: '上拉加载更多事件',
            default: () => {}
        },
        snap: {
            type: [Boolean, Number, Array],
            default: false,
            description: '是否开启像素网格移动'
        },
        snapAlign: {
            type: String,
            default: 'top',
            description: 'snap使用类型 [top,middle]'
        },
        snapSelect: {
            type: Number,
            default: 0,
            description: '默认选中的值'
        },
        snapListIndex: {
            type: Number,
            default: 0,
            description: '当前的组序列'
        },
        paging: {
            type: Boolean,
            default: false,
            description: '是否开启滑动分屏'
        },
        bouncing: {
            type: Boolean,
            default: true,
            description: '是否使用回弹效果'
        },
        animating: {
            type: Boolean,
            default: true,
            description: '是否使用动画'
        },
        duration: {
            type: Number,
            default: 250,
            description: '由 scrollTo 触发的动画持续时间 ms'
        },
        scrollingComplete: {
            type: Function,
            default: (() => function() {})(),
            description: '滑动完成后的回调'
        },
        snapComplete: {
            type: Function,
            default: (() => function() {})(),
            description: '选择完成后的回调'
        }
    },
    data() {
        return {
            scroller: null, // Scroller 实例
            container: null,
            content: null,
            showLoading: false, // 显示 加载更多
            refreshState: 0 // 0: pull to refresh, 1: release to refresh, 2: refreshing
        };
    },
    mounted() {
        this.init();
    },
    // 对 keep alive激活组件使用
    activated() {
        this.refresh();
    },
    methods: {
        // 初始化
        init() {
            // 得到需要的 dom
            this.container = this.$refs.container;
            this.content = this.$refs.content;
            // 实例化 Scroller
            this.scroller = new Scroller(this.content, {
                listenScroll: !!this.onScroll, // 是否需要监听滚动事件
                isPullRefresh: !!this.onPullRefresh, // 是否启用下拉刷新事件
                isReachBottom: !!this.onReachBottom, // 是否启用上拉加载事件
                scrollingX: this.scrollingX, // 开启横向滚动
                scrollingY: this.scrollingY, // 开启纵向滚动
                paging: this.paging, // 是否开启分页
                snap: this.snap, // 是否开启像素网格
                snapAlign: this.snapAlign,
                snapSelect: this.snapSelect,
                snapListIndex: this.snapListIndex,
                animating: this.animating, // 使用动画效果
                animationDuration: this.duration,
                bouncing: this.bouncing, // 开启回弹效果
                scrollingComplete: this.scrollingComplete, // 滑动完成后的回调事件
                snapComplete: this.snapComplete // 选择完成后的回调事件 多用于 snap
            });
            // 数据发生变化后更新 dom 性能优化
            // this.$watch('data',(newData,oldData)=>{
            //   //重置加载状态
            //   if(newData.length === 0 ){
            //     this.showLoading = true
            //   }else{
            //     this.refresh()
            //   }
            // },{ deep: true});
            console.log(this.scroller);
            // 根据是否绑定监听函数来判断是否调用
            this.scrollingX && this.getContentWidth();
            !!this.onScroll && this.onScrollHandler();
            !!this.onPullRefresh && this.onPullRefreshHandler();
            !!this.onReachBottom && this.onReachBottomHandler();
        },
        // 数据更新下后 调用刷新
        refresh() {
            if (this.scrollingX) {
                this.getContentWidth();
            } else {
                this.scroller.refresh();
            }
        },
        // 获取横向滚动的数据
        getContentWidth() {
            let timer = setTimeout(() => {
                // 得到宽度
                let widths = 0;
                let contentDoms = this.content.children[1].children;
                Array.from(contentDoms).forEach(item => {
                    // 为获取移动端精度
                    let width = Math.round(item.getBoundingClientRect().width * 100) / 100;
                    widths += width;
                });
                // 对paging 模式添加固定样式
                if (this.paging && this.scrollingX) {
                    this.content.children[1].style.display = 'flex';
                }
                this.content.style.width = Math.ceil(widths) + 'px';
                this.scroller.refresh();
                clearTimeout(timer);
            }, 500);
        },
        // 监听滚动事件处理
        onScrollHandler() {
            if (this.onScroll) {
                this.scroller.on('scroll', e => {
                    this.onScroll(e);
                });
            }
        },
        // 下拉刷新处理
        onPullRefreshHandler() {
            if (this.onPullRefresh) {
                this.scroller.activatePullToRefresh(
                    () => {
                        this.refreshState = 1;
                    },
                    () => {
                        this.refreshState = 0;
                    },
                    () => {
                        this.refreshState = 2;
                        this.onPullRefresh(this.onPullRefreshDone);
                    }
                );
            }
        },
        // 下拉刷新停止
        onPullRefreshDone() {
            this.scroller.finishPullToRefresh();
        },
        // 上拉加载处理
        onReachBottomHandler() {
            if (this.onReachBottom) {
                this.scroller.on('loading', e => {
                    if (e.hasMore) {
                        this.showLoading = true;
                        this.onReachBottom(this.onReachBottomDone);
                    }
                });
            }
        },
        // 下拉刷新停止
        onReachBottomDone() {
            this.showLoading = false;
        },
        // 捕获下层点击事件，立即停止滚动
        onClickCapture() {
            this.stopScroll();
        },
        // 获取属性
        getAttr(key) {
            return this.scroller[key];
        },
        // 设置属性
        setAttr(key, value) {
            this.scroller[key] = value;
        },
        // 滚动到
        scrollTo(x, y, animate) {
            this.scroller.scrollTo(x, y, animate);
        },
        // 滚动到
        publish(x, y, animate) {
            this.scroller.publish(x, y, animate);
        },
        // 停止动画
        stopScroll() {
            this.scroller.stopScroll();
        }
    }
};
</script>
<style>
body {
  scroll-behavior: smooth;
}
.vue-app-scroller__container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow: hidden;
}
.vue-app-scroller__content {
  width: 100%;
}
/* 下拉刷新 */
.vue-app-scroller__content .refresh--content {
  width: 100%;
  height: 100px;
  margin-top: -100px;
  text-align: center;
  font-size: 14px;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vue-app-scroller__content .refresh--content .refresh--content__icons {
  width: 18px;
  height: 18px;
}
.vue-app-scroller__content
  .refresh--content
  .refresh--content__icons
  .icon__arrow {
  width: 16px;
  height: 16px;
  -webkit-transform: translate3d(0, 0, 0) rotate(0deg);
  transform: translate3d(0, 0, 0) rotate(0deg);
  -webkit-transition: -webkit-transform 0.2s linear;
  transition: transform 0.2s linear;
}
.vue-app-scroller__content
  .refresh--content.active
  .refresh--content__icons
  .icon__arrow {
  -webkit-transform: translate3d(0, 0, 0) rotate(180deg);
  transform: translate3d(0, 0, 0) rotate(180deg);
}
.vue-app-scroller__content
  .refresh--content
  .refresh--content__icons
  .icon__spinner {
  width: 18px;
  height: 18px;
}
.vue-app-scroller__content .refresh--content .refresh--content__texts {
  margin-left: 5px;
}
.vue-app-scroller__content
  .refresh--content
  .refresh--content__texts
  .refresh__text {
  color: #69717d;
}

/* 上拉加载 */
.vue-app-scroller__content .loading--content {
  width: 100%;
  height: 40px;
  text-align: center;
  font-size: 14px;
  line-height: 40px;
  color: #aaa;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.vue-app-scroller__content .loading--content .spinner-holder {
  width: 18px;
  height: 18px;
}
.vue-app-scroller__content .loading--content .spinner-holder .icon__spinner {
  width: 18px;
  height: 18px;
  display: block;
}
.vue-app-scroller__content .loading--content .no-data-text {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
</style>
