<template>
    <div ref="container" class="infinite-scroller-warpper">
        <div
            v-if="onPullRefresh && onLoadData"
            ref="refreshEl"
            class="pull-refresh"
            :style="transform"
            :class="{ 'is-dropped': refreshDropped }"
        >
            <arrow
                v-if="refreshStatus !== 'loading'"
                class="arrow"
                :class="{ 'active': refreshStatus === 'drop' }"
            />
            <spinner v-else class="spinner" />
        </div>
        <slot name="header"></slot>
        <div
            class="infinite-scroller-container"
            :style="transform"
            :class="{ 'is-dropped': refreshDropped }"
        >
            <div
                ref="content"
                v-infinite-scroll="loadData"
                class="infinite-scroll-content scroll-behavior"
                infinite-scroll-disabled="disabled"
                infinite-scroll-distance="10"
                infinite-scroll-throttle-delay="100"
                :class="{
                    'no-scroll-bar': !scrollBar,
                    'scroll-behavior': snap
                }"
                @scroll="scrollHandler"
            >
                <slot></slot>
                <div v-if="!isRefresh && !empty && onLoadData" class="load-more">
                    <span v-if="disabled">没有更多数据了</span>
                    <spinner v-else class="spinner" />
                </div>
            </div>
        </div>
        <slot name="footer"></slot>
    </div>
