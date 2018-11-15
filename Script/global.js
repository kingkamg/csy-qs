


window.gl = window.gl || {};


gl.bottom_color = [cc.color(0x91, 0xe0, 0xea), cc.color(0xf5, 0xc1, 0xd0), cc.color(0xdf, 0xc3, 0xe8)];
gl.light_color = [cc.color(0x40, 0xa8, 0xb5), cc.color(0xf2, 0x9a, 0xb2), cc.color(0xcc, 0x9d, 0xda)];
gl.button_color = [cc.color(0x40, 0xa8, 0xb5), cc.color(0xf2, 0x9a, 0xb2), cc.color(0xcc, 0x9d, 0xda)];
gl.color_index = 0;
gl.MESSAGE_TYPE = {};
gl.MESSAGE_TYPE.CLOSE_RANK = 0;         //移除排行榜
gl.MESSAGE_TYPE.GAIN_RANK = 1;          //获取好友排行榜
gl.MESSAGE_TYPE.GAIN_CLUB = 2;          //获取群好友排行
gl.MESSAGE_TYPE.SUBMIT_RANK = 3;        //提交得分
gl.MESSAGE_TYPE.RANK_PAGE = 4;         //设置排行榜翻页的效果
gl.MESSAGE_TYPE.CROWD_RANK = 5;         //获取群排行榜（废弃接口）
gl.MESSAGE_TYPE.HIDE_RANK = 6;          //隐藏界面
gl.MESSAGE_TYPE.SHOW_RANK = 7;          //显示界面

gl.SHARE_TITLE = "信不信你压枪技术再好，也压不住这把枪？";                    //分享标题
gl.SHARE_PICURL = "https://wxgame.088.com/jdqs/res/resources/public/picture/img_share.png";                   //分享地址
gl.JDQS_DATA = "https://wxgame.088.com/jdqs/res/resources/public/picture/jdqsData.json";                   //jdqsData

cc.game.setFrameRate(60);

gl.wechat_rank_key = "imageJump";
gl.role_key = "role_index";
gl.loading_jh = "prefab_await";
gl.blLoading = true;
gl.blAddLoading = false;
gl.tip = "prefab_tip";

gl.audio = require('audio');
gl.emitter = require('emitter');
gl.userinfo = require("userinfo");
gl.userinfo.onLoad();
gl.network = require("network");
gl.wechat = require('wechat');
gl.wechat.onLoad();
gl.i18n = require('i18n');


gl.backCb = null;
gl.failCb = null;
gl.backTime = null;//切到后台的时间戳
gl.returnTime = null;//从后台返回的时间戳
gl.bannerSize = [];
gl.bannerIndex = 0;

cc.game.on(cc.game.EVENT_HIDE, () => {
    gl.backTime = null;
    gl.returnTime = null;
    gl.backTime = Math.round(new Date() / 1000);
    console.log('切到后台');
    gl.audio.setGameOpen(false);
});
cc.game.on(cc.game.EVENT_SHOW, () => {
    gl.returnTime = Math.round(new Date() / 1000);
    let _time = gl.returnTime - gl.backTime;
    console.log('返回前台,时间:', _time);
    if (_time > 3) {
        if (gl.backCb) {
            gl.backCb();
        }
    }
    else {
        if (gl.failCb) {
            gl.failCb();
        }
    }
    gl.backCb = null;
    gl.failCb = null;
    gl.audio.setGameOpen(true);
});

if (!gl.userinfo.isDevelop) {
    console.log = function () { };
    console.error = function () { };
    cc.log = function () { };
    cc.error = function () { }
}

/**
 * 加载远程图片
 */
gl.showRemoteImage = function (node, headUrl) {
    if (!headUrl) return console.error("showRemoteImage error");
    new Promise(function (resolve, reject) {
        cc.loader.load({ url: headUrl, type: 'jpg' }, function (err, data) {
            if (err) {
                reject("加载远程资源失败")
                return console.error(err)
            }
            resolve(new cc.SpriteFrame(data));
        })
    }).then(data => {
        node.getComponent(cc.Sprite).spriteFrame = data;
    });
};
/**
     * 加载资源
     * @param path 路径（从resources开始）
     * @param cb 加载回调
     */
gl.load = function (path, cb) {
    cc.loader.loadRes(path, (err, data) => {
        if (err) {
            return cc.error(`no find = ${path}`);
        }
        else {
            cb(data);
        }
    });
}
/**
 * 显示菊花屏蔽层
 */
gl.showJuHua = function () {
    let show = () => {
        let panel = cc.director.getScene().getChildByName(gl.loading_jh);
        panel.active = true;
        let script = panel.getComponent(panel.name);
        script.startAction();
        if (!gl.blLoading) {
            gl.closeJuHua();
        }
        return panel;
    };
    return new Promise((resolve, reject) => {
        let panel = cc.director.getScene().getChildByName(gl.loading_jh);
        if (panel) {
            resolve(show());
        } else {
            if (gl.blAddLoading) {
                gl.blLoading = true;
                return;
            }
            gl.blAddLoading = true;
            cc.loader.loadRes("prefab/prefab_await", cc.Prefab, function (err, data) {
                if (err) {
                    console.error(`${"prefab/prefab_await"}.prefab 文件读取失败`);
                    return reject(err);
                }
                let scene = cc.director.getScene();
                let newPrefab = cc.instantiate(data);
                scene.addChild(newPrefab, 1000);
                resolve(show());
            })
        }
    })
};
/**
 * 关闭菊花屏蔽层
 */
gl.closeJuHua = function () {
    let panel = cc.director.getScene().getChildByName(gl.loading_jh);
    if (panel) {
        panel.getComponent(panel.name).pauseAction();
        panel.active = false;
        gl.blLoading = true;
    } else gl.blLoading = false;
};

/**
 * 显示tip
 */
gl.showTip = function (content) {
    let show = (panel, content) => {
        let script = panel.getComponent(panel.name);
        script.showTip(content);
        return panel;
    };
    return new Promise((resolve, reject) => {
        cc.loader.loadRes(`prefab/${gl.tip}`, cc.Prefab, function (err, data) {
            if (err) {
                console.error(`prefab/${gl.tip}.prefab 文件读取失败`);
                return reject(err);
            }
            let scene = cc.director.getScene();
            let newPrefab = cc.instantiate(data);
            scene.addChild(newPrefab, 99);
            resolve(show(newPrefab, content));
        })
    })
};

/**
 * JSON 文件读取
 * @param {String} path: config/serverCfg
 * @returns {Promise}
 */
gl.readJSON = function (path) {
    return new Promise(function (resolve, reject) {
        cc.loader.load(`res/raw-assets/${path}.json`, function (err, data) {
            if (err) {
                console.error(`${path}.json 文件读取失败`);
                return reject(err);
            }
            console.log(`读取json文件 ${path}.json: `, data);
            resolve(data);
        })
    })
};