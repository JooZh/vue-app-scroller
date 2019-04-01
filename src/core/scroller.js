import Animate from './animate.js'
import Render from './render.js'

class Scroller {
  constructor(renderDom, options) {
    this.NOOP = function () {};
    // 合并参数
    this.options = {
      listenScroll: false, // 是否启用滚动监听实时获取滚动位置
      isPullRefresh:false,  // 是否监听下拉刷新
      isReachBottom:false,  // 是否监听触底事件
      scrollingX: false, //启用x轴滚动
      scrollingY: false, //启用y轴滚动
      animating: true, // 启用动画减速，弹回，缩放和滚动
      animationDuration: 250, // 由scrollTo/zoomTo触发的动画持续时间
      mousewheel:false,   // 是否启用鼠标滚轮事件
			paging: false, //启用分页模式(在全页内容窗格之间切换)
			snapping: false, // 启用对已配置像素网格的内容进行快照
      bouncing: true, // 启用弹跳(内容可以慢慢移到外面，释放后再弹回来)
      speedMultiplier: 1.5, // 增加或减少滚动速度
      scrollingComplete: this.NOOP, // 在触摸端或减速端后端触发的回调，前提是另一个滚动动作尚未开始。用于知道何时淡出滚动条
      penetrationDeceleration: 0.03, // 这配置了到达边界时应用于减速的更改量
      penetrationAcceleration: 0.08 // 这配置了到达边界时施加于加速度的变化量
    };
    // 参数合并
    for (let key in options) {
      this.options[key] = options[key];
    }
    // 当前的滚动容器信息
    this.container = renderDom.parentNode // 滚动容器的父容器
    this.content = renderDom
    this.render = Render(this.content) // 渲染函数
    this.animate = Animate; // 动画库                  
    this.handles = { scroll:[]}         // 自定义事件 用 on 监听，用 emit 发送
    // 状态 {Boolean}
    this.isSingleTouch = false //是否只有一根手指用于触摸操作
    this.isTracking = false //触摸事件序列是否正在进行中
    this.completeDeceleration = false //是否完成减速动画
    this.isDragging = false //用户移动的距离是否已达到启用拖动模式的程度。 提示:只有在移动了一些像素后，才可以不被点击等打断。
    this.isDecelerating = false //不再触摸和拖动，并使用减速平稳地动画触摸序列。
    this.isAnimating = false //平滑地动画当前配置的更改
    this.enableScrollX = false   // 是否开启横向滚动
    this.enableScrollY = false   // 是否开启纵向向滚动

    this.refreshActive = false //现在释放事件时是否启用刷新进程
    this.reachBottomActive = false //是否已经发送了触底事件
    // this.reachBottomStatus = false // 是否还有下拉刷新的数据

    //  {Function} 
    this.refreshStartCallBack = null        //执行回调以启动实际刷新
    this.refreshDeactivateCallBack = null   //在停用时执行的回调。这是为了通知用户刷新被取消
    this.refreshActivateCallBack = null     //回调函数，以在激活时执行。这是为了在用户释放时通知他即将发生刷新
    // {Number}
    this.scrollX = 0 //在x轴上的滚动位置
    this.scrollY = 0 //在y轴上的滚动位置
    this.prevScrollX = 0 // 上一个横向滚动位置
    this.prevScrollY = 0 // 上一个纵向滚动位置
    this.scheduledX = 0 //预定左侧位置(动画时的最终位置)
    this.scheduledY = 0 // 预定的顶部位置(动画时的最终位置)
    this.lastTouchX = 0 //开始时手指的左侧位置
    this.lastTouchY = 0 //开始时手指的顶部位置
    this.decelerationVelocityX = 0 //当前因素修改水平滚动的位置与每一步
    this.decelerationVelocityY = 0 //当前因素修改垂直滚动位置与每一步
    this.maxScrollX = 0 //x轴上最大允许滚动位置 
    this.maxScrollY = 0 // y轴上最大允许滚动位置 
    this.refreshHeight = 0 // 要分配给刷新区域的高度
    this.loadingHeight = 0 // 要分配给上拉加载区域的高度
    this.contentHeight = 0 //内容外高度
    this.contentWidth = 0 // 内容外宽度
    this.containerHeight = 0 //可用外高度
    this.containerWidth = 0 //可用外宽度
    this.snapWidth = 50   //内容的对齐宽度
    this.snapHeight = 50 // 内容的对齐高度
    
    this.minDecelerationScrollX = 0 //最小减速时X滚动位置
    this.minDecelerationScrollY = 0 //最小减速时Y滚动位置
    this.maxDecelerationScrollX = 0 //最大减速时X滚动位置
    this.maxDecelerationScrollY = 0 //最大减速时Y滚动位置
    // {Date} 
    this.lastTouchMoveTime = null //手指最后移动的时间戳。用于限制减速速度的跟踪范围。
    // {Array} List 
    this.positionsArray = null //位置列表，每个状态使用三个索引=左、上、时间戳
    // 事件监听
    this.initEventListener(this.container);
  }
  // 0(效果开始)到1(效果结束)之间的位置
  easeOutCubic(pos) {
    return (Math.pow((pos - 1), 3) + 1);
  }
  // 0(效果开始)到1(效果结束)之间的位置
  easeInOutCubic(pos) {
    if ((pos /= 0.5) < 1) {
      return 0.5 * Math.pow(pos, 3);
    }
    return 0.5 * (Math.pow((pos - 2), 3) + 2);
  }
  /*---------------------------------------------------------------------------
  * 初始化事件监听
  --------------------------------------------------------------------------- */
  initEventListener(element) {
    let mousedown = false
    // 触摸开始事件
    element.addEventListener('touchstart', e => {
      if (!e.target.tagName.match(/input|textarea|select/i)) {
        this.doTouchStart(e.touches, e.timeStamp)
      }
    })
    // 触摸移动事件
    element.addEventListener('touchmove', e => {
      e.preventDefault()
      this.doTouchMove(e.touches, e.timeStamp)
    })
    // 触摸结束事件
    element.addEventListener('touchend', e => {
      this.doTouchEnd(e.timeStamp)
    })
    // 鼠标点击事件
    element.addEventListener('mousedown', e => {
      if (!e.target.tagName.match(/input|textarea|select/i)) {
        this.doTouchStart([{
          pageX: e.pageX,
          pageY: e.pageY
        }], e.timeStamp)
        mousedown = true
      }
    })
    // 鼠标移动事件
    element.addEventListener('mousemove', e => {
      if (mousedown) {
        this.doTouchMove([{
          pageX: e.pageX,
          pageY: e.pageY
        }], e.timeStamp)
        mousedown = true
      }
    })
    // 鼠标离开事件
    element.addEventListener('mouseup', e => {
      if (mousedown) {
        this.doTouchEnd(e.timeStamp)
        mousedown = false
      }
    })
    // 鼠标滚动事件
    if(this.options.mousewheel){
      element.addEventListener('mousewheel', e => {
        this.scrollY = this.scrollY += e.deltaY
        if(this.scrollY>this.maxScrollY){
          this.scrollY = this.maxScrollY
        }
        if(this.scrollY < 0){
          this.scrollY = 0
        }
        this._publish(this.scrollX, this.scrollY, true);
      })
    }
  }
  /*---------------------------------------------------------------------------
  * 事件监听操作
  --------------------------------------------------------------------------- */
  // 触摸开始的时候，如果有动画正在运行，或者正在减速的时候都需要停止当前动画
  doTouchStart(touches, timeStamp) {
    // 检测是否是触摸事件
    if (touches.length == null) {
      throw new Error("Invalid touch list: " + touches);
    }
    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== "number") {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }
    // 重置中断动画标志
    this._interruptedAnimation = true;
    // 当减速停止时候停止动画
    if (this.isDecelerating) {
      this.animate.stop(this.isDecelerating);
      this.isDecelerating = false;
      this._interruptedAnimation = true;
    }
    // 当动画正在运行时候停止动画
    if (this.isAnimating) {
      this.animate.stop(this.isAnimating);
      this.isAnimating = false;
      this._interruptedAnimation = true;
    }
    // 当处理两个手指时使用中心点
    let currentTouchX = 0;
    let currentTouchY = 0;
    let isSingleTouch = touches.length === 1;
    if (isSingleTouch) {
      currentTouchX = touches[0].pageX;
      currentTouchY = touches[0].pageY;
    } else {
      currentTouchX = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
      currentTouchY = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
    }
    // 存储初始触摸位置
    this.lastTouchX = currentTouchX;
    this.lastTouchY = currentTouchY;
    // 存储初始移动时间戳
    this.lastTouchMoveTime = timeStamp;
    // 重置锁定标志
    this.enableScrollX = !isSingleTouch && this.options.scrollingX;
    this.enableScrollY = !isSingleTouch && this.options.scrollingY;
    // 重置跟踪标记
    this.isTracking = true;
    // 复位减速完成标志
    this.completeDeceleration = false;
    // 拖动直接从两个手指开始，否则将使用偏移量延迟
    this.isDragging = !isSingleTouch;
    // 一些功能在多触摸场景中是禁用的
    this.isSingleTouch = isSingleTouch;
    // 清除数据结构
    this.positionsArray = [];
  }
  // 触摸滑动的时候，
  doTouchMove(touches, timeStamp) {
    // 检测是否是触摸事件
    if (touches.length == null) {
      throw new Error("Invalid touch list: " + touches);
    }
    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== "number") {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }
    // 不启用跟踪时忽略事件(事件可能在元素外部)
    if (!this.isTracking) {
      return;
    }
    let currentTouchX = 0;
    let currentTouchY = 0;
    // 计算基于手指中心的移动
    if (touches.length === 2) {
      currentTouchX = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
      currentTouchY = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
    } else {
      currentTouchX = touches[0].pageX;
      currentTouchY = touches[0].pageY;
    }
    // 是否已经进入了拖拽模式
    if (this.isDragging) {
      // 计算移动的距离
      let moveX = currentTouchX - this.lastTouchX;
      let moveY = currentTouchY - this.lastTouchY;

      // 是否开启了横向滚动
      if (this.enableScrollX) {
        this.scrollX -= moveX * this.options.speedMultiplier;
        if (this.scrollX > this.maxScrollX || this.scrollX < 0) {
          // 在边缘放慢速度
          if (this.options.bouncing) {
            this.scrollX += (moveX / 2 * this.options.speedMultiplier);
          } else if (this.scrollX > this.maxScrollX) {
            this.scrollX = this.maxScrollX;
          } else {
            this.scrollX = 0;
          }
        }
      }
      // 是否开启了纵向滚动
      if (this.enableScrollY) {
        this.scrollY -= moveY * this.options.speedMultiplier;
        if (this.scrollY > this.maxScrollX || this.scrollY < 0) {
          // 在边缘放慢速度
          if (this.options.bouncing) {
            this.scrollY += (moveY / 2 * this.options.speedMultiplier);
            // 支持下拉刷新(仅当只有y可滚动时)
            if (!this.enableScrollX && this.refreshHeight != null) {
              if (!this.refreshActive && this.scrollY <= -this.refreshHeight) {
                this.refreshActive = true;
                if (this.refreshActivateCallBack) {
                  this.refreshActivateCallBack();
                }
              } else if (this.refreshActive && this.scrollY > -this.refreshHeight) {
                this.refreshActive = false;
                if (this.refreshDeactivateCallBack) {
                  this.refreshDeactivateCallBack();
                }
              }
            }
          } else if (this.scrollY > this.maxScrollX) {
            this.scrollY = this.maxScrollX;
          } else {
            this.scrollY = 0;
          }
        }
      }
      // 防止列表无限增长(保持最小10，最大20测量点)
      if (this.positionsArray.length > 60) {
        this.positionsArray.splice(0, 30);
      }
      // 跟踪滚动的运动
      this.positionsArray.push(this.scrollX, this.scrollY, timeStamp);
      // 同步滚动位置
      this._publish(this.scrollX, this.scrollY);
      // 否则，看看我们现在是否切换到拖拽模式。
    } else {
      let minTrackingForScroll = 0;  // 最小滚动距离
      let minTrackingForDrag = 5;    // 最小拖拽距离

      let distanceX = Math.abs(currentTouchX - this.lastTouchX);  // 横向滑动距离绝对值
      let distanceY = Math.abs(currentTouchY - this.lastTouchY);  // 纵向滑动距离绝对值
      // 根据滑动距离 是否大于等于最小滚动距离来开启滚动方向
      this.enableScrollX = this.options.scrollingX && distanceX >= minTrackingForScroll;
      this.enableScrollY = this.options.scrollingY && distanceY >= minTrackingForScroll;
      // 放入位置列表
      this.positionsArray.push(this.scrollX, this.scrollY, timeStamp);
      // 当开启了任意一方向的滚动和有一定的触摸滑动距离后开启拖拽模式
      let isEnableScroll = this.enableScrollX || this.enableScrollY;
      let isDistance = distanceX >= minTrackingForDrag || distanceY >= minTrackingForDrag;
      this.isDragging = isEnableScroll && isDistance
      // 如果进入拖拽模式解除动画中断标志
      if (this.isDragging) {
        this._interruptedAnimation = false;
      }
    }
    // 为下一个事件更新上次触摸的位置和时间戳
    this.lastTouchX = currentTouchX;
    this.lastTouchY = currentTouchY;
    this.lastTouchMoveTime = timeStamp;
  }
  // 触摸事件结束
  doTouchEnd(timeStamp) {
    // 触摸事件结束传入结束时间
    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== "number") {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }
    // 未启用跟踪时忽略事件(元素上没有touchstart事件)
    // 这是必需的，因为这个监听器(“touchmove”)位于文档上，而不是它所在的元素上。
    if (!this.isTracking) {
      return;
    }
    // 不再触摸(当两根手指触碰屏幕时，有两个触摸结束事件)
    this.isTracking = false;
    // 现在一定要重置拖拽标志。这里我们也检测是否手指移动得足够快，可以切换到减速动画。
    if (this.isDragging) {
      // 重置拖拽标志
      this.isDragging = false;
      // 开始减速 验证最后一次检测到的移动是否在某个相关的时间范围内
      if (this.isSingleTouch && this.options.animating && (timeStamp - this.lastTouchMoveTime) <= 100) {
        // 然后计算出100毫秒前滚动条的位置
        let endPos = this.positionsArray.length - 1;
        let startPos = endPos;
        // 将指针移动到100ms前测量的位置
        for (let i = endPos; i > 0 && this.positionsArray[i] > (this.lastTouchMoveTime - 100); i -= 3) {
          startPos = i;
        }
        // 如果开始和停止位置在100ms时间内相同，我们无法计算任何有用的减速。
        if (startPos !== endPos) {
          // 计算这两点之间的相对运动
          let timeOffset = this.positionsArray[endPos] - this.positionsArray[startPos];
          let movedX = this.scrollX - this.positionsArray[startPos - 2];
          let movedY = this.scrollY - this.positionsArray[startPos - 1];
          // 基于50ms计算每个渲染步骤的移动
          this.decelerationVelocityX = movedX / timeOffset * (1000 / 60);
          this.decelerationVelocityY = movedY / timeOffset * (1000 / 60);
          // 开始减速需要多少速度
          let minVelocityToStartDeceleration = this.options.paging || this.options.snapping ? 4 : 1;;
          // 验证我们有足够的速度开始减速
          let isVelocityX = Math.abs(this.decelerationVelocityX) > minVelocityToStartDeceleration
          let isVelocityY = Math.abs(this.decelerationVelocityY) > minVelocityToStartDeceleration
          if (isVelocityX || isVelocityY) {
            // 减速时关闭下拉刷新功能
            if (!this.refreshActive) {
              this._startDeceleration(timeStamp);
            }
          } else {
            this.options.scrollingComplete();
          }
        } else {
          this.options.scrollingComplete();
        }
      } else if ((timeStamp - this.lastTouchMoveTime) > 100) {
        this.options.scrollingComplete();
      }
    }
    // 如果这是一个较慢的移动，它是默认不减速，但这个仍然意味着我们想要回到这里的边界。为了提高边缘盒的稳定性，将其置于上述条件之外
    // 例如，touchend在没有启用拖放的情况下被触发。这通常不应该修改了滚动条的位置，甚至显示了滚动条。
    if (!this.isDecelerating) {
      if (this.refreshActive && this.refreshStartCallBack) {
        // 使用publish而不是scrollTo来允许滚动到超出边界位置
        // 我们不需要在这里对scrollLeft、zoomLevel等进行规范化，因为我们只在启用了滚动刷新时进行y滚动
        this._publish(this.scrollX, -this.refreshHeight, true);
        if (this.refreshStartCallBack) {
          this.refreshStartCallBack();
        }
      } else {
        if (this._interruptedAnimation || this.isDragging) {
          this.options.scrollingComplete();
        }
        this.scrollTo(this.scrollX, this.scrollY, true, );
        // Directly signalize deactivation (nothing todo on refresh?)
        // 直接对失活进行签名(在刷新时不做任何操作?)
        if (this.refreshActive) {
          this.refreshActive = false;
          if (this.refreshDeactivateCallBack) {
            this.refreshDeactivateCallBack();
          }
        }
      }
    }
    // 完全清除列表
    this.positionsArray.length = 0;
  }

  /*
  ---------------------------------------------------------------------------
    PUBLIC API
  ---------------------------------------------------------------------------
  */
  /**
   * 配置客户机(外部)和内容(内部)元素的维度。需要外部元素的可用空间和内部元素的外部大小。
   * 所有错误的值(null或zero等)都被忽略，保留旧值。
   * param clientWidth {Integer ? null} Inner width of outer element
   * param clientHeight {Integer ? null} Inner height of outer element
   * param contentWidth {Integer ? null} Outer width of inner element
   * param contentHeight {Integer ? null} Outer height of inner element
   */
  setDimensions() {
    let containerWidth = this.container.offsetWidth
    let containerHeight = this.container.offsetHeight
    let contentWidth = this.content.offsetWidth
    let contentHeight = this.content.offsetHeight
    // 只更新已定义的值
    if (containerWidth === +containerWidth) {
      this.containerWidth = containerWidth;
    }
    if (containerHeight === +containerHeight) {
      this.containerHeight = containerHeight;
    }
    if (contentWidth === +contentWidth) {
      this.contentWidth = contentWidth;
    }
    if (contentHeight === +contentHeight) {
      this.contentHeight = contentHeight;
    }
    // 保留上一次的最大可滚动值
    let prevMaxScroll = this.maxScrollY;
    let childrens = this.content.children;
    let maxScrollY = Math.max(this.contentHeight - this.containerHeight, 0);
    this.refreshHeight = this.options.isPullRefresh ? childrens[0].offsetHeight : 0;
    this.loadingHeight = this.options.isReachBottom ? childrens[childrens.length-1].offsetHeight : 0;

    // 刷新最大值
    this.maxScrollX = Math.max(this.contentWidth - this.containerWidth, 0);
    this.maxScrollY = maxScrollY - this.refreshHeight;

    // 判断是否需要发送下拉触底事件
    if(this.options.isReachBottom){
      if(prevMaxScroll !== this.maxScrollY){
        this.reachBottomActive = false;
      }else{
        this.emit('loading',{
          hasMore: false
        })
      }
    }
    // 更新滚动位置
    this.scrollTo(this.scrollX, this.scrollY, true);
  }
  // 设置像素网格间距距离
  setSnapSize(width, height) {
    this.snapWidth = width;
    this.snapHeight = height;
  }
  /**
   * 激活pull-to-refresh。列表顶部的一个特殊区域，用于在用户事件在此区域可见期间被释放时启动列表刷新。
   * 这是由iOS上的一些应用程序引入的，比如官方Twitter客户端。
   * param height {Integer} 在呈现列表顶部的拖放刷新区域的高度
   * param activateCallback {Function} 回调函数，以在激活时执行。这是为了在用户释放时通知他即将发生刷新.
   * param deactivateCallback {Function} 在停用时执行的回调。这是为了通知用户刷新被取消.
   * param startCallback {Function} 执行回调以启动真正的异步刷新操作。刷新完成后调用{link #finishPullToRefresh}.
   */
  activatePullToRefresh(activateCallback, deactivateCallback, startCallback) {
    this.refreshActivateCallBack = activateCallback;
    this.refreshDeactivateCallBack = deactivateCallback;
    this.refreshStartCallBack = startCallback;
  }
  // 标志下拉刷新完成。
  finishPullToRefresh() {
    this.refreshActive = false;
    if (this.refreshDeactivateCallBack) {
      this.refreshDeactivateCallBack();
    }
    this.scrollTo(this.scrollX, this.scrollY, true);
  }
  /**
   * 返回滚动位置和缩放值
   * return {Map} “左”和“上”滚动位置和“缩放”水平
   */
  getValues() {
    return {
      left: Math.ceil(this.scrollX),
      top: Math.ceil(this.scrollY),
    }
  }

  /**
   *滚动到指定位置。尊重边界，自动截断。
   * param left {Number?null} 水平滚动位置，如果值<code>null</code>，则保持当前状态
   * param top {Number?null} 垂直滚动位置，如果值<code>null</code>，则保持当前状态
   * param animate {Boolean?false} 是否应该使用动画进行滚动
   * param zoom {Number?null} 缩放级别
   */
  scrollTo(left, top, animate) {
    // 停止减速
    if (this.isDecelerating) {
      this.animate.stop(this.isDecelerating);
      this.isDecelerating = false;
    }
    if (!this.options.scrollingX) {
      left = this.scrollX;
    }else {
      if (this.options.paging) {
        left = Math.round(left / this.containerWidth) * this.containerWidth;
      } else if (this.options.snapping) {
        left = Math.round(left / this.snapWidth) * this.snapWidth;
      }

    }
    if (!this.options.scrollingY) {
      top = this.scrollY;
    }else {
      if (this.options.paging) {
        top = Math.round(top / this.containerHeight) * this.containerHeight;
      } else if (this.options.snapping) {
        top = Math.round(top / this.snapHeight) * this.snapHeight;
      }

    }
    // 容许范围极限
    left = Math.max(Math.min(this.maxScrollX, left), 0);
    top = Math.max(Math.min(this.maxScrollY, top), 0);
    // 当没有检测到更改时，不要动画，仍然调用publish以确保呈现的位置与内部数据是同步的
    if (left === this.scrollX && top === this.scrollY) {
      animate = false;
    }
    // 发布新值
    if (!this.isTracking) {
      this._publish(left, top, animate);
    }
  }
  /**
   * 按给定的偏移量滚动
   * param left {Number ? 0} 滚动x轴的给定偏移量
   * param top {Number ? 0} 滚动y轴的给定偏移量
   * param animate {Boolean ? false} 是否使用动画
   */
  scrollBy(left, top, animate) {
    let startLeft = this.isAnimating ? this.scheduledX : this.scrollX;
    let startTop = this.isAnimating ? this.scheduledY : this.scrollY;
    this.scrollTo(startLeft + (left || 0), startTop + (top || 0), animate);
  }
  /*
  ---------------------------------------------------------------------------
    EVENT CALLBACKS
  ---------------------------------------------------------------------------
  */
  //订阅事件 注册给定类型的事件处理程序， type -> 自定义事件类型， handler -> 自定义事件回调函数
  on(eventType, handle) {
    if (!this.handles.hasOwnProperty(eventType)) {
      this.handles[eventType] = [];
    }
    if (typeof handle == 'function') {
      this.handles[eventType].push(handle);
    } else {
      throw new Error('Missing callback function');
    }
  }
  // 发送 事件 以及附带参数和
  emit(eventType, ...args) {
    if (this.handles.hasOwnProperty(eventType)) {
      this.handles[eventType].forEach((item, key, arr) => {
        item.apply(null, args);
      })
    } else {
      throw new Error(`"${eventType}"Event not registered`);
    }
  }
  /*
  ---------------------------------------------------------------------------
    PRIVATE API
  ---------------------------------------------------------------------------
  */
  /**
   * 将滚动位置应用于内容元素
   * param left {Number} 左滚动位置
   * param top {Number} 顶部滚动位置
   * param zom {Number} 缩放级别
   * param animate {Boolean?false} 是否应该使用动画移动到新坐标
   */
  _publish(left, top, animate) {
    // 记住我们是否有动画，然后我们尝试基于动画的当前“驱动器”继续
    let wasAnimating = this.isAnimating;
    if (wasAnimating) {
      this.animate.stop(wasAnimating);
      this.isAnimating = false;
    }
    if (animate && this.options.animating) {
      // 为scrollBy/zoomBy功能保留预定位置
      this.scheduledX = left;
      this.scheduledY = top;
      let oldLeft = this.scrollX;
      let oldTop = this.scrollY;
      let diffLeft = left - oldLeft;
      let diffTop = top - oldTop;
      let step = (percent, now, render) => {
        if (render) {
          this.scrollX = oldLeft + (diffLeft * percent);
          this.scrollY = oldTop + (diffTop * percent);
          // 将值返回
          if (this.render) {
            this.render(this.scrollX, this.scrollY);
          }
        }
      };
      let verify = (id) => {
        return this.isAnimating === id;
      };
      let completed = (renderedFramesPerSecond, animationId, wasFinished) => {
        if (animationId === this.isAnimating) {
          this.isAnimating = false;
        }
        if (this.completeDeceleration || wasFinished) {
          this.options.scrollingComplete();
        }
      };
      // 当继续基于之前的动画时，我们选择一个ease-out动画而不是ease-in-out
      this.isAnimating = this.animate.start(step, verify, completed, this.options.animationDuration, wasAnimating ? this.easeOutCubic : this.easeInOutCubic);
    } else {
      this.scheduledX = this.scrollX = left;
      this.scheduledY = this.scrollY = top;
      //将值返回
      if (this.render) {
        this.render(left, top);
      }
    }
    
    // 是否需要监听触底事件
    if(this.options.isReachBottom && !this.reachBottomActive){
      if(Number(this.scrollY.toFixed()) > (this.maxScrollY - this.loadingHeight)){
        this.emit('loading',{
          hasMore: true
        })
        this.reachBottomActive = true
      }
    }
    // 是否需要监听滚动事件
    if(this.options.listenScroll){
      // 节流 只判断整数变化
      let isChangeX = this.prevScrollX.toFixed() !== this.scrollX.toFixed()
      let isChangeY = this.prevScrollY.toFixed() !== this.scrollY.toFixed()
      if(isChangeX || isChangeY){
        this.emit('scroll', {
          x: Math.floor(this.scrollX),
          y: Math.floor(this.scrollY)
        })
      }
    }
  }
  /*
  ---------------------------------------------------------------------------
    ANIMATION (DECELERATION) SUPPORT
  ---------------------------------------------------------------------------
  */
  /**
   * 当一个触摸序列结束，手指的速度足够快时，就会被调用切换到减速模式。
   */
  _startDeceleration() {
    // 是否分屏
    if (this.options.paging) {
      let scrollX = Math.max(Math.min(this.scrollX, this.maxScrollX), 0);
      let scrollY = Math.max(Math.min(this.scrollY, this.maxScrollY), 0);
      // 我们不是将减速限制在允许范围的最小/最大值，而是将减速限制在可见客户机区域的大小。每个页面都应该有准确的客户区域大小。
      this.minDecelerationScrollX = Math.floor(scrollX / this.containerWidth) * this.containerWidth;
      this.minDecelerationScrollY = Math.floor(scrollY / this.containerHeight) * this.containerHeight;
      this.maxDecelerationScrollX = Math.ceil(scrollX / this.containerWidth) * this.containerWidth;
      this.maxDecelerationScrollY = Math.ceil(scrollY / this.containerHeight) * this.containerHeight;
    } else {
      this.minDecelerationScrollX = 0;
      this.minDecelerationScrollY = 0;
      this.maxDecelerationScrollX = this.maxScrollX;
      this.maxDecelerationScrollY = this.maxScrollY;
    }
    // 包装类方法
    let step = (percent, now, render) => {
      this._stepThroughDeceleration(render);
    };
    // 保持减速运行需要多少速度
    let minVelocityToKeepDecelerating = this.options.snapping ? 4 : 0.001;;
    // 检测是否仍然值得继续动画步骤 如果我们已经慢到无法再被用户感知，我们就会在这里停止整个过程。
    let verify = () => {
      let shouldContinue =
        Math.abs(this.decelerationVelocityX) >= minVelocityToKeepDecelerating ||
        Math.abs(this.decelerationVelocityY) >= minVelocityToKeepDecelerating;
      if (!shouldContinue) {
        this.completeDeceleration = true;
      }
      return shouldContinue;
    };
    // 
    let completed = (renderedFramesPerSecond, animationId, wasFinished) => {
      this.isDecelerating = false;
      if (this.completeDeceleration) {
        this.options.scrollingComplete();
      }
      // 动画网格时，捕捉是活跃的，否则只是固定边界外的位置
      this.scrollTo(this.scrollX, this.scrollY, this.options.snapping);
    };
    // 启动动画并打开标志
    this.isDecelerating = this.animate.start(step, verify, completed);
  }
  /**
   * 调用动画的每一步
   * param inMemory {Boolean?false} 是否不呈现当前步骤，而只将其保存在内存中。仅在内部使用!
   */
  _stepThroughDeceleration(render) {

    // 计算下一个滚动位置 增加减速到滚动位置
    let scrollX = this.scrollX + this.decelerationVelocityX;
    let scrollY = this.scrollY + this.decelerationVelocityY;
    // 硬性限制滚动位置为非弹跳模式
    if (!this.options.bouncing) {
      let scrollLeftFixed = Math.max(Math.min(this.maxDecelerationScrollX, scrollX), this.minDecelerationScrollX);
      if (scrollLeftFixed !== scrollX) {
        scrollX = scrollLeftFixed;
        this.decelerationVelocityX = 0;
      }
      let scrollTopFixed = Math.max(Math.min(this.maxDecelerationScrollY, scrollY), this.minDecelerationScrollY);
      if (scrollTopFixed !== scrollY) {
        scrollY = scrollTopFixed;
        this.decelerationVelocityY = 0;
      }
    }
    //记录上一个滚动得位置
    this.prevScrollX = this.scrollX;
    this.prevScrollY = this.scrollY;
    // 更新滚动位置
    if (render) {
      this._publish(scrollX, scrollY);
    } else {
      this.scrollX = scrollX;
      this.scrollY = scrollY;
    }
    
    // 慢下来------
    // 在每次迭代中减慢速度
    // 这是应用于动画每次迭代的因素来减缓这个过程。这应该模拟在删除移动的发起者时对象减速的自然行为
    
    if (!this.options.paging) {
      let frictionFactor = 0.95;
      this.decelerationVelocityX *= frictionFactor;
      this.decelerationVelocityY *= frictionFactor;
    }
    
    // 跳跃的支持
    if (this.options.bouncing) {
      let scrollOutsideX = 0;
      let scrollOutsideY = 0;
      // 这配置了到达边界时应用于减速/加速的更改量
      let penetrationDeceleration = this.options.penetrationDeceleration;
      let penetrationAcceleration = this.options.penetrationAcceleration;
      // 检查限制
      if (scrollX < this.minDecelerationScrollX) {
        scrollOutsideX = this.minDecelerationScrollX - scrollX;
      } else if (scrollX > this.maxDecelerationScrollX) {
        scrollOutsideX = this.maxDecelerationScrollX - scrollX;
      }
      if (scrollY < this.minDecelerationScrollY) {
        scrollOutsideY = this.minDecelerationScrollY - scrollY;
      } else if (scrollY > this.maxDecelerationScrollY) {
        scrollOutsideY = this.maxDecelerationScrollY - scrollY;
      }
      // 慢下来，直到足够慢，然后翻转回弹起位置
      if (scrollOutsideX !== 0) {
        if (scrollOutsideX * this.decelerationVelocityX <= 0) {
          this.decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
        } else {
          this.decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
        }
      }
      if (scrollOutsideY !== 0) {
        if (scrollOutsideY * this.decelerationVelocityY <= 0) {
          this.decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
        } else {
          this.decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
        }
      }
    }
  }
}
export default Scroller