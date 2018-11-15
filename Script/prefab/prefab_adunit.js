
cc.Class({
    extends: cc.Component,

    properties: {
        node_thirdpary: cc.Node,
        node_thirdparylist: cc.Node,
        btn_adunitlist: [cc.Node],
        btn_adunitlistcb: [cc.Node],
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initThirdparty();
    },

    onButton(self) {
        switch (self.target.name) {
            case "btn_adunit1":
            case "btn_adunit2":
            case "btn_adunit3":
            case "btn_adunit4":
                let index = self.target.name.split('btn_adunit');
                this.btn_adunit(parseInt(index[1]));
                break;
            case "btn_thirdparty1":
            case "btn_thirdparty2":
                let index1 = self.target.name.split('btn_thirdparty');
                this.btn_Thirdparty(parseInt(index1[1]));
                break;
        }
    },

    initThirdparty() {
        this.tpadunitlist = gl.userinfo.getThirdpartyData();
        let count = this.btn_adunitlist.length,
            index = 0;
        for (let i = 0; i < count; i++) {
            let data = this.tpadunitlist[i];
            this.btn_adunitlist[i].active = false;
            if (data) {
                gl.showRemoteImage(this.btn_adunitlist[i], data.app_icon);
                this.btn_adunitlist[i].active = true;
            } else index++;
        }
        if (index == count) {
            this.node_thirdparylist.active = false;
        }
        this.thirdparty = gl.userinfo.getThirdpartyCb();
        index = 0;
        count = this.btn_adunitlistcb.length;
        for (let i = 0; i < count; i++) {
            let data = this.thirdparty[i];
            this.btn_adunitlistcb[i].active = false;
            if (data) {
                gl.showRemoteImage(this.btn_adunitlistcb[i], data.app_icon);
                this.btn_adunitlistcb[i].active = true;
            } else index++;
        }
        if (index == count) {
            this.node_thirdpary.active = false;
        }
    },

    btn_Thirdparty(index) {
        let data = this.thirdparty[index - 1];
        gl.wechat.navigateToMiniProgram(data.appid, data.link_path).then((res) => {
            gl.userinfo.reqSkipApp(data.app_id);
            if (cc.sys.os === cc.sys.OS_IOS){
                wx.exitMiniProgram({
                    success: function (res) { console.log("1"); },
                    fail: function (res) { console.log("2"); },
                    complete: function (res) { console.log("3"); },
                })
            };
        });
    },
    btn_adunit(index) {
        let data = this.tpadunitlist[index - 1];
        gl.wechat.navigateToMiniProgram(data.appid, data.link_path).then((res) => {
            gl.userinfo.reqSkipApp(data.app_id);
            gl.wechat.navigateToMiniProgram(data.appid, data.link_path).then((res) => {
                gl.userinfo.reqSkipApp(data.app_id);
                if (cc.sys.os === cc.sys.OS_IOS){
                    cc.game.restart();
                };
            });
        });
    },

    // update (dt) {},
});
