# vue-app-scroller

vue-app-scroller 是一款解决vue项目中各种滚动场景需求的 vue 组件，其核心是借鉴 [scroller](https://github.com/parkeeers/scroller) 和 [vue-scroller](https://github.com/wangdahoo/vue-scroller) 进行实现的，但是修改了 API 名称和调用方式，在他们的基础上拓展了部分功能，优化了滚动监听，自动刷新滚动视窗，视窗内的功能。

核心 js 文件 是基于原生 JS 实现的 不依赖其他库，核心源码压缩后仅 14kb 。

主要功能：【下拉刷新】【上拉加载】【监听实时滚动】【制作滚动组件：如 picker】更多请参考在线 demo 演示

## 使用前提

需要 vue 2.x,

需要支持 vue 组件解析的工程结构。

## 在线演示

[Demo演示示例](https://joozh.github.io/vue-app-scroller/examples)

## 安装使用

安装

```bash
$ npm install vue-app-scroller -S
```

使用

```javascript
import VueAppScroller from 'vue-app-scroller';
// use 以后就会添加一个 vue-app-scroller 组件
Vue.use(VueAppScroller);
```

```vue
<template>
  <div class="demo">
    <nav-bar title="PullAndReach"></nav-bar>
    <div class="scroller-container">
      <vue-app-scroller>
    		<!-- dom -->
      </vue-app-scroller>
    </div>
  </div>
</template>
```

* .scroller-container 为滚动区域的外容器 需要限制宽度和高度，并且采用定位的方式做为滚动容器父节点。这里不需要对溢出进行处理，组件会自动处理溢出内容，只需要设置定位和宽高内容即可。

```css
.scroller-container{
  position: relative;	// 定位元素  absolute,fixed
  width: 100%;
  height: 500px;
}
```

## 参数

| 参数              | 类型                 | 默认      | 说明                                                         | 必填                           |
| ----------------- | -------------------- | --------- | ------------------------------------------------------------ | ------------------------------ |
| scrollingX        | Boolean              | false     | 是否横向滚动                                                 | X 或者 Y                       |
| scrollingY        | Boolean              | false     | 是否纵向滚动                                                 | X 或者 Y                       |
| mousewheel        | Boolean              | false     | 是否开启鼠标滚动                                             |                                |
| snap          | Boolean,Number,Array | false     | 是否开启网格移动 传 true 默认为 50px                         |                                |
| snapAlign | String               | "top" | 可选值 ['top','middle'],如果使用 middle 会以选择器的模式展示 |                                |
| snapSelect    | Number               | 0         | snappingType 为 select 模式下当前选中的行或者列              |                                |
| snapListIndex | Number               | 0         | 多列模式下当前指定的当前列，用于区分当前选择的值。           | 多列模式【选择器模式】必须指定 |
| snapComplete  | Function             | NOOP      | 选择器切换选择后执行的函数，用于得到返回值，使用方式见 参数详细说明 | 需要得到值必填                 |
| paging            | Boolean              | false     | 是否开启滑动分屏                                             |                                |
| bouncing          | Boolean              | true      | 是否使用回弹效果                                             |                                |
| animating         | Boolean              | true      | 是否使用动画                                                 |                                |
| duration          | Number               | 250       | 由 scrollTo 触发的动画持续时间 ms                            |                                |
|               | Array,Object,Number  | []        | 监听数据，更新滚动视图,如果使用number，建议是累加值          | *                              |
| scrollingComplete | Function             | NOOP      | 每次滚动事件完成后需要执行的方法                             |                                |

### 参数详细说明

* snap :  传参方式为 Array 格式 [width,height] , 传参方式为 Number 格式，网格宽高同值

* snapType: 为 middle 模式下，建议行数为奇数行效果最佳。可参考 示例

* snapComplete: 接收一个参数 该参数内容为

  ```js
  snapComplete(e){
    console.log(e) // {listIndex:0,selectIndex:0}
  }
  ```

## 方法

所有方法都通过引用模式调用

```vue
<vue-app-scroller ref="scroller"></vue-app-scroller>
<script>
export default {
	data () {
    return {
      scroller:null
    }
  },
  mounted(){
    this.scroller = this.$refs.scroller
  },
  methods:{
    getAttr(){
      let direction = this.scroller.getAttr('scrollDirection');
    }
  }
}
</script>
```

| 方法名称   | 参数          | 返回值 | 说明                                                         |
| ---------- | ------------- | ------ | ------------------------------------------------------------ |
| refresh    | 无            | 无     | 当数据更新滚动视图无法更新时候，手动刷新                     |
| stopScroll | 无            | 无     | 主动停止当前动画和滚动效果。                                 |
| scrollTo   | x, y, animate | 无     | x： 为滚动到的横向位置，y： 为滚动到的纵向位置，animate：是否需要使用动画 |
| publish    | x, y, animate | 无     | 同上 该方法 会实时获取滚动位置，scrollTo 会在滚动完成后 更新滚动位置。 |
| getAttr    | name          | 多种   | 获取当前滚动的一些重要属性 参考下表                          |
| setAttr    | key,value     | 无     | 设置当前滚动的一些重要属性                                   |

##### 可操作属性表

| 可获取的属性名称 | 说明                                                 | 可设置 | 可读取 |
| ---------------- | ---------------------------------------------------- | ------ | ------ |
| scrollDirection  | ['top','right','left','bottom'] ，返回当前滑动的方向 | 🌚      | 🌝      |
| enableScrollX    | [true,false]  横向滚动                               | 🌝      | 🌝      |
| enableScrollY    | [true,false]  纵向滚动                               | 🌝      | 🌝      |
| minScrollX  | number  返回当前最小横向滚动距离                     | 🌚      | 🌝      |
| minScrollY | number  返回当前最小纵向滚动距离                     | 🌚      | 🌝      |
| maxScrollX  | number  返回当前最大横向滚动距离                     | 🌚      | 🌝      |
| maxScrollY | number  返回当前最大纵向滚动距离                     | 🌚      | 🌝      |

## 事件

| 事件名称      | 类型     | 说明                 | 传参 | 参数类型 | 返回                |
| ------------- | -------- | -------------------- | ---- | -------- | ------------------- |
| onScroll      | Function | 监听页面滚动处理函数 | e    | Object   | {x:0,y:0}           |
| onPullRefresh | Function | 监听下拉刷新处理函数 | done | Function | 更新完毕  done()    |
| onReachBottom | Function | 监听上拉加载处理函数 | done    | Function  | 没有更多数据  done() |

#### 事件函数使用

为了减少参数传递，对事件采用绑定函数的方式进行使用。

```vue
<vue-app-scroller
  :scrollingY="true"
  :onPullRefresh="refresh"
  :onReachBottom ="loadingMore"
  :onScroll ="scroll"
>
</vue-app-scroller>
```

* 使用一个刷新标志位置 isRefresh 来保证每次只有一个刷新函数在运行，避免多次重复的下拉刷新

* 上拉加载会自动判断当前是否还能继续加载。

```js
export default {
  data () {
    return {
      isRefresh:false,
      items: []
    }
  },
  mounted() {
    let items = []
    for (let i = 1; i <= 20; i++) {
      items.push(i + ' - keep walking, be 2 with you.')
    }
    this.items = items
    this.bottom = 20
  },
  methods: {
    refresh(done) {
      if(!this.isRefresh){
        this.isRefresh = true
        setTimeout(() => {
          let items = []
          for (let i = 1; i <= 20; i++) {
            items.push(i + ' - keep walking, be 2 with you.')
          }
          this.items = items
          this.bottom = 20
          this.isRefresh = false
          done()
        }, 1500)
      }
    },
    loadingMore(done) {
      setTimeout(() => {
        let start = this.bottom + 1
        let items = []
        if(this.bottom < 40){
          for (let i = start; i < start + 9; i++) {
            items.push(i + ' - keep walking, be 2 with you.')
          }
          this.items = this.items.concat(items)
          this.bottom = this.bottom + 9
        }else{
          done()
        }
      }, 1500)
    }
  }
}
```

## 其他

在 npm 包中的 dist 目录下有打包和压缩过后的 vue-app-scroller.min.js 可供使用。

自定义样式和自定义图标，暂未开发….
