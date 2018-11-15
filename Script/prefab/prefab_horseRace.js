
cc.Class({
    extends: cc.Component,

    properties: {
        node_mask: cc.Node,
        node_race: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.speed = 30;//移动速度
        this.initRace();
    },

    initRace() {
        this.horseInterval = 0;
        let horseRace = gl.userinfo.get('horseRace');
        this.horseInterval = horseRace.interval;
        console.log('跑马灯内容', horseRace);
        this.node_race.getComponent(cc.Label).string = horseRace.content;
        this.startAction();
    },

    startAction() {
        this.node_race.x = this.node_mask.width;
        let endPos = cc.v2(0 - this.node_race.width, 0);
        this.node_race.runAction(cc.sequence(
            cc.moveTo(this.node_race.width / this.speed, endPos),
            cc.delayTime(this.horseInterval),
            cc.callFunc(() => {
                this.startAction();
            })
        ))
    }

    // update (dt) {},
});
