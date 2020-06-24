
class Animate {
    constructor() {
        this.running = {};
        this.counter = 1;
        this.time = Date.now || function () {
            return Number(new Date());
        };
    }
    animate(callback) {
        let requestFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame;
        requestFrame(callback);
    }
    stop(id) {
        let stop = this.running[id] !== null;
        stop && (this.running[id] = null);
        return stop;
    }
    isRunning(id) {
        return this.running[id] !== null;
    }
    start(stepCb, verifyCb, completedCb, duration, easingMethod) {
        let start = this.time(); // 获取开始时的时间
        let lastFrame = start;
        let percent = 0;
        let dropCounter = 0;
        let id = this.counter++; // 动画Id
        // 压缩运行数据库自动每几个新的动画
        if (id % 20 === 0) {
            let newRunning = {};
            // eslint-disable-next-line guard-for-in
            for (let usedId in this.running) {
                newRunning[usedId] = true;
            }
            this.running = newRunning;
        }
        // 这是每隔几毫秒调用一次的内部步骤方法
        let step = (virtual) => {
            let render = virtual !== true; // 初始化虚拟值
            let now = this.time(); // 获取当前时间
            // 验证在下一个动画步骤之前执行
            if (!this.running[id] || (verifyCb && !verifyCb(id))) {
                this.running[id] = null;
                let renderedSecond = 60 - dropCounter / ((now - start) / 1000);
                if (completedCb) {
                    completedCb(renderedSecond, id, false);
                }
                return;
            }
            // 要应用当前呈现，让我们更新内存中省略的步骤。 这对于及时更新内部状态变量非常重要。
            if (render) {
                let droppedFrames = Math.round((now - lastFrame) / (1000 / 60)) - 1;
                for (let j = 0; j < Math.min(droppedFrames, 4); j++) {
                    step(true);
                    dropCounter++;
                }
            }
            // 计算百分比值
            if (duration) {
                percent = (now - start) / duration;
                if (percent > 1) {
                    percent = 1;
                }
            }
            // 执行步骤回调, then...
            let value = easingMethod ? easingMethod(percent) : percent;
            if ((stepCb(value, now, render) === false || percent === 1) && render) {
                this.running[id] = null;
                let renderedSecond = 60 - dropCounter / ((now - start) / 1000);
                if (completedCb) {
                    completedCb(renderedSecond, id, percent === 1 || duration == null);
                }
            }
            else if (render) {
                lastFrame = now;
                this.animate(step);
            }
        };
            // Mark as running
        this.running[id] = true;
        // 初始化的第一步
        this.animate(step);
        // 返回唯一的动画ID
        return id;
    }
}

export default new Animate();
