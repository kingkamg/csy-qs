
cc.Class({
    extends: cc.Component,

    properties: {
        node_time: cc.Label,
        goods_mos: cc.Prefab,
        prefab_overMenu: cc.Prefab,
        prefab_flaunt: cc.Prefab,
        prefab_pauseMenu: cc.Prefab,
        prefab_hintFrame: cc.Prefab,
        prefab_lookRank: cc.Prefab,
        prefab_switchRole: cc.Prefab,
        pre_treasure: cc.Prefab,
        node_world: cc.Node,
        node_guidance: [cc.Node],
        audio_bg: cc.AudioClip,
        auido_win: cc.AudioClip,
        auido_fail: cc.AudioClip,
        goods: [cc.Prefab],
        tv_fire: cc.Prefab,
        aroundWall: cc.Node,
        lab_pointNum: cc.Label,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.goodsList = {};
        //this.node.getChildByName("toeditor").active = !gl.userinfo.isWeChat;
        this.timer = null;
        this.gameTime = 0;
        this.useTime = 0;
        this.isWin = true;
        this.isOver = false;
        this.paseMenu = null;
        this.overMenu = null;
        this.flauntMenu = null;
        this.node_tvfire = null;
        this.lab_pointNum.string = `第${gl.userinfo.checkPoint + 1}关`;
        gl.emitter.on('event_creatMos', this.creatMos, this);
        gl.emitter.on('event_gameOver', this.gameOver, this);
        gl.emitter.on('event_gameWin', this.gameWin, this);
        gl.emitter.on("event_nostamina", this.noStamina, this);
        gl.emitter.on("event_oplookRank", this.lookRank, this);
        gl.emitter.on("event_opswitchRole", this.switchRole, this);
        gl.emitter.on("event_gamecontinue", this.startTimeOut, this);
        gl.emitter.on("event_gamesenter", this.gamesenter, this);
        gl.emitter.on("event_gamesopne", this.gamesopne, this);
        gl.emitter.on("event_blasting", this.Blasting, this);
        gl.emitter.on("event_guidanceStateChange", this.guidanceStateChange, this);
        gl.audio.playMusic(this.audio_bg);
        this.initDataGoods();
        gl.wechat.hideGameClub();
        this.startPhysic();
        gl.userinfo.initData();
        this.initPyhsicWorle();
        this.showGudianceState();
        this.initWnd();
    },

    showGudianceState() {
        if (gl.userinfo.checkPoint == 0) {
            this.node_guidance[4].active = true;
            this.node_guidance[5].active = true;
            this.node_guidance[5].runAction(cc.sequence(
                cc.delayTime(3),
                cc.callFunc(() => {
                    this.btn_startGuidance();
                })
            ))
        }
    },
    btn_startGuidance() {
        this.node_guidance[5].stopAllActions();
        this.node_guidance[5].active = false;
        this.guidanceStateChange(0);
    },
    guidanceStateChange(_state) {
        gl.userinfo.set('guidanceState', _state);
        this.node_guidance[0].active = false;
        this.node_guidance[1].active = false;
        this.node_guidance[2].active = false;
        this.node_guidance[3].active = false;
        this.node_guidance[4].active = true;//遮罩
        switch (_state) {
            case 0:
                this.node_guidance[0].active = true;
                break;
            case 1:
                this.node_guidance[1].active = true;
                break;
            case 2:
                this.node_guidance[2].active = true;
                break;
            case 3:
                this.node_guidance[4].active = false;
                this.node_guidance[3].active = true;
                this.scheduleOnce(() => {
                    this.node_guidance[3].active = false;
                }, 2)
                break;
        }
    },


    initWnd() {
        this.creatMos();
        // this.creatTreasure();
        this.startTimeOut();
    },

    gamesopne(bol) {
        let physicsManager = cc.director.getPhysicsManager();
        physicsManager.enabled = bol;
        bol ? this.node.resumeAllActions() : this.node.pauseAllActions();
        if (bol) {
            if (!this.timer) this.startTimeOut();
        } else {
            if (this.timer) this.cleanTimeOut();
        }
    },
    startPhysic() {
        let physicsManager = cc.director.getPhysicsManager();
        physicsManager.enabled = true;
        // physicsManager.FIXED_TIME_STEP = 0.03;//物理更新间隔时间
        // physicsManager.enabledAccumulator = true;
        // physicsManager.update(0.03);
    },
    initDataGoods() {
        for (let i = 0; i < this.goods.length; i++) {
            if (!this.goodsList[this.goods[i].data.name])
                this.goodsList[this.goods[i].data.name] = null;
            this.goodsList[this.goods[i].data.name] = this.goods[i].data
        }
    },
    //初始化游戏场景
    initPyhsicWorle() {
        this.levelarr = gl.levelArr;
        let checkPoint = gl.userinfo.get("checkPoint");
        let itemArr = this.levelarr[checkPoint].itemArr;
        let blueCount = 0;
        for (let i = 0; i < itemArr.length; i++) {
            let type = itemArr[i].type;
            if (type == "role") {
                //创建人物;
                let pos = cc.p(itemArr[i].x, itemArr[i].y);
                gl.userinfo.set("playerPos", pos)
                continue;
            }
            let curNode = cc.instantiate(this.goodsList[type]);
            curNode.x = itemArr[i].x;
            curNode.y = itemArr[i].y;
            curNode.rotation = itemArr[i].rotation;
            curNode.width = itemArr[i].width;
            curNode.height = itemArr[i].height;
            // if (type == "tv") {
            //     let tv = curNode.getChildByName("tv_3"),
            //         tv_4 = tv.getChildByName("tv_4"),
            //         tv_5 = tv.getChildByName("tv_5");
            //     tv_4.active = false;
            //     tv_5.active = false;
            //     Math.random() % 2 == 0 ? tv_4.active = true : tv_5.active = true;
            // }
            if (type == "buleGlassBig" || type == "buleGlass") {
                blueCount++;
            }
            let body;
            if (type == "fan" || type == "buleGlass" || type == "bottleGas" || type == "light" || type == "buleGlassBig" || type == "tv") {
                curNode.parent = this.node_world;
                continue;
            } else {
                body = curNode.getComponent(cc.PhysicsBoxCollider);
                body.size.width = itemArr[i].width;
                body.size.height = itemArr[i].height;
            }

            curNode.parent = this.node_world;
        }
        gl.userinfo.set('blueCount', blueCount);
    },
    //生成苍蝇
    creatMos() {
        if (this.isOver || (gl.userinfo.get('checkPoint') < 5)) return;
        this.mosNode = null;
        this.node.runAction(cc.sequence(
            cc.delayTime(2),
            cc.callFunc(() => {
                this.mosNode = cc.instantiate(this.goods_mos);
                this.mosNode.parent = this.node;
            }),
        ))
    },
    //生成宝箱
    creatTreasure() {
        if (gl.userinfo.wechatflag) {
            let point = gl.userinfo.checkPoint;
            if (point < 9) return;
            let creatTreasure = cc.instantiate(this.pre_treasure);
            creatTreasure.parent = this.node;
        }
    },

    gameOver() {
        if (this.isOver) return;
        this.cleanTimeOut();
        this.isOver = true;
        this.isWin = false;
        gl.userinfo.set('isWin', false);
        if (this.mosNode) this.mosNode.destroy();
        this.node.stopAllActions();
        this.showOverMenu();
        gl.audio.play(this.auido_fail, false);
    },
    gameWin() {
        if (this.isOver || !this.isWin) return;
        this.cleanTimeOut();
        gl.userinfo.set('time', this.gameTime);
        this.isOver = true;
        gl.userinfo.set('isWin', true);
        if (this.mosNode) this.mosNode.destroy();
        this.storagePoint();
        this.node.stopAllActions();
        this.showOverMenu();

        gl.audio.play(this.auido_win, false);
        let pointtime = this.gameTime;
        console.log("pointtime:", pointtime);
        //---------提交成绩-----------
        gl.wechat.openDataPostMessage({
            messageType: gl.MESSAGE_TYPE.SUBMIT_RANK,
            MAIN_MENU_NUM: "imageJump",
            point: gl.userinfo.get('checkPoint'),
            time: pointtime,
        });
        gl.userinfo.reqPointSubmit(gl.userinfo.get('checkPoint'), pointtime);
        //--------------------------
    },
    noStamina() {
        let node_hint = cc.instantiate(this.prefab_hintFrame);
        node_hint.parent = cc.director.getScene()//this.node;
    },
    lookRank() {
        let lookRank = cc.instantiate(this.prefab_lookRank);
        lookRank.parent = this.node;
    },
    switchRole() {
        let switchRole = cc.instantiate(this.prefab_switchRole);
        switchRole.parent = this.node;
        roleNode.getComponent('prefab_selectRole').isInGame();
    },
    goEditor() {
        cc.director.loadScene('editor');
    },
    storagePoint() {
        let pointCount = gl.userinfo.get('pointCount');
        let hadPass = Number(gl.userinfo.get('hadPass'));
        let checkPoint = gl.userinfo.get('checkPoint');
        if (hadPass <= pointCount && checkPoint == hadPass) {
            hadPass += 1;
            gl.userinfo.set('hadPass', hadPass);
            //gl.userinfo.storageData('bangbang_hadPass', hadPass);
        }
    },
    gamesenter() {
        this.cleanTimeOut();
        new Promise((resolve, reject) => {
            cc.director.preloadScene('game', (error, res) => {
                if (error) console.error(error);
                else return resolve();
            });
        }).then(() => {
            cc.director.resume();
            cc.director.loadScene('game');
        });
    },
    //显示时间
    startTimeOut() {
        if (this.timer) return;
        this.timer = setInterval(() => {
            this.gameTime += 1;
            //显示宝箱
            if (this.gameTime == 20) this.creatTreasure();
            this.node_time.string = gl.userinfo.getStrTime(this.gameTime);
        }, 1000)
    },
    //清理计时器
    cleanTimeOut() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    },
    //显示结束菜单
    showOverMenu() {
        this.node.runAction(cc.sequence(
            cc.delayTime(3),
            cc.callFunc(() => {
                this.isWin = gl.userinfo.get('isWin');
                if (this.paseMenu) this.paseMenu.destroy();
                //打开炫耀一下界面
                if (this.isWin) {
                    gl.wechat.showBannerAd();
                    this.flauntMenu = cc.instantiate(this.prefab_flaunt);
                    this.flauntMenu.parent = this.node;
                } else {
                    this.overMenu = cc.instantiate(this.prefab_overMenu);
                    this.overMenu.parent = this.node;
                }
            }),
        ))
    },

    //--------btn callback------
    btn_pause() {
        gl.userinfo.set('gametime', this.gameTime);
        this.cleanTimeOut();
        this.paseMenu = cc.instantiate(this.prefab_pauseMenu);
        this.paseMenu.parent = this.node;
        gl.emitter.emit('event_pauseGame');
        gl.audio.clickPlay();
    },

    //停止动画
    stopTvFire() {
        if (!this.node_tvfire) return;
        this.node_tvfire.destroy();
    },

    //爆破函数 tv_data:{uuid, pos}
    Blasting(tv_data) {
        for (let i = 0, count = this.node_world.childrenCount; i < count; i++) {
            let curNode = this.node_world.children[i];
            if (curNode.uuid === tv_data.uuid) {
                curNode && curNode.runAction(cc.moveBy(0.5, cc.p(0, 200)));
                continue;
            }
            let rigidbody = this.getNodeRigidBody(curNode);
            if (!rigidbody) continue;
            let velocityX = (rigidbody.node.x - tv_data.pos.x) * 500,
                velocityY = (rigidbody.node.y - tv_data.pos.y) * 500;
            rigidbody && rigidbody.applyForceToCenter(cc.v2(velocityX, velocityY), true);
        }
        this.node_tvfire = cc.instantiate(this.tv_fire);
        this.node_tvfire.position = tv_data.pos;
        this.node_tvfire.parent = this.node_world;
        let dyt = cc.delayTime(1);
        let cb = cc.callFunc(() => {
            this.stopTvFire();
        })
        this.node_tvfire.runAction(cc.sequence(dyt, cb));
    },

    //获取爆破的道具
    getNodeRigidBody(node) {
        let rigidbody = null;
        switch (node.name) {
            case "tv":
            case "bottleGas":
            case "glass":
            case "buleGlass":
            case "buleGlassBig":
                rigidbody = node.getComponent(cc.RigidBody);
                break;
            case "light":
                rigidbody = node.getChildByName('light_zhao').getComponent(cc.RigidBody);
                break;
            default:
                if (node.name.split('_')[0] == "Board") rigidbody = node.getComponent(cc.RigidBody);
                break;
        }
        return rigidbody
    },

    start() {

    },

    // update(dt) { },

    onDestroy() {
        this.cleanTimeOut();
        this.node.stopAllActions();
        gl.emitter.off('event_creatMos', this);
        gl.emitter.off('event_gameOver', this);
        gl.emitter.off('event_gameWin', this);
        gl.emitter.off("event_nostamina", this);
        gl.emitter.off("event_oplookRank", this);
        gl.emitter.off("event_opswitchRole", this);
        gl.emitter.off("event_gamecontinue", this);
        gl.emitter.off("event_gamesenter", this);
        gl.emitter.off("event_gamesopne", this);
        gl.emitter.off("event_blasting", this);
        gl.emitter.off("event_guidanceStateChange", this);
        cc.director.getPhysicsManager().enabled = false;
        gl.audio.stopMusic();
    }
});
