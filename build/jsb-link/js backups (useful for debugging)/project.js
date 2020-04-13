require = function s(o, r, a) {
function u(i, e) {
if (!r[i]) {
if (!o[i]) {
var t = "function" == typeof require && require;
if (!e && t) return t(i, !0);
if (h) return h(i, !0);
var n = new Error("Cannot find module '" + i + "'");
throw n.code = "MODULE_NOT_FOUND", n;
}
var c = r[i] = {
exports: {}
};
o[i][0].call(c.exports, function(e) {
var t = o[i][1][e];
return u(t || e);
}, c, c.exports, s, o, r, a);
}
return r[i].exports;
}
for (var h = "function" == typeof require && require, e = 0; e < a.length; e++) u(a[e]);
return u;
}({
Bird: [ function(e, t, i) {
"use strict";
cc._RF.push(t, "922a1OwZGxJkIDGMi5GrIV2", "Bird");
var c = cc.Enum({
Ready: -1,
Rise: -1,
FreeFall: -1,
Drop: -1,
Dead: -1
});
cc.Class({
statics: {
State: c
},
extends: cc.Component,
properties: {
initRiseSpeed: 800,
gravity: 1e3,
state: {
default: c.Ready,
type: c
},
ground: {
default: null,
type: cc.Node
},
riseAudio: {
default: null,
url: cc.AudioClip
},
dropAudio: {
default: null,
url: cc.AudioClip
},
hitAudio: {
default: null,
url: cc.AudioClip
}
},
init: function(e) {
this.Playscreen = e;
this.state = c.Ready;
this.currentSpeed = 0;
this.anim = this.getComponent(cc.Animation);
this.anim.playAdditive("flapping");
},
startFly: function() {
this._getNextPipe();
this.anim.stop("flapping");
this.rise();
},
_getNextPipe: function() {
this.nextPipe = this.Playscreen.pipeManager.getNext();
},
update: function(e) {
if (this.state !== c.Ready && this.state !== c.Dead) {
this._updatePosition(e);
this._updateState(e);
this._detectCollision();
this._fixBirdFinalPosition();
}
},
_updatePosition: function(e) {
if (this.state === c.Rise || this.state === c.FreeFall || this.state === c.Drop) {
this.currentSpeed -= e * this.gravity;
this.node.y += e * this.currentSpeed;
}
},
_updateState: function(e) {
switch (this.state) {
case c.Rise:
if (this.currentSpeed < 0) {
this.state = c.FreeFall;
this._runFallAction();
}
break;

case c.Drop:
this._detectCollisionWithBird(this.ground) && (this.state = c.Dead);
}
},
_detectCollision: function() {
var e = this;
if (this.nextPipe && this.state !== c.Ready && this.state !== c.Dead && this.state !== c.Drop) {
var t = !1;
this._detectCollisionWithBird(this.nextPipe.topPipe) && (t = !0);
this._detectCollisionWithBird(this.nextPipe.bottomPipe) && (t = !0);
var i = !1;
this._detectCollisionWithBird(this.ground) && (i = !0);
if (t || i) {
cc.audioEngine.playEffect(this.hitAudio);
if (i) this.state = c.Dead; else {
this.state = c.Drop;
this._runDropAction();
this.scheduleOnce(function() {
cc.audioEngine.playEffect(e.dropAudio);
}, .3);
}
this.anim.stop();
this.Playscreen.gameOver();
} else {
var n = this.node.x;
if (this.nextPipe.node.x + this.nextPipe.topPipe.width < n) {
this.Playscreen.gainScore();
this._getNextPipe();
}
}
}
},
_fixBirdFinalPosition: function() {
this._detectCollisionWithBird(this.ground) && (this.node.y = this.ground.y + this.node.width / 2);
},
_detectCollisionWithBird: function(e) {
return cc.rectIntersectsRect(this.node.getBoundingBoxToWorld(), e.getBoundingBoxToWorld());
},
rise: function() {
this.state = c.Rise;
this.currentSpeed = this.initRiseSpeed;
this._runRiseAction();
cc.audioEngine.playEffect(this.riseAudio);
},
_runRiseAction: function() {
this.node.stopAllActions();
var e = cc.rotateTo(.3, -30).easing(cc.easeCubicActionOut());
this.node.runAction(e);
},
_runFallAction: function() {
var e = 0 < arguments.length && void 0 !== arguments[0] ? arguments[0] : .6;
this.node.stopAllActions();
var t = cc.rotateTo(e, 90).easing(cc.easeCubicActionIn());
this.node.runAction(t);
},
_runDropAction: function() {
0 < this.currentSpeed && (this.currentSpeed = 0);
this._runFallAction(.4);
}
});
cc._RF.pop();
}, {} ],
PipeGroup: [ function(e, t, i) {
"use strict";
cc._RF.push(t, "2256556HhlNJ5KBL96Z4EO4", "PipeGroup");
cc.Class({
extends: cc.Component,
properties: {
topPipeMinHeight: 100,
bottomPipeMinHeight: 100,
spacingMinValue: 250,
spacingMaxValue: 300,
topPipe: cc.Node,
bottomPipe: cc.Node
},
init: function(e) {
this.pipeManager = e;
this._initPositionX();
this._initPositionY();
},
_initPositionX: function() {
var e = cc.director.getVisibleSize(), t = -e.width / 2, i = e.width / 2;
this.node.x = i + 300;
this.recylceX = t - Math.max(this.topPipe.width, this.bottomPipe.width);
},
_initPositionY: function() {
var e = cc.director.getVisibleSize().height / 2 - this.topPipeMinHeight, t = cc.find("Canvas/ground").y + this.bottomPipeMinHeight, i = this.spacingMinValue + Math.random() * (this.spacingMaxValue - this.spacingMinValue);
this.topPipe.y = e - Math.random() * (e - t - i);
this.bottomPipe.y = this.topPipe.y - i;
},
update: function(e) {
if (this.pipeManager.isRunning) {
this.node.x += this.pipeManager.pipeMoveSpeed * e;
this.node.x < this.recylceX && this.pipeManager.recyclePipe(this);
}
}
});
cc._RF.pop();
}, {} ],
PipeManager: [ function(e, t, i) {
"use strict";
cc._RF.push(t, "9533fzkqmFNJJUj/W6vKUqz", "PipeManager");
var n = e("PipeGroup");
cc.Class({
extends: cc.Component,
properties: {
pipePrefab: cc.Prefab,
pipeMoveSpeed: -300,
pipeSpacing: 400
},
onLoad: function() {
this.pipeList = [];
this.isRunning = !1;
},
startSpawn: function() {
this._spawnPipe();
var e = Math.abs(this.pipeSpacing / this.pipeMoveSpeed);
this.schedule(this._spawnPipe, e);
this.isRunning = !0;
},
_spawnPipe: function() {
var e = null;
e = cc.pool.hasObject(n) ? cc.pool.getFromPool(n) : cc.instantiate(this.pipePrefab).getComponent(n);
this.node.addChild(e.node);
e.node.active = !0;
e.init(this);
this.pipeList.push(e);
},
recyclePipe: function(e) {
e.node.removeFromParent();
e.node.active = !1;
cc.pool.putInPool(e);
},
getNext: function() {
return this.pipeList.shift();
},
reset: function() {
this.unschedule(this._spawnPipe);
this.pipeList = [];
this.isRunning = !1;
}
});
cc._RF.pop();
}, {
PipeGroup: "PipeGroup"
} ],
Scroll: [ function(e, t, i) {
"use strict";
cc._RF.push(t, "4c23aIemM5PXYKRA6TtR0Zt", "Scroll");
cc.Class({
extends: cc.Component,
properties: {
speed: -300,
resetX: -300
},
onLoad: function() {
this.canScroll = !0;
},
update: function(e) {
if (this.canScroll) {
this.node.x += this.speed * e;
this.node.x <= this.resetX && (this.node.x -= this.resetX);
}
},
stopScroll: function() {
this.canScroll = !1;
},
startScroll: function() {
this.canScroll = !0;
}
});
cc._RF.pop();
}, {} ],
buttonStart: [ function(e, t, i) {
"use strict";
cc._RF.push(t, "c93bbd6EbtFyLwHdju08pe+", "buttonStart");
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
startGame: function() {
cc.audioEngine.playEffect(this.swooshingAudio);
this.maskLayer.active = !0;
this.maskLayer.opacity = 0;
this.maskLayer.color = cc.Color.BLACK;
this.maskLayer.runAction(cc.sequence(cc.fadeIn(.2), cc.callFunc(function() {
cc.director.loadScene("Playscreen");
}, this)));
}
});
cc._RF.pop();
}, {} ],
game2: [ function(e, t, i) {
"use strict";
cc._RF.push(t, "ed8566Q/ypI+6PXBCxy01mY", "game2");
var n = e("PipeManager"), c = e("Bird"), s = e("Scroll");
cc.Class({
extends: cc.Component,
properties: {
goldScore: 30,
silverScore: 10,
pipeManager: n,
bird: c,
scoreLabel: cc.Label,
maskLayer: {
default: null,
type: cc.Node
},
ground: {
default: null,
type: cc.Node
},
readyMenu: {
default: null,
type: cc.Node
},
gameOverMenu: {
default: null,
type: cc.Node
},
scoreAudio: {
default: null,
url: cc.AudioClip
},
swooshingAudio: {
default: null,
url: cc.AudioClip
}
},
onLoad: function() {
this.score = 0;
this.scoreLabel.string = this.score;
this.bird.init(this);
this._enableInput(!0);
this._registerInput();
this._revealScene();
},
_revealScene: function() {
this.maskLayer.active = !0;
this.maskLayer.color = cc.Color.BLACK;
this.maskLayer.runAction(cc.fadeOut(.3));
},
restart: function() {
cc.audioEngine.playEffect(this.swooshingAudio);
this.maskLayer.color = cc.Color.BLACK;
this.maskLayer.runAction(cc.sequence(cc.fadeIn(.3), cc.callFunc(function() {
cc.director.loadScene("Playscreen");
}, this)));
},
_gameStart: function() {
this._hideReadyMenu();
this.pipeManager.startSpawn();
this.bird.startFly();
},
gameOver: function() {
this.pipeManager.reset();
this.ground.getComponent(s).stopScroll();
this._enableInput(!1);
this._blinkOnce();
this._showGameOverMenu();
},
gainScore: function() {
this.score++;
this.scoreLabel.string = this.score;
cc.audioEngine.playEffect(this.scoreAudio);
},
_hideReadyMenu: function() {
var e = this;
this.scoreLabel.node.runAction(cc.fadeIn(.3));
this.readyMenu.runAction(cc.sequence(cc.fadeOut(.5), cc.callFunc(function() {
e.readyMenu.active = !1;
}, this)));
},
_blinkOnce: function() {
this.maskLayer.color = cc.Color.WHITE;
this.maskLayer.runAction(cc.sequence(cc.fadeTo(.1, 200), cc.fadeOut(.1)));
},
_showGameOverMenu: function() {
var n = this;
this.scoreLabel.node.runAction(cc.sequence(cc.fadeOut(.3), cc.callFunc(function() {
n.scoreLabel.active = !1;
}, this)));
var e = this.gameOverMenu.getChildByName("gameOverLabel"), t = this.gameOverMenu.getChildByName("resultBoard"), c = this.gameOverMenu.getChildByName("buttonStart"), i = t.getChildByName("currentScore"), s = t.getChildByName("bestScore"), o = t.getChildByName("medal"), r = "bestScore", a = cc.sys.localStorage.getItem(r);
("null" === a || this.score > a) && (a = this.score);
cc.sys.localStorage.setItem(r, a);
i.getComponent(cc.Label).string = this.score;
s.getComponent(cc.Label).string = a;
var u = function(e, t) {
o.getComponent(cc.Sprite).spriteFrame = t;
};
this.score >= this.goldScore ? cc.loader.loadRes("Textures/medal_gold.png/medal_gold", u) : this.score >= this.silverScore ? cc.loader.loadRes("Textures/medal_silver.png/medal_silver", u) : u();
var h = function(e, t, i) {
c.active = !0;
cc.audioEngine.playEffect(n.swooshingAudio);
e.runAction(cc.sequence(t, cc.callFunc(function() {
i && i();
}, n)));
};
this.gameOverMenu.active = !0;
this.scheduleOnce(function() {
return h(e, cc.spawn(cc.fadeIn(.2), cc.sequence(cc.moveBy(.2, cc.p(0, 10)), cc.moveBy(.5, cc.p(0, -10)))), function() {
return h(t, cc.moveTo(.5, cc.p(t.x, -50)).easing(cc.easeCubicActionOut()), function() {
return h(c, cc.fadeIn(.5));
});
});
}, .55);
},
_startGameOrJumpBird: function() {
this.bird.state === c.State.Ready ? this._gameStart() : this.bird.rise();
},
_registerInput: function() {
cc.eventManager.addListener({
event: cc.EventListener.KEYBOARD,
onKeyPressed: function(e, t) {
this._startGameOrJumpBird();
}.bind(this)
}, this.node);
cc.eventManager.addListener({
event: cc.EventListener.TOUCH_ONE_BY_ONE,
onTouchBegan: function(e, t) {
this._startGameOrJumpBird();
return !0;
}.bind(this)
}, this.node);
},
_enableInput: function(e) {
e ? cc.eventManager.resumeTarget(this.node) : cc.eventManager.pauseTarget(this.node);
}
});
cc._RF.pop();
}, {
Bird: "Bird",
PipeManager: "PipeManager",
Scroll: "Scroll"
} ]
}, {}, [ "Bird", "PipeGroup", "PipeManager", "Scroll", "buttonStart", "game2" ]);