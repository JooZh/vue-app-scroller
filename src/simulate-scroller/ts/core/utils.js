export const noop = () => {};

export const isTouch = (timeStamp, touches) => {
    if (touches && !touches.length) {
        throw new Error('Invalid touch list: ' + touches);
    }
    if (typeof timeStamp !== 'number') {
        throw new Error('Invalid timestamp value: ' + timeStamp);
    }
};
// 缓动函数
export const easeOut = (pos) => {
    return Math.pow(pos - 1, 3) + 1;
};
export const easeInOut = (pos) => {
    // eslint-disable-next-line no-param-reassign
    if ((pos /= 0.5) < 1) {
        return 0.5 * Math.pow(pos, 3);
    }
    return 0.5 * (Math.pow(pos - 2, 3) + 2);
};

