
cc.Class({
    extends: cc.Component,

    properties: {
        tvFrame: cc.Sprite,
        imgList: [cc.SpriteFrame],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        let spIndex = Math.floor(Math.random() * 6);
        this.tvFrame.spriteFrame = this.imgList[spIndex];
    },

    // update (dt) {},
});
