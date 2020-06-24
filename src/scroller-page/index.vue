<template>
    <div>
        <!-- 下拉刷新 -->
        <div class="dragBox" ref="dragBox" :style="{ transform: `translateY(${moveOffset / double}px)` }">
            <!-- 下拉刷新动画效果 -->
            <div
                class="yd-pullTip"
                :style="{
                    height: `${moveOffset / double}px`,
                    top: `-${moveOffset / double}px`,
                    paddingBottom: paddingBottom
                }"
            >
                <img v-if="touches.loading" src="data:image/gif;base64,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"/>
                <img v-else :class="{ rotate: moveOffset >= touches.distance * double }" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACMAAAA4CAYAAAB3yEEBAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OEFFN0NBNENDQkVEMTFFOTg3ODBCRjE0Q0NBQTdFMDEiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OEFFN0NBNERDQkVEMTFFOTg3ODBCRjE0Q0NBQTdFMDEiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo4QUU3Q0E0QUNCRUQxMUU5ODc4MEJGMTRDQ0FBN0UwMSIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo4QUU3Q0E0QkNCRUQxMUU5ODc4MEJGMTRDQ0FBN0UwMSIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pk84QwMAAALZSURBVHja7Jm7jtpAFIbtgeXiBhvIG6RaEFRcnmIfIc02W20RVtr0KZIiaTYNTV6CJq/ApYpAW21DQwei4SIhQeZf+aDRrD0e20iJlBkJgeZ2vvnPmcN4bK9WKytluRF+D9JMlE0zeLvd3s1ms956vX7ved5zvV5/VywWf8r9bNu2TqdT5Hx2HGXESQEyHo+/73Y7h9odx1m32+2HpEBMB4CKCsSvd0ej0ROvv5Xn0VEmEkaeJAyECup5+7cgoNQwMghf+RkkbLVQaDKZxAZiUa4RVnwLRfb7vaPqR2Wz2bhxFWK6rvFjwdF1Z1QMJXITKaICUe2WODHEomJkOBw+BcVILpc7yP0zmYyVz+cPSRViKpCwGOF5ZNtqtT69mYwxq9vt3hcKhW0ShZjKNSIIFYDwxNbjCW4RNBb1nU6nFwQEhVRALGT7vroGbhFdAwM+SF8lN9oBRC4T51ABMVH+oIQG6UkRGIAhnWyKfuQyOQUQEOyJIcCIXAZBHe0Qcg3/7kfllyCFwlzGE+MXKER2GMWImFnFrSrESF+GiIJCuwwkjiGFeGx+IDfd8GPAx4hg7esmuqB20WXyGC6AO51OH8Hxqgw/RlzLq/Rj5J5AdOJEVXCsCHIZ5l0ul9fnAC6VSnN51wAk6FySpoTFEOwTzKDRaHzlJ7U5dk61Wn2GpDKIbtDq7jLYgb1yufwC++DICh0W3OCBK3SV9iyr4zIeiwvf1vnsnMWKj8cjVj4Qt7P8x6d7jtU9uvLPrzdJjwzLOyCsPm1RzcOSDrwkEBaNT9b6C0XeDATHrH+oGBgDY2AMjIExMAbGwBgYA2NgDMz/BJPk1iI2DD394cZC9dia5NGYJVmxf5NwFed5+iLvm8IMMcYO5Ar6xuWPf8dzho7jtsQxAxjXdefiqj3P+w3FyHBcV6UJ4EGz2fxcqVRe8AID12K1Wu2HleLWy477KjngButir5L/CDAAX5Ad05wlsggAAAAASUVORK5CYII="/>
                <span>{{ touches.statusText }}</span>
            </div>
            <!-- 下拉刷新提示效果 -->
            <div class="yd-Tip" v-if="pullupdateStatus">
                {{ pullupdateText }}
                <span :style="pullupdateText === '更新成功' ? `backgroundColor: ${pullTipBgColor};` : 'backgroundColor: #aeaeae;'"></span>
            </div>
            <slot name="list"></slot>
        </div>
        <div ref="tag" style="height: 0;"></div>

        <div class="yd-list-loading" v-if="!isDone">
            <div v-show="isLoading">
                <slot name="loadingTip">
                    <template>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 100 100"
                            preserveAspectRatio="xMidYMid"
                            class="lds-ellipsis"
                        >
                            <circle cx="84" cy="50" r="5.04711" fill="#f3b72e">
                                <animate
                                    attributeName="r"
                                    values="10;0;0;0;0"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                                    calcMode="spline"
                                    dur="1.7s"
                                    repeatCount="indefinite"
                                    begin="0s"
                                ></animate>
                                <animate
                                    attributeName="cx"
                                    values="84;84;84;84;84"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                                    calcMode="spline"
                                    dur="1.7s"
                                    repeatCount="indefinite"
                                    begin="0s"
                                ></animate>
                            </circle>
                            <circle cx="66.8398" cy="50" r="10" fill="#E8574E">
                                <animate
                                    attributeName="r"
                                    values="0;10;10;10;0"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                                    calcMode="spline"
                                    dur="1.7s"
                                    repeatCount="indefinite"
                                    begin="-0.85s"
                                ></animate>
                                <animate
                                    attributeName="cx"
                                    values="16;16;50;84;84"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                                    calcMode="spline"
                                    dur="1.7s"
                                    repeatCount="indefinite"
                                    begin="-0.85s"
                                ></animate>
                            </circle>
                            <circle cx="32.8398" cy="50" r="10" fill="#43A976">
                                <animate
                                    attributeName="r"
                                    values="0;10;10;10;0"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                                    calcMode="spline"
                                    dur="1.7s"
                                    repeatCount="indefinite"
                                    begin="-0.425s"
                                ></animate>
                                <animate
                                    attributeName="cx"
                                    values="16;16;50;84;84"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                                    calcMode="spline"
                                    dur="1.7s"
                                    repeatCount="indefinite"
                                    begin="-0.425s"
                                ></animate>
                            </circle>
                            <circle cx="16" cy="50" r="4.95289" fill="#304153">
                                <animate
                                    attributeName="r"
                                    values="0;10;10;10;0"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                                    calcMode="spline"
                                    dur="1.7s"
                                    repeatCount="indefinite"
                                    begin="0s"
                                ></animate>
                                <animate
                                    attributeName="cx"
                                    values="16;16;50;84;84"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                                    calcMode="spline"
                                    dur="1.7s"
                                    repeatCount="indefinite"
                                    begin="0s"
                                ></animate>
                            </circle>
                            <circle cx="16" cy="50" r="0" fill="#f3b72e">
                                <animate
                                    attributeName="r"
                                    values="0;0;10;10;10"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                                    calcMode="spline"
                                    dur="1.7s"
                                    repeatCount="indefinite"
                                    begin="0s"
                                ></animate>
                                <animate
                                    attributeName="cx"
                                    values="16;16;16;50;84"
                                    keyTimes="0;0.25;0.5;0.75;1"
                                    keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1"
                                    calcMode="spline"
                                    dur="1.7s"
                                    repeatCount="indefinite"
                                    begin="0s"
                                ></animate>
                            </circle>
                        </svg>
                    </template>
                </slot>
            </div>
        </div>
        <div class="yd-list-donetip" v-show="!isLoading && isDone">
            <slot name="doneTip">没有更多数据了</slot>
        </div>
    </div>
