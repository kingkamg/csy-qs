const AUDIO_TYPE = {
    SHOUQIANG: 0,
    CHONGFENGQIANG: 1,
    SANDANQIANG: 2,
    HIT_BOARD: 3,
    HIT_BULB: 4,
    HIT_GLASS: 5,
    HIT_LIGHT: 6,
    HIT_MOS: 7,
    HIT_PLAYER: 8,
    HIT_WALL: 9,
    BANG_TV: 10,
}
cc.Class({
    extends: cc.Component,

    properties: {
        audio_list: [cc.AudioClip]
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.num = 0;
        this.isOver = false;
        this.isCollide = false;
        this.bulletBody = this.node.getComponent(cc.RigidBody);
        this.BODYTAG = gl.userinfo.get('BODYTAG');
        this.PLAYERTAG = gl.userinfo.get('PLAYERTAG');
        this.bulletSpeed = gl.userinfo.get('bulletSpeed');
        gl.audio.play(this.audio_list[gl.userinfo.role], false);
    },

    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact: function (contact, selfCollider, otherCollider) {
        if (this.isCollide) return;
        switch (otherCollider.tag) {
            case this.PLAYERTAG.HATS:
                this.isCollide = true;
                if (gl.userinfo.shield !== 0) {
                    --gl.userinfo.shield === 0 ? gl.emitter.emit('event_offshield') : null;
                    this.hitTarget();
                } else if (otherCollider.node.getComponent(cc.WeldJoint)
                    && otherCollider.node.getComponent(cc.WeldJoint).enabled) {
                    otherCollider.node.getComponent(cc.WeldJoint).enabled = false;
                }
                //this.hitTarget();
                break;
            case this.BODYTAG.PLAYER:
                this.isCollide = true;
                if (gl.userinfo.shield !== 0) {
                    --gl.userinfo.shield === 0 ? gl.emitter.emit('event_offshield') : null;
                } else {
                    if (otherCollider.node.children[0].active) otherCollider.node.children[0].active = false;
                    else gl.emitter.emit('event_gameOver');
                    gl.emitter.emit('event_hitBody', { pos: otherCollider.node.position });
                    gl.audio.play(this.audio_list[AUDIO_TYPE.HIT_PLAYER], false);
                }
                this.hitTarget();
                break;
            case this.BODYTAG.GLASS:
                gl.emitter.emit('event_hitCup', { pos: otherCollider.node.position, tag: this.BODYTAG.GLASS });
                otherCollider.node.destroy();
                this.node.destroy();
                gl.audio.play(this.audio_list[AUDIO_TYPE.HIT_GLASS], false);
                break;
            case this.BODYTAG.BULEGLASS:
            case this.BODYTAG.BULEGLASSBIG:
                otherCollider.node.getComponent('goods_buleGlass').bulletHit();
                gl.emitter.emit('event_hitCup', { pos: otherCollider.node.position, tag: this.BODYTAG.BULEGLASS });
                this.hitTarget(otherCollider.node);
                gl.audio.play(this.audio_list[AUDIO_TYPE.HIT_GLASS], false);
                break;
            case this.BODYTAG.LIGHT:
                gl.emitter.emit('event_hitCup', { pos: this.node.position, tag: this.BODYTAG.GLASS });
                this.hitTarget(otherCollider.node);
                gl.audio.play(this.audio_list[AUDIO_TYPE.HIT_BULB], false);
                break;
            case this.BODYTAG.LIGHTCONNECT:
                if (otherCollider.node.getComponent(cc.RevoluteJoint) && otherCollider.node.getComponent(cc.RevoluteJoint).enabled)
                    otherCollider.node.getComponent(cc.RevoluteJoint).enabled = false;
                this.hitTarget(null, false);
                gl.audio.play(this.audio_list[AUDIO_TYPE.HIT_LIGHT], false);
                break;
            case this.BODYTAG.TV:
                if (otherCollider.node.children[0].active == true) return;
                let cutNode = otherCollider.node;
                cutNode.children[0].active = true;
                cutNode.children[1].active = false;
                gl.audio.play(this.audio_list[AUDIO_TYPE.BANG_TV], false);
                this.hitTarget();
                gl.emitter.emit("event_blasting", { uuid: cutNode.uuid, pos: cutNode.position });
                gl.audio.play(this.audio_list[AUDIO_TYPE.HIT_PLAYER], false);
                break;
            case this.BODYTAG.MOS:
                gl.emitter.emit('event_hitBody', { pos: otherCollider.node.position });
                gl.emitter.emit('event_creatMos');
                this.hitTarget(otherCollider.node);
                gl.audio.play(this.audio_list[AUDIO_TYPE.HIT_MOS], false);
                break;
            case this.BODYTAG.GAS:
                otherCollider.node.getComponent('goods_bottleGas').startJet();
                this.hitTarget(null, false);
                gl.audio.play(this.audio_list[AUDIO_TYPE.HIT_BOARD], false);
                break;
            case this.BODYTAG.BOARD:
                gl.audio.play(this.audio_list[AUDIO_TYPE.HIT_BOARD], false);
                break;
            case this.BODYTAG.WALL:
                gl.audio.play(this.audio_list[AUDIO_TYPE.HIT_WALL], false);
                break;
            default: gl.emitter.emit('event_spark', { pos: this.node.position });
        }
    },
    /**
     * 子弹撞击结果
     * @targetNode 被撞击的节点
     * @desBullet 是否销毁子弹
     */
    hitTarget(targetNode = null, desBullet = true) {
        if (targetNode) targetNode && targetNode.destroy();
        if (desBullet) this.node && this.node.destroy();
    },
    //只在两个碰撞体结束接触时被调用一次
    onEndContact: function (contact, selfCollider, otherCollider) {
        this.isCollide = false;
    },
    // 每次将要处理碰撞体接触逻辑时被调用
    // onPreSolve: function (contact, selfCollider, otherCollider) {
    // },
    // 每次处理完碰撞体接触逻辑时被调用
    // onPostSolve: function (contact, selfCollider, otherCollider) {
    // },

    start() {

    },

    update(dt) {
        //子弹角度更新
        let velocity = this.bulletBody.linearVelocity;
        if (Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) < this.bulletSpeed * (2 / 3)) {
            velocity.mulSelf(1.5);
            this.bulletBody.linearVelocity = velocity;
        }
        this.radian = Math.atan2(velocity.y, velocity.x);
        this.node.rotation = -this.radian * 180 / Math.PI;
    },

    onDestroy() {
    }
});
