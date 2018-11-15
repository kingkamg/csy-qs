let wechat = cc.Class({
    name: "wechat",
    ctor: function () {
    },
    onLoad: function () {
        if (!gl.userinfo.isWeChat) {
            return;
        }
        this.wechatData = null;
        this.gameclub = null;
        this.bannerAd = [];
        this.bannerAdIndex = -1;
        this.bannerAdMax = 3;
        this.sysFileManager = wx.getFileSystemManager();
        this.showShareMenu();
        this.onAudioInterruptionEnd();
        //this.onShareAppMessage();
        this.creatGameClub();
        this.getLaunchOptionsSync();
        this.createBannerAd();
        //this.updateGame();
    },
    copyToClip: function (text) {
        wx.setClipboardData({
            data: text,
            success: function () { console.log("WeChatGame复制成功"); },
            fail: function () { console.log("WeChatGame复制失败"); },
            complete: function () { console.log("WeChatGame复制完成"); }
        });
    },
    login: function () {
        return new Promise((resolve, reject) => {
            let login = () => {
                wx.login({
                    success: function (res) { console.log("WeChatGame登陆成功"); resolve(res); },
                    fail: function (res) { console.log("WeChatGame登陆失败"); reject(res); cc.director.end(); },
                    complete: function (res) { console.log("WeChatGame登陆完成"); }
                });
            };
            if (!gl.userinfo.isWeChat) {
                return;
            }
            wx.getSetting({
                success(res) {
                    if (res.authSetting['scope.userInfo']) {
                        login();
                        return;
                    }
                    wx.authorize({
                        scope: 'scope.userInfo',
                        success() { login() },
                        fail() {
                            wx.showModal({
                                title: "授权提示",
                                content: "当前小游戏需要获取您的公开信息(昵称、头像等)",
                                success: function (res) {
                                    if (res.confirm) {
                                        wx.openSetting({
                                            success() { login() },
                                            fail() { cc.director.end() }
                                        })
                                    }
                                    if (res.cancel) {
                                        wx.exitMiniProgram({})
                                    }
                                }
                            });
                        }
                    })
                }
            });
        })
    },
    getUserInfo: function () {
        return new Promise((resolve, reject) => {
            wx.getUserInfo({
                success: function (res) { console.log("WeChatGame获取玩家信息成功"); resolve(res); },
                fail: function (res) { console.log("WeChatGame获取玩家信息失败"); reject(res); },
                complete: function (res) { console.log("WeChatGame获取玩家信息完成"); }
            });
        })
    },
    getLaunchOptionsSync() {
        this.wechatData = wx.getLaunchOptionsSync();
        if (this.wechatData && this.wechatData.referrerInfo) {
            gl.userinfo.wcappid = this.wechatData.referrerInfo.appId || "";
        }
    },
    onShareAppMessage: function (title, imageUrl, query) {
        return new Promise((resolve, reject) => {
            wx.onShareAppMessage(function (res) {
                reject(res);
                return {
                    title: title || gl.SHARE_TITLE,
                    imageUrl: imageUrl || gl.SHARE_PICURL,
                    query: query || "global=true",
                    success: function (res) { resolve(res); console.log("onShareAppMessage success", res); },
                    fail: function (res) { reject(res); console.log("onShareAppMessage fail", res); },
                    complete: function (res) { console.log("onShareAppMessage complete", res); }
                }
            })
        })
    },
    offShareAppMessage: function () {
        return new Promise((resolve, reject) => {
            wx.offShareAppMessage(function () {
                resolve();
            })
        })
    },
    shareAppMessage: function (title, imageUrl, query) {
        return new Promise((resolve, reject) => {
            if (!gl.userinfo.isWeChat) {
                return;
            }
            console.log("shareAppMessage 2", gl.userinfo.isWeChat)
            wx.shareAppMessage({
                title: title,
                imageUrl: imageUrl || `${gl.i18n.t("remoteResPath")}${cc.url.raw(gl.i18n.t("shareIconPath"))}`,
                query: query,
                success: function (res) { resolve(res); console.log("shareAppMessage success", res); },
                fail: function (res) { reject(res); console.log("shareAppMessage fail", res); },
                complete: function (res) { console.log("shareAppMessage complete", res); },
                withShareTicket: true,
            })
        })
    },
    showShareMenu: function () {
        return new Promise((resolve, reject) => {
            wx.showShareMenu({
                withShareTicket: true,
                success: function (res) { console.log("显示分享按钮成功", res); resolve(); },
                fail: function (res) { console.log("显示分享按钮失败", res); reject(); },
                complete: function (res) { console.log("显示分享按钮完成", res); }
            })
        })
    },
    hideShareMenu: function () {
        return new Promise((resolve, reject) => {
            wx.hideShareMenu({
                success: function () { console.log("关闭分享按钮成功"); resolve(); },
                fail: function () { console.log("关闭分享按钮成功"); reject(); },
                complete: function () { console.log("关闭分享按钮成功"); }
            })
        })
    },
    getShareInfo: function (shareTickets) {
        return new Promise((resolve, reject) => {
            wx.getShareInfo({
                shareTicket: shareTickets,
                success: function (res) { console.log("微信获取回值成功"); resolve(res); },
                fail: function (res) { console.log("微信获取回值失败"); reject(res); },
                complete: function () { console.log("微信获取回值完成"); }
            })
        })
    },
    //联网分享组包
    shareAppMessages(next) {
        this.shareAppMessage(gl.SHARE_TITLE, gl.SHARE_PICURL, "login=true").then((res) => {
            if (res.shareTickets && res.shareTickets[0]) {
                this.getShareInfo(res.shareTickets[0]).then((data) => {
                    next(data);
                });
            } else gl.showTip("请分享到好友群");
        });

    },
    //通知获取群排行
    shareClubRank(next) {
        if (gl.userinfo.isWeChat) {
            this.shareAppMessage(gl.SHARE_TITLE, gl.SHARE_PICURL, "login=true").then((res) => {
                if (res.shareTickets && res.shareTickets[0]) {
                    next();
                    this.openDataPostMessage({
                        messageType: gl.MESSAGE_TYPE.GAIN_CLUB,
                        MAIN_MENU_NUM: gl.wechat_rank_key,
                        share: res.shareTickets[0],
                    });
                } else gl.showTip("请分享到好友群");
            });
        }
    },

    openDataPostMessage: function (object) {
        if (!gl.userinfo.isWeChat) {
            return;
        }
        wx.getOpenDataContext().postMessage(object);
    },

    createBannerAd: function () {
        let winSize = wx.getSystemInfoSync();
        let banner = { width: 600 / winSize.pixelRatio, height: 150 / winSize.pixelRatio }
        for (let i = 0; i < this.bannerAdMax; i++) {
            this.bannerAd.push(wx.createBannerAd({
                adUnitId: "adunit-c850a67b7e658e84",//wechatgame_adUnitId,
                style: {
                    left: winSize.windowWidth / 2 - banner.width / 2,// - winSize.windowWidth * 0.1,
                    top: winSize.windowHeight - banner.height - winSize.windowHeight * 0.1,
                    width: banner.width,
                    //height: banner.height,
                }
            }));
            this.bannerAd[i].onResize((res) => {
                gl.bannerSize[i] = { width: res.width, height: res.height, winHeight: winSize.windowHeight };
                this.bannerAd[i].style.left = winSize.windowWidth / 2 - res.width / 2;// - winSize.windowWidth * 0.1;
                this.bannerAd[i].style.top = winSize.windowHeight - res.height + 0.1;

            })

            this.bannerAd[i].onLoad(() => { console.log("banner 广告加载成功 ..."); });
            this.bannerAd[i].onError(err => { console.error("banner 广告创建失败 ...", err); });
        }
    },
    showBannerAd: function () {
        if (!gl.userinfo.isWeChat) return;
        if (this.bannerAdIndex == -1) this.bannerAdIndex = parseInt(Math.random() * 100) % this.bannerAdMax;
        let banner = this.bannerAd[this.bannerAdIndex];
        if (!banner) return;
        gl.bannerIndex = this.bannerAdIndex;
        banner.show().catch(err => { console.error("banner 广告显示失败", err) });
    },
    hideBannerAd: function () {
        if (!gl.userinfo.isWeChat) return;
        let banner = this.bannerAd[this.bannerAdIndex];
        if (!banner) return;
        banner.hide().catch(err => { console.error("banner 广告隐藏失败", err) });
        this.bannerAdIndex = -1;
    },

    //创建激励视频
    createRewardedVideoAd: function (wechatgame_adUnitId) {
        if (wechatgame_adUnitId == "") return console.error('no bannerId')
        this.rewardedVideoAd = wx.createRewardedVideoAd({ adUnitId: wechatgame_adUnitId });
        this.rewardedVideoAd.onLoad(() => { console.log("激励视频广告加载成功") });
        this.rewardedVideoAd.onError(err => {
            //获取不到视频时调起分享
            // gl.emitter.emit('event_faildSeeVideo');
            gl.emitter.emitOnce('event_faildSeeVideo');
            console.error("激励视频广告加载失败", err)
        });
    },
    //播放激励视频
    showRewardVideoAd(success, fail = null) {
        // return gl.emitter.emitOnce('event_faildSeeVideo');//////////////////////////////////////////////////////
        if (!this.rewardedVideoAd) return console.error('no rewardedVideoAd');
        this.rewardedVideoAd.load().then(() => {
            gl.audio.setGameOpen(false);
            this.rewardedVideoAd.show();
        });
        this.rewardedVideoAd.onClose(res => {
            // 小于 2.1.0 的基础库版本，res 是一个 undefined
            if (res && res["isEnded"] || res === undefined) {
                console.log('视频回调', success);
                success();
            } else {
                gl.showTip('提前关闭视频不能得到奖励哦！');
                setTimeout(() => {
                    if (fail) fail();
                }, 2000)
            }
            gl.audio.setGameOpen(true);
            this.rewardedVideoAd.offClose();
        });
    },

    downloadFile: function (url) {
        return new Promise((resolve, reject) => {
            let downloadTask = wx.downloadFile({
                url: url,
                success: function (res) { console.log("下载文件成功", res); resolve(res.tempFilePath); },
                fail: function () { console.log("下载文件失败"); reject(); },
                complete: function () { console.log("下载文件完成"); }
            });
            downloadTask.onProgressUpdate((res) => {
                console.log('下载进度', res.progress)
                console.log('已经下载的数据长度', res.totalBytesWritten)
                console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
            });
        })
    },
    fileAccess: function (dirPath) {
        return new Promise((resolve, reject) => {
            this.sysFileManager.access({
                path: dirPath,
                success: () => { console.log("文件/目录存在"); resolve(true); },
                fail: (res) => { console.log("文件/目录不存在"); resolve(false) },
                complete: () => { console.log("文件/目录是否存在判断完毕") }
            })
        })
    },
    mkdir: function (dirPath) {
        return new Promise((resolve, reject) => {
            this.sysFileManager.mkdir({
                dirPath: dirPath,
                success: () => { console.log("文件夹创建成功 ...", dirPath); },
                fail: (res) => { console.log("文件夹创建失败 ...", res); reject() },
                complete: () => { console.log("文件夹创建完成 ..."); resolve() }
            })
        })
    },
    saveFile: function (tempFilePath, saveFilePath) {
        this.sysFileManager.saveFile({
            tempFilePath: tempFilePath,
            filePath: saveFilePath,
            success: function (res) {
                console.log("保存文件成功 ...", res);
            },
            fail: function (res) { console.log("保存文件失败", res); },
            complete: function () { console.log("保存文件完成") }
        })
    },
    copyFile: function (srcPath, destPath) {
        return new Promise((resolve, reject) => {
            this.sysFileManager.copyFile({
                srcPath: srcPath,
                destPath: destPath,
                success: () => { console.log("文件 copy 成功 ...", dirPath); },
                fail: (res) => { console.log("文件 copy 失败 ...", res); reject() },
                complete: () => { console.log("文件 copy 完成 ..."); resolve() }
            })
        })
    },
    updateGame: function () {
        const updateManager = wx.getUpdateManager();
        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            console.log("请求完新版本信息的回调 ...", res)
        });
        updateManager.onUpdateReady(function () {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            wx.showModal({
                title: "提示",
                content: "新版本已准备好, 请确定重启游戏!",
                success: function (res) {
                    console.log("游戏已更新到了最新版本 ...", res);
                    updateManager.applyUpdate()
                }
            });
        });
        updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            console.log("新的版本下载失败 ...");
            wx.showModal({
                title: "提示",
                content: "新版本更新失败, 请删除当前游戏, 重新打开!",
                success: function (res) {
                    console.log("新版本更新失败 ...", res);
                    wx.exitMiniProgram({})
                }
            })
        });
        request = function (obj) {
            wx.request(obj);
        };
        navigateToMiniProgram = function (obj) {
            wx.navigateToMiniProgram({
                appId: obj["appid"],
                path: obj["path"],
                envVersion: "release",
                success: () => { console.log("wx.navigateToMiniProgram success ...") },
                fail: () => { console.log("wx.navigateToMiniProgram fail ...") },
                complete: () => { console.log("wx.navigateToMiniProgram complete ...") }
            })
        };
    },
    navigateToMiniProgram(appid, path) {
        return new Promise((resolve, reject) => {
            wx.navigateToMiniProgram({
                appId: appid,
                path: path,
                extraData: {
                    foo: 'bar'
                },
                envVersion: 'release',//gl.userinfo.isDevelop ? 'trial' : 'develop',
                success: (res) => { console.log("navigateToMiniProgram success ..."); resolve(res) },
                fail: () => { console.log("navigateToMiniProgram fail ...") },
                complete: () => { console.log("navigateToMiniProgram complete ...") }
            })
        });
    },
    navigateTo(navigate) {
        wx.navigateBack({
            url: navigate,
            success: (res) => { console.log("navigateToMiniProgram success ..."); resolve(res) },
            fail: () => { console.log("navigateToMiniProgram fail ...") },
            complete: () => { console.log("navigateToMiniProgram complete ...") }
        })
    },
    //创建游戏圈按钮
    creatGameClub() {
        this.gameclub = wx.createGameClubButton({
            icon: 'white',
            style: {
                left: 7,
                top: 50,
                width: 40,
                height: 40
            },
        })
    },
    showGameClub() {
        if (this.gameclub) this.gameclub.show();
    },
    hideGameClub() {
        if (this.gameclub) this.gameclub.hide();
    },
    onAudioInterruptionEnd() {
        wx.onAudioInterruptionEnd(() => {
            gl.audio.setGameOpen(true);
        })
    },
    openCustomerServiceConversation() {
        wx.openCustomerServiceConversation({
            sessionFrom: '',
            showMessageCard: false,
            sendMessageTitle: '客服',
            sendMessagePath: '',
            sendMessageImg: '',
            success: function () {
                //console.log("openCustomerServiceConversation success")
            },
            fail: function () {
                //console.log("openCustomerServiceConversation fail",err)
            },
            complete: function () {
                //console.log("openCustomerServiceConversation complete")
            },
        })
    },
})

module.exports = new wechat();