</template>

<script type="text/babel">
export default {
    name: 'yd-infinitescroll',
    data() {
        return {
            isLoading: false,
            isDone: false,
            num: 1,
            touches: {
                loading: false, //是否在下拉刷新回调中
                distance: 60, //滑动距离大于100时可释放刷新
                startClientY: 0,
                currentClientY: Math.pow(2, 32), //当前触摸位置
                isDraging: false, //是否开始下拉刷新
                statusText: '下拉刷新' //此时的状态描述
            },
            moveOffset: 0, //手指下拉的长度滚动的
            double: 3, //手滑动距离与下拉距离的倍数
            // step: 20 //松开手指界面向上滑动的速度
            time: 100,
            pullupdateStatus: false, //是否展示下拉刷新更新后的提示
            pullupdateText: '更新成功' //展示下拉刷新更新后的提示
        }
    },
    props: {
        callback: {
            type: Function
        },
        pullcallback: {
            type: Function
        },
        distance: {
            default: 0,
            validator(val) {
                return /^\d*$/.test(val)
            }
        },
        scrollTop: {
            type: Boolean,
            default: true
        },
        pullTipBgColor: {
            type: String,
            default: '#171dca'
        }
    },
    computed:{
        paddingBottom(){
            return this.moveOffset / this.double > (this.touches.distance - 20) / 2
                ? (this.touches.distance - 20) / 2 + 'px'
                : `${this.moveOffset / this.double}px`
        }
    },
    mounted() {
        console.log(this.$el)
        this.scrollview = this.getScrollView(this.$el)
        if (this.callback) {
            this.init()
        }
        if (this.pullcallback) {
            this.pullinit()
        }
    },
    methods: {
        init() {
            if (this.scrollTop) {
                if (this.scrollview === window) {
                    window.scrollTo(0, 0)
                } else {
                    this.scrollview.scrollTop = 0
                }
            }
            this.scrollview.addEventListener('scroll',this.throttledCheck, false)
            this.$on('ydui.infinitescroll.loadedDone', () => {
                this.isLoading = false
                this.isDone = true
            })
            this.$on('ydui.infinitescroll.finishLoad', () => {
                this.isLoading = false
            })
            this.$on('ydui.infinitescroll.reInit', () => {
                this.isLoading = false
                this.isDone = false
            })
        },
        pullinit() {
            //防止微信浏览器下拉出现域名
            document.body.addEventListener('touchmove', this.stopDragEvent, {
                passive: false //调用阻止默认行为
            })

            const dragBox = this.$refs.dragBox
            dragBox.addEventListener('touchstart', this.touchStartHandler)
            dragBox.addEventListener('touchmove', this.touchMoveHandler)
            dragBox.addEventListener('touchend', this.touchEndHandler)

            //容器距离顶部的距离
            this.offsetTop = dragBox.getBoundingClientRect().top

            //上拉加载完成
            this.$on('ydui.pullrefresh.finishLoad.success', (tip = true) => {
                this.pullupdateText = '更新成功'
                this.Retract(0, tip)
            })
            this.$on('ydui.pullrefresh.finishLoad.fail', (tip = true) => {
                this.pullupdateText = '更新失败'
                this.Retract(0, tip)
            })
        },
        scrollHandler() {
            if (this.isLoading || this.isDone) return
            const scrollview = this.scrollview
            const contentHeight = document.body.offsetHeight
            const isWindow = scrollview === window
            const offsetTop = isWindow ? 0 : scrollview.getBoundingClientRect().top
            const scrollviewHeight = isWindow ? contentHeight : scrollview.offsetHeight
            if (!scrollview) {
                console.warn("Can't find the scrollview!")
                return
            }
            if (!this.$refs.tag) {
                console.warn("Can't find the refs.tag!")
                return
            }
            const tagOffsetTop = Math.floor(this.$refs.tag.getBoundingClientRect().top) - 1
            const distance = !!this.distance && this.distance > 0 ? ~~this.distance : Math.floor(contentHeight / 10)
            if (
                tagOffsetTop > offsetTop &&
                tagOffsetTop - (distance + offsetTop) * this.num <= contentHeight &&
                this.$el.offsetHeight > scrollviewHeight
            ) {
                this.isLoading = true
                this.callback && this.callback()
                this.num++
            }
        },
        throttle(method, context) {
            clearTimeout(method.tId)
            method.tId = setTimeout(() => {
                method.call(context)
            }, 30)
        },
        throttledCheck() {
            this.throttle(this.scrollHandler)
        },
        getScrollView(el) {
            let currentNode = el
            while (
                currentNode &&
                currentNode.tagName !== 'HTML' &&
                currentNode.tagName !== 'BODY' &&
                currentNode.nodeType === 1
            ) {
                let overflowY = document.defaultView.getComputedStyle(currentNode).overflowY
                if (overflowY === 'scroll' || overflowY === 'auto') {
                    return currentNode
                }
                currentNode = currentNode.parentNode
            }
            return window
        },
        getScrollTop(element) {
            if (element === window) {
                return Math.max(window.pageYOffset || 0, document.documentElement.scrollTop)
            } else {
                return element.scrollTop
            }
        },
        touchStartHandler(event) {
            //正在执行下拉刷新则返回
            if (this.touches.loading) {
                event.preventDefault()
                return
            }
            //当向下滚动了则直接返回
            if (
                this.getScrollTop(this.scrollview) > 0 ||
                this.$refs.dragBox.getBoundingClientRect().top < this.offsetTop
            ) {
                return
            }
            //数据初始化
            this.touches.loading = false
            this.touches.startClientY = 0
            this.touches.isDraging = false
            this.touches.statusText = '下拉刷新'
            this.moveOffset = 0

            //记录触摸位置
            // this.touches.startClientX = event.touches[0].clientX
            this.touches.startClientY = event.touches[0].clientY
        },
        touchMoveHandler(event) {
            const touches = this.touches
            //记录当前触摸位置
            touches.currentClientY = event.touches[0].clientY
            //当向下滚动了则直接返回
            if (
                this.getScrollTop(this.scrollview) > 0 ||
                this.$refs.dragBox.getBoundingClientRect().top < this.offsetTop
            ) {
                // this.dragTip.translate = 0;
                // this.resetParams();
                this.touches.isDraging = false
                this.moveOffset = 0
                return
            }

            //正在执行下拉刷新则返回
            if (this.touches.loading) {
                event.preventDefault()
                return
            }
            const currentY = event.touches[0].clientY
            // const currentX = event.touches[0].clientX

            //防止手指直接下滑造成页面不能正常的滚动
            if (!touches.isDraging && currentY < touches.startClientY) {
                return
            }

            //手指先先下拉,再向上滑,说明此时手指已经在触摸位置上方了
            if (
                touches.isDraging &&
                (
                    currentY - touches.startClientY < 0 ||
                    this.$refs.dragBox.getBoundingClientRect().top <this.offsetTop
                )
            ) {
                // this.isDragToUp = true;
                event.preventDefault()
                return
            }
            //手指向下滑
            if (touches.isDraging && this.getScrollTop(this.scrollview) === 0) {
                event.preventDefault()
            }

            // //开始下拉刷新
            this.touches.isDraging = true

            // const touchAngle =
            //     (Math.atan2(
            //         Math.abs(currentY - touches.startClientY),
            //         Math.abs(currentX - touches.startClientX)
            //     ) *
            //         180) /
            //     Math.PI
            // if (90 - touchAngle > 45) return

            //手指滑动的距离
            let deltaSlide = currentY - touches.startClientY
            //如果超过了指定的距离, 达到了释放更新的条件
            if (deltaSlide >= touches.distance * this.double) {
                this.touches.statusText = '释放更新'
            } else {
                this.touches.statusText = '下拉刷新'
            }
            //记录滑动的位置
            this.moveOffset = deltaSlide
            // console.log(this.moveOffset)
        },
        touchEndHandler(event) {
            const touches = this.touches
            // console.log(this.touches.isDraging)
            //正在执行下拉刷新则返回
            if (this.touches.loading) {
                event.preventDefault()
                return
            }

            //当向下滚动了则直接返回
            if (
                this.getScrollTop(this.scrollview) > 0 ||
                this.$refs.dragBox.getBoundingClientRect().top < this.offsetTop
            ) {
                this.touches.isDraging = false
                this.moveOffset = 0
                return
            }

            const currentY = event.changedTouches[0].clientY
            // const currentX = event.changedTouches[0].clientX
            //说明此时手指已经在触摸位置上方了
            if (
                currentY - touches.startClientY < 0 ||
                this.$refs.dragBox.getBoundingClientRect().top < this.offsetTop
            ) {
                this.touches.isDraging = false
                event.preventDefault()
                return
            }
            //下拉刷新阻止浏览器默认行为
            if (this.getScrollTop(this.scrollview) === 0) {
                event.preventDefault()
            }

            //手指滑动的距离
            let deltaSlide = currentY - touches.startClientY
            //如果超过了指定的距离
            if (deltaSlide >= touches.distance * this.double) {
                //进行更新的动画
                this.touches.statusText = '加载中'
                // alert('下拉刷新')
                this.touches.startClientY = 0
                this.touches.isDraging = false
                this.Retract(touches.distance * this.double)
                return
            } else {
                this.touches.isDraging = false
                //距离不够则不刷新
                this.Retract(0, false)
            }
        },
        stopDragEvent(event) {
            this.touches.isDraging && event.preventDefault()
        },
        Retract(offsetTop, tip) {
            let timer = setInterval(() => {
                // 根据时间计算出每次运动的距离
                // 总时间 / 每次运动时间 = 运动次数
                // 总长度 / 运动次数 = 每次运动距离
                let step = ((this.touches.distance * this.double) / ((this.time * 60) / 1000).toFixed(2)).toFixed(2)
                if (this.moveOffset - step > offsetTop) {
                    this.moveOffset -= step
                } else {
                    this.moveOffset = offsetTop
                    clearInterval(timer)
                    if (offsetTop !== 0) {
                        this.touches.loading = true
                        this.pullcallback && this.pullcallback()
                    } else {
                        //重置
                        this.touches.loading = false
                        this.touches.startClientY = 0
                        this.touches.isDraging = false
                        this.touches.statusText = '下拉刷新'
                        //执行加载中动画
                        if (tip) {
                            //执行更新成功或者失败动画
                            this.pullupdateStatus = true
                            setTimeout(() => {
                                this.pullupdateStatus = false
                            }, 1000)
                        }
                    }
                }
            }, 1000 / 60)
        }
    },

    beforeDestroy() {
        this.scrollview.removeEventListener('scroll', this.throttledCheck)
        this.$refs.dragBox.removeEventListener('touchstart',this.touchStartHandler)
        this.$refs.dragBox.removeEventListener('touchmove',this.touchMoveHandler)
        this.$refs.dragBox.removeEventListener('touchend', this.touchEndHandler)
        document.body.removeEventListener('touchmove', this.stopDragEvent)
    }
}
</script>

