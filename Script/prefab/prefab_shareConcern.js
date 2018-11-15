
cc.Class({
    extends: cc.Component,

    properties: {
        node_bg: cc.Node,
        node_role: cc.Node,
        node_light: cc.Node,
        node_btnColor: cc.Node,
        prefab_role: [cc.Prefab],
        prefab_light: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initWnd();
        gl.emitter.on("event_refreshrole", this.refreshRole, this);
    },

    initWnd() {
        //gl.color_index = Math.random(2);
        //变色控制
        this.node_bg.setColor(gl.bottom_color[gl.color_index]);
        for (let i = 1, count = 2; i <= count; i++) {
            let light_top = this.node_bg.getChildByName(`img_ztop${i}`);
            light_top.setColor(gl.light_color[gl.color_index]);

            let light_down = this.node_bg.getChildByName(`img_zdown${i}`);
            light_down.setColor(gl.light_color[gl.color_index]);
        }
        this.node_btnColor.setColor(gl.button_color[gl.color_index]);
        //初始化贴图位置
        this.refreshRole();
        let light = cc.instantiate(this.prefab_light);
        light.parent = this.node_light;
        light.scaleX = 1.3;
        light.scaleY = 1.05;
    },

    refreshRole() {
        this.node_role.removeAllChildren();
        this.node_role.destroyAllChildren();
        let selectRole = gl.userinfo.get("role");
        let role = cc.instantiate(this.prefab_role[selectRole]);
        role.parent = this.node_role;
        role.scale = 2.2;
    },

    onButton(self) {
        switch (self.target.name) {
            case "btn_close":
                this.node.destroy();
                gl.audio.clickPlay();
                break;
            default:
                break;
        }
    },

    start() {

    },
    onDestroy() {
        gl.wechat.showBannerAd();
        gl.emitter.off("event_refreshrole", this);
    },
    // update (dt) {},
});
