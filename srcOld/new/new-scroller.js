import Animate from './animate.js'
import Render from './render.js'
import {easeOutCubic, easeInOutCubic} from './utils.js'

class Scroller {
  constructor(dom, options){
    let self = this;

    self.NOOP = function () {};
    self.handles = {
      scroll:[],    // 发送滚动监听事件
      loading:[]    // 发送下拉加载事件
    }
		self.options = {
      listenScroll: false, // 是否启用滚动监听实时获取滚动位置
      isPullRefresh:false,  // 是否监听下拉刷新
      isReachBottom:false,  // 是否监听触底事件
      mousewheel:true,

			scrollingX: true,
			scrollingY: true,
			animating: true,
			animationDuration: 250,
			bouncing: true,
			locking: true,
			paging: false,
      snapping: false,

      snappingType:'defalut',  // snappingType使用的方式 select 为类似时间选择器
      snappingSelect:0,        // snapping默认选中的值
      snappingListIndex:0,     // snapping多列的时候的当前列
      snappingComplete: self.NOOP,  // snapping 滑动完成后的执行事件

			zooming: false,
			minZoom: 0.5,
			maxZoom: 3,
			speedMultiplier: 1,
			scrollingComplete: self.NOOP
    };
    // 合并参数
		for (var key in options) {
			self.options[key] = options[key];
    }

    /*
		---------------------------------------------------------------------------
			配置数字参数
		---------------------------------------------------------------------------
    */
    self.__edgesMultiple = 1.5               // 边缘减速比例 不能小于 1 越接近 1 越慢
    self.__frictionFactor = 0.975           // 每次的递减速率
    self.__penetrationDeceleration = 0.09  // 到达边界时应用于减速的更改量
    self.__penetrationAcceleration = 0.08  // 到达边界时施加于加速度的变化量
    /*
		---------------------------------------------------------------------------
			INTERNAL FIELDS :: STATUS
		---------------------------------------------------------------------------
    */
    self.content = dom
    self.container = dom.parentNode

    self.__render = Render(dom)

    self.__reachHeight = 0    // 上拉加载区域的高度
    self.snappingTypeInit = false   // 是否已经初始化了snapping type = center
    self.reachBottomActive = false  //是否已经发送了触底事件

    /*
		---------------------------------------------------------------------------
			INTERNAL FIELDS :: STATUS
		---------------------------------------------------------------------------
		*/
		self.__isSingleTouch = false;
		self.__isTracking = false;
		self.__didDecelerationComplete= false
		/**
		 * {Boolean} Whether a gesture zoom/rotate event is in progress. Activates when
		 * a gesturestart event happens. This has higher priority than dragging.
		 */
		self.__isGesturing=false
		self.__isDragging= false
		self.__isDecelerating= false
		self.__isAnimating= false
		/*
		---------------------------------------------------------------------------
			INTERNAL FIELDS :: DIMENSIONS
		---------------------------------------------------------------------------
		*/
		/** {Integer} Available outer left position (from document perspective) */
		self.__clientLeft= 0
		/** {Integer} Available outer top position (from document perspective) */
		self.__clientTop= 0
		/** {Integer} Available outer width */
		self.__clientWidth= 0
		/** {Integer} Available outer height */
		self.__clientHeight= 0
		/** {Integer} Outer width of content */
		self.__contentWidth= 0
		/** {Integer} Outer height of content */
		self.__contentHeight= 0
		/** {Integer} Snapping width for content */
		self.__snapWidth= 50
		/** {Integer} Snapping height for content */
		self.__snapHeight= 50
		/** {Integer} Height to assign to refresh area */
		self.__refreshHeight= null
		/** {Boolean} Whether the refresh process is enabled when the event is released now */
		self.__refreshActive= false
		/** {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release */
		self.__refreshActivate= null
		/** {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled */
		self.__refreshDeactivate= null
		/** {Function} Callback to execute to start the actual refresh. Call {@link #refreshFinish} when done */
		self.__refreshStart= null
		/** {Number} Zoom level */
		self.__zoomLevel= 1
		/** {Number} Scroll position on x-axis */
		self.__scrollLeft= 0
		/** {Number} Scroll position on y-axis */
    self.__scrollTop= 0
    /** {Number} last Scroll position on y-axis */
    self.__prevScrollLeft = 0
    /** {Number} last Scroll position on y-axis */
    self.__prevScrollTop = 0
    /** {Integer} Min allowed scroll position on x-axis */
    self.__minScrollLeft = 0
    /** {Integer} Min allowed scroll position on x-axis */
    self.__minScrollTop = 0
		/** {Integer} Maximum allowed scroll position on x-axis */
		self.__maxScrollLeft= 0
		/** {Integer} Maximum allowed scroll position on y-axis */
		self.__maxScrollTop= 0
		/* {Number} Scheduled left position (final position when animating) */
		self.__scheduledLeft= 0
		/* {Number} Scheduled top position (final position when animating) */
		self.__scheduledTop= 0
		/* {Number} Scheduled zoom level (final scale when animating) */
		self.__scheduledZoom= 0
		/*
		---------------------------------------------------------------------------
			INTERNAL FIELDS :: LAST POSITIONS
		---------------------------------------------------------------------------
		*/
		/** {Number} Left position of finger at start */
		self.__lastTouchLeft= null
		/** {Number} Top position of finger at start */
		self.__lastTouchTop= null
		/** {Date} Timestamp of last move of finger. Used to limit tracking range for deceleration speed. */
		self.__lastTouchMove= null
		/** {Array} List of positions, uses three indexes for each state: left, top, timestamp */
		self.__positions= null
		/*
		---------------------------------------------------------------------------
			INTERNAL FIELDS :: DECELERATION SUPPORT
		---------------------------------------------------------------------------
		*/
		/** {Integer} Minimum left scroll position during deceleration */
		self.__minDecelerationScrollLeft= 0;
		/** {Integer} Minimum top scroll position during deceleration */
		self.__minDecelerationScrollTop= 0;
		/** {Integer} Maximum left scroll position during deceleration */
		self.__maxDecelerationScrollLeft= 0;
		/** {Integer} Maximum top scroll position during deceleration */
		self.__maxDecelerationScrollTop= 0;
		/** {Number} Current factor to modify horizontal scroll position with on every step */
		self.__decelerationVelocityX= 0;
		/** {Number} Current factor to modify vertical scroll position with on every step */
    self.__decelerationVelocityY= 0;

    self.initEvent(dom)
    self.setSnapSize(self.options.snapping);
  }
  /*
  ---------------------------------------------------------------------------
    envet API
  ---------------------------------------------------------------------------
  */
  // 初始化操作事件监听
  initEvent(el) {
    let self = this
    // 触摸开始事件
    el.addEventListener('touchstart', e => {
      if (!e.target.tagName.match(/input|textarea|select/i)) {
        self.doTouchStart(e.touches, e.timeStamp)
      }
    })
    // 触摸移动事件
    el.addEventListener('touchmove', e => {
      e.preventDefault()
      self.doTouchMove(e.touches, e.timeStamp)
    })
    // 触摸结束事件
    el.addEventListener('touchend', e => {
      self.doTouchEnd(e.timeStamp)
    })


    // 鼠标点击事件
    el.addEventListener('mousedown', e => {
      if (!e.target.tagName.match(/input|textarea|select/i)) {
        self.doTouchStart([{
          pageX: e.pageX,
          pageY: e.pageY
        }], e.timeStamp)
      }
    })
    // 鼠标移动事件
    el.addEventListener('mousemove', e => {
      self.doTouchMove([{
        pageX: e.pageX,
        pageY: e.pageY
      }], e.timeStamp)
    })
    // 鼠标离开事件
    el.addEventListener('mouseup', e => {
      self.doTouchEnd(e.timeStamp)
    })
    // 鼠标滚动事件
    // if(self.options.mousewheel){
    el.addEventListener('mousewheel', e => {
      self.__scrollTop = self.__scrollTop += e.deltaY
      if(self.__scrollTop>self.__maxScrollTop){
        self.__scrollTop = self.__maxScrollTop
      }
      if(self.__scrollTop < 0){
        self.__scrollTop = 0
      }
      self.__publish(self.__scrollLeft, self.__scrollTop, self.__zoomLevel, true);
    })
    // }
  }
  // 订阅事件 注册给定类型的事件处理程序， type -> 自定义事件类型， handler -> 自定义事件回调函数
  on(eventType, handle) {
    let self = this
    if (!self.handles.hasOwnProperty(eventType)) {
      self.handles[eventType] = [];
    }
    if (typeof handle == 'function') {
      self.handles[eventType].push(handle);
    } else {
      throw new Error('Missing callback function');
    }
  }
  // 发送 事件 以及附带参数和
  emit(eventType, ...args) {
    let self = this
    if (self.handles.hasOwnProperty(eventType)) {
      self.handles[eventType].forEach((item, key, arr) => {
        item.apply(null, args);
      })
    } else {
      throw new Error(`"${eventType}"Event not registered`);
    }
  }
  /*
  ---------------------------------------------------------------------------
    PUBLIC API
  ---------------------------------------------------------------------------
  */
  // 设置视窗
  setDimensions() {
    var self = this;
    let clientWidth = self.container.offsetWidth
    let clientHeight = self.container.offsetHeight
    let contentWidth = self.content.offsetWidth
    let contentHeight = self.content.offsetHeight
    // Only update values which are defined
    if (clientWidth === +clientWidth) {
      self.__clientWidth = clientWidth;
    }
    if (clientHeight === +clientHeight) {
      self.__clientHeight = clientHeight;
    }
    if (contentWidth === +contentWidth) {
      self.__contentWidth = contentWidth;
    }
    if (contentHeight === +contentHeight) {
      self.__contentHeight = contentHeight;
    }
    // 得到子元素
    let childrens = self.content.children;
    // 保留上一次的最大可滚动值
    let prevMaxScroll = self.__maxScrollTop;

    // 保留下拉刷新和上拉加载的高度
    self.__refreshHeight = self.options.isPullRefresh ? childrens[0].offsetHeight : 0;
    self.__reachHeight = self.options.isReachBottom ? childrens[childrens.length-1].offsetHeight : 0;

    // 刷新最大值
    // setSnap 是否开启居中类型的限制滑动区域
    if(self.options.snappingType === 'select'){
      let itemCount = Math.round(self.__clientHeight / self.__snapHeight)
      self.__minScrollTop = -self.__snapHeight * Math.floor(itemCount / 2)
      self.__maxScrollTop = self.__minScrollTop + (childrens[1].children.length-1) * self.__snapHeight
      // 防止多次
      if(!self.snappingTypeInit){
        self.__scrollTop = self.__minScrollTop + (self.options.snappingSelect * self.__snapHeight)
        self.snappingTypeInit = true;
      }
    }else{
      // Refresh maximums
      self.__computeScrollMax();
    }

    // 判断是否需要发送下拉触底事件
    if(self.options.isReachBottom){
      if(prevMaxScroll !== self.__maxScrollTop){
        self.reachBottomActive = false;
      }else{
        if(self.__maxScrollTop != 0){
          self.emit('loading',{
            hasMore: false
          })
        }
      }
    }

    // Refresh scroll position
    self.scrollTo(self.__scrollLeft, self.__scrollTop, true);
  }
  // 下拉刷新
  refresh(){
    let self = this
    self.setDimensions()
  }

