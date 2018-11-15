
cc.Class({
    extends: cc.Component,

    properties: {
        label_hint: cc.Label,
        node_flag: [cc.Node],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        gl.emitter.on("event_faildSeeVideo", this.faildSeeVideo, this);
        if (gl.userinfo.isWeChat && gl.userinfo.wechatadUnitId == "") gl.userinfo.reqGainAdId();
        // if (!gl.userinfo.wechatflag) {
        //     for (let key in this.node_flag) {
        //         let btn_node = this.node_flag[key];
        //         btn_node.active = false;
        //     }
        //     this.label_hint.string = "体力不足";
        //     this.label_hint.horizontalAlign = 1;
        // }
        if (!gl.userinfo.wechatflag) {
            this.label_hint.string = "看完视频，加5点体力";
        }
    },


    //-------btn callback------
    btn_cancel() {
        this.node.destroy();
        gl.audio.clickPlay();
    },

    btn_addStamina() {
        if (gl.userinfo.isWeChat) {
            //广告跳转预留
            if (gl.userinfo.sharecount == 0 && gl.userinfo.wechatadUnitId != "") {
                gl.wechat.showRewardVideoAd(() => {
                    gl.userinfo.reqStamina(2, "", "");
                    gl.wechat.shareAppMessages();
                },()=>{
                    gl.userinfo.reqGetShareStamina();
                })
            } else {
                gl.userinfo.reqGetShareStamina();
            }
            this.node.destroy();
        } else {
            gl.userinfo.stamina = 10;
            gl.emitter.emit("event_refreshstamina");
            this.node.destroy();
        }
        gl.audio.clickPlay();
    },

    faildSeeVideo() {
        gl.userinfo.reqGetShareStamina();
    },

    start() {

    },

    // update (dt) {},

    onDestroy() {
        gl.emitter.off("event_faildSeeVideo", this);
    }
});
