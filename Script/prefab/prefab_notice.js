
cc.Class({
    extends: cc.Component,

    properties: {
        lab_content: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (gl.userinfo.isWeChat) gl.wechat.hideBannerAd();
        this.initPanel();
    },

    initPanel() {
        this.notice = gl.userinfo.get('bulletin');
        let content = this.notice.content;
        this.lab_content.string = content;
    },

    btn_close() {
        this.node.destroy();
    },

    onDestroy() {
        if (gl.userinfo.isWeChat) gl.wechat.showBannerAd();
    }


    // update (dt) {},
});