  setPosition(left, top) {
    var self = this;
    self.__clientLeft = left || 0;
    self.__clientTop = top || 0;
  }

  // 设置snap区域大小
  setSnapSize(snapping) {
    let self = this
    if(typeof snapping === 'number'){
      self.__snapWidth = snapping;
      self.__snapHeight = snapping;
    }else if(Array.isArray(snapping)){
      self.__snapWidth = snapping[0];
      self.__snapHeight = snapping[1];
    }
  }

  /*
  ---------------------------------------------------------------------------
    Refresh API
  ---------------------------------------------------------------------------
  */
  activatePullToRefresh(activateCallback, deactivateCallback, startCallback) {
    var self = this;
    self.__refreshActivate = activateCallback;
    self.__refreshDeactivate = deactivateCallback;
    self.__refreshStart = startCallback;

  }
  triggerPullToRefresh() {
    let self = this
    // Use publish instead of scrollTo to allow scrolling to out of boundary position
    // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
    self.__publish(self.__scrollLeft, -self.__refreshHeight, self.__zoomLevel, true);
    if (self.__refreshStart) {
      self.__refreshStart();
    }
  }
  finishPullToRefresh() {
    var self = this;
    self.__refreshActive = false;
    if (self.__refreshDeactivate) {
      self.__refreshDeactivate();
    }
    self.scrollTo(self.__scrollLeft, self.__scrollTop, true);
  }


