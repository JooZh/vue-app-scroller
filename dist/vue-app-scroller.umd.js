/**
* vue-app-scroller v1.0.4
* https://github.com/JooZh/vue-app-scroller
* Released under the MIT License.
*/

(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.VueAppScroller = factory());
}(this, (function () { 'use strict';

var Animate = function (global) {
  var time = Date.now || function () {
    return +new Date();
  };
  var desiredFrames = 60;
  var millisecondsPerSecond = 1000;
  var running = {};
  var counter = 1;
  var animate = {
    requestAnimationFrame: function () {
      var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;
      var isNative = !!requestFrame;
      if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) {
        isNative = false;
      }
      if (isNative) {
        return function (callback, root) {
          requestFrame(callback, root);
        };
      }
      var TARGET_FPS = 60;
      var requests = {};
      var requestCount = 0;
      var rafHandle = 1;
      var intervalHandle = null;
      var lastActive = +new Date();

      return function (callback, root) {
        var callbackHandle = rafHandle++;

        requests[callbackHandle] = callback;
        requestCount++;

        if (intervalHandle === null) {
          intervalHandle = setInterval(function () {
            var time = +new Date();
            var currentRequests = requests;

            requests = {};
            requestCount = 0;
            for (var key in currentRequests) {
              if (currentRequests.hasOwnProperty(key)) {
                currentRequests[key](time);
                lastActive = time;
              }
            }

            if (time - lastActive > 2500) {
              clearInterval(intervalHandle);
              intervalHandle = null;
            }
          }, 1000 / TARGET_FPS);
        }
        return callbackHandle;
      };
    }(),
    stop: function stop(id) {
      var cleared = running[id] != null;
      if (cleared) {
        running[id] = null;
      }

      return cleared;
    },
    isRunning: function isRunning(id) {
      return running[id] != null;
    },
    start: function start(stepCallback, verifyCallback, completedCallback, duration, easingMethod, root) {
      var start = time();
      var lastFrame = start;
      var percent = 0;
      var dropCounter = 0;
      var id = counter++;

      if (!root) {
        root = document.body;
      }

      if (id % 20 === 0) {
        var newRunning = {};
        for (var usedId in running) {
          newRunning[usedId] = true;
        }
        running = newRunning;
      }

      var step = function step(virtual) {
        var render = virtual !== true;

        var now = time();

        if (!running[id] || verifyCallback && !verifyCallback(id)) {
          running[id] = null;
          completedCallback && completedCallback(desiredFrames - dropCounter / ((now - start) / millisecondsPerSecond), id, false);
          return;
        }

        if (render) {
          var droppedFrames = Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;
          for (var j = 0; j < Math.min(droppedFrames, 4); j++) {
            step(true);
            dropCounter++;
          }
        }

        if (duration) {
          percent = (now - start) / duration;
          if (percent > 1) {
            percent = 1;
          }
        }

        var value = easingMethod ? easingMethod(percent) : percent;
        if ((stepCallback(value, now, render) === false || percent === 1) && render) {
          running[id] = null;
          completedCallback && completedCallback(desiredFrames - dropCounter / ((now - start) / millisecondsPerSecond), id, percent === 1 || duration == null);
        } else if (render) {
          lastFrame = now;
          animate.requestAnimationFrame(step, root);
        }
      };

      running[id] = true;

      animate.requestAnimationFrame(step, root);

      return id;
    }
  };
  return animate;
}(window);

var Render = function Render(content) {
  var global = window;
  var docStyle = document.documentElement.style;
  var engine = void 0;
  if (global.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
    engine = 'presto';
  } else if ('MozAppearance' in docStyle) {
    engine = 'gecko';
  } else if ('WebkitAppearance' in docStyle) {
    engine = 'webkit';
  } else if (typeof navigator.cpuClass === 'string') {
    engine = 'trident';
  }
  var vendorPrefix = {
    trident: 'ms',
    gecko: 'Moz',
    webkit: 'Webkit',
    presto: 'O'
  }[engine];

  var helperElem = document.createElement("div");
  var undef = void 0;
  var perspectiveProperty = vendorPrefix + "Perspective";
  var transformProperty = vendorPrefix + "Transform";
  if (helperElem.style[perspectiveProperty] !== undef) {
    return function (left, top) {
      content.style[transformProperty] = 'translate3d(' + -left + 'px,' + -top + 'px,0)';
    };
  } else if (helperElem.style[transformProperty] !== undef) {
    return function (left, top) {
      content.style[transformProperty] = 'translate(' + -left + 'px,' + -top + 'px)';
    };
  } else {
    return function (left, top) {
      content.style.marginLeft = left ? -left + 'px' : '';
      content.style.marginTop = top ? -top + 'px' : '';
    };
  }
};

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scroller = function () {
  function Scroller(renderDom, options) {
    _classCallCheck(this, Scroller);

    this.NOOP = function () {
      console.log('s');
    };

    this.handles = {
      scroll: [],
      loading: [] };

    this.options = {
      listenScroll: false,
      isPullRefresh: false,
      isReachBottom: false,
      scrollingX: false,
      scrollingY: false,
      animating: true,
      animationDuration: 250,
      mousewheel: false,
      paging: false,
      snapping: false,
      snappingType: 'defalut',
      snappingSelect: 0,
      snappingListIndex: 0,
      bouncing: true,
      speedMultiplier: 1.5,
      scrollingComplete: this.NOOP,
      snappingComplete: this.NOOP,
      penetrationDeceleration: 0.03,
      penetrationAcceleration: 0.08 };

    for (var key in options) {
      this.options[key] = options[key];
    }

    this._initScrollAttr(renderDom);

    this._setSnapSize(this.options.snapping);

    this._initEventListener(this.container);
  }

  _createClass(Scroller, [{
    key: '_initEventListener',
    value: function _initEventListener(element) {
      var _this = this;

      this.enableScrollX = this.options.scrollingX;
      this.enableScrollY = this.options.scrollingY;

      var mousedown = false;

      element.addEventListener('touchstart', function (e) {
        if (!e.target.tagName.match(/input|textarea|select/i)) {
          _this.doTouchStart(e.touches, e.timeStamp);
        }
      });

      element.addEventListener('touchmove', function (e) {
        e.preventDefault();
        _this.doTouchMove(e.touches, e.timeStamp);
      });

      element.addEventListener('touchend', function (e) {
        _this.doTouchEnd(e.timeStamp);
      });

      element.addEventListener('mousedown', function (e) {
        if (!e.target.tagName.match(/input|textarea|select/i)) {
          _this.doTouchStart([{
            pageX: e.pageX,
            pageY: e.pageY
          }], e.timeStamp);
          mousedown = true;
        }
      });

      element.addEventListener('mousemove', function (e) {
        if (mousedown) {
          _this.doTouchMove([{
            pageX: e.pageX,
            pageY: e.pageY
          }], e.timeStamp);
          mousedown = true;
        }
      });

      element.addEventListener('mouseup', function (e) {
        if (mousedown) {
          _this.doTouchEnd(e.timeStamp);
          mousedown = false;
        }
      });

      if (this.options.mousewheel) {
        element.addEventListener('mousewheel', function (e) {
          _this.scrollY = _this.scrollY += e.deltaY;
          if (_this.scrollY > _this.maxHeightScrollY) {
            _this.scrollY = _this.maxHeightScrollY;
          }
          if (_this.scrollY < 0) {
            _this.scrollY = 0;
          }
          _this._publish(_this.scrollX, _this.scrollY, true);
        });
      }
    }
  }, {
    key: '_initScrollAttr',
    value: function _initScrollAttr(renderDom) {
      this.content = renderDom;
      this.container = renderDom.parentNode;
      this.render = Render(this.content);
      this.animate = Animate;
      this.scrollDirection = '';
      this.isTracking = false;
      this.completeDeceleration = false;
      this.isDragging = false;
      this.isDecelerating = false;
      this.isAnimating = false;
      this.enableScrollX = false;
      this.enableScrollY = false;
      this.refreshActive = false;
      this.reachBottomActive = false;
      this.snappingTypeInit = false;
      this.interruptedAnimation = true;

      this.refreshStartCallBack = null;
      this.refreshDeactivateCallBack = null;
      this.refreshActivateCallBack = null;
      this.scrollX = 0;
      this.scrollY = 0;
      this.minWidthScrollX = 0;
      this.minHeightScrollY = 0;
      this.maxWidthScrollX = 0;
      this.maxHeightScrollY = 0;
      this.prevScrollX = 0;
      this.prevScrollY = 0;

      this.scheduledX = 0;
      this.scheduledY = 0;
      this.lastTouchX = 0;
      this.lastTouchY = 0;
      this.decelerationVelocityX = 0;
      this.decelerationVelocityY = 0;

      this.refreshHeight = 0;
      this.loadingHeight = 0;
      this.contentWidth = 0;
      this.contentHeight = 0;
      this.containerWidth = 0;
      this.containerHeight = 0;
      this.snapWidth = 50;
      this.snapHeight = 50;

      this.minDecelerationScrollX = 0;
      this.minDecelerationScrollY = 0;
      this.maxDecelerationScrollX = 0;
      this.maxDecelerationScrollY = 0;
      this.lastTouchTime = null;
      this.positionsArray = null;
    }
  }, {
    key: '_setSnapSize',
    value: function _setSnapSize(snapping) {
      if (typeof snapping === 'number') {
        this.snapWidth = snapping;
        this.snapHeight = snapping;
      } else if (Array.isArray(snapping)) {
        this.snapWidth = snapping[0];
        this.snapHeight = snapping[1];
      }
    }
  }, {
    key: '_setDimensions',
    value: function _setDimensions() {
      var containerWidth = this.container.offsetWidth;
      var containerHeight = this.container.offsetHeight;
      var contentWidth = this.content.offsetWidth;
      var contentHeight = this.content.offsetHeight;

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

      var prevMaxScroll = this.maxHeightScrollY;
      var childrens = this.content.children;
      var maxScrollY = Math.max(this.contentHeight - this.containerHeight, 0);
      this.refreshHeight = this.options.isPullRefresh ? childrens[0].offsetHeight : 0;
      this.loadingHeight = this.options.isReachBottom ? childrens[childrens.length - 1].offsetHeight : 0;

      this.maxWidthScrollX = Math.max(this.contentWidth - this.containerWidth, 0);
      this.maxHeightScrollY = maxScrollY - this.refreshHeight;

      if (this.options.snappingType === 'select') {
        var itemCount = Math.round(this.containerHeight / this.snapHeight);
        this.minHeightScrollY = -this.snapHeight * Math.floor(itemCount / 2);
        this.maxHeightScrollY = this.minHeightScrollY + (childrens[1].children.length - 1) * this.snapHeight;

        if (!this.snappingTypeInit) {
          var top = this.minHeightScrollY + this.options.snappingSelect * this.snapHeight;
          this.scrollY = top;
          this.snappingTypeInit = true;
        }
      }

      if (this.options.isReachBottom) {
        if (prevMaxScroll !== this.maxHeightScrollY) {
          this.reachBottomActive = false;
        } else {
          if (this.maxHeightScrollY != 0) {
            this.emit('loading', {
              hasMore: false
            });
          }
        }
      }

      this._scrollTo(this.scrollX, this.scrollY, true);
    }
  }, {
    key: '_easeOutCubic',
    value: function _easeOutCubic(pos) {
      return Math.pow(pos - 1, 3) + 1;
    }
  }, {
    key: '_easeInOutCubic',
    value: function _easeInOutCubic(pos) {
      if ((pos /= 0.5) < 1) {
        return 0.5 * Math.pow(pos, 3);
      }
      return 0.5 * (Math.pow(pos - 2, 3) + 2);
    }
  }, {
    key: 'doTouchStart',
    value: function doTouchStart(touches, timeStamp) {
      this._isTouches(touches);
      this._isTouchesTime(timeStamp);

      this.isTracking = true;

      this.stopScroll();

      this.lastTouchX = touches[0].pageX;
      this.lastTouchY = touches[0].pageY;

      this.lastTouchTime = timeStamp;
    }
  }, {
    key: 'doTouchMove',
    value: function doTouchMove(touches, timeStamp) {
      this._isTouches(touches);
      this._isTouchesTime(timeStamp);
      if (!this.isTracking) {
        return;
      }

      var currentTouchX = touches[0].pageX;
      var currentTouchY = touches[0].pageY;

      this._doTouchMoveDirection(currentTouchX, currentTouchY);

      if (this.isDragging) {
        var moveX = currentTouchX - this.lastTouchX;
        var moveY = currentTouchY - this.lastTouchY;

        if (this.enableScrollX) {
          this._doTouchMoveActive(moveX, 'X');
        }

        if (this.enableScrollY) {
          this._doTouchMoveActive(moveY, 'Y');
        }

        if (this.positionsArray.length > 60) {
          this.positionsArray.splice(0, 30);
        }

        this.positionsArray.push(this.scrollX, this.scrollY, timeStamp);

        this._publish(this.scrollX, this.scrollY);
      } else {
        var minMoveDistance = 5;
        var distanceX = Math.abs(currentTouchX - this.lastTouchX);
        var distanceY = Math.abs(currentTouchY - this.lastTouchY);
        this.isDragging = distanceX >= minMoveDistance || distanceY >= minMoveDistance;

        if (this.isDragging) {
          this.interruptedAnimation = false;
        }
      }

      this.lastTouchX = currentTouchX;
      this.lastTouchY = currentTouchY;
      this.lastTouchTime = timeStamp;
    }
  }, {
    key: 'doTouchEnd',
    value: function doTouchEnd(timeStamp) {
      this._isTouchesTime(timeStamp);
      if (!this.isTracking) {
        return;
      }

      this.isTracking = false;

      if (this.isDragging) {
        this.isDragging = false;

        if (this.options.animating && timeStamp - this.lastTouchTime <= 100) {
          var isDeceleration = this._doTouchEndHasDeceleration();
          if (isDeceleration) {
            if (!this.refreshActive) {
              this._startDeceleration(timeStamp);
            }
          } else {
            this._scrollingComplete();
          }
        } else if (timeStamp - this.lastTouchTime > 100) {
          this._scrollingComplete();
        }
      }

      if (!this.isDecelerating) {
        if (this.refreshActive && this.refreshStartCallBack) {
          this._publish(this.scrollX, -this.refreshHeight, true);
          if (this.refreshStartCallBack) {
            this.refreshStartCallBack();
          }
        } else {
          if (this.interruptedAnimation || this.isDragging) {
            this._scrollingComplete();
          }
          if (this.scrollY > 0 || this.scrollX > 0) {
            this._scrollTo(this.scrollX, this.scrollY, true);
          } else {
            this._startDeceleration();
          }

          if (this.refreshActive) {
            this.refreshActive = false;
            if (this.refreshDeactivateCallBack) {
              this.refreshDeactivateCallBack();
            }
          }
        }
      }

      this.positionsArray.length = 0;
    }
  }, {
    key: '_isTouches',
    value: function _isTouches(touches) {
      if (touches.length == null) {
        throw new Error("Invalid touch list: " + touches);
      }
    }
  }, {
    key: '_isTouchesTime',
    value: function _isTouchesTime(timeStamp) {
      if (timeStamp instanceof Date) {
        timeStamp = timeStamp.valueOf();
      }
      if (typeof timeStamp !== "number") {
        throw new Error("Invalid timestamp value: " + timeStamp);
      }
    }
  }, {
    key: '_doTouchMoveActive',
    value: function _doTouchMoveActive(move, D) {
      this['scroll' + D] -= move * this.options.speedMultiplier;
      if (this['scroll' + D] > this['maxWidthScroll' + D] || this['scroll' + D] < 0) {
        if (this.options.bouncing) {
          this['scroll' + D] += move / 2 * this.options.speedMultiplier;
          D === 'Y' && this._doTouchMovePullRefresh();
        } else if (this['scroll' + D] > this['maxWidthScroll' + D]) {
          this['scroll' + D] = this['maxWidthScroll' + D];
        } else {
          this['scroll' + D] = 0;
        }
      }
    }
  }, {
    key: '_doTouchMovePullRefresh',
    value: function _doTouchMovePullRefresh() {
      if (this.refreshHeight != null) {
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
    }
  }, {
    key: '_doTouchMoveDirection',
    value: function _doTouchMoveDirection(currentX, currentY) {
      var X = currentX - this.lastTouchX;
      var Y = currentY - this.lastTouchY;
      if (X > 0 && Math.abs(X) > Math.abs(Y)) {
        this.scrollDirection = 'right';
      } else if (X < 0 && Math.abs(X) > Math.abs(Y)) {
        this.scrollDirection = 'left';
      } else if (Y > 0 && Math.abs(Y) > Math.abs(X)) {
        this.scrollDirection = 'down';
      } else if (Y < 0 && Math.abs(Y) > Math.abs(X)) {
        this.scrollDirection = 'up';
      }
    }
  }, {
    key: '_doTouchEndHasDeceleration',
    value: function _doTouchEndHasDeceleration() {
      var flag = false;

      var endPos = this.positionsArray.length - 1;
      var startPos = endPos;

      for (var i = endPos; i > 0 && this.positionsArray[i] > this.lastTouchTime - 100; i -= 3) {
        startPos = i;
      }

      if (startPos !== endPos) {
        var timeOffset = this.positionsArray[endPos] - this.positionsArray[startPos];
        var movedX = this.scrollX - this.positionsArray[startPos - 2];
        var movedY = this.scrollY - this.positionsArray[startPos - 1];

        this.decelerationVelocityX = movedX / timeOffset * (1000 / 60);
        this.decelerationVelocityY = movedY / timeOffset * (1000 / 60);

        var minVelocityToStartDeceleration = this.options.paging || this.options.snapping ? 4 : 1;

        var isVelocityX = Math.abs(this.decelerationVelocityX) > minVelocityToStartDeceleration;
        var isVelocityY = Math.abs(this.decelerationVelocityY) > minVelocityToStartDeceleration;
        if (isVelocityX || isVelocityY) {
          flag = true;
        }
      }
      return flag;
    }
  }, {
    key: 'refresh',
    value: function refresh() {
      this._setDimensions();
    }
  }, {
    key: 'publish',
    value: function publish(left, top, animate) {
      this._publish(left, top, animate);
    }
  }, {
    key: 'scrollTo',
    value: function scrollTo(left, top, animate) {
      this._scrollTo(left, top, animate);
    }
  }, {
    key: 'scrollBy',
    value: function scrollBy(left, top, animate) {
      this._scrollBy(left, top, animate);
    }
  }, {
    key: 'getAttr',
    value: function getAttr(key) {
      var publicAttr = ['scrollDirection', 'enableScrollX', 'enableScrollY', 'minWidthScrollX', 'minHeightScrollY', 'maxWidthScrollX', 'maxHeightScrollY'];
      if (publicAttr.indexOf(key) !== -1) {
        return this[key];
      } else {
        throw new Error('can not get attr name "key" ');
      }
    }
  }, {
    key: 'setAttr',
    value: function setAttr(key, value) {
      var publicAttr = ['enableScrollX', 'enableScrollY'];
      if (publicAttr.indexOf(key) !== -1) {
        this[key] = value;
      } else {
        throw new Error('can not set attr name "key" ');
      }
    }
  }, {
    key: 'stopScroll',
    value: function stopScroll() {
      if (this.isDecelerating) {
        this.animate.stop(this.isDecelerating);
        this.isDecelerating = false;
        this.interruptedAnimation = true;
      }

      if (this.isAnimating) {
        this.animate.stop(this.isAnimating);
        this.isAnimating = false;
        this.interruptedAnimation = true;
      }

      this.interruptedAnimation = true;

      this.completeDeceleration = false;

      this.positionsArray = [];
    }
  }, {
    key: 'activatePullToRefresh',
    value: function activatePullToRefresh(activateCallback, deactivateCallback, startCallback) {
      this.refreshActivateCallBack = activateCallback;
      this.refreshDeactivateCallBack = deactivateCallback;
      this.refreshStartCallBack = startCallback;
    }
  }, {
    key: 'finishPullToRefresh',
    value: function finishPullToRefresh() {
      this.refreshActive = false;
      if (this.refreshDeactivateCallBack) {
        this.refreshDeactivateCallBack();
      }
      this._scrollTo(this.scrollX, this.scrollY, true);
    }
  }, {
    key: 'on',
    value: function on(eventType, handle) {
      if (!this.handles.hasOwnProperty(eventType)) {
        this.handles[eventType] = [];
      }
      if (typeof handle == 'function') {
        this.handles[eventType].push(handle);
      } else {
        throw new Error('Missing callback function');
      }
    }
  }, {
    key: 'emit',
    value: function emit(eventType) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (this.handles.hasOwnProperty(eventType)) {
        this.handles[eventType].forEach(function (item, key, arr) {
          item.apply(null, args);
        });
      } else {
        throw new Error('"' + eventType + '"Event not registered');
      }
    }
  }, {
    key: '_scrollTo',
    value: function _scrollTo(left, top, animate) {
      if (this.isDecelerating) {
        this.animate.stop(this.isDecelerating);
        this.isDecelerating = false;
      }
      if (!this.options.scrollingX) {
        left = this.scrollX;
      } else {
        if (this.options.paging) {
          left = Math.round(left / this.containerWidth) * this.containerWidth;
        } else if (this.options.snapping) {
          left = Math.round(left / this.snapWidth) * this.snapWidth;
        }
      }
      if (!this.options.scrollingY) {
        top = this.scrollY;
      } else {
        if (this.options.paging) {
          top = Math.round(top / this.containerHeight) * this.containerHeight;
        } else if (this.options.snapping) {
          top = Math.round(top / this.snapHeight) * this.snapHeight;
        }
      }

      if (this.options.snappingType === 'select') {
        left = Math.max(Math.min(this.maxWidthScrollX, left), this.minWidthScrollX);
        top = Math.max(Math.min(this.maxHeightScrollY, top), this.minHeightScrollY);
      } else if (this.options.snappingType === 'default') {
        left = Math.max(Math.min(this.maxWidthScrollX, left), 0);
        top = Math.max(Math.min(this.maxHeightScrollY, top), 0);
      }

      if (left === this.scrollX && top === this.scrollY) {
        animate = false;
      }

      if (!this.isTracking) {
        this._publish(left, top, animate);
      }
    }
  }, {
    key: '_scrollToElement',
    value: function _scrollToElement() {}
  }, {
    key: '_scrollBy',
    value: function _scrollBy(left, top, animate) {
      var startLeft = this.isAnimating ? this.scheduledX : this.scrollX;
      var startTop = this.isAnimating ? this.scheduledY : this.scrollY;
      this._scrollTo(startLeft + (left || 0), startTop + (top || 0), animate);
    }
  }, {
    key: '_publish',
    value: function _publish(left, top, animate) {
      var _this2 = this;

      var wasAnimating = this.isAnimating;
      if (wasAnimating) {
        this.animate.stop(wasAnimating);
        this.isAnimating = false;
        this.interruptedAnimation = true;
      }

      if (animate && this.options.animating) {
        this.scheduledX = left;
        this.scheduledY = top;
        var oldLeft = this.scrollX;
        var oldTop = this.scrollY;
        var diffLeft = left - oldLeft;
        var diffTop = top - oldTop;
        var step = function step(percent, now, render) {
          if (render) {
            _this2.scrollX = oldLeft + diffLeft * percent;
            _this2.scrollY = oldTop + diffTop * percent;

            if (_this2.render) {
              _this2.render(_this2.scrollX, _this2.scrollY);
            }
          }
        };
        var verify = function verify(id) {
          return _this2.isAnimating === id;
        };
        var completed = function completed(renderedFramesPerSecond, animationId, wasFinished) {
          if (animationId === _this2.isAnimating) {
            _this2.isAnimating = false;
          }
          if (_this2.completeDeceleration || wasFinished) {
            _this2._scrollingComplete();
            _this2._snappingComplete();
          }
        };

        var animatType = wasAnimating ? this._easeOutCubic : this._easeInOutCubic;
        this.isAnimating = this.animate.start(step, verify, completed, this.options.animationDuration, animatType);
      } else {
        this.scheduledX = this.scrollX = left;
        this.scheduledY = this.scrollY = top;

        if (this.render) {
          this.render(left, top);
        }
      }

      if (this.options.isReachBottom && !this.reachBottomActive) {
        var scrollYn = Number(this.scrollY.toFixed());
        var absMaxScrollYn = this.maxHeightScrollY - this.loadingHeight;
        if (scrollYn > absMaxScrollYn && absMaxScrollYn > 0) {
          this.emit('loading', {
            hasMore: true
          });
          this.reachBottomActive = true;
        }
      }

      if (this.options.listenScroll) {
        var isChangeX = this.prevScrollX.toFixed() !== this.scrollX.toFixed();
        var isChangeY = this.prevScrollY.toFixed() !== this.scrollY.toFixed();
        if (isChangeX || isChangeY) {
          this.emit('scroll', {
            x: Math.floor(this.scrollX),
            y: Math.floor(this.scrollY)
          });
        }
      }
    }
  }, {
    key: '_scrollingComplete',
    value: function _scrollingComplete() {
      this.options.scrollingComplete();
    }
  }, {
    key: '_snappingComplete',
    value: function _snappingComplete() {
      if (this.options.snappingType === 'select') {
        var select = this._getSelectValue();
        this.options.snappingComplete(select);
      }
    }
  }, {
    key: '_getSelectValue',
    value: function _getSelectValue() {
      var minScrollY = Math.abs(this.minHeightScrollY);
      var scrollY = this.scrollY < 0 ? minScrollY - Math.abs(this.scrollY) : minScrollY + Math.abs(this.scrollY);
      var num = scrollY / this.snapHeight;
      return {
        listIndex: this.options.snappingListIndex,
        selectIndex: Math.floor(num)
      };
    }
  }, {
    key: '_startDeceleration',
    value: function _startDeceleration() {
      var _this3 = this;

      if (this.options.paging) {
        var scrollX = Math.max(Math.min(this.scrollX, this.maxWidthScrollX), 0);
        var scrollY = Math.max(Math.min(this.scrollY, this.maxHeightScrollY), 0);

        this.minDecelerationScrollX = Math.floor(scrollX / this.containerWidth) * this.containerWidth;
        this.minDecelerationScrollY = Math.floor(scrollY / this.containerHeight) * this.containerHeight;
        this.maxDecelerationScrollX = Math.ceil(scrollX / this.containerWidth) * this.containerWidth;
        this.maxDecelerationScrollY = Math.ceil(scrollY / this.containerHeight) * this.containerHeight;
      } else {
        this.minDecelerationScrollX = 0;
        this.minDecelerationScrollY = 0;
        this.maxDecelerationScrollX = this.maxWidthScrollX;
        this.maxDecelerationScrollY = this.maxHeightScrollY;
      }

      var step = function step(percent, now, render) {
        _this3._stepThroughDeceleration(render);
      };

      var minVelocityToKeepDecelerating = this.options.snapping ? 3 : 0.02;

      var verify = function verify() {
        var shouldContinue = Math.abs(_this3.decelerationVelocityX) >= minVelocityToKeepDecelerating || Math.abs(_this3.decelerationVelocityY) >= minVelocityToKeepDecelerating;
        if (!shouldContinue) {
          _this3.completeDeceleration = true;
        }
        return shouldContinue;
      };

      var completed = function completed(renderedFramesPerSecond, animationId, wasFinished) {
        _this3.isDecelerating = false;
        if (_this3.completeDeceleration) {
          _this3._scrollingComplete();
        }

        _this3._scrollTo(_this3.scrollX, _this3.scrollY, _this3.options.snapping);
      };

      this.isDecelerating = this.animate.start(step, verify, completed);
    }
  }, {
    key: '_stepThroughDeceleration',
    value: function _stepThroughDeceleration(render) {
      var scrollX = this.scrollX + this.decelerationVelocityX;
      var scrollY = this.scrollY + this.decelerationVelocityY;

      if (!this.options.bouncing) {
        var scrollLeftFixed = Math.max(Math.min(this.maxDecelerationScrollX, scrollX), this.minDecelerationScrollX);
        if (scrollLeftFixed !== scrollX) {
          scrollX = scrollLeftFixed;
          this.decelerationVelocityX = 0;
        }
        var scrollTopFixed = Math.max(Math.min(this.maxDecelerationScrollY, scrollY), this.minDecelerationScrollY);
        if (scrollTopFixed !== scrollY) {
          scrollY = scrollTopFixed;
          this.decelerationVelocityY = 0;
        }
      }

      this.prevScrollX = this.scrollX;
      this.prevScrollY = this.scrollY;

      if (render) {
        this._publish(scrollX, scrollY);
      } else {
        this.scrollX = scrollX;
        this.scrollY = scrollY;
      }

      if (!this.options.paging) {
        var frictionFactor = 0.95;
        this.decelerationVelocityX *= frictionFactor;
        this.decelerationVelocityY *= frictionFactor;
      }

      if (this.options.bouncing) {
        var scrollOutsideX = 0;
        var scrollOutsideY = 0;

        var penetrationDeceleration = this.options.penetrationDeceleration;
        var penetrationAcceleration = this.options.penetrationAcceleration;

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
  }]);

  return Scroller;
}();

return Scroller;

})));
