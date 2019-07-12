import Animate from '../core/animate.js'
import Render from '../core/render.js'

class Scroller {
  constructor(dom, options){
    this.NOOP = function () {};
		this.options = {
			/** Enable scrolling on x-axis */
			scrollingX: true,
			/** Enable scrolling on y-axis */
			scrollingY: true,
			/** Enable animations for deceleration, snap back, zooming and scrolling */
			animating: true,
			/** duration for animations triggered by scrollTo/zoomTo */
			animationDuration: 250,
			/** Enable bouncing (content can be slowly moved outside and jumps back after releasing) */
			bouncing: true,
			/** Enable locking to the main axis if user moves only slightly on one of them at start */
			locking: true,
			/** Enable pagination mode (switching between full page content panes) */
			paging: false,
			/** Enable snapping of content to a configured pixel grid */
			snapping: false,
			/** Enable zooming of content via API, fingers and mouse wheel */
			zooming: false,
			/** Minimum zoom level */
			minZoom: 0.5,
			/** Maximum zoom level */
			maxZoom: 3,
			/** Multiply or decrease scrolling speed **/
			speedMultiplier: 1,
			/** Callback that is fired on the later of touch end or deceleration end,
				provided that another scrolling action has not begun. Used to know
				when to fade out a scrollbar. */
			scrollingComplete: NOOP,
			/** This configures the amount of change applied to deceleration when reaching boundaries  **/
      penetrationDeceleration : 0.03,
      /** This configures the amount of change applied to acceleration when reaching boundaries  **/
      penetrationAcceleration : 0.08
		};
		for (var key in options) {
			this.options[key] = options[key];
    }
    /*
		---------------------------------------------------------------------------
			INTERNAL FIELDS :: STATUS
		---------------------------------------------------------------------------
		*/

		/** {Boolean} Whether only a single finger is used in touch handling */
		this.__isSingleTouch = false;

		/** {Boolean} Whether a touch event sequence is in progress */
		__isTracking: false;

		/** {Boolean} Whether a deceleration animation went to completion. */
		__didDecelerationComplete: false;

		/**
		 * {Boolean} Whether a gesture zoom/rotate event is in progress. Activates when
		 * a gesturestart event happens. This has higher priority than dragging.
		 */
		__isGesturing: false;

		/**
		 * {Boolean} Whether the user has moved by such a distance that we have enabled
		 * dragging mode. Hint: It's only enabled after some pixels of movement to
		 * not interrupt with clicks etc.
		 */
		__isDragging: false,

		/**
		 * {Boolean} Not touching and dragging anymore, and smoothly animating the
		 * touch sequence using deceleration.
		 */
		__isDecelerating: false,

		/**
		 * {Boolean} Smoothly animating the currently configured change
		 */
		__isAnimating: false,



		/*
		---------------------------------------------------------------------------
			INTERNAL FIELDS :: DIMENSIONS
		---------------------------------------------------------------------------
		*/

		/** {Integer} Available outer left position (from document perspective) */
		__clientLeft= 0,

		/** {Integer} Available outer top position (from document perspective) */
		__clientTop= 0,

		/** {Integer} Available outer width */
		__clientWidth= 0,

		/** {Integer} Available outer height */
		__clientHeight= 0,

		/** {Integer} Outer width of content */
		__contentWidth= 0,

		/** {Integer} Outer height of content */
		__contentHeight= 0,

		/** {Integer} Snapping width for content */
		__snapWidth= 100,

		/** {Integer} Snapping height for content */
		__snapHeight= 100,

		/** {Integer} Height to assign to refresh area */
		__refreshHeight= null,

		/** {Boolean} Whether the refresh process is enabled when the event is released now */
		__refreshActive= false,

		/** {Function} Callback to execute on activation. This is for signalling the user about a refresh is about to happen when he release */
		__refreshActivate= null,

		/** {Function} Callback to execute on deactivation. This is for signalling the user about the refresh being cancelled */
		__refreshDeactivate= null,

		/** {Function} Callback to execute to start the actual refresh. Call {@link #refreshFinish} when done */
		__refreshStart= null,

		/** {Number} Zoom level */
		__zoomLevel= 1,

		/** {Number} Scroll position on x-axis */
		__scrollLeft= 0,

		/** {Number} Scroll position on y-axis */
		__scrollTop= 0,

		/** {Integer} Maximum allowed scroll position on x-axis */
		__maxScrollLeft= 0,

		/** {Integer} Maximum allowed scroll position on y-axis */
		__maxScrollTop= 0,

		/* {Number} Scheduled left position (final position when animating) */
		__scheduledLeft= 0,

		/* {Number} Scheduled top position (final position when animating) */
		__scheduledTop= 0,

		/* {Number} Scheduled zoom level (final scale when animating) */
		__scheduledZoom= 0,



		/*
		---------------------------------------------------------------------------
			INTERNAL FIELDS :: LAST POSITIONS
		---------------------------------------------------------------------------
		*/

		/** {Number} Left position of finger at start */
		__lastTouchLeft= null,

		/** {Number} Top position of finger at start */
		__lastTouchTop= null,

		/** {Date} Timestamp of last move of finger. Used to limit tracking range for deceleration speed. */
		__lastTouchMove= null,

		/** {Array} List of positions, uses three indexes for each state: left, top, timestamp */
		__positions= null,



		/*
		---------------------------------------------------------------------------
			INTERNAL FIELDS :: DECELERATION SUPPORT
		---------------------------------------------------------------------------
		*/

		/** {Integer} Minimum left scroll position during deceleration */
		__minDecelerationScrollLeft= null;

		/** {Integer} Minimum top scroll position during deceleration */
		__minDecelerationScrollTop= null;

		/** {Integer} Maximum left scroll position during deceleration */
		__maxDecelerationScrollLeft= null;

		/** {Integer} Maximum top scroll position during deceleration */
		__maxDecelerationScrollTop= null;

		/** {Number} Current factor to modify horizontal scroll position with on every step */
		__decelerationVelocityX= null;

		/** {Number} Current factor to modify vertical scroll position with on every step */
		__decelerationVelocityY= null;
  }
}
