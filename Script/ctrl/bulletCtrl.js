
cc.Class({
    extends: cc.Component,

    properties: {
        bullet: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        gl.emitter.on('event_fireBullet', this.fireBullet, this);
    },
    //发射子弹
    fireBullet(msg) {
        let shootCount = gl.userinfo.get('shootCount');
        gl.userinfo.set('shootCount', shootCount += 1);
        let bulletNode = cc.instantiate(this.bullet);
        bulletNode.parent = this.node;
        bulletNode.setPosition(msg.pos);
        let radian = Math.atan2(msg.velocity.y, msg.velocity.x);
        bulletNode.rotation = -radian * 180 / Math.PI;
        let rigidBody = bulletNode.getComponent(cc.RigidBody);
        rigidBody.linearVelocity = msg.velocity;
    },

    start() {

    },

    // update (dt) {},

    onDestroy(){
        gl.emitter.off('event_fireBullet', this);
    },
});
