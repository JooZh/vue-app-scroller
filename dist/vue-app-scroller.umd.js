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
      speedMultiplier: 1,
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
    value: function _initEventListener(el) {
      var m = this;

      m.enableScrollX = m.options.scrollingX;
      m.enableScrollY = m.options.scrollingY;

      var mousedown = false;

      el.addEventListener('touchstart', function (e) {
        if (!e.target.tagName.match(/input|textarea|select/i)) {
          m.doTouchStart(e.touches, e.timeStamp);
        }
      });

      el.addEventListener('touchmove', function (e) {
        e.preventDefault();
        m.doTouchMove(e.touches, e.timeStamp);
      });

      el.addEventListener('touchend', function (e) {
        m.doTouchEnd(e.timeStamp);
      });

      el.addEventListener('mousedown', function (e) {
        if (!e.target.tagName.match(/input|textarea|select/i)) {
          m.doTouchStart([{
            pageX: e.pageX,
            pageY: e.pageY
          }], e.timeStamp);
          mousedown = true;
        }
      });

      el.addEventListener('mousemove', function (e) {
        if (mousedown) {
          m.doTouchMove([{
            pageX: e.pageX,
            pageY: e.pageY
          }], e.timeStamp);
          mousedown = true;
        }
      });

      el.addEventListener('mouseup', function (e) {
        if (mousedown) {
          m.doTouchEnd(e.timeStamp);
          mousedown = false;
        }
      });

      if (m.options.mousewheel) {
        el.addEventListener('mousewheel', function (e) {
          m.scrollY = m.scrollY += e.deltaY;
          if (m.scrollY > m.maxScrollY) {
            m.scrollY = m.maxScrollY;
          }
          if (m.scrollY < 0) {
            m.scrollY = 0;
          }
          m._publish(m.scrollX, m.scrollY, true);
        });
      }
    }
  }, {
    key: '_initScrollAttr',
    value: function _initScrollAttr(renderDom) {
      var m = this;

      m.content = renderDom;
      m.container = renderDom.parentNode;
      m.render = Render(m.content);
      m.animate = Animate;
      m.scrollDirection = '';
      m.isTracking = false;
      m.completeDeceleration = false;
      m.isDragging = false;
      m.isDecelerating = false;
      m.isAnimating = false;
      m.enableScrollX = false;
      m.enableScrollY = false;
      m.refreshActive = false;
      m.reachBottomActive = false;
      m.snappingTypeInit = false;
      m.interruptedAnimation = true;

      m.refreshStartCallBack = null;
      m.refreshDeactivateCallBack = null;
      m.refreshActivateCallBack = null;
      m.scrollX = 0;
      m.scrollY = 0;
      m.minScrollX = 0;
      m.minScrollY = 0;
      m.maxScrollX = 0;
      m.maxScrollY = 0;
      m.prevScrollX = 0;
      m.prevScrollY = 0;

      m.scheduledX = 0;
      m.scheduledY = 0;
      m.lastTouchX = 0;
      m.lastTouchY = 0;
      m.decelerationVelocityX = 0;
      m.decelerationVelocityY = 0;

      m.refreshHeight = 0;
      m.loadingHeight = 0;
      m.contentWidth = 0;
      m.contentHeight = 0;
      m.containerWidth = 0;
      m.containerHeight = 0;
      m.snapWidth = 50;
      m.snapHeight = 50;

      m.minDecelerationScrollX = 0;
      m.minDecelerationScrollY = 0;
      m.maxDecelerationScrollX = 0;
      m.maxDecelerationScrollY = 0;
      m.lastTouchTime = null;
      m.positionsArray = null;
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
      var m = this;
      var containerWidth = m.container.offsetWidth;
      var containerHeight = m.container.offsetHeight;
      var contentWidth = m.content.offsetWidth;
      var contentHeight = m.content.offsetHeight;

      if (containerWidth === +containerWidth) {
        m.containerWidth = containerWidth;
      }
      if (containerHeight === +containerHeight) {
        m.containerHeight = containerHeight;
      }
      if (contentWidth === +contentWidth) {
        m.contentWidth = contentWidth;
      }
      if (contentHeight === +contentHeight) {
        m.contentHeight = contentHeight;
      }

      var prevMaxScroll = m.maxScrollY;
      var childrens = m.content.children;
      var maxScrollY = Math.max(m.contentHeight - m.containerHeight, 0);
      m.refreshHeight = m.options.isPullRefresh ? childrens[0].offsetHeight : 0;
      m.loadingHeight = m.options.isReachBottom ? childrens[childrens.length - 1].offsetHeight : 0;

      m.maxScrollX = Math.max(m.contentWidth - m.containerWidth, 0);
      m.maxScrollY = maxScrollY - m.refreshHeight;

      if (m.options.snappingType === 'select') {
        var itemCount = Math.round(m.containerHeight / m.snapHeight);
        m.minScrollY = -m.snapHeight * Math.floor(itemCount / 2);
        m.maxScrollY = m.minScrollY + (childrens[1].children.length - 1) * m.snapHeight;

        if (!m.snappingTypeInit) {
          var top = m.minScrollY + m.options.snappingSelect * m.snapHeight;
          m.scrollY = top;
          m.snappingTypeInit = true;
        }
      }

      if (m.options.isReachBottom) {
        if (prevMaxScroll !== m.maxScrollY) {
          m.reachBottomActive = false;
        } else {
          if (m.maxScrollY != 0) {
            m.emit('loading', {
              hasMore: false
            });
          }
        }
      }

      m._scrollTo(m.scrollX, m.scrollY, true);
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
      var m = this;
      m._isTouchesTime(timeStamp);
      if (!m.isTracking) {
        return;
      }

      m.isTracking = false;

      if (m.isDragging) {
        m.isDragging = false;

        if (m.options.animating && timeStamp - m.lastTouchTime <= 200) {
          var isDeceleration = m._doTouchEndHasDeceleration();
          if (isDeceleration) {
            if (!m.refreshActive) {
              m._startDeceleration(timeStamp);
            }
          } else {
            m._scrollingComplete();
          }
        } else if (timeStamp - m.lastTouchTime > 200) {
          m._scrollingComplete();
        }
      }

      if (!m.isDecelerating) {
        if (m.refreshActive && m.refreshStartCallBack) {
          m._publish(m.scrollX, -m.refreshHeight, true);
          if (m.refreshStartCallBack) {
            m.refreshStartCallBack();
          }
        } else {
          if (m.interruptedAnimation || m.isDragging) {
            m._scrollingComplete();
          }
          if (m.scrollY > 0 || m.scrollX > 0) {
            m._scrollTo(m.scrollX, m.scrollY, true);
          } else {
            m._startDeceleration();
          }

          if (m.refreshActive) {
            m.refreshActive = false;
            if (m.refreshDeactivateCallBack) {
              m.refreshDeactivateCallBack();
            }
          }
        }
      }

      m.positionsArray.length = 0;
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
      var scroll = 'scroll' + D;
      var maxScroll = 'maxScroll' + D;
      this[scroll] -= move * this.options.speedMultiplier;
      if (this[scroll] > this[maxScroll] || this[scroll] < 0) {
        if (this.options.bouncing) {
          this[scroll] += move / 1.5 * this.options.speedMultiplier;
          D === 'Y' && this._doTouchMovePullRefresh();
        } else if (this[scroll] > this[maxScroll]) {
          this[scroll] = this[maxScroll];
        } else {
          this[scroll] = 0;
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
      var publicAttr = ['scrollDirection', 'enableScrollX', 'enableScrollY', 'minScrollX', 'minScrollY', 'maxScrollX', 'maxScrollY'];
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
      var m = this;

      if (m.isDecelerating) {
        m.animate.stop(m.isDecelerating);
        m.isDecelerating = false;
      }
      if (!m.options.scrollingX) {
        left = m.scrollX;
      } else {
        if (m.options.paging) {
          left = Math.round(left / m.containerWidth) * m.containerWidth;
        } else if (m.options.snapping) {
          left = Math.round(left / m.snapWidth) * m.snapWidth;
        }
      }
      if (!m.options.scrollingY) {
        top = m.scrollY;
      } else {
        if (m.options.paging) {
          top = Math.round(top / m.containerHeight) * m.containerHeight;
        } else if (m.options.snapping) {
          top = Math.round(top / m.snapHeight) * m.snapHeight;
        }
      }

      if (m.options.snappingType === 'select') {
        left = Math.max(Math.min(m.maxScrollX, left), m.minScrollX);
        top = Math.max(Math.min(m.maxScrollY, top), m.minScrollY);
      } else if (m.options.snappingType === 'default') {
        left = Math.max(Math.min(m.maxScrollX, left), 0);
        top = Math.max(Math.min(m.maxScrollY, top), 0);
      }

      if (left === m.scrollX && top === m.scrollY) {
        animate = false;
      }

      if (!m.isTracking) {
        m._publish(left, top, animate);
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
      var m = this;

      var wasAnimating = m.isAnimating;
      if (wasAnimating) {
        m.animate.stop(wasAnimating);
        m.isAnimating = false;
        m.interruptedAnimation = true;
      }

      if (animate && m.options.animating) {
        m.scheduledX = left;
        m.scheduledY = top;
        var oldLeft = m.scrollX;
        var oldTop = m.scrollY;
        var diffLeft = left - oldLeft;
        var diffTop = top - oldTop;
        var step = function step(percent, now, render) {
          if (render) {
            m.scrollX = oldLeft + diffLeft * percent;
            m.scrollY = oldTop + diffTop * percent;

            if (m.render) {
              m.render(m.scrollX, m.scrollY);
            }
          }
        };
        var verify = function verify(id) {
          return m.isAnimating === id;
        };
        var completed = function completed(renderedFramesPerSecond, animationId, wasFinished) {
          if (animationId === m.isAnimating) {
            m.isAnimating = false;
          }
          if (m.completeDeceleration || wasFinished) {
            m._scrollingComplete();
            m._snappingComplete();
          }
        };

        var animatType = wasAnimating ? m._easeOutCubic : m._easeInOutCubic;
        m.isAnimating = m.animate.start(step, verify, completed, m.options.animationDuration, animatType);
      } else {
        m.scheduledX = m.scrollX = left;
        m.scheduledY = m.scrollY = top;

        if (m.render) {
          m.render(left, top);
        }
      }

      if (m.options.isReachBottom && !m.reachBottomActive) {
        var scrollYn = Number(m.scrollY.toFixed());
        var absMaxScrollYn = m.maxScrollY - m.loadingHeight;
        if (scrollYn > absMaxScrollYn && absMaxScrollYn > 0) {
          m.emit('loading', {
            hasMore: true
          });
          m.reachBottomActive = true;
        }
      }

      if (m.options.listenScroll) {
        var isChangeX = m.prevScrollX.toFixed() !== m.scrollX.toFixed();
        var isChangeY = m.prevScrollY.toFixed() !== m.scrollY.toFixed();
        if (isChangeX || isChangeY) {
          m.emit('scroll', {
            x: Math.floor(m.scrollX),
            y: Math.floor(m.scrollY)
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
      var minScrollY = Math.abs(this.minScrollY);
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
      var m = this;

      if (m.options.paging) {
        var scrollX = Math.max(Math.min(m.scrollX, m.maxScrollX), 0);
        var scrollY = Math.max(Math.min(m.scrollY, m.maxScrollY), 0);

        m.minDecelerationScrollX = Math.floor(scrollX / m.containerWidth) * m.containerWidth;
        m.minDecelerationScrollY = Math.floor(scrollY / m.containerHeight) * m.containerHeight;
        m.maxDecelerationScrollX = Math.ceil(scrollX / m.containerWidth) * m.containerWidth;
        m.maxDecelerationScrollY = Math.ceil(scrollY / m.containerHeight) * m.containerHeight;
      } else {
        m.minDecelerationScrollX = 0;
        m.minDecelerationScrollY = 0;
        m.maxDecelerationScrollX = m.maxScrollX;
        m.maxDecelerationScrollY = m.maxScrollY;
      }

      var step = function step(percent, now, render) {
        m._stepThroughDeceleration(render);
      };

      var minVelocityToKeepDecelerating = m.options.snapping ? 3 : 0.02;

      var verify = function verify() {
        var shouldContinue = Math.abs(m.decelerationVelocityX) >= minVelocityToKeepDecelerating || Math.abs(m.decelerationVelocityY) >= minVelocityToKeepDecelerating;
        if (!shouldContinue) {
          m.completeDeceleration = true;
        }
        return shouldContinue;
      };

      var completed = function completed(renderedFramesPerSecond, animationId, wasFinished) {
        m.isDecelerating = false;
        if (m.completeDeceleration) {
          m._scrollingComplete();
        }

        m._scrollTo(m.scrollX, m.scrollY, m.options.snapping);
      };

      m.isDecelerating = m.animate.start(step, verify, completed);
    }
  }, {
    key: '_stepThroughDeceleration',
    value: function _stepThroughDeceleration(render) {
      var m = this;

      var scrollX = m.scrollX + m.decelerationVelocityX;
      var scrollY = m.scrollY + m.decelerationVelocityY;

      if (!m.options.bouncing) {
        var scrollLeftFixed = Math.max(Math.min(m.maxDecelerationScrollX, scrollX), m.minDecelerationScrollX);
        if (scrollLeftFixed !== scrollX) {
          scrollX = scrollLeftFixed;
          m.decelerationVelocityX = 0;
        }
        var scrollTopFixed = Math.max(Math.min(m.maxDecelerationScrollY, scrollY), m.minDecelerationScrollY);
        if (scrollTopFixed !== scrollY) {
          scrollY = scrollTopFixed;
          m.decelerationVelocityY = 0;
        }
      }

      m.prevScrollX = m.scrollX;
      m.prevScrollY = m.scrollY;

      if (render) {
        m._publish(scrollX, scrollY);
      } else {
        m.scrollX = scrollX;
        m.scrollY = scrollY;
      }

      if (!m.options.paging) {
        var frictionFactor = 0.975;
        m.decelerationVelocityX *= frictionFactor;
        m.decelerationVelocityY *= frictionFactor;
      }

      if (m.options.bouncing) {
        var scrollOutsideX = 0;
        var scrollOutsideY = 0;

        var penetrationDeceleration = m.options.penetrationDeceleration;
        var penetrationAcceleration = m.options.penetrationAcceleration;

        if (scrollX < m.minDecelerationScrollX) {
          scrollOutsideX = m.minDecelerationScrollX - scrollX;
        } else if (scrollX > m.maxDecelerationScrollX) {
          scrollOutsideX = m.maxDecelerationScrollX - scrollX;
        }
        if (scrollY < m.minDecelerationScrollY) {
          scrollOutsideY = m.minDecelerationScrollY - scrollY;
        } else if (scrollY > m.maxDecelerationScrollY) {
          scrollOutsideY = m.maxDecelerationScrollY - scrollY;
        }

        if (scrollOutsideX !== 0) {
          if (scrollOutsideX * m.decelerationVelocityX <= 0) {
            m.decelerationVelocityX += scrollOutsideX * penetrationDeceleration;
          } else {
            m.decelerationVelocityX = scrollOutsideX * penetrationAcceleration;
          }
        }
        if (scrollOutsideY !== 0) {
          if (scrollOutsideY * m.decelerationVelocityY <= 0) {
            m.decelerationVelocityY += scrollOutsideY * penetrationDeceleration;
          } else {
            m.decelerationVelocityY = scrollOutsideY * penetrationAcceleration;
          }
        }
      }
    }
  }]);

  return Scroller;
}();

return Scroller;

})));
