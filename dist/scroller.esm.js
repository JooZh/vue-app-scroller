/**
* vue-app-scroller v1.0.6
* https://github.com/JooZh/vue-app-scroller
* Released under the MIT License.
*/

var Animate = function (global) {
  var time = Date.now || function () {
    return +new Date();
  };
  var desiredFrames = 60;
  var millisecondsPerSecond = 1000;
  var running = {};
  var counter = 1;
  var animate = {
    requestAnimationFrame: function requestAnimationFrame(callback) {
      var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;

      requestFrame(callback);
    },
    stop: function stop(id) {
      var stop = running[id] != null;
      if (stop) {
        running[id] = null;
      }
      return stop;
    },
    isRunning: function isRunning(id) {
      return running[id] != null;
    },
    start: function start(stepCb, verifyCb, completedCb, duration, easingMethod) {
      var start = time();
      var lastFrame = start;
      var percent = 0;
      var dropCounter = 0;
      var id = counter++;
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

        if (!running[id] || verifyCb && !verifyCb(id)) {
          running[id] = null;
          var renderedFramesPerSecond = 60 - dropCounter / ((now - start) / 1000);
          completedCb && completedCb(renderedFramesPerSecond, id, false);
          return;
        }

        if (render) {
          var droppedFrames = Math.round((now - lastFrame) / (1000 / 60)) - 1;
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

        if ((stepCb(value, now, render) === false || percent === 1) && render) {
          running[id] = null;
          var _renderedFramesPerSecond = 60 - dropCounter / ((now - start) / 1000);
          completedCb && completedCb(_renderedFramesPerSecond, id, percent === 1 || duration == null);
        } else if (render) {
          lastFrame = now;
          animate.requestAnimationFrame(step);
        }
      };

      running[id] = true;

      animate.requestAnimationFrame(step);

      return id;
    }
  };
  return animate;
}(window);

