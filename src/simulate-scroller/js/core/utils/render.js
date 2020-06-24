const Render = content => {
    // 浏览器能力检测，进行对应的渲染
    let global = window;
    let docStyle = document.documentElement.style;
    let engine;
    if (global.opera && Object.prototype.toString.call(global.opera) === '[object Opera]') {
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
    }[engine];

    let helperElem = document.createElement('div');
    let undef;
    let perspectiveProperty = vendorPrefix + 'Perspective';
    let transformProperty = vendorPrefix + 'Transform';

    if (helperElem.style[perspectiveProperty] !== undef) {
        return function(left, top) {
            content.style[transformProperty] = 'translate3d(' + -left + 'px,' + -top + 'px,0)';
        };
    } else if (helperElem.style[transformProperty] !== undef) {
        return function(left, top) {
            content.style[transformProperty] = 'translate(' + -left + 'px,' + -top + 'px)';
        };
    } else {
        return function(left, top) {
            content.style.marginLeft = left ? -left + 'px' : '';
            content.style.marginTop = top ? -top + 'px' : '';
        };
    }
};
export default Render;
