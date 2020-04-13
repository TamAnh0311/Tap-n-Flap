cc.Class({
    extends: cc.Component,

    properties: {
        //toc do Scroller, dv:px/s
        speed:-300,
        //x den vi tri nay va bat dau cuon
       resetX:-300  
    },

    onLoad(){
        this.canScroll = true;
    },

    update(dt){
        if (!this.canScroll){
            return;
        }
        this.node.x += this.speed*dt;
        if (this.node.x <=this.resetX){
            this.node.x -= this.resetX;
        }
    },

    stopScroll(){
        this.canScroll = false;
    },

    startScroll(){
        this.canScroll = true;
    },
    // update (dt) {},
});
