import Render from './Render';
import Animate from './Animate';

class Deceleration extends Render {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }
    hasDeceleration() {
        let status = false;
        let recordLength = this.touchRecord.length - 1;
        let endIndex = recordLength;
        let startIndex = endIndex;
        let movedX = 0;
        let movedY = 0;
        let timeOffset = 0;

        if (recordLength <= 10) {
            startIndex = 0;
        } else {
            for (let i = recordLength; i > 0 && this.touchRecord[i].t > (this.moveTouchT - 100); i -= 1) {
                startIndex = i;
            }
        }
        timeOffset = this.touchRecord[endIndex].t - this.touchRecord[startIndex].t;
        movedX = this.touchRecord[endIndex].x - this.touchRecord[startIndex].x;
        movedY = this.touchRecord[endIndex].y - this.touchRecord[startIndex].y;
        this.velocityX = (movedX / timeOffset) * (1000 / 60);
        this.velocityY = (movedY / timeOffset) * (1000 / 60);

        status = true;

        return status;
    }
    startDeceleration() {
        // 是否分屏
        if (this.ops.paging) {
            let scrollX = Math.max(Math.min(this.scrollX, this.maxScrollX), 0);
            let scrollY = Math.max(Math.min(this.scrollY, this.maxScrollY), 0);
            // 我们不是将减速限制在允许范围的最小/最大值，而是将减速限制在可见客户机区域的大小。每个页面都应该有准确的客户区域大小。
            this.minDecelerationX = Math.floor(scrollX / this.containerWidth) * this.containerWidth;
            this.minDecelerationY = Math.floor(scrollY / this.containerHeight) * this.containerHeight;
            this.maxDecelerationX = Math.ceil(scrollX / this.containerWidth) * this.containerWidth;
            this.maxDecelerationY = Math.ceil(scrollY / this.containerHeight) * this.containerHeight;
        } else {
            this.minDecelerationX = 0;
            this.minDecelerationY = 0;
            this.maxDecelerationX = this.maxScrollX;
            this.maxDecelerationY = this.maxScrollY;
        }
        // 包装类方法
        let step = (percent, now, render) => {
            this.stepThroughDeceleration(render);
        };
            // 保持减速运行需要多少速度
        let minKeepVelocity = this.ops.snap ? 2 : 0.001;
        // 检测是否仍然值得继续动画步骤 如果我们已经慢到无法再被用户感知，我们就会在这里停止整个过程。
        let verify = () => {
            let absX = Math.abs(this.velocityX) >= minKeepVelocity;
            let absY = Math.abs(this.velocityY) >= minKeepVelocity;
            let shouldContinue = absX || absY;
            if (!shouldContinue) {
                this.completeDeceleration = true;
            }
            return shouldContinue;
        };
            //
        let completed = (renderedFramesPerSecond, animationId, wasFinished) => {
            this.isDecelerating = 0;
            if (this.completeDeceleration) {
                this.ops.scrollingComplete();
            }
            // 动画网格时，捕捉是活跃的，否则只是固定边界外的位置
            this.scrollTo(this.scrollX, this.scrollY, this.ops.snap);
        };
            // 启动动画并打开标志
        this.isDecelerating = Animate.start(step, verify, completed);
    }
    stepThroughDeceleration(render) {
        let frictionFactor = 0.97;
        // 计算下一个滚动位置 增加减速到滚动位置
        let scrollX = this.scrollX + this.velocityX;
        let scrollY = this.scrollY + this.velocityY;
        // 硬性限制滚动位置为非弹跳模式
        if (!this.ops.bouncing) {
            let minScrollXFixed = Math.min(this.maxDecelerationX, scrollX);
            let scrollXFixed = Math.max(minScrollXFixed, this.minDecelerationX);
            if (scrollXFixed !== scrollX) {
                scrollX = scrollXFixed;
                this.velocityX = 0;
            }
            let minScrollYFixed = Math.min(this.minDecelerationY, scrollY);
            let scrollYFixed = Math.max(minScrollYFixed, this.minDecelerationY);
            if (scrollYFixed !== scrollY) {
                scrollY = scrollYFixed;
                this.velocityY = 0;
            }
        }
        // 记录上一个滚动位置
        this.prevScrollX = this.scrollX;
        this.prevScrollY = this.scrollY;
        // 更新滚动位置
        if (render) {
            this.publish(scrollX, scrollY);
        } else {
            this.scrollX = scrollX;
            this.scrollY = scrollY;
        }
        // 在每次迭代中减慢速度 模拟自然行为
        if (!this.ops.paging) {
            this.velocityX *= frictionFactor;
            this.velocityY *= frictionFactor;
        }
        // 跳跃的支持
        if (this.ops.bouncing) {
            let scrollOutsideX = 0;
            let scrollOutsideY = 0;
            // 这配置了到达边界时应用于减速/加速的更改量
            let peneDece = this.penetrationDeceleration;
            let peneAcce = this.penetrationAcceleration;
            // 检查限制
            if (scrollX < this.minDecelerationX) {
                scrollOutsideX = this.minDecelerationX - scrollX;
            } else if (scrollX > this.maxDecelerationX) {
                scrollOutsideX = this.maxDecelerationX - scrollX;
            }
            if (scrollY < this.minDecelerationY) {
                scrollOutsideY = this.minDecelerationY - scrollY;
            } else if (scrollY > this.maxDecelerationY) {
                scrollOutsideY = this.maxDecelerationY - scrollY;
            }
            // 慢下来，直到足够慢，然后翻转回弹起位置
            if (scrollOutsideX !== 0) {
                if (scrollOutsideX * this.velocityX <= 0) {
                    this.velocityX += scrollOutsideX * peneDece;
                } else {
                    this.velocityX = scrollOutsideX * peneAcce;
                }
            }
            if (scrollOutsideY !== 0) {
                if (scrollOutsideY * this.velocityY <= 0) {
                    this.velocityY += scrollOutsideY * peneDece;
                } else {
                    this.velocityY = scrollOutsideY * peneAcce;
                }
            }
        }
    }
}
export default Deceleration;
