
const RANK_TYPE = {
    FRIEND: 0,
    OWNER: 1,
}
const BUTTON_TYPE = {
    SELECT: 0,
    CANCEL: 1,
}

cc.Class({
    extends: cc.Component,

    properties: {
        node_bg: cc.Node,
        node_color: [cc.Node],
        sprite_rankingScrollView: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.tex = new cc.Texture2D();
        this.blSetWin = false;
        this.initWnd();
    },

    initWnd() {
        //gl.color_index = Math.random(2);
        //变色控制
        this.node_bg.setColor(gl.bottom_color[gl.color_index]);

        //设置按钮颜色
        for (let key in this.node_color) {
            let btn_node = this.node_color[key];
            btn_node.setColor(gl.button_color[gl.color_index]);
        }
    },

    onButton(self) {
        switch (self.target.name) {
            case "btn_close":
                this.node.destroy();
                break;
            case "btn_left":
                this.onLeftPage();
                break;
            case "btn_right":
                this.onRightPage();
                break;
            default:
                break;
        }
        gl.audio.clickPlay();
    },
    onLeftPage() {
        gl.wechat.openDataPostMessage({
            messageType: gl.MESSAGE_TYPE.RANK_PAGE,
            page: 0,
        });
    },
    onRightPage() {
        gl.wechat.openDataPostMessage({
            messageType: gl.MESSAGE_TYPE.RANK_PAGE,
            page: 1,
        });
    },
    start() {

    },

    onDestroy() {
    },

    update(dt) {
        if (!window.sharedCanvas || !this.tex) return;
        if (!this.blSetWin) {
            let winSize = cc.director.getWinSize();
            window.sharedCanvas.width = winSize.width;
            window.sharedCanvas.height = winSize.height;
            this.blSetWin = true;
        }
        this.tex.initWithElement(window.sharedCanvas);
        this.tex.handleLoadedTexture();
        this.sprite_rankingScrollView.spriteFrame = new cc.SpriteFrame(this.tex);
    },
});
