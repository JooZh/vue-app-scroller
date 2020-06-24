
import Deceleration from './Deceleration';
import { isTouch } from './utils';

class TouchHandle extends Deceleration {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }
    doTouchStart(touches, timeStamp) {
        isTouch(timeStamp, touches);
        this.isTracking = true;
        // 执行停止动画
        this.stopScroll();
        this.startTouchX = touches[0].pageX;
        this.startTouchY = touches[0].pageY;
        this.startTouchT = timeStamp;
        this.moveTouchX = touches[0].pageX;
        this.moveTouchY = touches[0].pageY;
        this.moveTouchT = timeStamp;
        this.touchRecord.push({
            x: this.scrollX,
            y: this.scrollY,
            t: timeStamp
        });
    }
    doTouchMove(touches, timeStamp) {
        isTouch(timeStamp, touches);
        if (!this.isTracking) { return }
        let currentTouchX = touches[0].pageX;
        let currentTouchY = touches[0].pageY;
        let moveX = currentTouchX - this.moveTouchX;
        let moveY = currentTouchY - this.moveTouchY;

        if (this.enableScrollX) { this.doTouchMoveScroll(moveX, 'X') }
        if (this.enableScrollY) { this.doTouchMoveScroll(moveY, 'Y') }

        if (this.touchRecord.length > 100) {
            this.touchRecord.splice(0, 20);
        }

        this.publish(this.scrollX, this.scrollY);
        // 跟踪滚动的运动
        this.touchRecord.push({
            x: this.scrollX,
            y: this.scrollY,
            t: timeStamp
        });
        this.moveTouchX = currentTouchX;
        this.moveTouchY = currentTouchY;
        this.moveTouchT = timeStamp;
    }
    doTouchEnd(timeStamp) {
        isTouch(timeStamp);
        if (!this.isTracking) { return }
        this.endTouchX = this.moveTouchX;
        this.endTouchY = this.moveTouchY;
        this.endTouchT = timeStamp;
        this.touchRecord.push({
            x: this.scrollX,
            y: this.scrollY,
            t: timeStamp
        });
        this.isTracking = false;
        // if (this.isDragging) {
        // console.log("this._isDragging");
        // 重置拖拽标志
        this.isDragging = false;
        // 计算减速速度
        this.hasDeceleration();

        // 判断是否拉到了边界
        let inScrollX = this.scrollX < 0 || this.scrollX > this.maxScrollX;
        let inScrollY = this.scrollY < 0 || this.scrollY > this.maxScrollY;

        if (this.ops.animating && (inScrollX || inScrollY)) {
            // console.log("回弹");
            // 启动回弹减速
            // this._stopScroll();
            // this._scrollTo(this.scrollX, this.scrollY, true);
            // this._getScrollToValues();
            if (this.enableScrollY) {
                if (this.startTouchY - this.moveTouchY > 0) {
                    this.velocityY = -5;
                } else if (this.startTouchY - this.moveTouchY < 0) {
                    this.velocityY = 5;
                } else {
                    this.velocityY = 0;
                }
                // console.log(this._velocityY);
            }
            this.startDeceleration();
        } else {
            this.startDeceleration();
        }
        // 开始减速 验证最后一次检测到的移动是否在某个相关的时间范围内
        //   if (this.ops.animating && timeStamp - this._moveTouchT <= 100) {
        //     let isDeceleration = this._prevScrollX();
        //     // 开始减速 当没有下拉刷新状态
        //     if (isDeceleration) {
        //       if (!this._refreshActive) {
        //         this._startDeceleration();
        //       }
        //     } else {
        //       this._scrollingComplete();
        //     }
        //   }
        // }
        // 如果这是一个较慢的移动，它是默认不减速，但这个仍然意味着我们想要回到这里的边界。为了提高边缘盒的稳定性，将其置于上述条件之外
        // 例如，touchend在没有启用拖放的情况下被触发。这通常不应该修改了滚动条的位置，甚至显示了滚动条。

        // if (!this._isDecelerating) {
        //   console.log("!this._isDecelerating");
        //   // 如果有下拉刷新事件时
        //   if (this._refreshActive && this._refreshStartCb) {
        //     console.log(1);
        //     // 使用publish而不是scrollTo来允许滚动到超出边界位置
        //     // 我们不需要在这里对scrollLeft、zoomLevel等进行规范化，因为我们只在启用了滚动刷新时进行y滚动
        //     this._publish(this.scrollX, -this._refreshH, true);
        //     if (this._refreshStartCb) {
        //       this._refreshStartCb();
        //     }
        //   } else {
        //     if (this._interrupted || this._isDragging) {
        //       console.log(2);
        //       this._scrollingComplete();
        //     }
        //     if (timeStamp - this._lastTouchT > 300) {
        //       console.log(3);
        //       this._scrollTo(this.scrollX, this.scrollY, true);
        //       this._getScrollToValues();
        //     } else {
        //       console.log(4);
        //       if (this.enableScrollY) {
        //         if (this._startTouchY - this._moveTouchY > 0) {
        //           this._velocityY = -20;
        //         } else if (this._startTouchY - this._moveTouchY < 0) {
        //           this._velocityY = 20;
        //         } else {
        //           this._velocityY = 0;
        //         }
        //       }
        //       this._startDeceleration();
        //     }
        //     // 在刷新时不做任何操作
        //     if (this._refreshActive) {
        //       console.log(5);
        //       this._refreshActive = false;
        //       if (this._refreshCancelCb) {
        //         this._refreshCancelCb();
        //       }
        //     }
        //   }
        // }
        // 清空记录列表
        this.touchRecord.length = 0;
    }
    doTouchMoveScroll(move, type) {
        let scroll = 'scroll' + type;
        let maxScroll = 'maxScroll' + type;
        this[scroll] -= move * this.ops.speedRatio;
        if (this[scroll] > this[maxScroll] || this[scroll] < 0) {
            if (this.ops.bouncing) {
                this[scroll] += (move / 1.2) * this.ops.speedRatio;
                if (type === 'Y' && !!this.ops.onPullRefresh) {
                    this.emit('pullRefresh');
                }
            }
            else if (this[scroll] < 0) {
                this[scroll] = 0;
            }
            else {
                this[scroll] = this[maxScroll];
            }
        }
    }
}
export default TouchHandle;
