cc.Class({
    extends: cc.Component,

    properties: {
        audio_fly: cc.AudioClip,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        gl.emitter.on("event_gamesopne", this.gamesopne, this);
        this.sceneSize = cc.director.getWinSize();
        this.node.setPosition(this.randomPos()[2]);
        this.startAction();
        this.flyid = gl.audio.play(this.audio_fly, true);
    },

    gamesopne(bol) {
        if (bol) {
            this.node.resumeAllActions();
            // gl.audio.stop(this.flyid);
            // this.flyid = null;
        } else {
            this.node.pauseAllActions();
            // this.flyid = gl.audio.play(this.audio_fly, true);
        }
    },
    startAction() {
        this.node.stopAllActions();
        let _moveTime = 8;
        let _endPos = this.randomPos();
        this.node.runAction(cc.sequence(
            cc.delayTime(1),
            //cc.moveTo(_moveTime, _endPos),
            cc.bezierTo(_moveTime, _endPos),
            cc.callFunc(() => { this.startAction() })
        ))
    },
    //返回一个随机的坐标
    randomPos() {
        let _x1 = Math.random() * (1280) - 1280 / 2;
        let _y1 = Math.random() * (720) - 720 / 2;
        _x1 = _x1 > 0 ? _x1 -= this.node.width : _x1 += this.node.width;
        _y1 = _y1 > 0 ? _y1 -= this.node.height : _y1 += 200;
        let _bezier = [cc.v2(0, 360), cc.v2(300, -640), cc.v2(_x1, _y1)];
        //return cc.v2(_x1, _y1);
        return _bezier;
    },

    start() {

    },

    update(dt) {

    },

    onDestroy() {
        gl.emitter.off("event_gamesopne", this);
        this.node.stopAllActions();
        if (this.flyid) gl.audio.stop(this.flyid);
    }
});
