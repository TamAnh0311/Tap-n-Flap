var PipeManager = require('PipeManager');
var Bird = require('Bird');
var Scroll = require('Scroll');

cc.Class({
    extends: cc.Component,

    properties: {
        /** Điểm vàng */
        goldScore: 30,
        /** Điểm số bạc */
        silverScore: 10,
        /** Thành phần quản lý đường ống */
        pipeManager: PipeManager,
        /** Thành phần chim */
        bird: Bird,
        /** Nút hiển thị điểm */
        scoreLabel: cc.Label,
        /** Nút mặt nạ */
        maskLayer: {
            default: null,
            type: cc.Node
        },
        /** Nút mặt đất */
        ground: {
            default: null,
            type: cc.Node
        },
        /** Chuẩn bị để bắt đầu nút menu */
        readyMenu: {
            default: null,
            type: cc.Node
        },
        /** Nút menu kết thúc trò chơi */
        gameOverMenu: {
            default: null,
            type: cc.Node
        },
        /** Âm thanh điểm */
        scoreAudio: {
            default: null,
            url: cc.AudioClip
        },
        /** Nút bấm, âm thanh khi nút xuất hiện */
        swooshingAudio: {
            default: null,
            url: cc.AudioClip
        }
    },

    onLoad() {
        this.score = 0;
        this.scoreLabel.string = this.score;
        this.bird.init(this);
        this._enableInput(true);
        this._registerInput();
        this._revealScene();
    },

    _revealScene(){
        this.maskLayer.active = true;
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(cc.fadeOut(0.3));
    },

    /** Nhấp vào nút Khởi động lại trò chơi trong menu kết thúc trò chơi sẽ gọi phương thức này */
    restart(){
        //cai nay k chay duoc
        cc.audioEngine.playEffect(this.swooshingAudio);
        this.maskLayer.color = cc.Color.BLACK;
        this.maskLayer.runAction(
            cc.sequence(
                cc.fadeIn(0.3),
                cc.callFunc(()=> {
                    // Tải lại cảnh
                    cc.director.loadScene('Playscreen');
                }, this)
            )
        );
    },

    _gameStart(){
        this._hideReadyMenu();
        //cái này chạy
        this.pipeManager.startSpawn();
        //pipe pipeManager bi loi
        this.bird.startFly();
    },

    gameOver () {
        this.pipeManager.reset();
        this.ground.getComponent(Scroll).stopScroll();
        this._enableInput(false);
        this._blinkOnce();
        this._showGameOverMenu();
    },

    gainScore () {
        this.score++;
        this.scoreLabel.string = this.score;
        cc.audioEngine.playEffect(this.scoreAudio);
    },

    _hideReadyMenu(){
        this.scoreLabel.node.runAction(cc.fadeIn(0.3));
        this.readyMenu.runAction(
            cc.sequence(
                cc.fadeOut(0.5),
                cc.callFunc(()=> {
                    this.readyMenu.active = false;
                }, this)
            )
        );
    },

    /** Màn hình nhấp nháy */
    _blinkOnce(){
        this.maskLayer.color = cc.Color.WHITE;
        this.maskLayer.runAction(
            cc.sequence(
                cc.fadeTo(0.1, 200),
                cc.fadeOut(0.1)
            )
        );
    },

    _showGameOverMenu(){
        // Ẩn điểm số

        this.scoreLabel.node.runAction(
            cc.sequence(
                cc.fadeOut(0.3),
                cc.callFunc(()=> {
                    this.scoreLabel.active = false;
                }, this)
            )
        );

        // Nhận từng nút giao diện kết thúc trò chơi
        let gameOverNode = this.gameOverMenu.getChildByName("gameOverLabel");
        let resultBoardNode = this.gameOverMenu.getChildByName("resultBoard");
        let buttonStartNode = this.gameOverMenu.getChildByName("buttonStart");
        let currentScoreNode = resultBoardNode.getChildByName("currentScore");
        let bestScoreNode = resultBoardNode.getChildByName("bestScore");
        let medalNode = resultBoardNode.getChildByName("medal");

        // Lưu điểm cao nhất 
        const KEY_BEST_SCORE = "bestScore";
        let bestScore = cc.sys.localStorage.getItem(KEY_BEST_SCORE);
        if (bestScore === "null" || this.score > bestScore) {
            bestScore = this.score;
        }
        cc.sys.localStorage.setItem(KEY_BEST_SCORE, bestScore);

        // Hiển thị điểm số hiện tại, điểm số cao nhất
        currentScoreNode.getComponent(cc.Label).string = this.score;
        bestScoreNode.getComponent(cc.Label).string = bestScore;

        // Quyết định xem có hiển thị huy chương hay không
        let showMedal = (err, spriteFrame) => {
            medalNode.getComponent(cc.Sprite).spriteFrame = spriteFrame;
        };
        
        if (this.score >= this.goldScore) { // Hiển thị huy chương vàng
            cc.loader.loadRes("Textures/medal_gold.png/medal_gold", showMedal);
        } else if (this.score >= this.silverScore) { // Hiển thị huy chương bạc

            cc.loader.loadRes("Textures/medal_silver.png/medal_silver", showMedal);
        } else { // Không hiển thị huy chương
            showMedal();
        }

        // Hiển thị từng nút lần lượt
        var showNode = (node, action, callback)=> {
            buttonStartNode.active = true;
            cc.audioEngine.playEffect(this.swooshingAudio);
            node.runAction(cc.sequence(
                action,
                cc.callFunc(()=> {
                    if (callback) {
                        callback();
                    }
                }, this)
            ));
        };
        this.gameOverMenu.active = true;
        let showNodeFunc = ()=> showNode(
            gameOverNode,
            cc.spawn(
                cc.fadeIn(0.2),
                cc.sequence(
                    cc.moveBy(0.2, cc.p(0, 10)),
                    cc.moveBy(0.5, cc.p(0, -10))
                )
            ),
            ()=>showNode(
                resultBoardNode,
                cc.moveTo(0.5, cc.p(resultBoardNode.x, -50)).easing(cc.easeCubicActionOut()),
                ()=>showNode(
                    buttonStartNode,
                    cc.fadeIn(0.5))
            )
        );
        this.scheduleOnce(showNodeFunc, 0.55);
    },

    _startGameOrJumpBird(){
        if (this.bird.state === Bird.State.Ready) {
            this._gameStart();
        } else {
            this.bird.rise();
        }
    },

    _registerInput () {
        cc.eventManager.addListener({
            event: cc.EventListener.KEYBOARD,
            onKeyPressed: function (keyCode, event) {
                this._startGameOrJumpBird();
            }.bind(this)
        }, this.node);
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function (touch, event) {
                this._startGameOrJumpBird();
                return true;
            }.bind(this)
        }, this.node);
    },

    _enableInput: function (enable) {
        if (enable) {
            cc.eventManager.resumeTarget(this.node);
        } else {
            cc.eventManager.pauseTarget(this.node);
        }
    },
});