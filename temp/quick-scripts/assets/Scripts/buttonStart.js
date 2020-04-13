(function() {"use strict";var __module = CC_EDITOR ? module : {exports:{}};var __filename = 'preview-scripts/assets/Scripts/buttonStart.js';var __require = CC_EDITOR ? function (request) {return cc.require(request, require);} : function (request) {return cc.require(request, __filename);};function __define (exports, require, module) {"use strict";
cc._RF.push(module, 'c93bbd6EbtFyLwHdju08pe+', 'buttonStart', __filename);
// Scripts/buttonStart.js

'use strict';

cc.Class({
	extends: cc.Component,

	properties: {
		swooshingAudio: {
			default: null,
			url: cc.AudioClip
		},
		maskLayer: {
			default: null,
			type: cc.Node
		}
	},
	startGame: function startGame() {
		cc.audioEngine.playEffect(this.swooshingAudio);
		this.maskLayer.active = true;
		this.maskLayer.opacity = 0;
		this.maskLayer.color = cc.Color.BLACK;
		this.maskLayer.runAction(cc.sequence(cc.fadeIn(0.2), cc.callFunc(function () {
			//tai lai canh
			cc.director.loadScene('Playscreen');
		}, this)));
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
        //# sourceMappingURL=buttonStart.js.map
        