</template>
<script>
import infiniteScroll from './scroller.js';
import Spinner from '../components/Spinner';
import Arrow from '../components/Arrow';
export default {
    directives: {
        infiniteScroll
    },
    components: {
        Spinner,
        Arrow
    },
    props: {
        loadControl: {
            type: Boolean,
            required: false,
            description: '是否加载数据',
            default: true
        },
        onScroll: {
            type: Function,
            required: false,
            description: '监听滚动',
            default: null
		},
		scrollX:{
			type: [String,Boolean],
            required: false,
            description: '横向滚动',
            default: ''
		},
        onPullRefresh: {
            type: Function,
            required: false,
            description: '下拉刷新',
            default: null
        },
        onLoadData: {
            type: Function,
            required: false,
            description: '加载数据方法',
            default: null
        },
        scrollBar: {
            type: Boolean,
            required: false,
            description: '是否需要显示滚动条',
            default: true
        },
        setScrollTop: {
            type: Number,
            required: false,
            description: '设置滚动条',
            default: 0
        },
        snap:{
            type: Boolean,
            required: false,
            description: '是否需要snap效果',
            default: false
        }
    },
    data() {
        return {
            container: null,
            refreshEl: null,
            content: null,
            containerHeight: 0,
            refreshHeight: 0,

            scrollLeft: 0,
            scrollTop: 0,
            translate: 0,
            startY: 0,
            refreshStatus: '',
            refreshDropped: false,
            disabled: false,
            isRefresh: false,
            loading: false,
            loadCount: 0,
            empty: false,

            snapIndex:'',
            snapHeight:0,
            snapHasDiff:false,
            isTouchMove:false,
        };
    },
    computed: {
        transform() {
            return this.translate === 0 ? null : { 'transform': 'translate3d(0, ' + this.translate + 'px, 0)' };
        },
    },
    watch: {
        loadControl(val) {
            this.disabled = !val;
        },
        setScrollTop(val) {
            if (this.content) {
                console.log(val);
                this.content.scrollTop = val;
            }
        }
    },
    created() {
        // 是否自动加载
        this.disabled = !this.loadControl;
        // 取消body滑动
        document.body.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    },
    mounted() {
        this.initRefs().then(() => {
            setTimeout(()=>{
                this.touchEvents();
                this.setScrollX();
                this.setSnapWarrper();
            },30)
        });
        this.$on('scrollEnd',()=>{
            console.log('滑动结束')
            this.setSnapIndex()
        })
    },
    activated() {
        if (this.content) {
            this.content.scrollTop = this.scrollTop;
            this.content.scrollLeft = this.scrollLeft;
        }
    },
    methods: {
        load() {
            this.empty = false;
            if (this.disabled) {
                this.disabled = false;
            } else {
                this.$refs.content['@@InfiniteScroll'].expression();
            }
        },
        setScrollX(){
            if(this.scrollX){
                if(typeof this.scrollX === 'string'){
                    this.content.querySelector(this.scrollX).style.display = 'flex'
                } else {
                    this.content.style.display = 'flex'
                }
            }
        },
        setScrollNum(){
            this.content.scrollTop = this.scrollTop;
            this.content.scrollLeft = this.scrollLeft;
        },
        scrollHandler(e) {
            this.scrollTop = e.target.scrollTop;
            this.scrollLeft = e.target.scrollLeft;
            if (this.onScroll) {
                this.onScroll({
                    x: this.scrollLeft,
                    y: this.scrollTop
                });
            }
            if (this.snap && !this.isTouchMove && !this.snapHasDiff) {
                this.scrollEventHandler()
            }
        },
        scrollEventHandler () {
            let scrollY = this.scrollTop
            let scrollCount = 0 // 偏移量相同次数
            // 滑动位置判断定时器
            let timer = setInterval(() => {
                if (scrollY === this.scrollTop){
                    scrollCount = 1;
                }
                if (scrollCount === 1) {
                    this.$emit('scrollEnd')
                    scrollCount = 0
                }
                clearInterval(timer)
            }, 100)
        },
        initRefs() {
            return new Promise(resolve => {
                this.$nextTick(() => {
                    this.content = this.$refs.content;
                    this.container = this.$refs.container;
                    this.refreshEl = this.$refs.refreshEl;
                    this.containerHeight = this.container.getBoundingClientRect().height;
                    resolve(true);
                });
            });
        },
        // ===== 下拉刷新事件 =====
        touchEvents() {
            this.container.addEventListener('touchstart', (e) => {
                if (this.onPullRefresh) {
                    this.startY = e.touches[0].clientY;
                    if (this.refreshStatus !== 'loading') {
                        this.refreshStatus = 'pull';
                        this.refreshDropped = false;
                    }
                }
            });
            this.container.addEventListener('touchmove', (e) => {
                e.stopPropagation();
                if(this.snap){
                    this.isTouchMove = true;
                }
                if (this.onPullRefresh) {
                    // eslint-disable-next-line radix
                    let distance = parseInt((e.touches[0].clientY - this.startY) / 2);
                    this.refreshHeight = this.refreshEl.getBoundingClientRect().height;
                    if (this.scrollTop <= 0 && this.refreshStatus !== 'loading') {
                        this.translate = distance - this.scrollTop;
                        if (this.translate < 0) {
                            this.translate = 0;
                        }
                        this.refreshStatus = this.translate >= this.refreshHeight + 20 ? 'drop' : 'pull';
                    }
                }
            });
            this.container.addEventListener('touchend', (e) => {
                e.stopPropagation();
                if(this.snap){
                    this.isTouchMove = false;
                    // 滑动结束后执行一次滑动结束判断
                    this.scrollEventHandler()
                }
                if (this.onPullRefresh) {
                    if (this.scrollTop <= 0 && this.translate > 0) {
                        this.refreshDropped = true;
                        if (this.refreshStatus === 'drop') {
                            this.pullRefresh();
                        } else {
                            this.translate = 0;
                            this.refreshStatus = 'pull';
                        }
                    }
                }
            });
        },
        pullRefresh() {
            this.isRefresh = true;
            this.loadCount = 1;
            this.disabled = false;
            this.loading = true;

            this.translate = this.refreshHeight;
            this.refreshStatus = 'loading';
            this.onPullRefresh(this.refreshDone);
        },
        refreshDone(disabled, empty) {
            this.disabled = !!disabled;
            this.empty = !!empty;

            this.isRefresh = false;
            this.loading = false;

            this.translate = 0;
            this.refreshStatus = 'pull';
        },
        // ===== 上拉加载 =====
        loadData() {
            if (this.isRefresh) {
                return;
            }
            if (this.onLoadData && !this.loading) {
                this.loading = true;
                this.onLoadData(this.loadDone);
            }
        },
        loadDone(disabled, empty) {
            this.disabled = !!disabled;
            this.empty = !!empty;

            this.loadCount++;
            this.loading = false;
        },
        // ===== SNAP 模式 =====
        setSnapWarrper(){
            if(!this.snap) return;
            let snapContent = this.content.children[0]
            let allSnapDom = snapContent.children
            this.snapHeight = allSnapDom[0].getBoundingClientRect().height
            let childrenCount = this.containerHeight / this.snapHeight
            let paddingCount = Math.floor(childrenCount / 2)
            snapContent.style.padding = `${this.snapHeight * paddingCount}px 0`;
        },
        setSnapIndex(){
            let diffHeight = this.scrollTop % this.snapHeight
            if(diffHeight !== 0){
                this.snapHasDiff = true
                let parHeight = this.snapHeight/2
                if(diffHeight<=parHeight){
                    this.scrollTop = this.scrollTop-diffHeight
                } else {
                    let addHeight = this.snapHeight-diffHeight
                    this.scrollTop = this.scrollTop+addHeight
                }
                this.setScrollNum()
                let timer = setTimeout(()=>{
                    this.snapHasDiff = false
                    clearTimeout(timer)
                },300)
            }
        }
    }
};
</script>
<style scoped>
.infinite-scroller-warpper{
    position: absolute;
    bottom: 0;
    top: 0;
    left: 0;
    right: 0;
    overflow:hidden;
}
.infinite-scroller-container{
    position: absolute;
    bottom: 0;
    top: 0;
    left: 0;
    right: 0;
    overflow: auto;
}
.infinite-scroll-content{
    height:100%;
    overflow: auto;
    scroll-behavior: auto;
    -webkit-scroll-behavior: auto;
    -webkit-overflow-scrolling: touch;
}
.infinite-scroll-content.no-overflow-touch{
    -webkit-overflow-scrolling: auto;
}
.infinite-scroll-content.scroll-behavior{
    scroll-behavior:smooth;
    -webkit-scroll-behavior: smooth;
}
.infinite-scroll-content.no-scroll-bar::-webkit-scrollbar {
    display:none
}
scroll-snap-type
.is-dropped{
    transition: .2s;
}
.arrow{
    width: 16px;
    height: 16px;
    fill: #AAA;
    transition: transform 0.2s linear;
}
.spinner{
    width: 18px;
    height: 18px;
    fill: #AAA;
    stroke: #AAA
}
.pull-refresh{
    height: 50px;
    margin-top:-50px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}
.pull-refresh .arrow {
    transform: translate3d(0, 0, 0) rotate(0deg);
}
.pull-refresh .arrow.active {
    transform: translate3d(0, 0, 0) rotate(180deg);
}
.load-more{
    height: 50px;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
}

.pos{
    position: absolute;
    top: 10px;
    right: 10px;
}
</style>
