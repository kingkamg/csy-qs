
const RANK_TYPE = {
    FRIEND: 0,
    OWNER: 1,
}
const BUTTON_TYPE = {
    SELECT: 0,
    CANCEL: 1,
}

cc.Class({
    extends: cc.Component,

    properties: {
        node_bg: cc.Node,
        node_light: cc.Node,
        node_roleData: cc.Node,
        node_btnSelect: [cc.Node],
        sf_rankPic: [cc.SpriteFrame],
        node_color: [cc.Node],
        prefab_light: cc.Prefab,

        node_roleStrip: cc.Node,
        node_rankContent: cc.Node,
        sprite_rankingScrollView: cc.Sprite,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.tex = new cc.Texture2D();
        this.blSetWin = false;
        this.rank_page = 1;
        this.rank_web_page = 1;
        this.rank_init = false;
        this.rank_count = 12;
        this.rank_count_min = 4;
        this.name_width = 224;
        this.blRecord = true;
        this.rank_type = RANK_TYPE.FRIEND;
        this.rank_select_color = [cc.color(0xFF, 0xAF, 0x48), cc.color(0xD4, 0xD4, 0xD4)];
        this.initWnd();
        gl.emitter.on("event_rankuser", this.initUserRole, this);
        gl.emitter.on("event_ownerrank", this.rankView, this);
        this.setBtnColor();
        this.setRankListOpen();
        if (gl.userinfo.isWeChat) {
            gl.wechat.openDataPostMessage({
                messageType: gl.MESSAGE_TYPE.GAIN_RANK,
                MAIN_MENU_NUM: gl.wechat_rank_key,
            });
        }
        this.node_roleData.active = false;
    },

    initWnd() {
        //变色控制
        this.node_bg.setColor(gl.bottom_color[gl.color_index]);
        for (let i = 1, count = 2; i <= count; i++) {
            let light_top = this.node_bg.getChildByName(`img_ztop${i}`);
            light_top.setColor(gl.light_color[gl.color_index]);
        }
        //初始化贴图位置
        let light = cc.instantiate(this.prefab_light);
        light.parent = this.node_light;
        light.scaleX = 1.3
        light.scaleY = 1.2
        //设置按钮颜色
        for (let key in this.node_color) {
            let btn_node = this.node_color[key];
            btn_node.setColor(gl.button_color[gl.color_index]);
        }
    },

    ownerRank() {
        if (gl.userinfo.isWeChat)
            gl.userinfo.reqOwnerRank(this.rank_web_page, this.rank_count);
    },


    rankView() {
        this.rank_init = true;
        let begin_num = (this.rank_page - 1) * this.rank_count_min,
            itemNum = this.rank_page * this.rank_count_min,
            index = 0,
            rank_list = gl.userinfo.get("ownerRank");

        if (begin_num > rank_list.length) {
            this.rank_page--;
            this.blRecord = false;
            return;
        }
        this.node_rankContent.removeAllChildren();
        for (let i = begin_num; i < itemNum; i++) {
            let odd = rank_list[i];
            if (!odd || !odd.rank) continue;
            this.addRoleData(odd)
            index++;
        }
        if (rank_list.length < itemNum || index < this.rank_count_min) this.blRecord = false;
        else this.blRecord = true;
    },

    initUserRole() {
        let userRank = gl.userinfo.get("userRank");
        this.setRestsRoleData(this.node_roleData, userRank, true)
    },

    addRoleData(data) {
        let nodeRole = cc.instantiate(this.node_roleStrip);
        nodeRole.active = true;
        nodeRole.parent = this.node_rankContent;
        this.setRestsRoleData(nodeRole, data);
    },

    setRestsRoleData(nodeRole, roleRank, bLabel = false) {
        let nsrank = nodeRole.getChildByName("img_rank"),
            spRank = nsrank ? nsrank.getComponent(cc.Sprite) : null,
            lbRank = nodeRole.getChildByName("label_rank").getComponent(cc.Label),
            nodeIcon = nodeRole.getChildByName("icon"),
            lbName = nodeRole.getChildByName("label_name").getComponent(cc.Label),
            lbPoint = nodeRole.getChildByName("label_point").getComponent(cc.Label),
            lbTime = nodeRole.getChildByName("label_time").getComponent(cc.Label);


        spRank ? spRank.node.active = false : null;
        lbRank.node.active = false;
        if (roleRank.rank > 3 || bLabel) {
            lbRank.node.active = true;
            lbRank.string = "" + roleRank.rank;
        } else {
            spRank.node.active = true;
            spRank.spriteFrame = this.sf_rankPic[roleRank.rank - 1];
        }
        gl.showRemoteImage(nodeIcon, roleRank.avatar);
        lbName.string = "" + roleRank.nickname;
        if (lbName.node.width >= this.name_width)lbName.node.scale = this.name_width/lbName.node.width; 
        lbPoint.string = "" + (parseInt(roleRank.pointid) + 1) + "关";
        lbTime.string = gl.userinfo.getStrTime(roleRank.finishtime);
    },

    /**
     * 设置选中按钮的颜色
     */
    setBtnColor() {
        this.node_btnSelect[RANK_TYPE.FRIEND].setColor(this.rank_select_color[BUTTON_TYPE.CANCEL]);
        this.node_btnSelect[RANK_TYPE.OWNER].setColor(this.rank_select_color[BUTTON_TYPE.CANCEL]);
        if (this.rank_type == RANK_TYPE.FRIEND) {
            this.node_btnSelect[RANK_TYPE.FRIEND].setColor(this.rank_select_color[BUTTON_TYPE.SELECT]);
        } else {
            this.node_btnSelect[RANK_TYPE.OWNER].setColor(this.rank_select_color[BUTTON_TYPE.SELECT]);
        }
    },
    /**
     * 设置选中按钮的颜色
     */
    setRankListOpen() {
        this.node_roleData.active = false;
        this.node_rankContent.active = false;
        if (this.rank_type == RANK_TYPE.FRIEND) {
            //this.node_roleData.active = false;
        } else {
            this.node_rankContent.active = true;
            this.node_roleData.active = true;
            if (!this.rank_init)this.ownerRank();
        }
    },

    onButton(self) {
        switch (self.target.name) {
            case "btn_close":
                this.node.destroy();
                break;
            case "btn_invitation":
                if (this.rank_type != RANK_TYPE.FRIEND) {
                    this.rank_type = RANK_TYPE.FRIEND;
                    this.setBtnColor();
                    this.setRankListOpen();
                    gl.wechat.openDataPostMessage({
                        messageType: gl.MESSAGE_TYPE.SHOW_RANK,
                    });
                }
                break;
            case "btn_allrank":
                if (this.rank_type != RANK_TYPE.OWNER) {
                    this.rank_type = RANK_TYPE.OWNER;
                    this.setBtnColor();
                    this.setRankListOpen();
                    gl.wechat.openDataPostMessage({
                        messageType: gl.MESSAGE_TYPE.HIDE_RANK,
                    });
                }
                break;
            case "btn_left":
                this.onLeftPage();
                break;
            case "btn_right":
                this.onRightPage();
                break;
            default:
                break;
        }
        gl.audio.clickPlay();
    },

    onLeftPage() {
        if (this.rank_type == RANK_TYPE.FRIEND) {
            gl.wechat.openDataPostMessage({
                messageType: gl.MESSAGE_TYPE.RANK_PAGE,
                page: 0,
            });
        } else {
            if (this.rank_page > 1) {
                this.rank_page--;
                this.rankView();
            }
        }
    },
    onRightPage() {
        if (this.rank_type == RANK_TYPE.FRIEND) {
            gl.wechat.openDataPostMessage({
                messageType: gl.MESSAGE_TYPE.RANK_PAGE,
                page: 1,
            });
        } else {
            let rank_list = gl.userinfo.get("ownerRank"),
                begin_num = this.rank_page * this.rank_count_min;
            if (rank_list && this.blRecord == true && this.rank_page < 25) {
                this.rank_page++;
                if (rank_list.length <= begin_num) {
                    this.rank_web_page++;
                    this.ownerRank();
                }
                else this.rankView();

            }
        }
    },


    start() {

    },

    onDestroy() {
        if (cc.director.getScene().name === "start") gl.wechat.showBannerAd();
        gl.emitter.off("event_rankuser", this);
        gl.emitter.off("event_ownerrank", this);
    },

    update(dt) {
        if (!window.sharedCanvas || !this.tex) return;
        if (!this.blSetWin) {
            let winSize = cc.director.getWinSize();
            window.sharedCanvas.width = winSize.width;
            window.sharedCanvas.height = winSize.height;
            this.blSetWin = true;
        }
        this.tex.initWithElement(window.sharedCanvas);
        this.tex.handleLoadedTexture();
        this.sprite_rankingScrollView.spriteFrame = new cc.SpriteFrame(this.tex);
    },
});
