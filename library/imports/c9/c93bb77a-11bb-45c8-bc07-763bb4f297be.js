"use strict";
cc._RF.push(module, 'c93bbd6EbtFyLwHdju08pe+', 'buttonStart');
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