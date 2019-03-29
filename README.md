# vue-app-scroller

根据  scroller.js 和 vue-scroller 改良的滚动插件，优化下拉刷新和上拉加载，并且能支持事件监听实时获取到滚动的位置。 

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
// use 以后就会添加一个 scroller 组件
Vue.use(VueAppScroller);
```

## 配置参数

| 参数       | 类型                  | 默认值   | 说明                                | 必填   |
| ---------- | --------------------- | -------- | ----------------------------------- | ------ |
| scrollingX | Boolean               | false    | 是否横向滚动                        | X 或 Y |
| scrollingY | Boolean               | false    | 是否纵向滚动                        | X 或 Y |
| mousewheel | Boolean               | false    | 是否开启鼠标滚动                    |        |
| snapping   | Boolean,Number,Object | false,50 | 是否开启网格移动 (不与paging同开)   |        |
| paging     | Boolean               | false    | 是否开启滑动分屏 (不与snapping同开) |        |
| bouncing   | Boolean               | true     | 是否使用回弹效果                    |        |
| animating  | Boolean               | true     | 是否使用动画                        |        |
| duration   | Number                | 250      | 由 scrollTo 触发的动画持续时间 ms   |        |
| data       | Array,Object          | []       | 监听数据，更新滚动视图              | *必填  |

* snapping :  传参方式为 Object 格式  {width:50;height:50} 网格的宽度和高度
* snapping :  传参方式为 Number 格式时，网格宽高同值

## 事件方法

| 事件名称      | 类型     | 说明                 | 传参 | 参数类型 | 返回                |
| ------------- | -------- | -------------------- | ---- | -------- | ------------------- |
| onScroll      | Function | 监听页面滚动处理函数 | e    | Object   | {x:0,y:0}           |
| onPullRefresh | Function | 监听下拉刷新处理函数 | done | Function | 更新完毕  done()    |
| onReachBottom | Function | 监听上拉加载处理函数 | e    | Boolean  | {hasMore:true/fase} |

#### HTML 结构说明

* .scroller-container 为滚动区域的外容器 需要限制宽度和高度，并且采用定位的方式做为滚动容器父节点。

```vue
<template>
  <div class="demo">
    <nav-bar title="Pull & Reach"></nav-bar>
    <div class="scroller-container">
      <scroller>
        <div>
    		  <!-- dom -->
    	  </div>
      </scroller>
    </div>
  </div>
</template>
```

```css
.scroller-container{
  position: absolute;	// 定位元素
  top:44px;				// 为导航预留高度
  left: 0;
  right: 0;
  bottom:0;
}
```

#### 事件函数的使用建议

为了减少参数传递，对事件采用绑定函数的方式进行使用。

```vue
<scroller
  :scrollingY="true"  
  :onPullRefresh="refresh"
  :onReachBottom ="loadingMore"
  :onScroll ="scroll"
  :data="items">
</scroller>
```

* 使用一个刷新标志位置 isRefresh 来保证每次只有一个刷新函数在运行，避免多次重复的下拉刷新

* 上拉加载会自动判断当前是否还能继续加载。

```js
export default {
  data () {
    return {
      isRefresh:false,
      x:0,
      y:0,
      pageNum:1,
      items: []
    }
  },
  methods: {
    // 滚动事件监听
    scroll(e){
      this.x = e.x
      this.y = e.y
    },
    // 下拉事件监听
    refresh(done) {
      if(!this.isRefresh){
        this.isRefresh = true			  // 阻止重复操作
        let items = []
        for (let i = 1; i <= 20; i++) {
          items.push(i + 'my-data')
        }
        setTimeout(() => {
          this.items = items      // 重置数据
          this.pageNum = 1        // 重置分页
          this.isRefresh = false  // 重置刷新状态
          done()                  // 关闭刷新状态
        }, 1500)
      }
    },
    // 触底事件监听   
    // 会自动判断还有无更多数据
    loadingMore(e) {
      let items = []
      for (let i = 0; i < 20; i++) {
        items.push(i + 'my-data')
      }
      setTimeout(() => {
        this.items = this.items.concat(items)
        this.pageNum = this.pageNum + 1
      }, 1500)
    },
  }
}
```

## 其他

在 npm 包中的 dist 目录下有打包和压缩过后的 vue-app-scroller.min.js 可供使用。

自定义样式和自定义图标，暂未开发….