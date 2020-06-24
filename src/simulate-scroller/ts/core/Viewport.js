import TouchHandle  from './TouchHandle';

class Viewport extends TouchHandle {
    // eslint-disable-next-line no-useless-constructor
    constructor() {
        super();
    }
    initElement(selector) {
        // 验证
        if (!selector) { throw new Error('Could not find node to mount scroll') }
        let dom = null;
        // 初始化挂载节点
        if (selector instanceof HTMLElement) {
            dom = selector;
        }
        if (typeof selector === 'string') {
            let el = document.querySelector(selector);
            if (el) {
                dom = el;
            } else {
                throw new Error(`Could not find element "${selector}" `);
            }
        }
        if (dom) {
            this.content = dom;
            this.container = this.content.parentNode;
            this.initEventListener();
            this.observer();
        }
    }
    initEventListener() {
        let el = this.container;
        // 触摸开始事件
        el.addEventListener('touchstart', e => {
            if (e.target.tagName.match(/input|textarea|select/i)) { return }
            e.preventDefault();
            this.doTouchStart(e.touches, e.timeStamp);
        }, false);
        // 触摸移动事件
        el.addEventListener('touchmove', e => {
            e.preventDefault();
            this.doTouchMove(e.touches, e.timeStamp);
        }, false);
        // 触摸结束事件
        el.addEventListener('touchend', e => {
            e.preventDefault();
            this.doTouchEnd(e.timeStamp);
        }, false);
    }
    setDimensions() {
        // 获取容器尺寸
        this.containerWidth = this.container.offsetWidth;
        this.containerHeight = this.container.offsetHeight;
        this.contentWidth = this.content.offsetWidth;
        this.contentHeight = this.content.offsetHeight;
        // 判断是否能开启滚动
        if (this.contentWidth > this.containerWidth && this.ops.scrollingX) {
            this.enableScrollX = this.ops.scrollingX;
        }
        if (this.contentHeight > this.containerHeight && this.ops.scrollingY) {
            this.enableScrollY = this.ops.scrollingY;
        }
        // 保留上一次的最大可滚动值
        // let prevMaxScroll = this.maxScrollY;
        // 获取子节点
        // let childrens = this.content.children;
        // 保存下拉刷新和上拉加载的高度
        // this._refreshH = this.ops.isPullRefresh ? childrens[0].offsetHeight : 0;
        // this._loadingH = this.ops.isReachBottom ? childrens[childrens.length - 1].offsetHeight : 0;
        // 剧中类型的选择
        // if (this.ops.snapAlign === 'middle') {
        //     let itemCount = Math.floor(Math.round(this.containerHeight / this._snapH) / 2);
        //     this.content.style.padding = `${itemCount * this._snapH}px 0`;
        //     if (!this.snapAlignInit) {
        //         this.scrollY = this.minScrollY + this.ops.snapSelect * this._snapH;
        //         this.snapAlignInit = true;
        //     }
        // }
        // 更新可滚动区域的尺寸。
        this.maxScrollX = Math.max(this.contentWidth - this.containerWidth, 0);
        this.maxScrollY = Math.max(this.contentHeight - this.containerHeight, 0) - this.refreshHeight;

        // 更新可上拉加载状态区域
        // this._reachActive = false;
        // 更新滚动位置
        this.scrollTo(this.scrollX, this.scrollY, true);
    }

    observer() {
        let MutationObserver = (() => {
            return window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        })();

        if (MutationObserver) {
            new MutationObserver((mutations) => {
                let length = mutations.length - 1;
                mutations.forEach((item, index) => {
                    if (this.ops.snap) {
                        this.setDimensions();
                    } else {
                        if (length === index) {
                            let timer = setTimeout(() => {
                                this.setDimensions();
                                clearTimeout(timer);
                            }, 30);
                        }
                    }
                });
            }).observe(this.content.children[1], {
                childList: true,
                subtree: true,
                characterData: true // 节点内容或节点文本的变动
            });
        }
    }
}
export default Viewport;
