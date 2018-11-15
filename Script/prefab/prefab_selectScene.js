
let OPEN_POINT_STATE = {
    OFF: 0,
    ON: 1,
    FILD: 2,
}
let OPEN_POINT_COLOR = {};
OPEN_POINT_COLOR[OPEN_POINT_STATE.OFF] = cc.color(0xd4, 0xd4, 0xd4);
OPEN_POINT_COLOR[OPEN_POINT_STATE.ON] = cc.color(0x70, 0xff, 0x2a);
OPEN_POINT_COLOR[OPEN_POINT_STATE.FILD] = cc.color(0xff, 0x7f, 0x39);

cc.Class({
    extends: cc.Component,

    properties: {
        node_bg: cc.Node,
        btn_preNode: cc.Node,
        node_pointList: cc.Node,
        btn_unlock: cc.Node,
        node_light: cc.Node,
        label_stamina: cc.Label,
        prefab_light: cc.Prefab,
        label_staminatime: cc.Label,
        pageview_content: cc.Node,
        node_color: [cc.Node],
        pageView: cc.PageView,
        node_page: cc.Node,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.selectIndex = 0;
        this.initWnd();
        this.initList();
        //if (!gl.userinfo.isDevelop)
        this.btn_unlock.active = false;
        gl.emitter.on('event_refreshstamina', this.refreshStamina, this);
    },
    start() {
        this.initPageViewIndex();
    },
    update(dt) {
        if (this.label_staminatime) {
            this.label_staminatime.string = gl.userinfo.getStaminaTime();
        }
    },
    initPageViewIndex() {
        let index = Math.ceil((gl.userinfo.hadPass + 1) / 20) - 1;
        index = index > 4 ? 4 : index;
        console.log('滚动到指定页面' + index);
        this.pageView.getComponent(cc.PageView).scrollToPage(index, 0);
        this.selectIndex = index;
    },
    initWnd() {
        //变色
        this.node_bg.setColor(gl.bottom_color[gl.color_index]);
        for (let i = 1, count = 2; i <= count; i++) {
            let light_top = this.node_bg.getChildByName(`img_ztop${i}`);
            light_top.setColor(gl.light_color[gl.color_index]);
        }
        //吊顶
        let light = cc.instantiate(this.prefab_light);
        light.parent = this.node_light;
        light.scaleX = 1.3;
        light.scaleY = 1.2;
        //按钮颜色
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

    cb_unlock() {
        this.node_pointList.destroyAllChildren();
        let pointCount = gl.userinfo.get('pointCount')
        gl.userinfo.set('hadPass', pointCount);
        this.initList();
    },
    pageTouch(event) {
        this.selectIndex = event._lastPageIdx;
    },
    cb_left() {
        this.selectIndex -= 1;
        this.selectIndex = this.selectIndex < 0 ? 0 : this.selectIndex;
        this.pageView.getComponent(cc.PageView).scrollToPage(this.selectIndex, 0.3);
    },
    cb_right() {
        this.selectIndex += 1;
        let max = Math.ceil((gl.userinfo.pointCount + 1) / 20) - 1;
        this.selectIndex = this.selectIndex >= max ? max : this.selectIndex;
        this.pageView.getComponent(cc.PageView).scrollToPage(this.selectIndex, 0.3);
    },
    initList() {
        let hadPass = gl.userinfo.get('hadPass'), pointMax = gl.levelArr.length;
        let pageNumber = Math.ceil(pointMax / 20);
        for (let i = 0; i < pageNumber; i++) {
            let page = cc.instantiate(this.node_page);
            page.parent = this.pageview_content;
            page.active = true;
        }
        for (let i = 0; i < pointMax; i++) {
            let curNode = cc.instantiate(this.btn_preNode);
            let parentIndex = Math.ceil((i + 1) / 20) - 1;
            curNode.parent = this.pageview_content.children[parentIndex];
            curNode.active = true;
            curNode.getChildByName("label_point").getComponent(cc.Label).string = i + 1;
            curNode.getChildByName("img_pwhite").setColor(gl.button_color[gl.color_index]);
            curNode.on('click', this.selectPoint, this);
            curNode.tag = i;
            if (i > hadPass) curNode.setColor(OPEN_POINT_COLOR[OPEN_POINT_STATE.OFF]);
            else if (i == hadPass && hadPass <= pointMax) curNode.setColor(OPEN_POINT_COLOR[OPEN_POINT_STATE.ON]);
            else curNode.setColor(OPEN_POINT_COLOR[OPEN_POINT_STATE.FILD]);
        }
    },

    //---------btn callback-------------
    cb_back() {
        this.node.destroy();
        gl.wechat.showBannerAd();
        gl.audio.clickPlay();
    },

    selectPoint(event) {
        let _index = Number(event.currentTarget.tag), hadPass = gl.userinfo.get('hadPass');
        if (_index > hadPass) return;
        gl.userinfo.set('checkPoint', _index);
        if (gl.userinfo.stamina > 0) gl.userinfo.reqEnterPoint();
        else gl.emitter.emit('event_nostamina');
        gl.audio.clickPlay();
    },


    // update (dt) {},

    onDestroy() {
        gl.emitter.off('event_refreshstamina', this);
    },
});
