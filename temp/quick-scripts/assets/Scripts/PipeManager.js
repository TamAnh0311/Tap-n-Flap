(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Scripts/PipeManager.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, '9533fzkqmFNJJUj/W6vKUqz', 'PipeManager', __filename);
// Scripts/PipeManager.js

'use strict';

var PipeGroup = require('PipeGroup');

cc.Class({
    extends: cc.Component,

    properties: {
        /** Tài nguyên tiền chế của nút đường ống */
        pipePrefab: cc.Prefab,
        /** Tốc độ di chuyển ống, đơn vị px/s */
        pipeMoveSpeed: -300,
        /** Khoảng cách giữa mỗi cặp ống, đơn vị px */
        pipeSpacing: 400
    },

    onLoad: function onLoad() {
        this.pipeList = [];
        this.isRunning = false;
    },
    startSpawn: function startSpawn() {
        this._spawnPipe();
        var spawnInterval = Math.abs(this.pipeSpacing / this.pipeMoveSpeed);
        this.schedule(this._spawnPipe, spawnInterval);
        this.isRunning = true;
    },
    _spawnPipe: function _spawnPipe() {
        var pipeGroup = null;
        if (cc.pool.hasObject(PipeGroup)) {
            pipeGroup = cc.pool.getFromPool(PipeGroup);
        } else {
            pipeGroup = cc.instantiate(this.pipePrefab).getComponent(PipeGroup);
        }
        this.node.addChild(pipeGroup.node);
        pipeGroup.node.active = true;
        pipeGroup.init(this);
        this.pipeList.push(pipeGroup);
    },
    recyclePipe: function recyclePipe(pipe) {
        pipe.node.removeFromParent();
        pipe.node.active = false;
        cc.pool.putInPool(pipe);
    },


    /** Nhận ống nước thất bại tiếp theo
    */
    getNext: function getNext() {
        return this.pipeList.shift();
    },
    reset: function reset() {
        this.unschedule(this._spawnPipe);
        this.pipeList = [];
        this.isRunning = false;
    }
});

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
        //# sourceMappingURL=PipeManager.js.map
        