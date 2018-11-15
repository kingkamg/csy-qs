
const RANK_TYPE = {
    POINT: 2,
    FRIEND: 0,
    OWNER: 1,
}

let userinfo = cc.Class({
    name: "userinfo",
    properties: {

    },
    ctor: function () {
        this.isWeChat = true;      //是否为微信登录模式
        this.isOrgainMap = true;    //是否读取远程地图
        this.isDevelop = true;      //是否为开发模式
        this.isAndroid = false;      //是否为安卓登录
        this.enter = false;         //是否登入成功
        this.serverDelay = 0;       //客户端与服务端的时间延迟
        this.wechatflag = 1;        //控制按钮开关
        this.wechatadUnitId = "";   //微信广告id
        this.wcappid = "";          //跳转进入的id
        this.tpadunitlist = [];
        this.guidanceState = 4;     //新手引导状态 0 1 2 3 4完成
        this.shieldVideoCount = 0;       //无敌使用次数可看视频次数
        this.shieldVideoMax = 0;       //无敌使用次数可看视频次数

        //------玩家相关-----------
        this.userid = "";
        this.usericon = "";
        this.username = "";
        this.sendWechat = {};
        this.bulletin = {};             //公告
        this.horseRace = null;         //跑马灯
        this.stamina = 10;             //当前体力值
        this.staminaTime = 0;          //下次体力获取的时间
        // this.roleLock = [0, 4, 9, 0];
        this.sharecount = 0;
        this.skinList = { 0: 0 };
        //------关卡相关-----------
        this.pointCount = 19;       //总关数（从0开始）
        this.checkPoint = 0;        //选择的关卡
        this.time = 0;              //当前关卡过关时间
        this.gametime = 0;          //当前游戏时间
        this.hadPass = 0;           //已经通过的关卡
        this.role = 0;              //选择的人物012
        this.blueCount = 0;         //蓝瓶子的总数
        this.sceneSize = cc.winSize;


        //-----游戏中的数据--------
        this.sorce = 0;         //击中蓝色瓶子的数目
        this.shootCount = 0;    //射击总次数
        this.playerPos = null;
        this.isWin = null;      //是否胜利
        this.shield = 0;        //是否添加护盾
        this.shieldMax = 3;     //最大护盾个数

        //-----排行榜的数据--------
        this.rank_type = 0;
        this.rank_page = 1;
        this.pointRank = [];        //关卡排行
        this.friendRank = [];       //好友排行
        this.ownerRank = [];        //所有人排行
        this.userRank = {};

        //------config-----------
        this.gasSpeed = 600;//煤气罐的速度
        this.bulletSpeed = 1300;//子弹速度
        this.BODYTAG = {
            //刚体的tag代表的物理对象
            BOARD: 0,//木板
            PLAYER: 1,//玩家
            GLASS: 2,//普通杯子
            BULEGLASS: 3,//蓝色瓶子
            LIGHT: 4,//灯泡
            LIGHTCONNECT: 5,//灯的连接环
            TV: 6,//电视机
            MOS: 7,//蚊子
            GAS: 8,//煤气罐
            BULEGLASSBIG: 9,//大蓝色瓶子
            WALL: 10,//墙壁
        };
        this.PLAYERTAG = {
            HATS: 20,//帽子
        };
        this.intro = {
            0: '精灵王子，射箭技术一流，但是打手枪更牛逼。',
            1: '梦想射术绝顶，接着拿到一个射击的冠军。',
            2: '以前打飞机的射击很准，现在喜欢射蓝色的瓶子。',
            3: '一把将电脑砸在老板桌上，拿起抽屉里的枪走了。',
            4: '梦想成为饶舌高手的中年男子，在一场被嘲笑的表演后举起了枪。',
            5: '少女心不足以支撑自己喜好，只能用枪捍卫。',
        };
    },
    onLoad() {
        gl.emitter.on("event_servsertime", this.setServerTime, this);
        // gl.emitter.on("event_faildSeeVideo", this.faildSeeVideo, this);
        this.userInfoGain();
        this.testRank();

        let role_index = parseInt(this.readData(gl.role_key));
        if (role_index == 5 ||
            role_index == 4 ||
            role_index == 3 ||
            role_index == 2 ||
            role_index == 1 ||
            role_index == 0) {
            this.role = role_index;
        }
    },
    //初始化数据
    initData() {
        this.sorce = 0;
        this.shootCount = 0;
        this.playerPos = null;
        this.isWin = null;//是否胜利
    },
    posChnange(_pos) {
        this.sceneSize = cc.winSize;
        return cc.v2(_pos.x - this.sceneSize.width / 2, _pos.y - this.sceneSize.height / 2);
    },
    //----------------------------
    //储存数据
    storageData(_key, _value) {
        cc.sys.localStorage.setItem(_key, _value);
    },
    //读取数据
    readData(_key) {
        return cc.sys.localStorage.getItem(_key);
    },
    //一秒判定一些用户数据，如果有数据变化将进行发包访问
    userInfoGain() {
        setInterval(() => {
            if (this.staminaTime) {
                let time = Math.floor(Date.now() / 1000);
                if (time >= this.staminaTime) {
                    this.staminaTime = 0;
                    this.reqGainStamina();
                }
            }

        }, 1000)
    },
    //----------------------------
    getStrTime(timer = this.gametime) {
        let hour = Math.floor(timer / 3600),
            minute = Math.floor((timer % 3600) / 60),
            second = timer % 60;
        return `${hour > 9 ? "" : "0"}${hour}:${minute > 9 ? "" : "0"}${minute}:${second > 9 ? "" : "0"}${second}`;
    },
    //体力
    getStaminaTime() {
        if (this.staminaTime == 0) return "";
        else {
            let time = Math.floor(Date.now() / 1000),
                delay = Math.max(this.staminaTime - time, 0),
                minute = Math.floor(delay / 60),
                second = delay % 60;
            return `${minute > 9 ? "" : "0"}${minute}:${second > 9 ? "" : "0"}${second}`;
        }
    },
    clearRankPoint() {
        this.pointRank = [];
    },
    //设置系统时间
    setServerTime(time) {
        this.serverDelay = time - Math.floor(Date.now() / 1000);
    },
    // faildSeeVideo() {
    //     this.reqGetShareStamina();
    // },
    //设置体力值的获取时间戳
    setStaminaTime(staminaTime) {
        if (!staminaTime) this.staminaTime = 0;
        else this.staminaTime = staminaTime + this.serverDelay + 1;
    },
    //获取第三方广告
    getThirdpartyData() {
        if (!this.tpadunitlist || !this.tpadunitlist.app_page) return [];
        return this.tpadunitlist.app_page;

    },
    //获取第三方的渠道路口
    getThirdpartyCb() {
        if (!this.tpadunitlist || !this.tpadunitlist.app_cb) return [];
        return this.tpadunitlist.app_cb;
    },
    //获取第三方的渠道路口app_id: "", appid: "", title: "", path: ""
    getThirdpartyEnter() {
        if (!this.tpadunitlist || !this.tpadunitlist.app_box) return [];
        return this.tpadunitlist.app_box;
    },
    //----------WX------------
    wechat_StartGame() {
        gl.wechat.login().then((res) => {
            //驗證數據
            console.log("wechat_StartGame1", res);
            this.sendWechat.wccode = res.code;
            this.sendWechat.wckey = gl.wechat_rank_key;
            return gl.wechat.getUserInfo();
        }).then((res) => {
            this.usericon = res.userInfo.avatarUrl;
            this.username = res.userInfo.nickName;
            //驗證數據
            console.log("wechat_StartGame2", res);
            this.sendWechat.wcencrypted = res.encryptedData;
            this.sendWechat.wciv = res.iv;
            this.sendWechat.appid = this.wcappid;
            this.reqGetUser();
        });
    },
    //获取用户数据
    reqGetUser() {
        gl.emitter.emit("event_startlogin");
        gl.network.send("http.reqGetUser", this.sendWechat, this.http_reqGetUser.bind(this));
    },

    http_reqGetUser(route, data) {
        console.log('登录成功', data);
        this.userid = data.openid;
        this.stamina = data.stamina;
        this.hadPass = data.pointid;
        this.sharecount = data.sharecount;
        console.log("分享次数1", this.sharecount, data.sharecount)
        this.wechatadUnitId = data.adunitlist.video;
        this.bulletin = data.bulletin;
        this.horseRace = data.lamp;
        this.shieldVideoCount = data.shieldcount || 0;
        this.shieldVideoMax = data.shieldmax || 5;
        this.skinList = data.skinList;
        console.log("当前无敌可看视频次数", data.shieldcount, data.shieldmax);
        // let time = Math.floor(Date.now()/1000) + this.serverDelay + 10;
        // this.setStaminaTime(time);
        gl.wechat.createRewardedVideoAd(this.wechatadUnitId);
        this.setStaminaTime(data.staminatime);
        this.tpadunitlist = data.thirdpartydata;
        this.enter = true;
        gl.emitter.emit("event_login");
        gl.emitter.emit("event_refreshstamina");
        this.reqGetInitShare();
    },
    //获取广告id
    reqGainAdId() {
        gl.network.send("http.reqGainAdId", {}, this.http_reqGainAdId.bind(this));
    },

    http_reqGainAdId(route, data) {
        this.wechatadUnitId = data.adunitlist.video;
    },

    //获取初始化分享数据
    reqGetInitShare() {
        gl.network.send("http.reqGetShare", {}, this.http_reqGetInitShare.bind(this));
    },

    http_reqGetInitShare(route, data) {
        if (data.purl != "" && data.title != "") {
            gl.wechat.onShareAppMessage(data.title, data.purl);
        } else {
            gl.wechat.onShareAppMessage();
        }
    },
    //获取分享数据(获得体力)
    reqGetShareStamina() {
        gl.network.send("http.reqGetShare", {}, this.http_reqGetShareStamina.bind(this));
    },

    //获取分享数据
    http_reqGetShareStamina(route, data) {
        if (data.title != "") gl.SHARE_TITLE = data.title;
        if (data.purl != "") gl.SHARE_PICURL = data.purl;
        gl.wechat.shareAppMessages();
        gl.backCb = () => {
            this.reqStamina(4, null, null);
        }
        gl.failCb = () => {
            gl.showTip('分享失败');
        }
    },

    //提交跳转方式
    reqSkipApp(app_id) {
        gl.network.send("http.reqSkipApp", { to_id: app_id }, () => {
            console.log("chenggong");
        });
    },

    //获取激励视频(复活)
    reqGetVideoRevive() {
        if (this.shieldVideoCount < this.shieldVideoMax) {
            gl.wechat.showRewardVideoAd(() => {
                this.shield = this.shieldMax;
                this.shieldVideoCount++;
                this.reqEnterPoint(true);
            })
        } else {
            this.reqGetShareRevive();
        }
    },
    //获取分享数据(复活)
    reqGetShareRevive() {
        gl.network.send("http.reqGetShare", {}, this.http_reqGetShareRevive.bind(this));
    },

    //获取分享数据
    http_reqGetShareRevive(route, data) {
        if (data.title != "") gl.SHARE_TITLE = data.title;
        if (data.purl != "") gl.SHARE_PICURL = data.purl;
        console.log("http_reqGetShare", data);
        gl.wechat.shareAppMessages();
        gl.backCb = () => {
            this.shieldVideoCount++;
            this.shield = this.shieldMax;
            this.reqEnterPoint(true);
        }
        gl.failCb = () => {
            gl.showTip('分享失败');
        }
    },

    //进入关卡判定发包
    reqEnterPoint(bshield) {
        if (this.isWeChat) {
            gl.network.send("http.reqEnterPoint", bshield ? { shield: 1 } : {}, this.http_reqEnterPoint.bind(this));
        } else {
            this.stamina--;
            gl.emitter.emit("event_gamesenter");
        }
    },
    http_reqEnterPoint(route, data) {
        this.stamina = data.stamina;
        this.setStaminaTime(data.staminatime);
        gl.emitter.emit("event_gamesenter");
    },

    //发送关卡结果
    reqPointSubmit(point, finish) {
        if (!this.isWeChat) return;
        let msg = {
            pointid: point,		    //关卡id
            finishtime: finish,		//通过结束时间
        }
        gl.network.send("http.reqPointSubmit", msg, this.http_reqPointSubmit.bind(this));
    },

    http_reqPointSubmit() {
        this.reqPointRank(1, gl.userinfo.get('checkPoint'));
    },
    //当前体力值
    reqGainStamina() {
        gl.network.send("http.reqGainStamina", {}, this.http_reqGainStamina.bind(this));
    },
    http_reqGainStamina(route, data) {
        console.log('当前体力值', data)
        this.stamina = data.stamina;
        this.setStaminaTime(data.staminatime);
        gl.emitter.emit("event_refreshstamina");
    },
    //获取体力值
    reqStamina(type, wencrypted, wiv) {
        console.log("type:", type, "wencrypted:", "wiv:", wiv);
        gl.network.send("http.reqStamina", { type: type, encrypted: wencrypted, iv: wiv }, this.http_reqStamina.bind(this));
    },
    http_reqStamina(route, data) {
        console.log("分享回调data", data)
        this.stamina = data.stamina;
        this.sharecount = data.sharecount;
        console.log("分享次数2", this.sharecount, data.sharecount)
        this.setStaminaTime(data.staminatime);
        gl.showTip("体力已添加");
        gl.emitter.emit("event_refreshstamina");
    },

    //关卡排行
    reqPointRank(pageIndex, pointid) {
        this.reqGetRank(RANK_TYPE.POINT, pageIndex, pointid, 3);
    },

    //所有人的排行
    reqOwnerRank(pageIndex, count) {
        this.rank_page = pageIndex;
        this.reqGetRank(RANK_TYPE.OWNER, pageIndex, 0, count);
    },

    //获取排行榜的数据
    reqGetRank(rtype, pageIndex, pointid = 1, psum) {
        let msg = {
            type: rtype,		    //关卡id
            page: pageIndex,		//通过结束时间
            point: pointid,          //关卡id
            sum: psum,               //获取人数
        }
        this.rank_type = rtype;
        gl.network.send("http.reqGetRank", msg, this.http_reqGetRank.bind(this));
    },
    http_reqGetRank(route, data) {
        console.log('排行榜详情', data)
        switch (this.rank_type) {
            case RANK_TYPE.POINT:
                this.pointRank = data.rank_list;
                this.userRank = data.player_rank;
                this.userRank.nickname = this.username;
                this.userRank.avatar = this.usericon;
                gl.emitter.emit("event_refreshprank");
                break;
            case RANK_TYPE.OWNER:
                if (this.rank_page == 1) {
                    this.userRank = data.player_rank;
                    this.userRank.nickname = this.username;
                    this.userRank.avatar = this.usericon;
                    this.ownerRank = [];
                    this.ownerRank = data.rank_list;
                    gl.emitter.emit("event_rankuser");
                    gl.emitter.emit("event_ownerrank");
                } else {
                    if (data.rank_list.length)
                        this.ownerRank = this.ownerRank.concat(data.rank_list);
                    gl.emitter.emit("event_ownerrank");
                }
                break;
            case RANK_TYPE.FRIEND:
                //对接微信接口预留
                //gl.emitter.emit("event_ranklist");
                break;
            default:
                break;
        }
    },

    //排行数据模拟
    testRank() {
        this.pointRank = [];
        this.userRank = {};
        this.friendRank = [];       //好友排行
        this.ownerRank = [];        //所有人排行
    },

    set(_key, _value) {
        //console.log('设置', _key, '为', _value)
        this[_key] = _value;
    },
    get(_key) {
        return this[_key];
    },
});

module.exports = new userinfo();