(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Scripts/Scroll.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '4c23aIemM5PXYKRA6TtR0Zt', 'Scroll', __filename);
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
        }
        if (CC_EDITOR) {
            __define(__module.exports, __require, __module);
        }
        else {
            cc.registerModuleFunc(__filename, function () {
                __define(__module.exports, __require, __module);
            });
        }
        })();
        //# sourceMappingURL=Scroll.js.map
        