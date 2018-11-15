cc.Class({
    extends: cc.Component,

    properties: {
        bottom: cc.Node,
        content: cc.Label
    },
    onLoad() {
        this.scheduleOnce(() => { this.node.destroy(); }, 1.5);
    },
    showTip(content) {
        this.content.string = content;
        //this.content.node.color = new cc.Color(255,255,255);
        this.bottom.width = this.content.node.width + 120;
    },
})