  // 修复调用scrollTo 方法时候无法获取当前滚动高度的方法，只在非进入减速状态下调用
  getScrollToValues() {
    var self = this;
    var interTimer = setInterval(()=>{
      // 节流 只判断整数变化
      let isChangeX = self.__prevScrollLeft.toFixed() !== self.__scrollLeft.toFixed()
      let isChangeY = self.__prevScrollTop.toFixed() !== self.__scrollTop.toFixed()
      if(isChangeX || isChangeY){
        self.emit('scroll', {
          x: Math.floor(self.__scrollLeft),
          y: Math.floor(self.__scrollTop)
        })
      }else{
        var outTimer = setTimeout(()=>{
          // console.log(self.__scrollTop,self.__maxScrollTop)
          let x = self.__scrollLeft;
          let y = self.__scrollTop ;
          if(self.__scrollTop === 0) y = 0 ;
          if(self.__scrollLeft === 0) x = 0;
          if(self.__scrollTop === self.__maxScrollTop ) y = self.__maxScrollTop;
          if(self.__scrollLeft === self.__maxScrollLeft) x = self.__maxScrollLeft;
          self.emit('scroll', {
            x: Math.floor(x),
            y: Math.floor(y)
          })
          // console.log(self.__scrollTop,self.__maxScrollTop)
          clearInterval(interTimer)
          clearTimeout(outTimer)
        },50)
      }
    },30)
  }
  getScrollMax() {
    var self = this;
    return {
      left: self.__maxScrollLeft,
      top: self.__maxScrollTop
    };
  }

