import { noop } from './utils';

class Attributes {
    constructor() {
        this.handles = {
            scroll: [],
            touchEnd: []
        };
        this.touchRecord = [];
        this.content = null;
        this.container = null;
        this.isTracking = false;
        this.isDragging = false; // 用户移动的距离是否已达到启用拖动模式的程度。 提示:只有在移动了一些像素后，才可以不被点击等打断。
        this.isDecelerating = 0; // 是否正在减速中
        this.isAnimating = false;
        this.interrupted = true;
        this.minScrollX = 0;
        this.minScrollY = 0;
        this.maxScrollX = 0;
        this.maxScrollY = 0;
        this.contentWidth = 0; // 滚动内容宽度
        this.contentHeight = 0; // 滚动内容高度
        this.containerWidth = 0; // 可视容器宽度
        this.containerHeight = 0; // 可视容器高度
        this.refreshHeight = 0;
        this.startTouchX = 0;
        this.startTouchY = 0;
        this.startTouchT = 0;
        this.moveTouchX = 0;
        this.moveTouchY = 0;
        this.moveTouchT = 0;
        this.endTouchX = 0;
        this.endTouchY = 0;
        this.endTouchT = 0;
        this.scrollX = 0; // 当前在x轴上的滚动位置
        this.scrollY = 0; // 当前在y轴上的滚动位置
        this.prevScrollX = 0; // 上一个横向滚动位置
        this.prevScrollY = 0; // 上一个纵向滚动位置
        this.velocityX = 0;
        this.velocityY = 0;
        this.velocityMin = 1; // 开始减速需要多少速度
        this.minDecelerationX = 0; // 最小减速时X滚动位置
        this.minDecelerationY = 0; // 最小减速时Y滚动位置
        this.maxDecelerationX = 0; // 最大减速时X滚动位置
        this.maxDecelerationY = 0; // 最大减速时Y滚动位置
        this.completeDeceleration = false;
        this.penetrationDeceleration = 0.03;
        this.penetrationAcceleration = 0.08;
        this.enableScrollX = false;
        this.enableScrollY = false;
        this.refreshStartCb = null; // 执行回调以启动实际刷新
        this.refreshCancelCb = null; // 在停用时执行的回调。这是为了通知用户刷新被取消
        this.refreshActiveCb = null; // 回调函数，以在激活时执行。这是为了在用户释放时通知他即将发生刷新

        this.ops = {
            snap: false,
            paging: false,                  // 启用分页模式(在全容器内容窗格之间切换)
            scrollingX: false,              // 启用x轴滚动
            scrollingY: false,              // 启用y轴滚动
            animating: false,               // 启用动画减速，弹回，缩放和滚动
            animationDuration: 250,         // 由scrollTo/zoomTo触发的动画持续时间
            mousewheel: false,              // 是否启用鼠标滚轮事件
            snapAlign: 'middle',            // snapAlign使用的方式 [top, middle] 居中对齐和顶部对齐
            snapSelect: 0,                  // snap默认选中的值
            snapListIndex: 0,               // snap多列的时候的当前列
            bouncing: true,                 // 启用弹跳(内容可以慢慢移到外面，释放后再弹回来)
            speedRatio: 1,                  // 增加或减少滚动速度
            onScroll: false,                // 是否启用滚动监听实时获取滚动位置
            onPullRefresh: false,           // 是否监听下拉刷新
            onReachBottom: false,           // 是否监听触底事件
            scrollingComplete: noop,        // 在触摸端或减速端后端触发的回调，前提是另一个滚动动作尚未开始。用于知道何时淡出滚动条
            snapComplete: noop              // snap 滑动完成后的执行事件
        };
    }
    on(event, handle) {
        if (!this.handles.hasOwnProperty(event)) {
            this.handles[event] = [];
        }
        this.handles[event].push(handle);
    }
    emit(event, ...args) {
        if (this.handles.hasOwnProperty(event)) {
            this.handles[event].forEach((item) => {
                item.apply(null, args);
            });
        }
        else {
            throw new Error(`"${event}" Event not registered`);
        }
    }
    mergeOps(options) {
        Object.assign(this.ops, options);
    }
}

export default Attributes;

