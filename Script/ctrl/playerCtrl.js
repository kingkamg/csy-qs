
cc.Class({
    extends: cc.Component,

    properties: {
        roleList: {
            default: [],
            type: cc.Prefab,
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.isTouch = false;
        this.role = null;
        this.roleScript = null;
        this.startPos = null;
        this.movePos = null;
        this.endPos = null;
        this.creatRole();
        this.addListener();
        gl.emitter.on('event_gameOver', this.gameOver, this);
        gl.emitter.on('event_gameWin', this.gameWin, this);
        gl.emitter.on('event_pauseGame', this.touchCancel, this);
    },
    gameOver() {
        this.offListener();
    },
    gameWin() {
        this.offListener();
    },

    creatRole() {
        let _roleIndex = gl.userinfo.get('role');
        if (!this.roleList[_roleIndex]) return;
        this.role = cc.instantiate(this.roleList[_roleIndex]);
        let _pos = gl.userinfo.get('playerPos');
        this.role.setPosition(_pos);//TODO
        this.role.parent = this.node;
        this.roleScript = this.role.getComponent('role');
    },

    touchStart(event) {
        this.isTouch = true;
        this.startPos = event.touch.getLocation();
        this.roleScript && this.roleScript.moveArm(gl.userinfo.posChnange(this.startPos), true);
    },
    touchMove(event) {
        if (!this.isTouch) return
        this.movePos = event.touch.getLocation();
        this.roleScript && this.roleScript.moveArm(gl.userinfo.posChnange(this.movePos));
    },
    touchEnd(event) {
        if (!this.isTouch) return
        this.isTouch = false;
        this.endPos = event.touch.getLocation();
        let guidanceState = gl.userinfo.get('guidanceState');
        if (guidanceState == 2) {
            gl.emitter.emit('event_guidanceStateChange', 3);
        }
        // else if (guidanceState < 2) {
        //     this.roleScript.stopArm();
        //     return;
        // }
        this.roleScript && this.roleScript.fireBullet(gl.userinfo.posChnange(this.endPos));
        this.roleScript && this.roleScript.stopArm();
    },
    touchCancel(event) {
        this.isTouch = false;
        console.log('触摸取消');
        this.roleScript && this.roleScript.stopArm();
    },

    // start() {},
    // update (dt) {},

    addListener() {
        this.node.on('touchstart', this.touchStart, this);
        this.node.on('touchmove', this.touchMove, this);
        this.node.on('touchend', this.touchEnd, this);
        this.node.on('touchcancel', this.touchCancel, this);
    },
    offListener() {
        this.node.off('touchstart', this.touchStart, this);
        this.node.off('touchmove', this.touchMove, this);
        this.node.off('touchend', this.touchEnd, this);
        this.node.off('touchcancel', this.touchCancel, this);
    },
    onDestroy() {
        gl.emitter.off('event_gameOver', this);
        gl.emitter.off('event_gameWin', this);
        gl.emitter.off('event_pauseGame', this);
        this.offListener();
    }
});
