cc.Class({
    extends: cc.Component,

    properties: {
        node_bg: cc.Node,
        label_time: cc.Label,
        label_stamina: cc.Label,
        node_color: [cc.Node],
        label_staminatime: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        gl.emitter.emit('event_gamesopne', false);
        this.initWnd();
        this.refreshTime();
        gl.emitter.on('event_refreshstamina', this.refreshStamina, this);
        cc.audioEngine.pauseAll();
    },
    update (dt) {
        if (this.label_staminatime){
            this.label_staminatime.string = gl.userinfo.getStaminaTime();
        }
    },
    initWnd() {
        this.node_bg.setColor(gl.bottom_color[gl.color_index]);

        //设置按钮颜色
        for (let key in this.node_color) {
            let btn_node = this.node_color[key];
            btn_node.setColor(gl.button_color[gl.color_index]);
        }
        this.refreshStamina();
    },
    refreshStamina() {
        //设置体力值
        this.label_stamina.string = "" + gl.userinfo.get("stamina");
    },
    //-------btn callback-----
    btn_continue() {
        gl.emitter.emit('event_gamesopne', true);
        this.node.destroy();
        gl.emitter.emit('event_gamecontinue');
        cc.audioEngine.resumeAll();
        gl.audio.clickPlay();
    },
    btn_backToMenu() {
        gl.emitter.emit('event_gamesopne', true);
        new Promise((resolve, reject) => {
            cc.director.preloadScene('start', (error, res) => {
                if (error) console.error(error);
                else return resolve();
            });
        }).then(() => {
            cc.director.loadScene('start');
            gl.wechat.showBannerAd();
            gl.userinfo.shield = 0;
        });
        gl.audio.clickPlay();
    },

    btn_again() {
        if (gl.userinfo.get('stamina') > 0) gl.userinfo.reqEnterPoint();
        else gl.emitter.emit('event_nostamina');
        gl.audio.clickPlay();
        gl.userinfo.shield = 0;
    },

    btn_switchRole() {
        gl.emitter.emit('event_opswitchRole');
        gl.audio.clickPlay();
        gl.userinfo.shield = 0;
    },

    btn_lookRank() {
        gl.emitter.emit('event_oplookRank');
        gl.audio.clickPlay();
    },

    refreshTime() {
        this.label_time.string = gl.userinfo.getStrTime();
    },


    start() {

    },

    // update (dt) {},

    onDestroy() {
        gl.emitter.off('event_refreshstamina', this);
    },
});
