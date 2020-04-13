require = function() {
  function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = "function" == typeof require && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f;
        }
        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function(e) {
          var n = t[o][1][e];
          return s(n || e);
        }, l, l.exports, e, t, n, r);
      }
      return n[o].exports;
    }
    var i = "function" == typeof require && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
  }
  return e;
}()({
  Bird: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "922a1OwZGxJkIDGMi5GrIV2", "Bird");
    "use strict";
    var State = cc.Enum({
      Ready: -1,
      Rise: -1,
      FreeFall: -1,
      Drop: -1,
      Dead: -1
    });
    cc.Class({
      statics: {
        State: State
      },
      extends: cc.Component,
      properties: {
        initRiseSpeed: 800,
        gravity: 1e3,
        state: {
          default: State.Ready,
          type: State
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
      init: function init(Playscreen) {
        this.Playscreen = Playscreen;
        this.state = State.Ready;
        this.currentSpeed = 0;
        this.anim = this.getComponent(cc.Animation);
        this.anim.playAdditive("flapping");
      },
      startFly: function startFly() {
        this._getNextPipe();
        this.anim.stop("flapping");
        this.rise();
      },
      _getNextPipe: function _getNextPipe() {
        this.nextPipe = this.Playscreen.pipeManager.getNext();
      },
      update: function update(dt) {
        if (this.state === State.Ready || this.state === State.Dead) return;
        this._updatePosition(dt);
        this._updateState(dt);
        this._detectCollision();
        this._fixBirdFinalPosition();
      },
      _updatePosition: function _updatePosition(dt) {
        var flying = this.state === State.Rise || this.state === State.FreeFall || this.state === State.Drop;
        if (flying) {
          this.currentSpeed -= dt * this.gravity;
          this.node.y += dt * this.currentSpeed;
        }
      },
      _updateState: function _updateState(dt) {
        switch (this.state) {
         case State.Rise:
          if (this.currentSpeed < 0) {
            this.state = State.FreeFall;
            this._runFallAction();
          }
          break;

         case State.Drop:
          this._detectCollisionWithBird(this.ground) && (this.state = State.Dead);
        }
      },
      _detectCollision: function _detectCollision() {
        var _this = this;
        if (!this.nextPipe) return;
        if (this.state === State.Ready || this.state === State.Dead || this.state === State.Drop) return;
        var collideWithPipe = false;
        this._detectCollisionWithBird(this.nextPipe.topPipe) && (collideWithPipe = true);
        this._detectCollisionWithBird(this.nextPipe.bottomPipe) && (collideWithPipe = true);
        var collideWithGround = false;
        this._detectCollisionWithBird(this.ground) && (collideWithGround = true);
        if (collideWithPipe || collideWithGround) {
          cc.audioEngine.playEffect(this.hitAudio);
          if (collideWithGround) this.state = State.Dead; else {
            this.state = State.Drop;
            this._runDropAction();
            this.scheduleOnce(function() {
              cc.audioEngine.playEffect(_this.dropAudio);
            }, .3);
          }
          this.anim.stop();
          this.Playscreen.gameOver();
        } else {
          var birdLeft = this.node.x;
          var pipeRight = this.nextPipe.node.x + this.nextPipe.topPipe.width;
          var crossPipe = birdLeft > pipeRight;
          if (crossPipe) {
            this.Playscreen.gainScore();
            this._getNextPipe();
          }
        }
      },
      _fixBirdFinalPosition: function _fixBirdFinalPosition() {
        this._detectCollisionWithBird(this.ground) && (this.node.y = this.ground.y + this.node.width / 2);
      },
      _detectCollisionWithBird: function _detectCollisionWithBird(otherNode) {
        return cc.rectIntersectsRect(this.node.getBoundingBoxToWorld(), otherNode.getBoundingBoxToWorld());
      },
      rise: function rise() {
        this.state = State.Rise;
        this.currentSpeed = this.initRiseSpeed;
        this._runRiseAction();
        cc.audioEngine.playEffect(this.riseAudio);
      },
      _runRiseAction: function _runRiseAction() {
        this.node.stopAllActions();
        var jumpAction = cc.rotateTo(.3, -30).easing(cc.easeCubicActionOut());
        this.node.runAction(jumpAction);
      },
      _runFallAction: function _runFallAction() {
        var duration = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : .6;
        this.node.stopAllActions();
        var dropAction = cc.rotateTo(duration, 90).easing(cc.easeCubicActionIn());
        this.node.runAction(dropAction);
      },
      _runDropAction: function _runDropAction() {
        this.currentSpeed > 0 && (this.currentSpeed = 0);
        this._runFallAction(.4);
      }
    });
    cc._RF.pop();
  }, {} ],
  PipeGroup: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "2256556HhlNJ5KBL96Z4EO4", "PipeGroup");
    "use strict";
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
      init: function init(pipeManager) {
        this.pipeManager = pipeManager;
        this._initPositionX();
        this._initPositionY();
      },
      _initPositionX: function _initPositionX() {
        var visibleSize = cc.director.getVisibleSize();
        var sceneLeft = -visibleSize.width / 2;
        var sceneRight = visibleSize.width / 2;
        this.node.x = sceneRight + 300;
        this.recylceX = sceneLeft - Math.max(this.topPipe.width, this.bottomPipe.width);
      },
      _initPositionY: function _initPositionY() {
        var visibleSize = cc.director.getVisibleSize();
        var topPipeMaxY = visibleSize.height / 2 - this.topPipeMinHeight;
        var bottomPipeMinY = cc.find("Canvas/ground").y + this.bottomPipeMinHeight;
        var spacing = this.spacingMinValue + Math.random() * (this.spacingMaxValue - this.spacingMinValue);
        this.topPipe.y = topPipeMaxY - Math.random() * (topPipeMaxY - bottomPipeMinY - spacing);
        this.bottomPipe.y = this.topPipe.y - spacing;
      },
      update: function update(dt) {
        if (!this.pipeManager.isRunning) return;
        this.node.x += this.pipeManager.pipeMoveSpeed * dt;
        this.node.x < this.recylceX && this.pipeManager.recyclePipe(this);
      }
    });
    cc._RF.pop();
  }, {} ],
  PipeManager: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "9533fzkqmFNJJUj/W6vKUqz", "PipeManager");
    "use strict";
    var PipeGroup = require("PipeGroup");
    cc.Class({
      extends: cc.Component,
      properties: {
        pipePrefab: cc.Prefab,
        pipeMoveSpeed: -300,
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
        pipeGroup = cc.pool.hasObject(PipeGroup) ? cc.pool.getFromPool(PipeGroup) : cc.instantiate(this.pipePrefab).getComponent(PipeGroup);
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
  }, {
    PipeGroup: "PipeGroup"
  } ],
  Scroll: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "4c23aIemM5PXYKRA6TtR0Zt", "Scroll");
    "use strict";
    cc.Class({
      extends: cc.Component,
      properties: {
        speed: -300,
        resetX: -300
      },
      onLoad: function onLoad() {
        this.canScroll = true;
      },
      update: function update(dt) {
        if (!this.canScroll) return;
        this.node.x += this.speed * dt;
        this.node.x <= this.resetX && (this.node.x -= this.resetX);
      },
      stopScroll: function stopScroll() {
        this.canScroll = false;
      },
      startScroll: function startScroll() {
        this.canScroll = true;
      }
    });
    cc._RF.pop();
  }, {} ],
  buttonStart: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "c93bbd6EbtFyLwHdju08pe+", "buttonStart");
    "use strict";
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
        this.maskLayer.runAction(cc.sequence(cc.fadeIn(.2), cc.callFunc(function() {
          cc.director.loadScene("Playscreen");
        }, this)));
      }
    });
    cc._RF.pop();
  }, {} ],
  game2: [ function(require, module, exports) {
    "use strict";
    cc._RF.push(module, "ed8566Q/ypI+6PXBCxy01mY", "game2");
    "use strict";
    var PipeManager = require("PipeManager");
    var Bird = require("Bird");
    var Scroll = require("Scroll");
    cc.Class({
      extends: cc.Component,
      properties: {
        goldScore: 30,
        silverScore: 10,
        pipeManager: PipeManager,
        bird: Bird,
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
      onLoad: function onLoad() {
        this.score = 0;
        this.scoreLabel.string = this.score;
        this.bird.init(this);
        this._enableInput(true);
        this._registerInput();
        this._revealScene();
      },
      _revealScene: function _revealScene() {
        this.maskLayer.active = true;
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(cc.fadeOut(.3));
      },
      restart: function restart() {
        cc.audioEngine.playEffect(this.swooshingAudio);
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(cc.sequence(cc.fadeIn(.3), cc.callFunc(function() {
          cc.director.loadScene("Playscreen");
        }, this)));
      },
      _gameStart: function _gameStart() {
        this._hideReadyMenu();
        this.pipeManager.startSpawn();
        this.bird.startFly();
      },
      gameOver: function gameOver() {
        this.pipeManager.reset();
        this.ground.getComponent(Scroll).stopScroll();
        this._enableInput(false);
        this._blinkOnce();
        this._showGameOverMenu();
      },
      gainScore: function gainScore() {
        this.score++;
        this.scoreLabel.string = this.score;
        cc.audioEngine.playEffect(this.scoreAudio);
      },
      _hideReadyMenu: function _hideReadyMenu() {
        var _this = this;
        this.scoreLabel.node.runAction(cc.fadeIn(.3));
        this.readyMenu.runAction(cc.sequence(cc.fadeOut(.5), cc.callFunc(function() {
          _this.readyMenu.active = false;
        }, this)));
      },
      _blinkOnce: function _blinkOnce() {
        this.maskLayer.color = cc.Color.WHITE;
        this.maskLayer.runAction(cc.sequence(cc.fadeTo(.1, 200), cc.fadeOut(.1)));
      },
      _showGameOverMenu: function _showGameOverMenu() {
        var _this2 = this;
        this.scoreLabel.node.runAction(cc.sequence(cc.fadeOut(.3), cc.callFunc(function() {
          _this2.scoreLabel.active = false;
        }, this)));
        var gameOverNode = this.gameOverMenu.getChildByName("gameOverLabel");
        var resultBoardNode = this.gameOverMenu.getChildByName("resultBoard");
        var buttonStartNode = this.gameOverMenu.getChildByName("buttonStart");
        var currentScoreNode = resultBoardNode.getChildByName("currentScore");
        var bestScoreNode = resultBoardNode.getChildByName("bestScore");
        var medalNode = resultBoardNode.getChildByName("medal");
        var KEY_BEST_SCORE = "bestScore";
        var bestScore = cc.sys.localStorage.getItem(KEY_BEST_SCORE);
        ("null" === bestScore || this.score > bestScore) && (bestScore = this.score);
        cc.sys.localStorage.setItem(KEY_BEST_SCORE, bestScore);
        currentScoreNode.getComponent(cc.Label).string = this.score;
        bestScoreNode.getComponent(cc.Label).string = bestScore;
        var showMedal = function showMedal(err, spriteFrame) {
          medalNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        };
        this.score >= this.goldScore ? cc.loader.loadRes("Textures/medal_gold.png/medal_gold", showMedal) : this.score >= this.silverScore ? cc.loader.loadRes("Textures/medal_silver.png/medal_silver", showMedal) : showMedal();
        var showNode = function showNode(node, action, callback) {
          buttonStartNode.active = true;
          cc.audioEngine.playEffect(_this2.swooshingAudio);
          node.runAction(cc.sequence(action, cc.callFunc(function() {
            callback && callback();
          }, _this2)));
        };
        this.gameOverMenu.active = true;
        var showNodeFunc = function showNodeFunc() {
          return showNode(gameOverNode, cc.spawn(cc.fadeIn(.2), cc.sequence(cc.moveBy(.2, cc.p(0, 10)), cc.moveBy(.5, cc.p(0, -10)))), function() {
            return showNode(resultBoardNode, cc.moveTo(.5, cc.p(resultBoardNode.x, -50)).easing(cc.easeCubicActionOut()), function() {
              return showNode(buttonStartNode, cc.fadeIn(.5));
            });
          });
        };
        this.scheduleOnce(showNodeFunc, .55);
      },
      _startGameOrJumpBird: function _startGameOrJumpBird() {
        this.bird.state === Bird.State.Ready ? this._gameStart() : this.bird.rise();
      },
      _registerInput: function _registerInput() {
        cc.eventManager.addListener({
          event: cc.EventListener.KEYBOARD,
          onKeyPressed: function(keyCode, event) {
            this._startGameOrJumpBird();
          }.bind(this)
        }, this.node);
        cc.eventManager.addListener({
          event: cc.EventListener.TOUCH_ONE_BY_ONE,
          onTouchBegan: function(touch, event) {
            this._startGameOrJumpBird();
            return true;
          }.bind(this)
        }, this.node);
      },
      _enableInput: function _enableInput(enable) {
        enable ? cc.eventManager.resumeTarget(this.node) : cc.eventManager.pauseTarget(this.node);
      }
    });
    cc._RF.pop();
  }, {
    Bird: "Bird",
    PipeManager: "PipeManager",
    Scroll: "Scroll"
  } ]
}, {}, [ "Bird", "PipeGroup", "PipeManager", "Scroll", "buttonStart", "game2" ]);