const Animate = (global => {
  let time = Date.now || function () {
    return +new Date();
  };
  let desiredFrames = 60;
  let millisecondsPerSecond = 1000;
  let running = {};
  let counter = 1;
  let animate = {
    /**
     * A requestAnimationFrame wrapper / polyfill.
     * param callback {Function} 要在下一次重新绘制之前调用的回调。
     * param root {HTMLElement} 用于重新绘制的根元素
     */
    requestAnimationFrame: (callback) => {
      // 检查请求动画帧支持
      let requestFrame =
        global.requestAnimationFrame ||
        global.webkitRequestAnimationFrame ||
        global.mozRequestAnimationFrame ||
        global.oRequestAnimationFrame;

      // // 判断是否是原生的方法
      // let isNative = !!requestFrame;
      // if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) {
      //   isNative = false;
      // }
      // 如果浏览器支持原生方法之间使用
      // if (isNative) {
        // return function (callback, root) {
          requestFrame(callback)
        // };
      // }

      //  不支持 创建一个
      // let TARGET_FPS = 60;
      // let requests = {};
      // let requestCount = 0;
      // let rafHandle = 1;
      // let intervalHandle = null;
      // let lastActive = +new Date();

      // return function (callback, root) {
      //   let callbackHandle = rafHandle++;
      //   // 存储回调
      //   requests[callbackHandle] = callback;
      //   requestCount++;
      //   // 在第一次请求时创建超时
      //   if (intervalHandle === null) {
      //     intervalHandle = setInterval(function () {
      //       let time = +new Date();
      //       let currentRequests = requests;
      //       // 在执行回调之前重置数据结构
      //       requests = {};
      //       requestCount = 0;
      //       for (let key in currentRequests) {
      //         if (currentRequests.hasOwnProperty(key)) {
      //           currentRequests[key](time);
      //           lastActive = time;
      //         }
      //       }
      //       // 禁用超时时，什么也没有发生 一段时间
      //       if (time - lastActive > 2500) {
      //         clearInterval(intervalHandle);
      //         intervalHandle = null;
      //       }
      //     }, 1000 / TARGET_FPS);
      //   }
      //   return callbackHandle;
      // };
    },
    /**
     * 主动 停止当前动画。
     * id {Integer} 唯一动画 Id
     * return {Boolean} 是否停止动画(也就是说，之前正在运行)
     */
    stop(id) {
      let stop = running[id] != null;
      if (stop) {
        running[id] = null;
      }
      return stop;
    },
    /**
     * 当前是否有动画正在运行
     * id {Integer} 唯一动画 Id
     * return {Boolean} 动画是否仍在运行
     */
    isRunning(id) {
      return running[id] != null;
    },
    /**
     * 启动动画。
     * param stepCb {Function} 指向每一步执行的函数的指针。 方法的签名应该是 `function(percent, now, virtual) { return continueWithAnimation; }`
     * param verifyCb {Function} 在每个动画步骤之前执行。 方法的签名应该是 `function() { return continueWithAnimation; }`
     * param completedCb {Function} 方法的签名应该是 `function(droppedFrames, finishedAnimation) {}`
     * param duration {Integer} 毫秒来运行动画
     * param easingMethod {Function} 缓动函数指针 方法的签名应该是 `function(percent) { return modifiedValue; }`
     * param root {Element ? document.body} 渲染根目录(如果可用)。用于内部 使用requestAnimationFrame。
     * return {Integer} 标识符的动画。可以随时用来阻止它。
     */
    start(stepCb, verifyCb, completedCb, duration, easingMethod) {
      let start = time();  // 获取开始时的时间
      let lastFrame = start;
      let percent = 0;
      let dropCounter = 0;
      let id = counter++;  // 动画Id
      // 压缩运行数据库自动每几个新的动画
      if (id % 20 === 0) {
        let newRunning = {};
        for (let usedId in running) {
          newRunning[usedId] = true;
        }
        running = newRunning;
      }
      // 这是每隔几毫秒调用一次的内部步骤方法
      let step = (virtual) => {
        // console.log(id)
        // 初始化虚拟值
        let render = virtual !== true;
        // 获取当前时间
        let now = time();
        // 验证在下一个动画步骤之前执行
        if (!running[id] || (verifyCb && !verifyCb(id))) {
          running[id] = null;
          let renderedFramesPerSecond = 60 - (dropCounter / ((now - start) / 1000))
          completedCb && completedCb(renderedFramesPerSecond, id, false);
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
          running[id] = null;
          let renderedFramesPerSecond = 60 - (dropCounter / ((now - start) / 1000))
          completedCb && completedCb(renderedFramesPerSecond, id, percent === 1 || duration == null);
        } else if (render) {
          lastFrame = now;
          animate.requestAnimationFrame(step);
        }
      };
      // Mark as running
      running[id] = true;
      // 初始化的第一步
      animate.requestAnimationFrame(step);
      // 返回唯一的动画ID
      return id;
    }
  }
  return animate;
})(window);

export default Animate
