const State = cc.Enum({
    /** Chuẩn bị trước khi trò chơi bắt đầu */
    Ready: -1,
    /** Chim tăng */
    Rise: -1,
    /** Chim rơi tự do */
    FreeFall: -1,
    /** Chim đâm vào ống rơi */
    Drop: -1,
    /** Con chim đã rơi xuống đất */
    Dead: -1,
});

cc.Class({
    statics: {
        State: State
    },

    extends: cc.Component,

    properties: {
        /** Tốc độ ném, tính bằng pixel / giây */
        initRiseSpeed: 800,
        /** Tăng tốc trọng lực, đơn vị: pixel / giây bình phương*/
        gravity: 1000,
        /** Tình trạng của chim */
        state: {
            default: State.Ready,
            type: State,
        },
        /** Nút mặt đất */
        ground: {
            default: null,
            type: cc.Node
        },
        /** Âm thanh chim bay lên trên */
        riseAudio: {
            default: null,
            url: cc.AudioClip
        },
        /** Tiếng chim bắt đầu rơi xuống sau khi va chạm với ống nước */
        dropAudio: {
            default: null,
            url: cc.AudioClip
        },
        /** Tiếng va chạm của con chim */
        hitAudio: {
            default: null,
            url: cc.AudioClip
        },
    },

    init(Playscreen){
        this.Playscreen = Playscreen;
        this.state = State.Ready;
        this.currentSpeed = 0;
        this.anim = this.getComponent(cc.Animation);
        this.anim.playAdditive("flapping");
    },

    startFly () {
        this._getNextPipe();
        this.anim.stop("flapping");
        this.rise();
    },

    _getNextPipe () {
        this.nextPipe = this.Playscreen.pipeManager.getNext();
    },

    update (dt) {
        if (this.state === State.Ready || this.state === State.Dead) {
            return;
        }
        this._updatePosition(dt);
        this._updateState(dt);
        this._detectCollision();
        this._fixBirdFinalPosition();
    },

    _updatePosition (dt) {
        var flying = this.state === State.Rise
            || this.state === State.FreeFall
            || this.state === State.Drop;
        if (flying) {
            this.currentSpeed -= dt * this.gravity;
            this.node.y += dt * this.currentSpeed;
        }
    },

    _updateState (dt) {
        switch (this.state) {
            case State.Rise:
                if (this.currentSpeed < 0) {
                    this.state = State.FreeFall;
                    this._runFallAction();
                }
                break;
            case State.Drop:
                if (this._detectCollisionWithBird(this.ground)) {
                    this.state = State.Dead;
                }
                break;
        }
    },

    _detectCollision () {
        if (!this.nextPipe) {
            return;
        }
        if (this.state === State.Ready || this.state === State.Dead || this.state === State.Drop) {
            return;
        }
        let collideWithPipe = false;
        // Phát hiện va chạm giữa chim và ống trên
        if (this._detectCollisionWithBird(this.nextPipe.topPipe)) {
            collideWithPipe = true;
        }
        // Phát hiện va chạm của chim với ống bên dưới
        if (this._detectCollisionWithBird(this.nextPipe.bottomPipe)) {
            collideWithPipe = true;
        }
        // Phát hiện va chạm giữa chim và mặt đất
        let collideWithGround = false;
        if (this._detectCollisionWithBird(this.ground)) {
            collideWithGround = true;
        }
        // Xử lý kết quả va chạm
        if (collideWithPipe || collideWithGround) {
            cc.audioEngine.playEffect(this.hitAudio);

            if (collideWithGround) { // Va chạm với mặt đất
                this.state = State.Dead;
            } else { // Va chạm với một đường ống nước
                this.state = State.Drop;
                this._runDropAction();
                this.scheduleOnce(()=> {
                    cc.audioEngine.playEffect(this.dropAudio);
                }, 0.3);
            }

            this.anim.stop();
            this.Playscreen.gameOver();
      
        } else { // Xử lý không có xung đột
            let birdLeft = this.node.x;
            let pipeRight = this.nextPipe.node.x + this.nextPipe.topPipe.width
            let crossPipe = birdLeft > pipeRight;
            if (crossPipe) {
                this.Playscreen.gainScore();
                this._getNextPipe();
            }
        }
    },


    /** Sửa vị trí đích cuối cùng */
    _fixBirdFinalPosition(){
        if (this._detectCollisionWithBird(this.ground)) {
            this.node.y = this.ground.y + this.node.width / 2;
        }
    },

    _detectCollisionWithBird(otherNode){
        return cc.rectIntersectsRect(this.node.getBoundingBoxToWorld(), otherNode.getBoundingBoxToWorld());
    },

    rise() {
        this.state = State.Rise;
        this.currentSpeed = this.initRiseSpeed;
        this._runRiseAction();
        cc.audioEngine.playEffect(this.riseAudio);
    },

    _runRiseAction(){
        this.node.stopAllActions();
        let jumpAction = cc.rotateTo(0.3, -30).easing(cc.easeCubicActionOut());
        this.node.runAction(jumpAction);
    },

    _runFallAction(duration = 0.6){
        this.node.stopAllActions();
        let dropAction = cc.rotateTo(duration, 90).easing(cc.easeCubicActionIn());
        this.node.runAction(dropAction);
    },

    _runDropAction(){
        if (this.currentSpeed > 0) {
            this.currentSpeed = 0;
        }
        this._runFallAction(0.4);
    }
});
