cc.Class({
    extends: cc.Component,

    properties: {
        node_bg: cc.Node,
        node_role: cc.Node,
        node_light: cc.Node,
        node_color: [cc.Node],
        prefab_selectRole: cc.Prefab,
        prefab_selectScene: cc.Prefab,
        prefab_shareConcern: cc.Prefab,
        prefab_lookRank: cc.Prefab,
        prefab_role: [cc.Prefab],
        prefab_notice: cc.Prefab,
        prefab_light: cc.Prefab,
        prefab_hintFrame: cc.Prefab,
        prefab_loading: cc.Prefab,
        prefab_hourseRace: cc.Prefab,
        label_stamina: cc.Label,
        label_staminatime: cc.Label,
        ActWechat: cc.Animation,
        audio_bg: cc.AudioClip,
        img_audio: [cc.Node],
        node_flag: [cc.Node],

        //非微信登录需要隐藏
        node_addWechat: cc.Node,
        btn_service: cc.Node,

        layBox: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (gl.userinfo.isWeChat) {
            if (!gl.userinfo.enter) {
                this.addLoading();
                gl.userinfo.wechat_StartGame();
                this.initData();
            } else if (gl.userinfo.wechatadUnitId == "") {
                gl.userinfo.reqGainAdId();
            }
            gl.wechat.showGameClub();
            // this.initNotice();
            this.initHorseRace();
        } else this.initData();
        this.initWnd();

        this.gamecut = true;
        gl.emitter.on("event_nostamina", this.noStamina, this);
        gl.emitter.on("event_refreshrole", this.refreshRole, this);
        gl.emitter.on("event_gamesenter", this.gamesenter, this);
        gl.emitter.on('event_refreshstamina', this.refreshStamina, this);
        gl.emitter.on('event_login', this.login, this);
        gl.emitter.on("event_faildSeeVideo", this.faildSeeVideo, this);
        new Promise((resolve, reject) => {
            cc.director.preloadScene('game', (error, res) => {
                if (error) console.error(error);
                else return resolve();
            });
        }).then(() => {
            this.gamecut = true;
        });
        this.audio_open = gl.audio.open === 1 ? true : false;
        gl.audio.playMusic(this.audio_bg);
        this.img_audio[0].active = this.audio_open;
        this.img_audio[1].active = !this.audio_open;
        if (!gl.userinfo.wechatflag) {
            for (let key in this.node_flag) {
                let btn_node = this.node_flag[key];
                btn_node.active = false;
            }
        }
    },
    login() {
        if (!gl.userinfo.wechatflag) {
            for (let key in this.node_flag) {
                let btn_node = this.node_flag[key];
                btn_node.active = false;
            }
        } else {
            this.initHorseRace();
            this.initNotice();
        }
        let hadSkin = gl.userinfo.get("skinList");
        let selectRole = gl.userinfo.get("role");
        console.log('皮肤信息', hadSkin, selectRole)
        if (!hadSkin[selectRole + 1]) {
            gl.userinfo.set("role", 0);
            selectRole = 0;
        }
        this.refreshRole();
    },
    update(dt) {
        if (this.label_staminatime) {
            this.label_staminatime.string = gl.userinfo.getStaminaTime();
        }
    },
    initNotice() {
        let notice = gl.userinfo.get('bulletin');
        console.log('公告详情', notice);
        if (!notice || !notice.content) return;
        let noticeNode = cc.instantiate(this.prefab_notice);
        noticeNode.parent = this.node;
    },
    initHorseRace() {
        let horseRace = gl.userinfo.get('horseRace');
        if (horseRace && horseRace.content) {
            let horseNode = cc.instantiate(this.prefab_hourseRace);
            horseNode.parent = this.node;
        }
    },
    initWnd() {
        gl.color_index = parseInt(Math.random() * (2 - 0 + 1) + 0);

        if (!gl.userinfo.isWeChat) {
            this.node_addWechat.active = false;
            this.btn_service.active = false;
        }

        //变色控制
        this.node_bg.setColor(gl.bottom_color[gl.color_index]);
        for (let i = 1, count = 2; i <= count; i++) {
            let light_top = this.node_bg.getChildByName(`img_ztop${i}`);
            light_top.setColor(gl.light_color[gl.color_index]);

            let light_down = this.node_bg.getChildByName(`img_zdown${i}`);
            light_down.setColor(gl.light_color[gl.color_index]);
        }
        //初始化贴图位置
        this.refreshRole();
        let light = cc.instantiate(this.prefab_light);
        light.parent = this.node_light;
        light.scaleX = 1.3;
        light.scaleY = 1.05;
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

    refreshRole() {
        this.node_role.removeAllChildren();
        this.node_role.destroyAllChildren();
        let selectRole = gl.userinfo.get("role");
        let role = cc.instantiate(this.prefab_role[selectRole]);
        role.parent = this.node_role;
        role.scale = 2.2;
    },

    initData() {
        let str; // = gl.userinfo.readData("jdqsData");
        if (gl.userinfo.isOrgainMap) {                          //微信登录，关卡数据服务器下发
            cc.loader.load(gl.JDQS_DATA, (err, res) => {
                //cc.log(res);
                gl.levelArr = res;
                gl.userinfo.set("pointCount", res.length - 1);
            })
            return;
        }
        if (gl.userinfo.isDevelop) {
            str = "resources/jdqsData";
        } else {
            str = "resources/jdqsData";
        }
        gl.readJSON(str).then(data => {
            gl.levelArr = data;
            gl.userinfo.set("hadPass", gl.levelArr.length);
            gl.userinfo.set("pointCount", data.length - 1);
            // this.node.getChildByName("toeditor").active = gl.userinfo.isDevelop;
        })
    },
    addLoading() {
        let curNode = cc.instantiate(this.prefab_loading);
        curNode.parent = this.node;
    },
    //--Btn callback--
    selectScene() {
        let curNode = cc.instantiate(this.prefab_selectScene);
        curNode.parent = this.node;
    },
    selectRole() {
        let curNode = cc.instantiate(this.prefab_selectRole);
        curNode.parent = this.node;
    },
    sceneEditor() {
        cc.director.loadScene('editor');
    },
    shareConcern() {
        let node_concern = cc.instantiate(this.prefab_shareConcern);
        node_concern.parent = this.node;
    },

    addStamina() {
        if (gl.userinfo.isWeChat) {
            if (gl.userinfo.wechatflag) {
                //广告跳转预留
                console.log("分享次数3", gl.userinfo.sharecount, gl.userinfo.wechatadUnitId)
                if (gl.userinfo.sharecount == 0 && gl.userinfo.wechatadUnitId != "") {
                    gl.wechat.showRewardVideoAd(() => {
                        console.log("分享走哪里1")
                        gl.userinfo.reqStamina(2, "", "");
                        gl.wechat.shareAppMessages();
                    }, () => {
                        gl.userinfo.reqGetShareStamina();
                    })
                } else {
                    console.log("分享走哪里2")
                    gl.userinfo.reqGetShareStamina();
                }
            } else {
                this.noStamina();
            }
        } else this.noStamina();
    },
    faildSeeVideo() {
        gl.userinfo.reqGetShareStamina();
    },
    lookRank() {
        let node_lookRank = cc.instantiate(this.prefab_lookRank);
        node_lookRank.parent = this.node;
    },
    noStamina() {
        let node_hint = cc.instantiate(this.prefab_hintFrame);
        node_hint.parent = this.node;
    },
    gamesenter() {
        if (!this.gamecut) console.error("cutgame", this.gamecut);
        else cc.director.loadScene('game');
    },

    onButton(self) {
        switch (self.target.name) {
            case "btn_start":
                this.selectScene();
                if (!gl.userinfo.isWeChat) break;
                gl.wechat.hideBannerAd();
                break;
            case "btn_selectRole":
                this.selectRole();
                if (!gl.userinfo.isWeChat) break;
                gl.wechat.hideBannerAd();
                break;
            case "btn_interesting":
                this.shareConcern();
                if (!gl.userinfo.isWeChat) break;
                gl.wechat.hideBannerAd();
                break;
            case "btn_rank":
                this.lookRank();
                if (!gl.userinfo.isWeChat) break;
                gl.wechat.hideBannerAd();
                break;
            case "btn_stamina":
                this.addStamina();
                break;
            case "btn_service":
                if (!gl.userinfo.isWeChat) break;
                gl.wechat.openCustomerServiceConversation();
                break;
            case "btn_snFight":
                gl.showTip("还未开放敬请期待！");
                break;
            case "btn_audio":
                this.audio_open = !this.audio_open;
                this.img_audio[0].active = this.audio_open;
                this.img_audio[1].active = !this.audio_open;
                gl.audio.setOpen();
                break;
            case "btn_ttl":
                //console.log("点击了跳转跳跳乐按钮")
                if (!gl.userinfo.isWeChat) break;
                gl.wechat.navigateToMiniProgram('wx0fb02089c02032c5', 'pages/index/index?id=123');
                break;
            case 'layBox':
                this.layBox_cb();
                break;
            default:
                break;
        }
        gl.audio.clickPlay();
    },

    start() {

    },
    onDestroy() {
        gl.emitter.off("event_refreshrole", this);
        gl.emitter.off("event_nostamina", this);
        gl.emitter.off("event_gamesenter", this);
        gl.emitter.off('event_refreshstamina', this);
        gl.emitter.off('event_login', this);
        gl.emitter.off("event_faildSeeVideo", this);
        gl.audio.stopMusic();
    },
});