  zoomTo(level, animate, originLeft, originTop, callback) {
    var self = this;
    if (!self.options.zooming) {
      throw new Error("Zooming is not enabled!");
    }

    // Add callback if exists
    if(callback) {
      self.__zoomComplete = callback;
    }

    // Stop deceleration
    if (self.__isDecelerating) {
      Animate.stop(self.__isDecelerating);
      self.__isDecelerating = false;
    }

    var oldLevel = self.__zoomLevel;

    // Normalize input origin to center of viewport if not defined
    if (originLeft == null) {
      originLeft = self.__clientWidth / 2;
    }

    if (originTop == null) {
      originTop = self.__clientHeight / 2;
    }

    // Limit level according to configuration
    level = Math.max(Math.min(level, self.options.maxZoom), self.options.minZoom);

    // Recompute maximum values while temporary tweaking maximum scroll ranges
    self.__computeScrollMax(level);

    // Recompute left and top coordinates based on new zoom level
    var left = ((originLeft + self.__scrollLeft) * level / oldLevel) - originLeft;
    var top = ((originTop + self.__scrollTop) * level / oldLevel) - originTop;

    // Limit x-axis
    if (left > self.__maxScrollLeft) {
      left = self.__maxScrollLeft;
    } else if (left < 0) {
      left = 0;
    }

    // Limit y-axis
    if (top > self.__maxScrollTop) {
      top = self.__maxScrollTop;
    } else if (top < 0) {
      top = 0;
    }

    // Push values out
    self.__publish(left, top, level, animate);

  }
  zoomBy(factor, animate, originLeft, originTop, callback) {
    var self = this;
    self.zoomTo(self.__zoomLevel * factor, animate, originLeft, originTop, callback);
  }
  // 滚动到指定位置方法
  scrollTo(left, top, animate, zoom) {

    var self = this;
    // Stop deceleration
    if (self.__isDecelerating) {
      Animate.stop(self.__isDecelerating);
      self.__isDecelerating = false;
    }
    // Correct coordinates based on new zoom level
    if (zoom != null && zoom !== self.__zoomLevel) {
      if (!self.options.zooming) {
        throw new Error("Zooming is not enabled!");
      }
      left *= zoom;
      top *= zoom;
      // Recompute maximum values while temporary tweaking maximum scroll ranges
      self.__computeScrollMax(zoom);
    } else {
      // Keep zoom when not defined
      zoom = self.__zoomLevel;
    }
    if (!self.options.scrollingX) {
      left = self.__scrollLeft;
    } else {
      if (self.options.paging) {
        left = Math.round(left / self.__clientWidth) * self.__clientWidth;
      } else if (self.options.snapping) {
        left = Math.round(left / self.__snapWidth) * self.__snapWidth;
      }
    }
    if (!self.options.scrollingY) {
      top = self.__scrollTop;
    } else {
      if (self.options.paging) {
        top = Math.round(top / self.__clientHeight) * self.__clientHeight;
      } else if (self.options.snapping) {
        top = Math.round(top / self.__snapHeight) * self.__snapHeight;
      }
    }

    // Limit for allowed ranges
    // left = Math.max(Math.min(self.__maxScrollLeft, left), 0);
    // top = Math.max(Math.min(self.__maxScrollTop, top), 0);

    // setSnap 容许范围极限 增加最小高度判断
    if(self.options.snappingType === 'select'){
      left = Math.max(Math.min(self.__maxScrollLeft, left), self.__minScrollLeft);
      top = Math.max(Math.min(self.__maxScrollTop, top), self.__minScrollTop);
    }else if(self.options.snappingType === 'default'){
      left = Math.max(Math.min(self.__maxScrollLeft, left), 0);
      top = Math.max(Math.min(self.__maxScrollTop, top), 0);
    }
    // Don't animate when no change detected, still call publish to make sure
    // that rendered position is really in-sync with internal data
    if (left === self.__scrollLeft && top === self.__scrollTop) {
      animate = false;
    }
    // Publish new values
    if (!self.__isTracking) {
      self.__publish(left, top, zoom, animate);
    }
  }
  // 滚动大偏移量位置
  scrollBy(left, top, animate) {
    var self = this;
    var startLeft = self.__isAnimating ? self.__scheduledLeft : self.__scrollLeft;
    var startTop = self.__isAnimating ? self.__scheduledTop : self.__scrollTop;
    self.scrollTo(startLeft + (left || 0), startTop + (top || 0), animate);
  }
  /*
  ---------------------------------------------------------------------------
    EVENT CALLBACKS
  ---------------------------------------------------------------------------
  */
  // Mouse wheel handler for zooming support
  // 双指缩放处理函数
  doMouseZoom(wheelDelta, timeStamp, pageX, pageY) {
    var self = this;
    var change = wheelDelta > 0 ? 0.97 : 1.03;
    return self.zoomTo(self.__zoomLevel * change, false, pageX - self.__clientLeft, pageY - self.__clientTop);
  }
  // Touch start handler for scrolling support
  // 触摸开始处理函数
  doTouchStart(touches, timeStamp) {
    // Array-like check is enough here
    // 判断当前是否存在触摸事件
    if (touches.length == null) {
      throw new Error("Invalid touch list: " + touches);
    }
    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== "number") {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }
    var self = this;
    // Reset interruptedAnimation flag
    self.__interruptedAnimation = true;
    // Stop deceleration
    if (self.__isDecelerating) {
      Animate.stop(self.__isDecelerating);
      self.__isDecelerating = false;
      self.__interruptedAnimation = true;
    }
    // Stop animation
    if (self.__isAnimating) {
      Animate.stop(self.__isAnimating);
      self.__isAnimating = false;
      self.__interruptedAnimation = true;
    }

    // Use center point when dealing with two fingers
    var currentTouchLeft, currentTouchTop;
    var isSingleTouch = touches.length === 1;
    if (isSingleTouch) {
      currentTouchLeft = touches[0].pageX;
      currentTouchTop = touches[0].pageY;
    } else {
      currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
      currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
    }

