
cc.Class({
    extends: cc.Component,

    properties: {
        node_bg:cc.Node,
        node_light:cc.Node,
        node_textColor:cc.Node,
        progress:cc.ProgressBar,
        prefab_light: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.delayTime = 50;
        this.progress_count = 0;
        this.progress.progress = 0;
        this.progress_end = false;
        this.initWnd();
        gl.emitter.on('event_login', this.closeLoading, this);
        gl.emitter.on('event_startlogin', this.startLoading, this);
    },

    initWnd(){
        //gl.color_index = Math.random(2);
        //变色控制
        this.node_bg.setColor(gl.bottom_color[gl.color_index]);
        for (let i=1, count = 2; i<=count; i++){
            let light_top = this.node_bg.getChildByName(`img_ztop${i}`);
            light_top.setColor(gl.light_color[gl.color_index]);
        }
        this.node_textColor.setColor(gl.light_color[gl.color_index]);
        //初始化贴图位置
        let light = cc.instantiate(this.prefab_light);
        light.parent = this.node_light;
        light.scaleX = 1.3;
        light.scaleY = 1.05;
    },

    startLoading(){
        this.schedule(this.loadingAction.bind(this), 0.1);
    },  

    loadingAction(){
        if(this.progress_end)return;
        this.progress_count++;
        this.progress.progress = this.progress_count/this.delayTime;
        if (this.delayTime === this.progress_count){
            this.unschedule(this.loadingAction.bind(this));
        }
    },

    closeLoading(){
        this.progress_end = true;
        this.progress.progress = 1;
        this.unschedule(this.loadingAction.bind(this));
        this.scheduleOnce(()=>{this.node.destroy();}, 0.1);
    },

    start() {

    },
    onDestroy(){
        gl.wechat.showBannerAd();
        gl.emitter.off('event_startlogin', this);
        gl.emitter.off('event_login', this);
    },
    // update (dt) {},
});
