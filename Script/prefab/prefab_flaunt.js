

cc.Class({
    extends: cc.Component,

    properties: {
        prefab_overMenu: cc.Prefab,
        lab_tip: cc.Label,
        lab_time: cc.Label,
        btn_skip: cc.Node,
    },


    onLoad() {
        gl.emitter.on("event_refreshprank", this.initInfo, this);
        this.initInfo();
    },

    initInfo() {
        let userRank = gl.userinfo.get("userRank");
        if (gl.bannerSize && gl.bannerSize[gl.bannerIndex]) {
            let bannerInfo = gl.bannerSize[gl.bannerIndex];
            if (bannerInfo.height && bannerInfo.winHeight) {
                this.btn_skip.y = -(cc.winSize.height / 2 - (bannerInfo.height / (bannerInfo.winHeight / cc.winSize.height))) + this.btn_skip.height / 2;
            }
        }
        let myRank = userRank.rank;
        let countRank = userRank.rank_count;
        let otherCount = countRank - 1 < 0 ? 1 : countRank - 1;
        this.lab_time.string = gl.userinfo.getStrTime(gl.userinfo.get('time'));
        if (countRank == 1) this.ranking = 100;
        else this.ranking = (((countRank - myRank) / otherCount) * 100).toFixed(2);
        this.lab_tip.string = `您超越了全球${this.ranking}%的玩家，快去朋友圈炫耀一下吧！`;
    },

    //-------------btn callback------------
    btn_skip_cb() {
        this.close();
    },

    btn_flaunt() {
        let userRank = gl.userinfo.get("userRank");
        let time = gl.userinfo.getStrTime(gl.userinfo.get('time'));
        let point = userRank.pointid + 1;
        gl.wechat.shareAppMessage(`我在第${point}关用时${time}秒超越了全球${this.ranking}%的玩家，一战疯神，你可敢来战？`, gl.SHARE_PICURL, 'type=flaunt');
        gl.backCb = () => {
            this.close();
        }
    },
    close() {
        gl.wechat.hideBannerAd();
        let curNode = cc.instantiate(this.prefab_overMenu);
        curNode.parent = cc.director.getScene();
        this.node.destroy();
    },

    onDestroy() {
        gl.emitter.off("event_refreshprank", this);
    }

    // update (dt) {},
});
