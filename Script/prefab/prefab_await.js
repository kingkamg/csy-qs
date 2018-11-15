
cc.Class({
    extends: cc.Component,

    properties: {
        node_jh:cc.Node,
        node_jbbg:cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.node.scale = 0.7;
        this.dot_max = 8;
        this.index = 0;
        this.opacity = [255,229, 204, 178, 153, 127, 102, 76];
        this.scale = [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
    },

    action(){
        this.node_jh.active = true;
        for (let i=0; i<8; i++){
            let img_jh = this.node_jh.getChildByName(`img_jh${i+1}`);
            let index = (this.index + i)%this.dot_max;
            img_jh.scale = this.scale[index];
            img_jh.opacity = this.opacity[index];
        }
        this.index++;
        if (this.index>=8)this.index = 0;
    },
    pauseAction(){
        this.unscheduleAllCallbacks();
    },
    startAction(){
        this.unscheduleAllCallbacks();
        this.node_jh.active = false;
        this.node_jbbg.active = false;

        for (let i=0; i<8; i++){
            let img_jh = this.node_jh.getChildByName(`img_jh${i+1}`);
            let index = (this.index + i)%this.dot_max;
            img_jh.scale = this.scale[index];
            img_jh.opacity = this.opacity[index];
        }
        this.scheduleOnce((data, event)=>{
            this.node_jbbg.active = true;
            this.schedule(this.action.bind(this), 0.1);
        }, 2);
    },
    
    start() {

    },

    // update (dt) {},
});
