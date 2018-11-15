
cc.Class({
    extends: cc.Component,

    properties: {
        prefab_openBox: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.setPosition(cc.v2(-340, 310));
        this.startAction();
    },

    startAction() {
        this.node.stopAllActions();
        let _moveTime = 5;
        let _endPos = this.randomPos();
        this.node.runAction(cc.sequence(
            // cc.delayTime(1),
            cc.moveTo(_moveTime, _endPos),
            // cc.bezierTo(_moveTime, _endPos),
            cc.callFunc(() => { this.startAction() })
        ))
    },
    //返回一个随机的坐标
    randomPos() {
        let _x1 = Math.random() * (1280) - 1280 / 2;
        let _y1 = Math.random() * (720) - 720 / 2;
        _x1 = _x1 > 0 ? _x1 -= this.node.width : _x1 += this.node.width;
        _y1 = _y1 > 0 ? _y1 -= this.node.height : _y1 += 200;
        // let _bezier = [cc.v2(0, 360), cc.v2(300, -640), cc.v2(_x1, _y1)];
        return cc.v2(_x1, _y1);
        // return _bezier;
    },

    openBox() {
        console.log('打开宝箱');
        let openMenu = cc.instantiate(this.prefab_openBox);
        openMenu.parent = cc.director.getScene().getChildByName('Canvas');
        this.node.destroy();
    },


    // update (dt) {},
});
