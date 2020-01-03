 const Render = (content) => {
  let global = window;
  let docStyle = document.documentElement.style;
  let engine;
  if (global.opera && Object.prototype.toString.call(opera) === '[object Opera]') {
    engine = 'presto';
  } else if ('MozAppearance' in docStyle) {
    engine = 'gecko';
  } else if ('WebkitAppearance' in docStyle) {
    engine = 'webkit';
  } else if (typeof navigator.cpuClass === 'string') {
    engine = 'trident';
  }
  let vendorPrefix = {
    trident: 'ms',
    gecko: 'Moz',
    webkit: 'Webkit',
    presto: 'O'
  } [engine];

  let helperElem = document.createElement("div");
  let undef;
  let perspectiveProperty = vendorPrefix + "Perspective";
  let transformProperty = vendorPrefix + "Transform";
  if (helperElem.style[perspectiveProperty] !== undef) {
    return function(left, top, zoom) {
      content.style[transformProperty] = 'translate3d(' + (-left) + 'px,' + (-top) + 'px,0) scale(' + zoom + ')';
    };
  } else if (helperElem.style[transformProperty] !== undef) {
    return function(left, top, zoom) {
      content.style[transformProperty] = 'translate(' + (-left) + 'px,' + (-top) + 'px) scale(' + zoom + ')';
    };
  } else {
    return function(left, top, zoom) {
      content.style.marginLeft = left ? (-left/zoom) + 'px' : '';
      content.style.marginTop = top ? (-top/zoom) + 'px' : '';
      content.style.zoom = zoom || '';
    };
  }
}
export default Render
