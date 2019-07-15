function publicApi(self){
  return {
    // 刷新滚动区域，通常是由于 dom 加载和渲染未完成时候的操作
    refresh(){
      self._setDimensions()
    },
    // 更新位置
    publish(left, top, animate){
      self._publish(left, top, animate)
    },
    // 更新位置
    scrollTo(left, top, animate){
      self._scrollTo(left, top, animate)
    },
    // 更新位置
    scrollBy(left, top, animate){
      self._scrollBy(left, top, animate)
    },
    // 停止滚动，停止动画
    stopScroll(){
      self._stopScroll()
    },
    // 获取公开属性
    getAttr(key){
      let publicAttr = [
        'scrollDirection',
        'enableScrollX',
        'enableScrollY',
        'minScrollX',
        'minScrollY',
        'maxScrollX' ,
        'maxScrollY'
      ]
      if(publicAttr.indexOf(key)!==-1){
        return self[key]
      }else{
        throw new Error('can not get attr name "key" ')
      }
    },
    // 设置公开属性
    setAttr(key,value){
      let publicAttr = [ 'enableScrollX', 'enableScrollY']
      if(publicAttr.indexOf(key)!== -1){
        self[key] = value
      }else{
        throw new Error('can not set attr name "key" ')
      }
    }
  }
}

export default publicApi