<style lang="stylus" scoped>
html{
    font-size: 50px;
}
@keyframes intact {
    0% {
        border-radius: 50%;
    }
    100% {
        border-radius: 0%;
    }
}
.yd {
    &-list-loading {
        padding: 0.1rem 0;
        text-align: center;
        font-size: 0.26rem;
        color: #999;
        height: 0.66rem;
        box-sizing: content-box;
        &-box {
            height: 0.66rem;
            overflow: hidden;
            line-height: 0.66rem;
        }
        img {
            height: 0.66rem;
            display: inline-block;
        }
        svg {
            width: 0.66rem;
            height: 0.66rem;
        }
    }

    &-list-donetip {
        font-size: 0.24rem;
        text-align: center;
        padding: 0.25rem 0;
        color: #777;
    }
    &-pullTip {
        text-align: center;
        font-size: 0.24rem;
        position: absolute;
        left: 0;
        right: 0;
        background: #eeeeee;
        color: #a5a5a5;
        overflow: hidden;
        display: flex;
        align-items: flex-end;
        justify-content: center;
        img {
            height: 20px;
            margin-right: 12px;
            margin-bottom: -1px;
            transition: transform 0.1s linear;
            transform: rotate(180deg);
        }
        img.rotate {
            transform: rotate(0deg);
        }
    }
    &-Tip {
        z-index: 99999999;
        position: absolute;
        left: 0;
        right: 0;
        top: 0;
        height: 30px;
        line-height: 30px;
        font-size: 0.24rem;
        overflow: hidden;
        text-align: center;
        color: #fff;
        span {
            position: absolute;
            top: 0;
            left: 0;
            z-index: -1;
            display: block;
            width: 100%;
            padding-top: 100%;
            border-radius: 50%;
            animation: intact 0.1s linear forwards;
        }
    }
}
</style>