    // Store initial positions
    self.__initialTouchLeft = currentTouchLeft;
    self.__initialTouchTop = currentTouchTop;
    // Store current zoom level
    self.__zoomLevelStart = self.__zoomLevel;
    // Store initial touch positions
    self.__lastTouchLeft = currentTouchLeft;
    self.__lastTouchTop = currentTouchTop;
    // Store initial move time stamp
    self.__lastTouchMove = timeStamp;
    // Reset initial scale
    self.__lastScale = 1;
    // Reset locking flags
    self.__enableScrollX = !isSingleTouch && self.options.scrollingX;
    self.__enableScrollY = !isSingleTouch && self.options.scrollingY;
    // Reset tracking flag
    self.__isTracking = true;
    // Reset deceleration complete flag
    self.__didDecelerationComplete = false;
    // Dragging starts directly with two fingers, otherwise lazy with an offset
    self.__isDragging = !isSingleTouch;
    // Some features are disabled in multi touch scenarios
    self.__isSingleTouch = isSingleTouch;
    // Clearing data structure
    self.__positions = [];
  }

  // Touch move handler for scrolling support
  // 触摸移动处理函数
  doTouchMove(touches, timeStamp, scale) {
    // Array-like check is enough here
    if (touches.length == null) {
      throw new Error("Invalid touch list: " + touches);
    }
    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== "number") {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }

    var self = this;
    // Ignore event when tracking is not enabled (event might be outside of element)
    if (!self.__isTracking) {
      return;
    }
    var currentTouchLeft, currentTouchTop;
    // Compute move based around of center of fingers
    if (touches.length === 2) {
      currentTouchLeft = Math.abs(touches[0].pageX + touches[1].pageX) / 2;
      currentTouchTop = Math.abs(touches[0].pageY + touches[1].pageY) / 2;
    } else {
      currentTouchLeft = touches[0].pageX;
      currentTouchTop = touches[0].pageY;
    }

    var positions = self.__positions;

    // Are we already is dragging mode?
    if (self.__isDragging) {

      // Compute move distance
      var moveX = currentTouchLeft - self.__lastTouchLeft;
      var moveY = currentTouchTop - self.__lastTouchTop;

      // Read previous scroll position and zooming
      var scrollLeft = self.__scrollLeft;
      var scrollTop = self.__scrollTop;
      var level = self.__zoomLevel;

      // Work with scaling
      if (scale != null && self.options.zooming) {
        var oldLevel = level;
        // Recompute level based on previous scale and new scale
        level = level / self.__lastScale * scale;
        // Limit level according to configuration
        level = Math.max(Math.min(level, self.options.maxZoom), self.options.minZoom);
        // Only do further compution when change happened
        if (oldLevel !== level) {
          // Compute relative event position to container
          var currentTouchLeftRel = currentTouchLeft - self.__clientLeft;
          var currentTouchTopRel = currentTouchTop - self.__clientTop;
          // Recompute left and top coordinates based on new zoom level
          scrollLeft = ((currentTouchLeftRel + scrollLeft) * level / oldLevel) - currentTouchLeftRel;
          scrollTop = ((currentTouchTopRel + scrollTop) * level / oldLevel) - currentTouchTopRel;
          // Recompute max scroll values
          self.__computeScrollMax(level);
        }
      }

      if (self.__enableScrollX) {
        scrollLeft -= moveX * self.options.speedMultiplier;
        var maxScrollLeft = self.__maxScrollLeft;
        if (scrollLeft > maxScrollLeft || scrollLeft < 0) {
          // Slow down on the edges
          if (self.options.bouncing) {
            scrollLeft += (moveX / self.__edgesMultiple  * self.options.speedMultiplier);
          } else if (scrollLeft > maxScrollLeft) {
            scrollLeft = maxScrollLeft;
          } else {
            scrollLeft = 0;
          }
        }
      }
      // Compute new vertical scroll position
      if (self.__enableScrollY) {
        scrollTop -= moveY * self.options.speedMultiplier;
        var maxScrollTop = self.__maxScrollTop;
        if (scrollTop > maxScrollTop || scrollTop < 0) {
          // Slow down on the edges
          console.log('move __isDragging')
          if (self.options.bouncing) {
            if(self.options.snappingType === 'select'){
              scrollTop += (moveY / 10 * self.options.speedMultiplier);
            }else{
              scrollTop += (moveY / self.__edgesMultiple * self.options.speedMultiplier);
            }
            // console.log('2',scrollTop)
            // scrollTop += (moveY / self.__edgesMultiple * self.options.speedMultiplier);
            // Support pull-to-refresh (only when only y is scrollable)
            if (!self.__enableScrollX && self.__refreshHeight != null) {
              if (!self.__refreshActive && scrollTop <= -self.__refreshHeight) {
                self.__refreshActive = true;
                if (self.__refreshActivate) {
                  self.__refreshActivate();
                }
              } else if (self.__refreshActive && scrollTop > -self.__refreshHeight) {
                self.__refreshActive = false;
                if (self.__refreshDeactivate) {
                  self.__refreshDeactivate();
                }
              }
            }
            // self.__startDeceleration()
          } else if (scrollTop > maxScrollTop) {
            scrollTop = maxScrollTop;
          } else {
            scrollTop = 0;
          }
          // console.log('3',scrollTop)
        }
      }

      // Keep list from growing infinitely (holding min 10, max 20 measure points)
      if (positions.length > 60) {
        positions.splice(0, 30);
      }

      // Track scroll movement for decleration
      positions.push(scrollLeft, scrollTop, timeStamp);

      // Sync scroll position
      self.__publish(scrollLeft, scrollTop, level);

    // Otherwise figure out whether we are switching into dragging mode now.
    } else {
      console.log('move __noDragging')
      var minimumTrackingForScroll = self.options.locking ? 3 : 0;
      var minimumTrackingForDrag = 5;

      var distanceX = Math.abs(currentTouchLeft - self.__initialTouchLeft);
      var distanceY = Math.abs(currentTouchTop - self.__initialTouchTop);

      self.__enableScrollX = self.options.scrollingX && distanceX >= minimumTrackingForScroll;
      self.__enableScrollY = self.options.scrollingY && distanceY >= minimumTrackingForScroll;

      positions.push(self.__scrollLeft, self.__scrollTop, timeStamp);

      self.__isDragging = (self.__enableScrollX || self.__enableScrollY) && (distanceX >= minimumTrackingForDrag || distanceY >= minimumTrackingForDrag);
      if (self.__isDragging) {
        self.__interruptedAnimation = false;
      }

    }

    // Update last touch positions and time stamp for next event
    self.__lastTouchLeft = currentTouchLeft;
    self.__lastTouchTop = currentTouchTop;
    self.__lastTouchMove = timeStamp;
    self.__lastScale = scale;

  }
  /**
   * Touch end handler for scrolling support
   */
  doTouchEnd(timeStamp) {

    if (timeStamp instanceof Date) {
      timeStamp = timeStamp.valueOf();
    }
    if (typeof timeStamp !== "number") {
      throw new Error("Invalid timestamp value: " + timeStamp);
    }

    var self = this;
    // Ignore event when tracking is not enabled (no touchstart event on element)
    // This is required as this listener ('touchmove') sits on the document and not on the element itself.
    if (!self.__isTracking) {
      return;
    }
    // Not touching anymore (when two finger hit the screen there are two touch end events)
    self.__isTracking = false;
    // Be sure to reset the dragging flag now. Here we also detect whether
    // the finger has moved fast enough to switch into a deceleration animation.
    if (self.__isDragging) {
      console.log('end __isDragging')
      // Reset dragging flag
      self.__isDragging = false;
      // Start deceleration
      // Verify that the last move detected was in some relevant time frame
      if (self.__isSingleTouch && self.options.animating && (timeStamp - self.__lastTouchMove) <= 100) {
        console.log('end timeStamp <= 100')
        // Then figure out what the scroll position was about 100ms ago
        var positions = self.__positions;
        var endPos = positions.length - 1;
        var startPos = endPos;
        // console.log('12')
        // Move pointer to position measured 100ms ago
        for (var i = endPos; i > 0 && positions[i] > (self.__lastTouchMove - 100); i -= 3) {
          startPos = i;
        }
        // If start and stop position is identical in a 100ms timeframe,
        // we cannot compute any useful deceleration.
        if (startPos !== endPos) {
          // console.log('')
          // Compute relative movement between these two points
          var timeOffset = positions[endPos] - positions[startPos];
          var movedLeft = self.__scrollLeft - positions[startPos - 2];
          var movedTop = self.__scrollTop - positions[startPos - 1];
          // Based on 50ms compute the movement to apply for each render step
          self.__decelerationVelocityX = movedLeft / timeOffset * (1000 / 60);
          self.__decelerationVelocityY = movedTop / timeOffset * (1000 / 60);
          // How much velocity is required to start the deceleration
          var minVelocityToStartDeceleration = self.options.paging || self.options.snapping ? 4 : 1;
          // Verify that we have enough velocity to start deceleration
          if (Math.abs(self.__decelerationVelocityX) > minVelocityToStartDeceleration || Math.abs(self.__decelerationVelocityY) > minVelocityToStartDeceleration) {
            // Deactivate pull-to-refresh when decelerating
            if (!self.__refreshActive) {
              self.__startDeceleration(timeStamp);
            }
          } else {
            self.options.scrollingComplete();
          }
        } else {
          self.options.scrollingComplete();
        }
      } else if ((timeStamp - self.__lastTouchMove) > 100) {
        console.log('end timeStamp > 100')
        self.options.scrollingComplete();
      }
    }

    // If this was a slower move it is per default non decelerated, but this
    // still means that we want snap back to the bounds which is done here.
    // This is placed outside the condition above to improve edge case stability
    // e.g. touchend fired without enabled dragging. This should normally do not
    // have modified the scroll positions or even showed the scrollbars though.
    if (!self.__isDecelerating) {
      console.log('end __noDecelerating')
      if (self.__refreshActive && self.__refreshStart) {
        // Use publish instead of scrollTo to allow scrolling to out of boundary position
        // We don't need to normalize scrollLeft, zoomLevel, etc. here because we only y-scrolling when pull-to-refresh is enabled
        self.__publish(self.__scrollLeft, -self.__refreshHeight, self.__zoomLevel, true);

        if (self.__refreshStart) {
          self.__refreshStart();
        }
      } else {
        if (self.__interruptedAnimation || self.__isDragging) {
          self.options.scrollingComplete();
        }
        if((timeStamp - self.__lastTouchMove) > 100){
          console.log('end scrollTo')
          self.scrollTo(self.__scrollLeft, self.__scrollTop, true, self.__zoomLevel);
          self.getScrollToValues();
        }else{
          console.log('end __startDeceleration')
          self.__startDeceleration()
        }

        // Directly signalize deactivation (nothing todo on refresh?)
        if (self.__refreshActive) {
          self.__refreshActive = false;
          if (self.__refreshDeactivate) {
            self.__refreshDeactivate();
          }
        }
      }
    }

    // Fully cleanup list
    self.__positions.length = 0;

  }
  /*
  ---------------------------------------------------------------------------
    PRIVATE API
  ---------------------------------------------------------------------------
  */

  /**
   * Applies the scroll position to the content element
   *
   * @param left {Number} Left scroll position
   * @param top {Number} Top scroll position
   * @param animate {Boolean?false} Whether animation should be used to move to the new coordinates
   */
  __publish(left, top, zoom, animate) {

    var self = this;

    // Remember whether we had an animation, then we try to continue based on the current "drive" of the animation
    var wasAnimating = self.__isAnimating;
    if (wasAnimating) {
      Animate.stop(wasAnimating);
      self.__isAnimating = false;
    }

    if (animate && self.options.animating) {

      // Keep scheduled positions for scrollBy/zoomBy functionality
      self.__scheduledLeft = left;
      self.__scheduledTop = top;
      self.__scheduledZoom = zoom;

      var oldLeft = self.__scrollLeft;
      var oldTop = self.__scrollTop;
      var oldZoom = self.__zoomLevel;

      var diffLeft = left - oldLeft;
      var diffTop = top - oldTop;
      var diffZoom = zoom - oldZoom;

      var step = function(percent, now, render) {

        if (render) {

          self.__scrollLeft = oldLeft + (diffLeft * percent);
          self.__scrollTop = oldTop + (diffTop * percent);
          self.__zoomLevel = oldZoom + (diffZoom * percent);

          // Push values out
          if (self.__render) {
            self.__render(self.__scrollLeft, self.__scrollTop, self.__zoomLevel);
          }

        }
      };

      var verify = function(id) {
        return self.__isAnimating === id;
      };

      var completed = function(renderedFramesPerSecond, animationId, wasFinished) {
        if (animationId === self.__isAnimating) {
          self.__isAnimating = false;
        }
        if (self.__didDecelerationComplete || wasFinished) {
          self.options.scrollingComplete();
        }

        if (self.options.zooming) {
          self.__computeScrollMax();
          if(self.__zoomComplete) {
            self.__zoomComplete();
            self.__zoomComplete = null;
          }
        }
      };

      // When continuing based on previous animation we choose an ease-out animation instead of ease-in-out
      self.__isAnimating = Animate.start(step, verify, completed, self.options.animationDuration, wasAnimating ? easeOutCubic : easeInOutCubic);

    } else {

      self.__scheduledLeft = self.__scrollLeft = left;
      self.__scheduledTop = self.__scrollTop = top;
      self.__scheduledZoom = self.__zoomLevel = zoom;

      // Push values out
      if (self.__render) {
        self.__render(left, top, zoom);
      }

      // Fix max scroll ranges
      if (self.options.zooming) {
        self.__computeScrollMax();
        if(self.__zoomComplete) {
          self.__zoomComplete();
          self.__zoomComplete = null;
        }
      }

      // console.log(self.__scrollLeft,self.__scrollTop)
    }
    // 是否需要监听触底事件
    if(self.options.isReachBottom && !self.reachBottomActive){
      let fixedScrollTop= Number(self.__scrollTop.toFixed());
      let absMaxScrollTop =  self.__maxScrollTop - self.__reachHeight;
      if(fixedScrollTop > absMaxScrollTop && absMaxScrollTop > 0){
        self.emit('loading',{
          hasMore: true
        })
        self.reachBottomActive = true
      }
    }
    // 是否需要监听滚动事件
    if(self.options.listenScroll){
      // 节流 只判断整数变化
      let isChangeX = self.__prevScrollLeft.toFixed() !== self.__scrollLeft.toFixed()
      let isChangeY = self.__prevScrollTop.toFixed() !== self.__scrollTop.toFixed()
      if(isChangeX || isChangeY){
        self.emit('scroll', {
          x: Math.floor(self.__scrollLeft),
          y: Math.floor(self.__scrollTop)
        })
      }
    }
  }
  /**
   * Recomputes scroll minimum values based on client dimensions and content dimensions.
   */
  __computeScrollMax(zoomLevel) {
    var self = this;
    if (zoomLevel == null) {
      zoomLevel = self.__zoomLevel;
    }
    self.__maxScrollLeft = Math.max((self.__contentWidth * zoomLevel) - self.__clientWidth, 0);
    self.__maxScrollTop = Math.max((self.__contentHeight * zoomLevel) - self.__clientHeight, 0) - self.__refreshHeight;

    // self.__maxScrollLeft = Math.max(self.__contentWidth - self.__clientWidth, 0);
    // self.__maxScrollTop = Math.max(self.__contentHeight - self.__clientHeight, 0) - self.__refreshHeight;
  }
  /*
  ---------------------------------------------------------------------------
    ANIMATION (DECELERATION) SUPPORT
  ---------------------------------------------------------------------------
  */
  // 开始进入减速模式
  __startDeceleration(timeStamp) {

    var self = this;

    // 是否分屏
    if (self.options.paging) {
      var scrollLeft = Math.max(Math.min(self.__scrollLeft, self.__maxScrollLeft), 0);
      var scrollTop = Math.max(Math.min(self.__scrollTop, self.__maxScrollTop), 0);
      var clientWidth = self.__clientWidth;
      var clientHeight = self.__clientHeight;

      // We limit deceleration not to the min/max values of the allowed range, but to the size of the visible client area.
      // Each page should have exactly the size of the client area.
      // 分屏模式下，应该将减速应用在当前可视区域的范围内，而不是整个页面
      self.__minDecelerationScrollLeft = Math.floor(scrollLeft / clientWidth) * clientWidth;
      self.__minDecelerationScrollTop = Math.floor(scrollTop / clientHeight) * clientHeight;
      self.__maxDecelerationScrollLeft = Math.ceil(scrollLeft / clientWidth) * clientWidth;
      self.__maxDecelerationScrollTop = Math.ceil(scrollTop / clientHeight) * clientHeight;
    } else {
      self.__minDecelerationScrollLeft = 0;
      self.__minDecelerationScrollTop = 0;
      self.__maxDecelerationScrollLeft = self.__maxScrollLeft;
      self.__maxDecelerationScrollTop = self.__maxScrollTop;
    }

    // Wrap class method
    var step = function(percent, now, render) {
      self.__stepThroughDeceleration(render);
    };

    // How much velocity is required to keep the deceleration running
    // 保持减速运行需要多少速度
    var minVelocityToKeepDecelerating = self.options.snapping ? 4 : 0.001;

    // Detect whether it's still worth to continue animating steps
    // If we are already slow enough to not being user perceivable anymore, we stop the whole process here.
    // 检测是否仍然值得继续动画步骤 如果我们已经慢到无法再被用户感知，我们就会在这里停止整个过程。
    var verify = function() {
      var isVelocityX = Math.abs(self.__decelerationVelocityX) >= minVelocityToKeepDecelerating;
      var isVelocityY = Math.abs(self.__decelerationVelocityY) >= minVelocityToKeepDecelerating;
      var shouldContinue = isVelocityX || isVelocityY;
      if (!shouldContinue) {
        self.__didDecelerationComplete = true;
      }
      return shouldContinue;
    };

    var completed = function(renderedFramesPerSecond, animationId, wasFinished) {
      self.__isDecelerating = false;
      if (self.__didDecelerationComplete) {
        self.options.scrollingComplete();
      }

      // Animate to grid when snapping is active, otherwise just fix out-of-boundary positions
      // 捕捉处于活动状态时动画到网格，否则只需固定超出边界的位置。
      self.scrollTo(self.__scrollLeft, self.__scrollTop, self.options.snapping);
    };

    // Start animation and switch on flag
    self.__isDecelerating = Animate.start(step, verify, completed);

  }

  // 调用每一步动画
  // 是否不呈现当前步骤，但只保留在内存中。仅供内部使用！
  __stepThroughDeceleration(render) {

    var self = this;
    // Add deceleration to scroll position
    // 计算下一个滚动位置 增加减速到滚动位置
    var scrollLeft = self.__scrollLeft + self.__decelerationVelocityX;
    var scrollTop = self.__scrollTop + self.__decelerationVelocityY;

    // HARD LIMIT SCROLL POSITION FOR NON BOUNCING MODE
    // 限制滚动为非弹跳模式
    if (!self.options.bouncing) {
      var scrollLeftFixed = Math.max(Math.min(self.__maxDecelerationScrollLeft, scrollLeft), self.__minDecelerationScrollLeft);
      if (scrollLeftFixed !== scrollLeft) {
        scrollLeft = scrollLeftFixed;
        self.__decelerationVelocityX = 0;
      }
      var scrollTopFixed = Math.max(Math.min(self.__maxDecelerationScrollTop, scrollTop), self.__minDecelerationScrollTop);
      if (scrollTopFixed !== scrollTop) {
        scrollTop = scrollTopFixed;
        self.__decelerationVelocityY = 0;
      }
    }

    // 记录上一个滚动位置
    self.__prevScrollLeft = self.__scrollLeft;
    self.__prevScrollTop = self.__scrollTop;

    // UPDATE SCROLL POSITION
    // 更新滚动位置
    if (render) {
      self.__publish(scrollLeft, scrollTop, self.__zoomLevel);
    } else {
      self.__scrollLeft = scrollLeft;
      self.__scrollTop = scrollTop;
    }

    // Slow down velocity on every iteration
    // 在每次迭代中减慢速度 模拟浏览器默认行为
    if (!self.options.paging) {
      // This is the factor applied to every iteration of the animation
      // to slow down the process. This should emulate natural behavior where
      // objects slow down when the initiator of the movement is removed
      // 以当前的减速比例进行递减
      var frictionFactor = self.__frictionFactor;
      self.__decelerationVelocityX *= frictionFactor;
      self.__decelerationVelocityY *= frictionFactor;
    }
    // BOUNCING SUPPORT
    // 回弹跳跃的支持
    if (self.options.bouncing) {
      var scrollOutsideX = 0;
      var scrollOutsideY = 0;
      // This configures the amount of change applied to deceleration/acceleration when reaching boundaries
      // 应用配置了到达边界时，应用于减速/加速的更改量
      var penetrationDeceleration = self.__penetrationDeceleration;
      var penetrationAcceleration = self.__penetrationAcceleration;
      // Check limits
      // 检查限制
      if (scrollLeft < self.__minDecelerationScrollLeft) {
        scrollOutsideX = self.__minDecelerationScrollLeft - scrollLeft;
      } else if (scrollLeft > self.__maxDecelerationScrollLeft) {
        scrollOutsideX = self.__maxDecelerationScrollLeft - scrollLeft;
      }

      if (scrollTop < self.__minDecelerationScrollTop) {
        scrollOutsideY = self.__minDecelerationScrollTop - scrollTop;
      } else if (scrollTop > self.__maxDecelerationScrollTop) {
        scrollOutsideY = self.__maxDecelerationScrollTop - scrollTop;
      }
      // console.log('scrollOutsideY',scrollOutsideY)
      // console.log('__isDragging',self.__isDragging)
      // console.log('__isDecelerating',self.__isDecelerating)
      // console.log('__isAnimating',self.__isAnimating)
      // console.log('__maxDecelerationScrollTop',self.__maxDecelerationScrollTop)
      // console.log('__decelerationVelocityX',self.__decelerationVelocityX)
      // Slow down until slow enough, then flip back to snap position
      // 慢下来，直到足够慢，然后翻转回弹
      if (scrollOutsideX !== 0) {
        if (scrollOutsideX * self.__decelerationVelocityX <= 0) {
          self.__decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
        } else {
          self.__decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
        }
      }
      if (scrollOutsideY !== 0) {
        if (scrollOutsideY * self.__decelerationVelocityY <= 0) {
          self.__decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
        } else {
          self.__decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
        }
      }
      // console.log('__decelerationVelocityY',self.__decelerationVelocityY)
      // console.log('__minDecelerationScrollTop',self.__minDecelerationScrollTop)
      // console.log('__maxDecelerationScrollTop',self.__maxDecelerationScrollTop)
    }
  }
}

export default Scroller
