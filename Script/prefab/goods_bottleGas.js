
cc.Class({
    extends: cc.Component,

    properties: {
        effect_fire:cc.Prefab,
        audio_fiv:cc.AudioClip,
        audio_light:cc.AudioClip,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.isJet = false;
        this.isFirst = true;
        this.BODYTAG = gl.userinfo.get('BODYTAG');
        this.speed = gl.userinfo.get('gasSpeed');
        this.audioID = -1;
    },

    startJet() {
        if (!this.isFirst) return;
        let animList = [];
        animList.push(cc.callFunc(() => {
            this.updateVelocity();
            this.isFirst = false;
            this.isJet = true;
            this.audioID = gl.audio.play(this.audio_fiv, true);
        }));
        let count = 5;
        for (let i = 0; i < count; i++) {
            animList.push(
                cc.delayTime(3 / count),
                cc.callFunc(() => { this.updateVelocity(); }),
            )
        }
        animList.push(
            cc.delayTime(0.5),
            cc.callFunc(() => {
                if (this.audioID != -1){
                    gl.audio.stop(this.audioID);
                    this.audioID = -1;
                }
                this.updateVelocity();
                this.isJet = false;
            }))
        this.node.runAction(cc.sequence(animList));
    },
    
    updateVelocity() {
        let pos1 = this.node.getChildByName("top").convertToWorldSpaceAR(this.node.getChildByName("top").position);
        let pos2 = this.node.getChildByName("bottom").convertToWorldSpaceAR(this.node.getChildByName("top").position);
        let x = pos2.x-pos1.x;
        let y = pos2.y-pos1.y;
        let velocityX = (x/260)*this.speed;     //260为煤气罐的长度的2倍,为什么2倍？
        let velocityY = (y/260)*this.speed;
        // this._rotation = (this.node.rotation - 90) % 180;
        // let radian = Math.PI * (this._rotation) / 180;
        // let gasSpeed = (this._rotation) >= 0 ? this.speed : -this.speed;
        // let velocityX = Math.cos(radian) * gasSpeed;
        // let velocityY = Math.sin(radian) * gasSpeed;
        this.velocity = cc.v2(velocityX, velocityY);

        let fireNode = cc.instantiate(this.effect_fire);
        let fire_pos = cc.p( 0, -this.node.height / 2)
        fireNode.setPosition(fire_pos);
        fireNode.parent = this.node;
        fireNode.runAction(cc.sequence(
            cc.delayTime(0.2),
            cc.callFunc(() => { fireNode.destroy() })
        ))
    },

    start() {

    },

    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
        switch (otherCollider.tag) {
            case this.BODYTAG.LIGHTCONNECT:
                console.log("BODYTAG.LIGHTCONNECT");
                if (otherCollider.node.getComponent(cc.RevoluteJoint) && otherCollider.node.getComponent(cc.RevoluteJoint).enabled)
                    otherCollider.node.getComponent(cc.RevoluteJoint).enabled = false;
                gl.audio.play(this.audio_light, false);
                break;
            default: break;
        }
    },
    //只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {

    },
    onDestroy(){
        if (this.audioID != -1)gl.audio.stop(this.audioID);
    },

    update(dt) {
        if (!this.isJet) return;
        this.node.getComponent(cc.RigidBody).linearVelocity = this.velocity;
    },
});
