import Attributes from './Attributes';
import Animate from './Animate';
import { easeOut, easeInOut } from './utils';

class Render extends Attributes {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }

    renderTransform(x, y) {
        // this.content.style.transform = 'translate3d(' + (-x) + 'px,' + (-y) + 'px,0)';
        this.content.style.transform = 'translate(' + (-x) + 'px,' + (-y) + 'px)';

    }
    stopScroll() {
        // 重置中断动画标志
        this.interrupted = true;
        // 当减速停止时候停止动画
        if (this.isDecelerating) {
            Animate.stop(this.isDecelerating);
            this.isDecelerating = false;
            this.interrupted = true;
        }
        // 当动画正在运行时候停止动画
        if (this.isAnimating) {
            Animate.stop(this.isAnimating);
            this.isAnimating = false;
            this.interrupted = true;
        }
        // 复位减速完成标志
        this.completeDeceleration = false;
        // 清除数据结构
        this.touchRecord.length = 0;
    }
    publish(x, y, animate) {
        // 记住我们是否有动画，然后我们尝试基于动画的当前“驱动器”继续
        // 当前主要服务于 snap
        let wasAnimating = this.isAnimating;
        if (wasAnimating) {
            Animate.stop(wasAnimating);
            this.isAnimating = false;
            this.interrupted = true;
        }

        if (animate && this.ops.animating) {
            // 为scrollBy/zoomBy功能保留预定位置
            this.scheduledX = x;
            this.scheduledY = y;
            let oldX = this.scrollX;
            let oldY = this.scrollY;
            let diffX = x - oldX;
            let diffY = y - oldY;
            let step = (percent, now, render) => {
                if (render) {
                    this.scrollX = oldX + diffX * percent;
                    this.scrollY = oldY + diffY * percent;
                    // 将值返回
                    this.renderTransform(this.scrollX, this.scrollY);
                }
            };
            let verify = id => this.isAnimating === id;
            let completed = (renderedFramesPerSecond, animationId, wasFinished) => {
                if (animationId === this.isAnimating) {
                    this.isAnimating = false;
                }
                if (this.completeDeceleration || wasFinished) {
                    this.scrollingComplete();
                    this.snapComplete();
                }
            };
            // 当继续基于之前的动画时，我们选择一个ease-out动画而不是ease-in-out
            let animatType = wasAnimating ? easeOut : easeInOut;
            this.isAnimating = Animate.start(
                step,
                verify,
                completed,
                this.ops.animationDuration,
                animatType
            );
        } else {
            this.scheduledX = this.scrollX = x;
            this.scheduledY = this.scrollY = y;
            // 将值返回
            this.renderTransform(x, y);
        }
        // 节流 是否需要监听触底事件
        if (this.ops.isReachBottom && !this.reachActive) {
            let scrollYn = Number(this.scrollY.toFixed());
            let absMaxScrollYn = this.maxScrollY - this.loadingH;
            if (scrollYn > absMaxScrollYn && absMaxScrollYn > 0) {
                this.emit('loading', {
                    hasMore: true
                });
                this.reachActive = true;
            }
        }
        // 是否需要监听滚动事件
        if (this.ops.listenScroll) {
            // 节流 只判断整数变化
            let isChangeX = this.prevScrollX.toFixed() !== this.scrollX.toFixed();
            let isChangeY = this.prevScrollY.toFixed() !== this.scrollY.toFixed();
            if (isChangeX || isChangeY) {
                this.emit('scroll', {
                    x: Math.floor(this.scrollX),
                    y: Math.floor(this.scrollY)
                });
            }
        }
    }
    scrollTo(left, top, animate) {
        let x = left;
        let y = top;
        let isAnimate = animate;
        // 停止减速
        if (this.isDecelerating) {
            Animate.stop(this.isDecelerating);
            this.isDecelerating = false;
        }
        if (!this.ops.scrollingX) {
            x = this.scrollX;
        } else {
            if (this.ops.paging) {
                x = Math.round(x / this.containerWidth) * this.contentWidth;
            } else if (this.ops.snap) {
                x = Math.round(x / this.snapW) * this.snapW;
            }
        }
        if (!this.ops.scrollingY) {
            y = this.scrollY;
        } else {
            if (this.ops.paging) {
                y = Math.round(y / this.contentHeight) * this.containerWidth;
            } else if (this.ops.snap) {
                y = Math.round(y / this.snapH) * this.snapH;
            }
        }
        // 容许范围极限
        x = Math.max(Math.min(this.maxScrollX, x), 0);
        y = Math.max(Math.min(this.maxScrollY, y), 0);
        // 当没有检测到更改时，不要动画，仍然调用publish以确保呈现的位置与内部数据是同步的
        if (x === this.scrollX && y === this.scrollY) {
            isAnimate = false;
        }
        // 发布新值
        if (!this.isTracking) {
            this.publish(x, y, isAnimate);
        }
    }
}

export default Render;
