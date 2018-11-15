
cc.Class({
    extends: cc.Component,

    properties: {
        head: cc.Node,
        upBody: cc.Node,
        arm_left: cc.Node,
        arm_right: cc.Node,
        hand_left: cc.Node,
        hand_right: cc.Node,
        line_left: cc.Node,
        line_right: cc.Node,
        foot_left: cc.Node,
        foot_right: cc.Node,
        node_shield: cc.Node,
        maozi: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (cc.director.getScene().name == 'game') {
            this.node.opacity = 0;
            this.node.runAction(cc.sequence(
                cc.delayTime(0.1),
                cc.callFunc(() => { this.node.opacity = 255; })
            ))
        }
        this.isTouch = false;
        this.handBody = null;//手臂的刚体
        this._velocity = null;//作用于手臂的力的向量
        this.miaoZhunNode = null;
        this.direction = true;//控制跳舞的方向
        this.bulletSpeed = gl.userinfo.get('bulletSpeed');
        this.shield = gl.userinfo.shield;
        this.node_shield.active = Boolean(this.shield);
        gl.emitter.on('event_gameOver', this.gameOver, this);
        gl.emitter.on('event_gameWin', this.gameWin, this);
        gl.emitter.on('event_offshield', this.offshield, this);
        gl.emitter.on("event_blasting", this.Blasting, this);
    },

    gameOver() {
        if (gl.userinfo.get('isWin')) return;
        gl.userinfo.shield = 0;
        this.isTouch = false;
        this.line_left.active = false;
        this.line_right.active = false;
        this.head.children[5].active = true;
    },
    gameWin() {
        if (!gl.userinfo.get('isWin')) return;
        gl.userinfo.shield = 0;
        this.line_left.active = false;
        this.line_right.active = false;
        this.head.children[4].active = true;
        this.dance();
    },
    offshield() {
        this.node_shield.active = false;
        this.shield = 0;
        this.scheduleOnce(() => {
            this.head.getComponent(cc.RigidBody).fixedRotation = false;
            this.upBody.getComponent(cc.RigidBody).fixedRotation = false;
            this.foot_left.getComponent(cc.RigidBody).fixedRotation = false;
            this.foot_right.getComponent(cc.RigidBody).fixedRotation = false;
        })
    },



    moveArm(_position, start = false) {
        let guidanceState = gl.userinfo.get('guidanceState');
        this.isTouch = true;
        this._velocity = cc.v2((_position.x - this.upBody.x), (_position.y - this.upBody.y));
        if (this.miaoZhunNode) this.miaoZhunNode.active = false;
        this.line_left.active = false;
        this.line_right.active = false;
        let leftDis = cc.pDistance(this.arm_left.position, _position);
        let rightDis = cc.pDistance(this.arm_right.position, _position);
        if (leftDis > rightDis) {//举右手
            //新手引导状态
            if (start && guidanceState == 0) {
                gl.emitter.emit('event_guidanceStateChange', 1);
            }
            this.miaoZhunNode = this.head.children[2];
            this.handBody = this.hand_right.getComponent(cc.RigidBody);
            this.line_right.active = true;
        } else if (leftDis < rightDis) {//举左手
            //新手引导状态
            if (start && guidanceState == 1) {
                gl.emitter.emit('event_guidanceStateChange', 2);
            }
            this.miaoZhunNode = this.head.children[3];
            this.handBody = this.hand_left.getComponent(cc.RigidBody);
            this.line_left.active = true;
        }
        this.miaoZhunNode.active = true;
    },

    stopArm() {
        this.isTouch = false;
        this.handBody = null;
        this._velocity = null;
        this.line_left.active = false;
        this.line_right.active = false;
        if (this.miaoZhunNode) {
            this.miaoZhunNode.active = false;
            this.miaoZhunNode = null;
        }
    },

    fireBullet(_position) {
        let firePos, offX, offY;
        let leftDis = cc.pDistance(this.arm_left.position, _position);
        let rightDis = cc.pDistance(this.arm_right.position, _position);
        if (leftDis > rightDis) {//右手射击
            firePos = cc.v2(this.hand_right.x, this.hand_right.y);
            offX = this.hand_right.x - this.arm_right.x;
            offY = this.hand_right.y - this.arm_right.y;
        } else if (leftDis < rightDis) {//左手射击
            firePos = cc.v2(this.hand_left.x, this.hand_left.y);
            offX = this.hand_left.x - this.arm_left.x;
            offY = this.hand_left.y - this.arm_left.y;
        }
        this.radian = Math.atan2(offY, offX);
        let velocityX = Math.cos(this.radian) * this.bulletSpeed;
        let velocityY = Math.sin(this.radian) * this.bulletSpeed;
        if (this.shield !== 0) {
            this.head.getComponent(cc.RigidBody).fixedRotation = true;
            this.upBody.getComponent(cc.RigidBody).fixedRotation = true;
            this.foot_left.getComponent(cc.RigidBody).fixedRotation = true;
            this.foot_right.getComponent(cc.RigidBody).fixedRotation = true;
        }
        gl.emitter.emit('event_fireBullet', { pos: firePos, velocity: cc.v2(velocityX, velocityY) });
    },

    // start() { },

    //胜利跳舞
    dance() {
        console.log('跳舞');
        this.danceTimer = setInterval(() => {
            this.direction = this.direction ? false : true;
            let vectorY = 200;
            if (this.direction) {
                this.hand_right.getComponent(cc.RigidBody).applyForce(cc.v2(0, vectorY), this.hand_right.position);
                this.hand_left.getComponent(cc.RigidBody).applyForce(cc.v2(0, -vectorY), this.hand_right.position);
            } else {
                this.hand_right.getComponent(cc.RigidBody).applyForce(cc.v2(0, -vectorY), this.hand_right.position);
                this.hand_left.getComponent(cc.RigidBody).applyForce(cc.v2(0, vectorY), this.hand_right.position);
            }
        }, 200)
    },
    //清理跳舞update
    cleanTimeOut() {
        if (this.danceTimer) {
            clearTimeout(this.danceTimer);
            this.danceTimer = null;
        }
    },

    //瞄准举手
    raiseHand() {
        if (!this.handBody) return;
        let _power = 600;
        let _radian = Math.atan2(this._velocity.y, this._velocity.x);
        let velocityX = Math.cos(_radian) * _power;
        let velocityY = Math.sin(_radian) * _power;
        this.handBody && this.handBody.applyForceToCenter(cc.v2(velocityX, velocityY));
    },

    //爆破函数 tv_data:{uuid, pos}
    Blasting(tv_data) {
        let rigidbody = this.node.getChildByName('body').getComponent(cc.RigidBody);
        let velocityX = (rigidbody.node.x - tv_data.pos.x) * 500,
            velocityY = (rigidbody.node.y - tv_data.pos.y) * 500;
        rigidbody && rigidbody.applyForceToCenter(cc.v2(velocityX, velocityY), true);
        if (gl.userinfo.get('isWin')) return;
        //gl.userinfo.shield = 0;
        if (gl.userinfo.shield == 0) {
            this.unclothe();
        }
    },
    //脱衣服
    unclothe() {
        this.node.getChildByName("body").children[0].active = false;
        this.node.getChildByName("leg").children[0].active = false;
        this.node.getChildByName("arm_left").children[0].active = false;
        this.node.getChildByName("hand_left").children[0].active = false;
        this.node.getChildByName("arm_right").children[0].active = false;
        this.node.getChildByName("hand_righ").children[0].active = false;
        this.node.getChildByName("foot_left").children[0].active = false;
        this.node.getChildByName("foot_right").children[0].active = false;
        if (this.maozi.getComponent(cc.WeldJoint)
            && this.maozi.getComponent(cc.WeldJoint).enabled) {
            this.maozi.getComponent(cc.WeldJoint).enabled = false;
        }
    },
    update(dt) {
        if (this.isTouch) this.raiseHand();
    },

    onDestroy() {
        this.cleanTimeOut();
        gl.emitter.off('event_gameOver', this);
        gl.emitter.off('event_gameWin', this);
        gl.emitter.off('event_offshield', this);
        gl.emitter.off("event_blasting", this);
    },
});
