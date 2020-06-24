
import Viewport  from './Viewport';

class Scroller extends Viewport {
    constructor(selector, options) {
        super();
        this.mergeOps(options);
        this.initElement(selector);
    }

    refresh() {
        this.setDimensions();
    }
}

export default Scroller;