function publicApi(self) {
  return {
    refresh: function refresh() {
      self._setDimensions();
    },
    publish: function publish(left, top, animate) {
      self._publish(left, top, animate);
    },
    scrollTo: function scrollTo(left, top, animate) {
      self._scrollTo(left, top, animate);
    },
    scrollBy: function scrollBy(left, top, animate) {
      self._scrollBy(left, top, animate);
    },
    stopScroll: function stopScroll() {
      self._stopScroll();
    },
    getAttr: function getAttr(key) {
      var publicAttr = ['scrollDirection', 'enableScrollX', 'enableScrollY', 'minScrollX', 'minScrollY', 'maxScrollX', 'maxScrollY'];
      if (publicAttr.indexOf(key) !== -1) {
        return self[key];
      } else {
        throw new Error('can not get attr name "key" ');
      }
    },
    setAttr: function setAttr(key, value) {
      var publicAttr = ['enableScrollX', 'enableScrollY'];
      if (publicAttr.indexOf(key) !== -1) {
        self[key] = value;
      } else {
        throw new Error('can not set attr name "key" ');
      }
    }
  };
}

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

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Scroller = function () {
  function Scroller(selector, options) {
    _classCallCheck(this, Scroller);

    var m = this;
    m.w = window;

    m._NOOP = function () {};

    m._handles = {
      scroll: [],
      loading: [] };

    m.ops = {
      listenScroll: false,
      isPullRefresh: false,
      isReachBottom: false,
      scrollingX: false,
      scrollingY: false,
      animating: true,
      animationDuration: 250,
      mousewheel: false,
      paging: false,
      snap: false,
      snapAlign: 'top',
      snapSelect: 0,
      snapListIndex: 0,
      bouncing: true,
      speedRatio: 1,
      scrollingComplete: m._NOOP,
      snapComplete: m._NOOP,
      peneDece: 0.07,
      peneAcce: 0.08 };

    for (var key in options) {
      m.ops[key] = options[key];
    }

    m._initPublicApi();

    m._initAttr(selector);

    m._initSnapSize(m.ops.snap);

    m._initEvent();
  }

  _createClass(Scroller, [{
    key: '_initSelector',
    value: function _initSelector(selector) {
      var m = this;
      var dom = null;
      if (typeof selector === 'string') {
        dom = document.querySelector(selector);
      } else if ((typeof selector === 'undefined' ? 'undefined' : _typeof(selector)) === 'object' && selector.nodeType === 1) {
        dom = selector;
      }

      var MutationObserver = m.w.MutationObserver || m.w.WebKitMutationObserver || m.w.MozMutationObserver;
      var observerMutationSupport = !!MutationObserver;
      if (observerMutationSupport) {
        var observer = new MutationObserver(function (mutations) {
          var length = mutations.length - 1;
          mutations.forEach(function (item, index) {
            if (m.ops.snap) {
              m.refresh();
            } else {
              if (length === index) {
                var timer = setTimeout(function () {
                  m.refresh();
                  clearTimeout(timer);
                }, 30);
              }
            }
          });
        });
        observer.observe(dom.children[1], {
          "childList": true,
          "subtree": true });
      }
      return dom;
    }
  }, {
    key: '_initAttr',
    value: function _initAttr(selector) {
      var m = this;
      var dom = m._initSelector(selector);

      m._render = Render(dom);
      m._content = dom;
      m._container = dom.parentNode;
      m._animate = Animate;
      m.scrollDirection = '';
      m._isTracking = false;
      m.completeDeceleration = false;
      m._isDragging = false;
      m._isDecelerating = false;
      m._isAnimating = false;
      m.enableScrollX = false;
      m.enableScrollY = false;
      m._refreshActive = false;
      m._reachActive = false;
      m.snapAlignInit = false;
      m._interrupted = true;

      m._refreshStartCb = null;
      m._refreshCancelCb = null;
      m._refreshActiveCb = null;
      m.scrollX = 0;
      m.scrollY = 0;
      m.minScrollX = 0;
      m.minScrollY = 0;
      m.maxScrollX = 0;
      m.maxScrollY = 0;
      m._prevScrollX = 0;
      m._prevScrollY = 0;

      m._scheduledX = 0;
      m._scheduledY = 0;
      m._lastTouchX = 0;
      m._lastTouchY = 0;
      m._lastTouchT = null;
      m._velocityX = 0;
      m._velocityY = 0;

      m._refreshH = 0;
      m._loadingH = 0;
      m._contentW = 0;
      m._contentH = 0;
      m._containerW = 0;
      m._containerH = 0;
      m._snapW = 50;
      m._snapH = 50;

      m._minDeceX = 0;
      m._minDeceY = 0;
      m._maxDeceX = 0;
      m._maxDeceY = 0;
      m._touchArr = null;
    }
  }, {
    key: '_initEvent',
    value: function _initEvent() {
      var m = this;
      var el = m._container;

      var supportTouch = window.Modernizr && !!window.Modernizr.touch || function () {
        return !!('ontouchstart' in window || window.DocumentTouch && document instanceof DocumentTouch);
      }();
      var _event = {
        start: supportTouch ? 'touchstart' : 'mousedown',
        move: supportTouch ? 'touchmove' : 'mousemove',
        end: supportTouch ? 'touchend' : 'mouseup'
      };

      el.addEventListener(_event.start, function (e) {
        if (!e.target.tagName.match(/input|textarea|select/i)) {
          m.doTouchStart(e.touches, e.timeStamp);
        }
      }, false);

      document.body.addEventListener('focusout', function () {
        var timer = setTimeout(function () {
          window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
          clearTimeout(timer);
        }, 250);
      });

      el.addEventListener(_event.move, function (e) {
        e.preventDefault();
        m.doTouchMove(e.touches, e.timeStamp);
      }, false);

      el.addEventListener(_event.end, function (e) {
        m.doTouchEnd(e.timeStamp);
      }, false);

      if (m.ops.mousewheel) {
        el.addEventListener('mousewheel', function (e) {
          m.scrollY = m.scrollY += e.deltaY;
          if (m.scrollY > m.maxScrollY) {
            m.scrollY = m.maxScrollY;
          }
          if (m.scrollY < 0) {
            m.scrollY = 0;
          }
          m._publish(m.scrollX, m.scrollY, true);
        }, false);
      }
    }
  }, {
    key: '_initSnapSize',
    value: function _initSnapSize(snap) {
      var m = this;
      if (typeof snap === 'number') {
        m._snapW = snap;
        m._snapH = snap;
      } else if (Array.isArray(snap)) {
        m._snapW = snap[0];
        m._snapH = snap[1];
      }
    }
  }, {
    key: '_setDimensions',
    value: function _setDimensions() {
      var m = this;

      m._containerW = m._container.offsetWidth;
      m._containerH = m._container.offsetHeight;
      m._contentW = m._content.offsetWidth;
      m._contentH = m._content.offsetHeight;

      if (m._contentW > m._containerW && m.ops.scrollingX) {
        m.enableScrollX = m.ops.scrollingX;
      }
      if (m._contentH > m._containerH && m.ops.scrollingY) {
        m.enableScrollY = m.ops.scrollingY;
      }

      var childrens = m._content.children;

      m._refreshH = m.ops.isPullRefresh ? childrens[0].offsetHeight : 0;
      m._loadingH = m.ops.isReachBottom ? childrens[childrens.length - 1].offsetHeight : 0;

      if (m.ops.snapAlign === 'middle') {
        var itemCount = Math.floor(Math.round(m._containerH / m._snapH) / 2);
        m._content.style.padding = itemCount * m._snapH + 'px 0';
        if (!m.snapAlignInit) {
          m.scrollY = m.minScrollY + m.ops.snapSelect * m._snapH;
          m.snapAlignInit = true;
        }
      }

      m.maxScrollX = Math.max(m._contentW - m._containerW, 0);
      m.maxScrollY = Math.max(m._contentH - m._containerH, 0) - m._refreshH;

      m._reachActive = false;

      m._scrollTo(m.scrollX, m.scrollY, true);
    }
  }, {
    key: '_initPublicApi',
    value: function _initPublicApi() {
      var m = this;
      var apis = publicApi(m);
      for (var api in apis) {
        m[api] = apis[api];
      }
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
      var m = this;
      m._isTouches(touches);
      m._isTouchesTime(timeStamp);

      m._isTracking = true;

      m.stopScroll();

      m._lastTouchX = touches[0].pageX;
      m._lastTouchY = touches[0].pageY;

      m._lastTouchT = timeStamp;
    }
  }, {
    key: 'doTouchMove',
    value: function doTouchMove(touches, timeStamp) {
      var m = this;
      m._isTouches(touches);
      m._isTouchesTime(timeStamp);

      if (!m._isTracking) {
        return;
      }

      var currentTouchX = touches[0].pageX;
      var currentTouchY = touches[0].pageY;

      m._doTouchMoveDirection(currentTouchX, currentTouchY);

      if (m._isDragging) {
        var moveX = currentTouchX - m._lastTouchX;
        var moveY = currentTouchY - m._lastTouchY;

        if (m.enableScrollX) {
          m._doTouchMoveActive(moveX, 'X');
        }

        if (m.enableScrollY) {
          m._doTouchMoveActive(moveY, 'Y');
        }

        if (m._touchArr.length > 60) {
          m._touchArr.splice(0, 30);
        }

        m._touchArr.push(m.scrollX, m.scrollY, timeStamp);

        m._publish(m.scrollX, m.scrollY);
      } else {
        var minMoveDistance = 5;
        var distanceX = Math.abs(currentTouchX - m._lastTouchX);
        var distanceY = Math.abs(currentTouchY - m._lastTouchY);
        m._isDragging = distanceX >= minMoveDistance || distanceY >= minMoveDistance;

        if (m._isDragging) {
          m._interrupted = false;
        }
      }

      m._lastTouchX = currentTouchX;
      m._lastTouchY = currentTouchY;
      m._lastTouchT = timeStamp;
    }
  }, {
    key: 'doTouchEnd',
    value: function doTouchEnd(timeStamp) {
      var m = this;
      m._isTouchesTime(timeStamp);
      if (!m._isTracking) {
        return;
      }

      m._isTracking = false;

      if (m._isDragging) {
        m._isDragging = false;

        if (m.ops.animating && timeStamp - m._lastTouchT <= 100) {
          var isDeceleration = m._doTouchCanDeceleration();
          if (isDeceleration) {
            if (!m._refreshActive) {
              m._startDeceleration(timeStamp);
            }
          } else {
            m._scrollingComplete();
          }
        } else if (timeStamp - m._lastTouchT > 100) {
          m._scrollingComplete();
        }
      }

      if (!m._isDecelerating) {
        if (m._refreshActive && m._refreshStartCb) {
          m._publish(m.scrollX, -m._refreshH, true);
          if (m._refreshStartCb) {
            m._refreshStartCb();
          }
        } else {
          if (m._interrupted || m._isDragging) {
            m._scrollingComplete();
          }
          if (timeStamp - m._lastTouchT > 100) {
            m._scrollTo(m.scrollX, m.scrollY, true);
            m._getScrollToValues();
          } else {
            m._startDeceleration();
          }

          if (m._refreshActive) {
            m._refreshActive = false;
            if (m._refreshCancelCb) {
              m._refreshCancelCb();
            }
          }
        }
      }

      m._touchArr.length = 0;
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
      var m = this;
      var scroll = 'scroll' + D;
      var maxScroll = 'maxScroll' + D;
      m[scroll] -= move * m.ops.speedRatio;
      if (m[scroll] > m[maxScroll] || m[scroll] < 0) {
        if (m.ops.bouncing) {
          m[scroll] += move / 1.5 * m.ops.speedRatio;
          D === 'Y' && m._doTouchMovePullRefresh();
        } else if (m[scroll] > m[maxScroll]) {
          m[scroll] = m[maxScroll];
        } else {
          m[scroll] = 0;
        }
      }
    }
  }, {
    key: '_doTouchMovePullRefresh',
    value: function _doTouchMovePullRefresh() {
      var m = this;
      if (!m.enableScrollX && m._refreshH != null) {
        if (!m._refreshActive && m.scrollY <= -m._refreshH) {
          m._refreshActive = true;
          if (m._refreshActiveCb) {
            m._refreshActiveCb();
          }
        } else if (m._refreshActive && m.scrollY > -m._refreshH) {
          m._refreshActive = false;
          if (m._refreshCancelCb) {
            m._refreshCancelCb();
          }
        }
      }
    }
  }, {
    key: '_doTouchMoveDirection',
    value: function _doTouchMoveDirection(currentX, currentY) {
      var m = this;
      var X = currentX - m._lastTouchX;
      var Y = currentY - m._lastTouchY;
      if (X > 0 && Math.abs(X) > Math.abs(Y)) {
        m.scrollDirection = 'right';
      } else if (X < 0 && Math.abs(X) > Math.abs(Y)) {
        m.scrollDirection = 'left';
      } else if (Y > 0 && Math.abs(Y) > Math.abs(X)) {
        m.scrollDirection = 'down';
      } else if (Y < 0 && Math.abs(Y) > Math.abs(X)) {
        m.scrollDirection = 'up';
      }
    }
  }, {
    key: '_doTouchCanDeceleration',
    value: function _doTouchCanDeceleration() {
      var m = this;
      var flag = false;

      var endPos = m._touchArr.length - 1;
      var startPos = endPos;

      for (var i = endPos; i > 0 && m._touchArr[i] > m._lastTouchT - 100; i -= 3) {
        startPos = i;
      }

      if (startPos !== endPos) {
        var timeOffset = m._touchArr[endPos] - m._touchArr[startPos];
        var movedX = m.scrollX - m._touchArr[startPos - 2];
        var movedY = m.scrollY - m._touchArr[startPos - 1];

        m._velocityX = movedX / timeOffset * (1000 / 60);
        m._velocityY = movedY / timeOffset * (1000 / 60);

        var minVelocityToStartDeceleration = m.ops.paging || m.ops.snap ? 4 : 1;

        var isVelocityX = Math.abs(m._velocityX) > minVelocityToStartDeceleration;
        var isVelocityY = Math.abs(m._velocityY) > minVelocityToStartDeceleration;
        if (isVelocityX || isVelocityY) {
          flag = true;
        }
      }
      return flag;
    }
  }, {
    key: 'activatePullToRefresh',
    value: function activatePullToRefresh(activateCb, deactivateCb, startCb) {
      var m = this;
      m._refreshStartCb = startCb;
      m._refreshActiveCb = activateCb;
      m._refreshCancelCb = deactivateCb;
    }
  }, {
    key: 'finishPullToRefresh',
    value: function finishPullToRefresh() {
      var m = this;
      m._refreshActive = false;
      if (m._refreshCancelCb) {
        m._refreshCancelCb();
      }
      m._scrollTo(m.scrollX, m.scrollY, true);
    }
  }, {
    key: 'on',
    value: function on(eventType, handle) {
      var m = this;
      if (!m._handles.hasOwnProperty(eventType)) {
        m._handles[eventType] = [];
      }
      if (typeof handle == 'function') {
        m._handles[eventType].push(handle);
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

      var m = this;
      if (m._handles.hasOwnProperty(eventType)) {
        m._handles[eventType].forEach(function (item, key, arr) {
          item.apply(null, args);
        });
      } else {
        throw new Error('"' + eventType + '"Event not registered');
      }
    }
  }, {
    key: '_stopScroll',
    value: function _stopScroll() {
      var m = this;

      m._interrupted = true;

      if (m._isDecelerating) {
        m._animate.stop(m._isDecelerating);
        m._isDecelerating = false;
        m._interrupted = true;
      }

      if (m._isAnimating) {
        m._animate.stop(m._isAnimating);
        m._isAnimating = false;
        m._interrupted = true;
      }

      m.completeDeceleration = false;

      m._touchArr = [];
    }
  }, {
    key: '_scrollTo',
    value: function _scrollTo(left, top, animate) {
      var m = this;

      if (m._isDecelerating) {
        m._animate.stop(m._isDecelerating);
        m._isDecelerating = false;
      }
      if (!m.ops.scrollingX) {
        left = m.scrollX;
      } else {
        if (m.ops.paging) {
          left = Math.round(left / m._containerW) * m._containerW;
        } else if (m.ops.snap) {
          left = Math.round(left / m._snapW) * m._snapW;
        }
      }
      if (!m.ops.scrollingY) {
        top = m.scrollY;
      } else {
        if (m.ops.paging) {
          top = Math.round(top / m._containerH) * m._containerH;
        } else if (m.ops.snap) {
          top = Math.round(top / m._snapH) * m._snapH;
        }
      }

      left = Math.max(Math.min(m.maxScrollX, left), 0);
      top = Math.max(Math.min(m.maxScrollY, top), 0);

      if (left === m.scrollX && top === m.scrollY) {
        animate = false;
      }

      if (!m._isTracking) {
        m._publish(left, top, animate);
      }
    }
  }, {
    key: '_scrollToElement',
    value: function _scrollToElement(left, top, animate) {}
  }, {
    key: '_scrollBy',
    value: function _scrollBy(left, top, animate) {
      var m = this;
      var startX = m._isAnimating ? m._scheduledX : m.scrollX;
      var startY = m._isAnimating ? m._scheduledY : m.scrollY;
      m._scrollTo(startX + (left || 0), startY + (top || 0), animate);
    }
  }, {
    key: '_publish',
    value: function _publish(left, top, animate) {
      var m = this;

      var wasAnimating = m._isAnimating;
      if (wasAnimating) {
        m._animate.stop(wasAnimating);
        m._isAnimating = false;
        m._interrupted = true;
      }

      if (animate && m.ops.animating) {
        m._scheduledX = left;
        m._scheduledY = top;
        var oldLeft = m.scrollX;
        var oldTop = m.scrollY;
        var diffLeft = left - oldLeft;
        var diffTop = top - oldTop;
        var step = function step(percent, now, render) {
          if (render) {
            m.scrollX = oldLeft + diffLeft * percent;
            m.scrollY = oldTop + diffTop * percent;

            if (m._render) {
              m._render(m.scrollX, m.scrollY);
            }
          }
        };
        var verify = function verify(id) {
          return m._isAnimating === id;
        };
        var completed = function completed(renderedFramesPerSecond, animationId, wasFinished) {
          if (animationId === m._isAnimating) {
            m._isAnimating = false;
          }
          if (m.completeDeceleration || wasFinished) {
            m._scrollingComplete();
            m._snapComplete();
          }
        };

        var animatType = wasAnimating ? m._easeOutCubic : m._easeInOutCubic;
        m._isAnimating = m._animate.start(step, verify, completed, m.ops.animationDuration, animatType);
      } else {
        m._scheduledX = m.scrollX = left;
        m._scheduledY = m.scrollY = top;

        if (m._render) {
          m._render(left, top);
        }
      }

      if (m.ops.isReachBottom && !m._reachActive) {
        var scrollYn = Number(m.scrollY.toFixed());
        var absMaxScrollYn = m.maxScrollY - m._loadingH;
        if (scrollYn > absMaxScrollYn && absMaxScrollYn > 0) {
          m.emit('loading', {
            hasMore: true
          });
          m._reachActive = true;
        }
      }

      if (m.ops.listenScroll) {
        var isChangeX = m._prevScrollX.toFixed() !== m.scrollX.toFixed();
        var isChangeY = m._prevScrollY.toFixed() !== m.scrollY.toFixed();
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
      var m = this;
      m.ops.scrollingComplete();
    }
  }, {
    key: '_snapComplete',
    value: function _snapComplete() {
      var m = this;
      if (m.ops.snapAlign === 'middle') {
        m.ops.snapComplete(m._getSnapValue());
      }
    }
  }, {
    key: '_getSnapValue',
    value: function _getSnapValue() {
      var m = this;
      var minScrollY = Math.abs(m.minScrollY);
      var scrollY = m.scrollY < 0 ? minScrollY - Math.abs(m.scrollY) : minScrollY + Math.abs(m.scrollY);
      var num = scrollY / m._snapH;
      return {
        listIndex: m.ops.snapListIndex,
        selectIndex: Math.floor(num)
      };
    }
  }, {
    key: '_getScrollToValues',
    value: function _getScrollToValues() {
      var m = this;
      var interTimer = setInterval(function () {
        var isChangeX = m._prevScrollX.toFixed() !== m.scrollX.toFixed();
        var isChangeY = m._prevScrollY.toFixed() !== m.scrollY.toFixed();
        if (isChangeX || isChangeY) {
          m.emit('scroll', {
            x: Math.floor(m.scrollX),
            y: Math.floor(m.scrollY)
          });
        } else {
          var outTimer = setTimeout(function () {
            var x = m.scrollX;
            var y = m.scrollY;
            if (m.scrollY === 0) y = 0;
            if (m.scrollX === 0) x = 0;
            if (m.scrollY === m.maxScrollY) y = m.maxScrollY;
            if (m.scrollX === m.maxScrollX) x = m.maxScrollX;
            m.emit('scroll', {
              x: Math.floor(x),
              y: Math.floor(y)
            });
            clearInterval(interTimer);
            clearTimeout(outTimer);
          }, 50);
        }
      }, 30);
    }
  }, {
    key: '_startDeceleration',
    value: function _startDeceleration() {
      var m = this;

      if (m.ops.paging) {
        var scrollX = Math.max(Math.min(m.scrollX, m.maxScrollX), 0);
        var scrollY = Math.max(Math.min(m.scrollY, m.maxScrollY), 0);

        m._minDeceX = Math.floor(scrollX / m._containerW) * m._containerW;
        m._minDeceY = Math.floor(scrollY / m._containerH) * m._containerH;
        m._maxDeceX = Math.ceil(scrollX / m._containerW) * m._containerW;
        m._maxDeceY = Math.ceil(scrollY / m._containerH) * m._containerH;
      } else {
        m._minDeceX = 0;
        m._minDeceY = 0;
        m._maxDeceX = m.maxScrollX;
        m._maxDeceY = m.maxScrollY;
      }

      var step = function step(percent, now, render) {
        m._stepThroughDeceleration(render);
      };

      var minVelocity = m.ops.snap ? 4 : 0.001;

      var verify = function verify() {
        var shouldContinue = Math.abs(m._velocityX) >= minVelocity || Math.abs(m._velocityY) >= minVelocity;
        if (!shouldContinue) {
          m.completeDeceleration = true;
        }
        return shouldContinue;
      };

      var completed = function completed(renderedFramesPerSecond, animationId, wasFinished) {
        m._isDecelerating = false;
        m.completeDeceleration && m._scrollingComplete();

        m._scrollTo(m.scrollX, m.scrollY, m.ops.snap);
      };

      m._isDecelerating = m._animate.start(step, verify, completed);
    }
  }, {
    key: '_stepThroughDeceleration',
    value: function _stepThroughDeceleration(render) {
      var m = this;

      var scrollX = m.scrollX + m._velocityX;
      var scrollY = m.scrollY + m._velocityY;

      if (!m.ops.bouncing) {
        var scrollLeftFixed = Math.max(Math.min(m._maxDeceX, scrollX), m._minDeceX);
        if (scrollLeftFixed !== scrollX) {
          scrollX = scrollLeftFixed;
          m._velocityX = 0;
        }
        var scrollTopFixed = Math.max(Math.min(m._maxDeceY, scrollY), m._minDeceY);
        if (scrollTopFixed !== scrollY) {
          scrollY = scrollTopFixed;
          m._velocityY = 0;
        }
      }

      m._prevScrollX = m.scrollX;
      m._prevScrollY = m.scrollY;

      if (render) {
        m._publish(scrollX, scrollY);
      } else {
        m.scrollX = scrollX;
        m.scrollY = scrollY;
      }

      if (!m.ops.paging) {
        var frictionFactor = 0.97;
        m._velocityX *= frictionFactor;
        m._velocityY *= frictionFactor;
      }

      if (m.ops.bouncing) {
        var scrollOutsideX = 0;
        var scrollOutsideY = 0;

        var peneDece = m.ops.peneDece;
        var peneAcce = m.ops.peneAcce;

        if (scrollX < m._minDeceX) {
          scrollOutsideX = m._minDeceX - scrollX;
        } else if (scrollX > m._maxDeceX) {
          scrollOutsideX = m._maxDeceX - scrollX;
        }
        if (scrollY < m._minDeceY) {
          scrollOutsideY = m._minDeceY - scrollY;
        } else if (scrollY > m._maxDeceY) {
          scrollOutsideY = m._maxDeceY - scrollY;
        }

        if (scrollOutsideX !== 0) {
          if (scrollOutsideX * m._velocityX <= 0) {
            m._velocityX += scrollOutsideX * peneDece;
          } else {
            m._velocityX = scrollOutsideX * peneAcce;
          }
        }
        if (scrollOutsideY !== 0) {
          if (scrollOutsideY * m._velocityY <= 0) {
            m._velocityY += scrollOutsideY * peneDece;
          } else {
            m._velocityY = scrollOutsideY * peneAcce;
          }
        }
      }
    }
  }]);

  return Scroller;
}();

export default Scroller;
