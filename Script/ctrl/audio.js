let audio = cc.Class({
    name: "audio",
    ctor: function () {
        this.audio_url = "https://wxgame.088.com/jdqs/res/resources/public/audio/";
        this.open = 1;
        let isAudio = parseInt(cc.sys.localStorage.getItem('isAudio'));
        if (isAudio == 1 || isAudio == 0) this.open = isAudio;
        this.sound = true;
        this.filePath = "";
        this.wxauio = null;
        if (cc.sys.os === cc.sys.OS_IOS) {
            this.wxauio = wx.createInnerAudioContext();
        }
    },
    play(filePath, loop) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            let wxauio = wx.createInnerAudioContext();
            wxauio.autoplay = true
            wxauio.src = this.getUrl(filePath);
            wxauio.loop = loop;
            wxauio.volume = (this.open && this.sound) ? 1 : 0;
            wxauio.play();
            wxauio.onEnded((res) => {
                wxauio.destroy();
            })
            return wxauio;
        }
        return cc.audioEngine.play(filePath, loop, this.open && this.sound ? 1 : 0);
    },
    playMusic(filePath) {
        this.filePath = filePath;
        if (this.open === 1) {
            if (cc.sys.os === cc.sys.OS_IOS) {
                this.wxauio.autoplay = true
                this.wxauio.src = this.getUrl(filePath);
                console.log("1", this.getUrl(filePath));
                this.wxauio.loop = true;
                this.wxauio.volume = (this.open && this.sound) ? 1 : 0;
                this.wxauio.play();
                console.log("2", this.wxauio);
            } else cc.audioEngine.playMusic(filePath, true);
        }
    },
    getUrl(name) {
        let words = name.split('/');
        return this.audio_url + words[words.length - 1];
    },
    playNative(filePath, loop) {
        gl.load(filePath, (data, a, b) => {
            gl.audio.play(data, loop, this.open && this.sound ? 1 : 0);
        })
    },
    clickPlay() {
        this.playNative("audio/click", false)
    },
    pause() {

    },
    resume() {

    },
    stop(audioID) {
        if (cc.sys.os === cc.sys.OS_IOS) {
            audioID.destroy();
        } else cc.audioEngine.stop(audioID);
    },
    stopMusic() {
        if (cc.sys.os === cc.sys.OS_IOS) {

        } else cc.audioEngine.stopMusic();
    },
    setSound(bol) {
        this.sound = bol;
        console.log("this.sound", this.sound);
    },
    setOpen() {
        if (this.open) {
            this.open = 0;
        } else {
            this.open = 1;
        }
        if (cc.sys.os === cc.sys.OS_IOS) {
            this.open == 1 ? this.wxauio.play() : this.wxauio.pause();
        } else {
            this.open == 1 ? cc.audioEngine.resumeMusic() : cc.audioEngine.pauseMusic();
        }
        cc.sys.localStorage.setItem('isAudio', this.open);
        if (this.filePath && this.open) this.playMusic(this.filePath, true);
    },
    // false 切入后台， true 切入前台
    setGameOpen(bol) {
        if (cc.sys.os === cc.sys.OS_IOS && this.wxauio) {
            if (bol) {
                if (this.open) this.wxauio.play();
            } else {
                this.wxauio.pause();
            }
        } else {
            if (bol) {
                if (this.open) cc.audioEngine.resumeMusic();
            } else {
                cc.audioEngine.pauseMusic();
            }
        }
    },
});

module.exports = new audio();