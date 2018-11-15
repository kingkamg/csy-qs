

cc.Class({
    extends: cc.Component,

    properties: {
        btn_skip: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        gl.emitter.on("event_faildSeeVideo", this.faildSeeVideo, this);
        if (gl.userinfo.isWeChat) gl.wechat.showBannerAd();
        gl.emitter.emit('event_gamesopne', false);
        this.initSkipPos();
    },



    initSkipPos() {
        if (gl.bannerSize && gl.bannerSize[gl.bannerIndex]) {
            let bannerInfo = gl.bannerSize[gl.bannerIndex];
            if (bannerInfo.height && bannerInfo.winHeight) {
                this.btn_skip.y = -(cc.winSize.height / 2 - (bannerInfo.height / (bannerInfo.winHeight / cc.winSize.height))) + this.btn_skip.height / 2;
            }
        }
    },

    btn_boom_cb() {
        if (gl.userinfo.isWeChat) {
            let randomOpen = Math.floor(Math.random() * 2);
            if (randomOpen == 0) {
                this.viedoOpen();
            } else {
                this.shareOpen();
            }
        } else {
            this.breakBottle()
        }
    },

    viedoOpen() {
        gl.wechat.showRewardVideoAd(() => {
            this.breakBottle();
            gl.wechat.shareAppMessage();
        }, () => {
            this.shareOpen();
        })
    },
    shareOpen() {
        gl.wechat.shareAppMessage();
        gl.backCb = () => {
            this.breakBottle();
        }
        gl.failCb = () => {
            gl.showTip('分享失败');
        }
    },
    faildSeeVideo() {
        this.shareOpen();
    },

    btn_skip_cb() {
        this.node && this.node.destroy();
    },

    breakBottle() {
        this.scheduleOnce(() => {
            gl.emitter.emitOnce('eventOnce_bottleBreak');
            this.node && this.node.destroy();
        }, 0.5)
    },

    onDestroy() {
        gl.emitter.emit('event_gamesopne', true);
        gl.emitter.off("event_faildSeeVideo", this);
        if (gl.userinfo.isWeChat) gl.wechat.hideBannerAd();
    },


    // update (dt) {},
});
