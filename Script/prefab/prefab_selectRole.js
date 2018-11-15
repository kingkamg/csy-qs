cc.Class({
    extends: cc.Component,

    properties: {
        node_bg: cc.Node,
        lab_intro: cc.Label,
        page_roleList: cc.PageView,
        node_roleContent: cc.Node,
        node_light: cc.Node,
        node_btnColor: [cc.Node],
        prefab_light: cc.Prefab,

        btn_select: cc.Node,
        btn_video: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.page_count = 6;
        gl.emitter.on("event_faildSeeVideo", this.faildSeeVideo, this);
        this.selectIndex = gl.userinfo.get('role');
        this.intro = gl.userinfo.get('intro');
        this.isSwitch = false;
        this.initWnd();
        this.updateList(false);
        this.updateText();
    },
    initWnd() {
        this.node_bg.setColor(gl.bottom_color[gl.color_index]);
        for (let i = 1, count = 2; i <= count; i++) {
            let light_top = this.node_bg.getChildByName(`img_ztop${i}`);
            light_top.setColor(gl.light_color[gl.color_index])
        }
        for (let i = 0, count = this.node_btnColor.length; i < count; i++) {
            let nodeColor = this.node_btnColor[i];
            nodeColor.setColor(gl.button_color[gl.color_index]);
        }
        let light = cc.instantiate(this.prefab_light);
        light.parent = this.node_light;
        light.scaleX = 1.3;
        light.scaleY = 1.2;
        let count = this.node_roleContent.childrenCount
        for (let i = 0; i < count; i++) {
            let node_lock = this.node_roleContent.getChildByName(`page_${i}`).getChildByName("img_lock");
            if (gl.userinfo.skinList[i + 1]) {
                node_lock.active = false;
            } else {
                node_lock.active = true;
            }
        }
    },

    chengeBtnState() {
        let index = this.selectIndex;
        if (gl.userinfo.skinList[index + 1]) {
            this.initselectBtnState(true);
        } else {
            this.initselectBtnState(false);
        }
    },

    initselectBtnState(isLock) {
        this.btn_select.active = isLock;
        this.btn_video.active = !isLock;
    },
    updateList(scroll = true) {
        // this.setRoleScale(this.selectIndex, 1.6);
        if (scroll) this.page_roleList.scrollToPage(this.selectIndex);
        else this.page_roleList.scrollToPercentHorizontal(this.getScrollIndex());
    },
    updateText() {
        if (this.intro[this.selectIndex]) this.lab_intro.string = this.intro[this.selectIndex];
        else this.lab_intro.string = '无此人物介绍';
    },
    selectRoleAct() {
        let node_role = this.node_roleContent.getChildByName(`page_${this.selectIndex}`).getChildByName("role"),
            action = [], count = 4, duration = 0.1, movex = 15;
        for (let i = 0; i < count; i++)action.push(cc.moveBy(duration, i % 2 ? movex : -movex, 0));
        node_role.runAction(cc.sequence(action));
        let node_lock = this.node_roleContent.getChildByName(`page_${this.selectIndex}`).getChildByName("img_lock"),
            laction = [];
        for (let i = 0; i < count; i++)laction.push(cc.moveBy(duration, i % 2 ? movex : -movex, 0));
        node_lock.runAction(cc.sequence(laction));

    },
    /**
     * 获取滚动的百分比值
     */
    getScrollIndex() {
        if (this.selectIndex != 0 && this.selectIndex != this.page_count - 1)
            return this.selectIndex / (this.page_count - 1);
        return this.selectIndex ? 1 : 0;
    },
    /**
     * 设置人物缩放
     * @param {number} index 
     * @param {float} scale 
     */
    setRoleScale(index, scale) {
        for (let i = 0; i < this.page_count; i++) {
            let page_node = this.node_roleContent.getChildByName(`page_${i}`), node_role = page_node.getChildByName("role");
            i == index ? node_role.setScale(scale) : node_role.setScale(1);
        }
    },
    //是否在游戏中切换人物
    isInGame() {
        this.isSwitch = true;
    },
    //---------callback-------------
    pageTouch(event) {
        this.selectIndex = event._lastPageIdx;
        this.updateText();
        this.selectRoleAct();
        this.chengeBtnState();
    },
    cb_left() {
        this.selectIndex -= 1;
        this.selectIndex = this.selectIndex < 0 ? 0 : this.selectIndex;
        this.updateList();
        this.chengeBtnState();
        gl.audio.clickPlay();
    },
    cb_right() {
        this.selectIndex += 1;
        let max = this.page_count - 1;
        this.selectIndex = this.selectIndex > max ? max : this.selectIndex;
        this.updateList();
        this.chengeBtnState();
        gl.audio.clickPlay();
    },
    cb_back() {
        this.node.destroy();
        gl.audio.clickPlay();
    },
    /**
     *确定按钮
     * @isSwitch 是否重新加载star场景
     */
    cb_sure() {
        gl.userinfo.set('role', this.selectIndex);
        gl.userinfo.storageData(gl.role_key, this.selectIndex);
        gl.emitter.emit("event_refreshrole");
        //if (this.isSwitch) cc.director.loadScene('game');
        this.node.destroy();
        gl.audio.clickPlay();
    },
    cb_video() {
        if (gl.userinfo.wechatflag) {
            gl.wechat.showRewardVideoAd(() => {
                gl.network.send("http.reqUnlockSkin", { "skinIndex": this.selectIndex + 1, "type": 2 }, (route, msg) => {
                    console.log("aaaaa", msg)
                    if (msg.state == 1) {
                        gl.userinfo.skinList[this.selectIndex + 1] = msg.state;
                        this.initselectBtnState(true);
                        this.node_roleContent.getChildByName(`page_${this.selectIndex}`).getChildByName("img_lock").active = false;
                    }
                });
            });
        } else {
            gl.showTip('敬请期待');
        }
    },
    faildSeeVideo() {
        gl.showTip('敬请期待');
    },
    start() {

    },

    // update (dt) {},

    onDestroy() {
        gl.emitter.off("event_faildSeeVideo", this);
        gl.wechat.showBannerAd();
    },
});
