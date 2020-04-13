"use strict";
cc._RF.push(module, '4c23aIemM5PXYKRA6TtR0Zt', 'Scroll');
// Scripts/Scroll.js

"use strict";

cc.Class({
    extends: cc.Component,

    properties: {
        //toc do Scroller, dv:px/s
        speed: -300,
        //x den vi tri nay va bat dau cuon
        resetX: -300
    },

    onLoad: function onLoad() {
        this.canScroll = true;
    },
    update: function update(dt) {
        if (!this.canScroll) {
            return;
        }
        this.node.x += this.speed * dt;
        if (this.node.x <= this.resetX) {
            this.node.x -= this.resetX;
        }
    },
    stopScroll: function stopScroll() {
        this.canScroll = false;
    },
    startScroll: function startScroll() {
        this.canScroll = true;
    }
}
// update (dt) {},
);

cc._RF.pop();