
cc.Class({
    extends: cc.Component,

    properties: {
        effect_burst: cc.Prefab,
        effect_burst_blue: cc.Prefab,
        effect_blood: cc.Prefab,
        effect_fire: cc.Prefab,
        effect_spark: cc.Prefab,
        effect_openBottle: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        gl.emitter.on('event_hitCup', this.hitCup, this);
        gl.emitter.on('event_hitBody', this.hitBody, this);
        gl.emitter.on('event_fireBullet', this.fireBullet, this);
        gl.emitter.on('event_spark', this.spark, this);
        gl.emitter.on('event_openBottle', this.openBottl, this);
        this.BODYTAG = gl.userinfo.get('BODYTAG');
        this.initPool();
    },
    initPool() {
        this.sparkPool = new cc.NodePool();
        for (let i = 0; i < 10; i++) {
            let curNode = cc.instantiate(this.effect_spark);
            this.sparkPool.put(curNode);
        }
    },
    //撞击火花
    spark(msg) {
        let sparkNode = this.getNodeFromPool();
        sparkNode.setPosition(msg.pos);
        sparkNode.runAction(cc.sequence(
            cc.delayTime(0.1),
            cc.callFunc(() => { this.sparkPool.put(sparkNode); })
        ))
    },
    //枪口烟火
    fireBullet(msg) {
        let fireNode = cc.instantiate(this.effect_fire);
        fireNode.setPosition(msg.pos);
        fireNode.parent = this.node;
        fireNode.runAction(cc.sequence(
            cc.delayTime(0.2),
            cc.callFunc(() => { fireNode.destroy() })
        ))
    },
    //飙血
    hitBody(msg) {
        let bloodNode = cc.instantiate(this.effect_blood);
        bloodNode.setPosition(msg.pos);
        bloodNode.parent = this.node;
        bloodNode.runAction(cc.sequence(
            cc.delayTime(5),
            cc.callFunc(() => { bloodNode.destroy() })
        ))
    },
    //击中杯子
    hitCup(msg) {
        let burstNode;
        switch (msg.tag) {
            case this.BODYTAG.GLASS:
                burstNode = cc.instantiate(this.effect_burst);
                break;
            case this.BODYTAG.BULEGLASS:
                burstNode = cc.instantiate(this.effect_burst_blue);
                break;
        }
        if (!burstNode) return;
        burstNode.setPosition(msg.pos);
        burstNode.parent = this.node;
    },
    // 爆破瓶子特效
    openBottl(msg) {
        let openBottle = cc.instantiate(this.effect_openBottle);
        openBottle.setPosition(msg.pos);
        openBottle.parent = this.node;
        openBottle.runAction(cc.sequence(
            cc.delayTime(1),
            cc.callFunc(() => { openBottle.destroy() })
        ))
    },

    //获取火花效果实例
    getNodeFromPool() {
        let curNode = null;
        if (this.sparkPool.size() > 0) {
            curNode = this.sparkPool.get();
        } else {
            curNode = cc.instantiate(this.effect_spark);
        }
        curNode.parent = this.node;
        return curNode;
    },


    start() {

    },

    // update (dt) {},

    onDestroy() {
        this.sparkPool.clear();
        gl.emitter.off('event_hitCup', this);
        gl.emitter.off('event_hitBody', this);
        gl.emitter.off('event_fireBullet', this);
        gl.emitter.off('event_spark', this);
        gl.emitter.off('event_openBottle', this);
    },
});
