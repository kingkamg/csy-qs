cc.Class({
    extends: cc.Component,

    properties: {
        node_bg: cc.Node,
        node_win: cc.Node,
        node_fail: cc.Node,
        node_rank: cc.Node,
        node_light: cc.Node,
        node_wudi: cc.Node,
        node_again: cc.Node,
        label_stamina: cc.Label,
        node_color: [cc.Node],
        prefab_switchRol: cc.Prefab,
        prefab_lookclub: cc.Prefab,
        prefab_light: cc.Prefab,
        label_staminatime: cc.Label,
        node_flag: [cc.Node],
        prefab_ad: cc.Prefab,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.initWnd();
        this.initMenu();
        gl.emitter.on("event_faildSeeVideo", this.faildSeeVideo, this);
        gl.emitter.on("event_refreshprank", this.initRank, this);
        gl.emitter.on('event_refreshstamina', this.refreshStamina, this);
        gl.audio.setSound(false);
        if (!gl.userinfo.wechatflag) {
            for (let key in this.node_flag) {
                let btn_node = this.node_flag[key];
                btn_node.active = false;
            }
            this.node_again.x = 0;
        }
    },
    update(dt) {
        if (this.label_staminatime) {
            this.label_staminatime.string = gl.userinfo.getStaminaTime();
        }
    },
    initWnd() {
        this.node_bg.setColor(gl.bottom_color[gl.color_index]);
        for (let i = 1, count = 2; i <= count; i++) {
            let light_top = this.node_bg.getChildByName(`img_ztop${i}`);
            light_top.setColor(gl.light_color[gl.color_index])
        }

        let light = cc.instantiate(this.prefab_light);
        light.parent = this.node_light;
        light.scaleX = 1.3
        light.scaleY = 1.2
        //设置按钮颜色
        for (let key in this.node_color) {
            let btn_node = this.node_color[key];
            btn_node.setColor(gl.button_color[gl.color_index]);
        }
        //设置体力值
        this.refreshStamina();
    },
    refreshStamina() {
        //设置体力值
        this.label_stamina.string = "" + gl.userinfo.get("stamina");
    },
    initMenu() {
        this.isWin = gl.userinfo.get('isWin');
        this.node_win.active = false;
        this.node_fail.active = false;
        if (this.isWin) {
            this.node_win.active = true;
            this.initRank();
        }
        else {
            this.node_fail.active = true;
            let node_label = this.node_wudi.getChildByName(`label_${parseInt(Math.random() * (3 - 1 + 1) + 1)}`);
            node_label.active = true;
            let adNode = cc.instantiate(this.prefab_ad);
            adNode.parent = this.node;
        }
    },
    initRank() {
        let pointRank = gl.userinfo.get("pointRank");
        for (let i = 1, count = this.node_rank.childrenCount; i < count; i++) {
            let rankdata = pointRank[i - 1],
                noderank = this.node_rank.getChildByName(`node_rank${i}`),
                nodeIcon = noderank.getChildByName("icon"),
                lbName = noderank.getChildByName("name").getComponent(cc.Label),
                lbTime = noderank.getChildByName("time").getComponent(cc.Label);
            if (!rankdata) {
                noderank.active = false;
                continue;
            }
            gl.showRemoteImage(nodeIcon, rankdata.avatar);
            lbName.string = rankdata.nickname;
            lbTime.string = gl.userinfo.getStrTime(rankdata.finishtime);
        }
        //自己的排行
        let userRank = gl.userinfo.get("userRank");
        let noderank = this.node_rank.getChildByName(`node_rank4`),
            img_bg = noderank.getChildByName("img_bg"),
            lbRank = noderank.getChildByName("label_rank").getComponent(cc.Label),
            nodeIcon = noderank.getChildByName("icon"),
            lbName = noderank.getChildByName("name").getComponent(cc.Label),
            lbTime = noderank.getChildByName("time").getComponent(cc.Label);
        img_bg.setColor(gl.light_color[gl.color_index]);
        lbRank.string = "" + userRank.rank;
        gl.showRemoteImage(nodeIcon, userRank.avatar);
        lbName.string = userRank.nickname;
        lbTime.string = gl.userinfo.getStrTime(userRank.finishtime);

    },

    //-------btn callback------
    btn_backToMenu() {
        new Promise((resolve, reject) => {
            cc.director.preloadScene('start', (error, res) => {
                if (error) console.error(error);
                else return resolve();
            });
        }).then(() => {
            cc.director.loadScene('start');
            gl.wechat.showBannerAd();
        });
    },

    btn_share() {
        gl.wechat.shareAppMessage(gl.SHARE_TITLE, gl.SHARE_PICURL, "login=true")
    },

    btn_specialStart() {
        if (gl.userinfo.stamina > 0) {
            if (gl.userinfo.isWeChat) {
                gl.userinfo.reqGetVideoRevive();
            } else {
                gl.userinfo.shield = gl.userinfo.shieldMax;
                gl.userinfo.reqEnterPoint();
            }
        } else gl.emitter.emit('event_nostamina');
    },

    faildSeeVideo() {
        gl.userinfo.reqGetShareRevive();
    },

    btn_again() {
        if (gl.userinfo.stamina > 0) gl.userinfo.reqEnterPoint();
        else gl.emitter.emit('event_nostamina');
    },

    btn_switchRole() {
        let roleNode = cc.instantiate(this.prefab_switchRol);
        roleNode.parent = this.node;
        roleNode.getComponent('prefab_selectRole').isInGame();
    },

    btn_next() {
        if (gl.userinfo.stamina > 0) {
            let pointCount = gl.userinfo.get('pointCount');
            let checkPoint = gl.userinfo.get('checkPoint');
            if (pointCount >= checkPoint + 1) {
                gl.userinfo.set('checkPoint', checkPoint += 1);//进入下一关
                gl.userinfo.reqEnterPoint();
            } else gl.showTip("还未开放敬请期待！");
        }
        else {
            gl.emitter.emit('event_nostamina');
        }
    },

    btn_checkRank() {
        gl.wechat.shareClubRank(() => {
            let roleNode = cc.instantiate(this.prefab_lookclub);
            roleNode.parent = this.node;
        });
    },


    onButton(self) {
        switch (self.target.name) {
            case "btn_checkrank":
                this.btn_checkRank();
                break;
            case "btn_again":
                this.btn_again();
                break;
            case "btn_specialStart":
                this.btn_specialStart();
                break;
            case "btn_selectRole":
                this.btn_switchRole();
                break;
            case "btn_next":
                this.btn_next();
                break;
            case "btn_share":
                this.btn_share();
                break;
            case "btn_backToStart":
                this.btn_backToMenu();
                break;
            default:
                break;
        }

        gl.audio.clickPlay();
    },

    start() {

    },

    onDestroy() {
        gl.emitter.off("event_faildSeeVideo", this);
        gl.emitter.off("event_refreshprank", this);
        gl.emitter.off('event_refreshstamina', this);
        gl.userinfo.clearRankPoint();
        gl.audio.setSound(true);
    }

    // update (dt) {},
});
