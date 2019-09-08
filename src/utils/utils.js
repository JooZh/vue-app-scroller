/*---------------------------------------------------------------------------
  动画缓动函数
--------------------------------------------------------------------------- */
function _easeOutCubic(pos) {
  return (Math.pow((pos - 1), 3) + 1);
}
function _easeInOutCubic(pos) {
  if ((pos /= 0.5) < 1) {
    return 0.5 * Math.pow(pos, 3);
  }
  return 0.5 * (Math.pow((pos - 2), 3) + 2);
}
/*---------------------------------------------------------------------------
  触摸事件的 私有方法
--------------------------------------------------------------------------- */
// 是否有触摸
function _isTouches(touches){
  if (touches.length == null) {
    throw new Error("Invalid touch list: " + touches);
  }
}
// 检测时间戳
function _isTouchesTime(timeStamp){
  if (timeStamp instanceof Date) {
    timeStamp = timeStamp.valueOf();
  }
  if (typeof timeStamp !== "number") {
    throw new Error("Invalid timestamp value: " + timeStamp);
  }
}



export default {
  _isTouches,
  _isTouchesTime,
  _easeOutCubic,
  _easeInOutCubic
}
