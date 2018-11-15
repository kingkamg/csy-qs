let hex_sha1 = require("sha1");

let network = cc.Class({
    name: "network",

    ctor: function () {
        this.code = "jdqs";
        this.token = "";
        //this.http_ip = "http://192.168.30.111:9506";//鑫良
        // this.http_ip = "http://192.168.30.112:9504";//陈超
        this.http_ip = "https://wxgame.088.com/jdqs/index";
        this.sha1list = ["token:", "uid:", "key:", "data:"];
        this.netList = [];
        this.exit_count = 0;
    },
    POST: function (msg, next) {
        msg.head.token = this.token;
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            gl.closeJuHua();
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                let respone = xhr.responseText;
                if (!respone) console.log("httperror", respone);
                let resp = JSON.parse(respone);
                gl.network.closeNetList();
                console.log(resp);
                this.exit_count = 0;
                if (!gl.network.codeerror(resp.head.code)) {
                    let head = resp.head;
                    gl.emitter.emit("event_servsertime", head.servertime);
                    gl.network.setToken(head.token);
                    let body = resp.body;
                    if (next) next(head.route, body);
                    gl.network.repeatNet();
                } else gl.emitter.emit("httperror");
            }
        };
        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 5000;
        xhr.onerror = (error) => {
            console.log("出错啦 http.POST ...", error);
            gl.closeJuHua();
            setTimeout(this.repeatNet.bind(this), 3000);
        }
        gl.showJuHua();
        console.log("http.POST 发送数据: ", this.http_ip, msg);
        console.log(this.netList);
        xhr.open("POST", this.http_ip, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
        xhr.send(this.encryption(msg));
    },

    wechatPost(msg, next) {
        gl.showJuHua();
        msg.head.token = this.token;
        let self = this;
        wx.request({
            url: this.http_ip,
            header: { "content-type": "application/x-www-form-urlencoded;charset=utf-8" },
            method: 'POST',
            data: this.encryption(msg),
            success: function success(res) {
                gl.closeJuHua();
                console.log('Network sendReport success', res)
                let resp = res.data;
                let bolone = gl.network.bolOneNet(resp.head.route);
                gl.network.closeNetList();
                if (resp.head.token) gl.network.setToken(resp.head.token);
                if (resp.head.flag === 0 || resp.head.flag === 1) gl.userinfo.wechatflag = resp.head.flag;
                if (!gl.network.codeerror(resp.head.code) && bolone) {
                    let head = resp.head;
                    gl.emitter.emit("event_servsertime", head.servertime);
                    let body = resp.body;
                    gl.network.repeatNet();
                    if (next) next(head.route, body);
                } else gl.emitter.emit("httperror");
            },
            fail: function fail(err) {
                console.log("出错啦 http.POST ...", err);
                gl.closeJuHua();
                setTimeout(() => {
                    self.repeatNet();
                }, 3000);
            }
        });
    },

    setToken(htoken) {
        this.token = htoken;
    },
    closeNetList() {
        this.netList.splice(0, 1);
    },
    repeatNet() {
        if (!this.netList || !this.netList[0]) return;
        let netdata = this.netList[0];
        this.wechatPost(netdata.data, netdata.call);
    },
    bolOneNet(route) {
        let netdata = this.netList[0];
        if (netdata && netdata.data) {
            let net_route = netdata.data.head.route
            if (net_route == route) return true;
        }
        return false;
    },
    bolNetList(route) {
        for (let i = 0, count = this.netList.length; i < count; i++) {
            let netdata = this.netList[i];
            if (route === netdata.data.head.route) {
                return false;
            }
        }
        return true;
    },

    send(route, data, next = null) {
        let msg = {};
        msg.head = { uid: gl.userinfo.get("userid"), }
        msg.head.route = route;
        //作用协议区分
        msg.body = data;
        //堆叠协议
        if (this.netList[0]) {
            if (this.bolNetList(route)) this.netList.push({ data: msg, call: next });
            return;
        } else this.netList.push({ data: msg, call: next });
        this.wechatPost(msg, next);
    },
    /**
     * 数据加密
     * @param {any} edata 
     */
    encryption(edata) {
        let headdata = edata.head;
        let body = JSON.stringify(edata.body);
        let endata = `${this.sha1list[0]}${headdata.token}&${this.sha1list[1]}${headdata.uid}&${this.sha1list[2]}${this.code}&${this.sha1list[3]}${body}`;
        edata.head.mi = hex_sha1.hex_hmac_sha1(this.code, endata).slice(5);
        console.log('mi mw:', endata);
        console.log('');
        console.log('post', edata);
        return JSON.stringify(edata);
    },
    /**
     * 数据解密判定是否有效
     * @param {object} edata 
     */
    decode(edata) {
        let headdata = edata.head;
        let body = JSON.stringify(edata.body);
        let endata = `${this.sha1list[0]}${headdata.token}&${this.sha1list[1]}${headdata.uid}&${this.sha1list[2]}${this.code}&${this.sha1list[3]}${body}`;
        let shadata = hex_sha1.hex_hmac_sha1(this.code, endata).slice(5);
        if (edata.head.mi == shadata) return true;
        return false;
    },
    /**
     * 服务端反馈失败
     * @param {number} code 
     */
    codeerror(code) {
        let strContent = "";
        switch (code) {
            case 10010013:
                strContent = "今日分享次数达到上限";
                break;
            case 10010014:
                strContent = "请分享到好友群";
                break;
            case 10010015:
                strContent = "请不要分享到同个群";
                break;
            case 0:
                return false;
            default:
                break;
        }
        if (strContent != "") gl.showTip(strContent);
        else return false;
        return true;
    }
});

module.exports = new network();