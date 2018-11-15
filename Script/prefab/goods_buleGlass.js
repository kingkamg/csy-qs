cc.Class({
    extends: cc.Component,

    properties: {
        breakAudio: cc.AudioClip,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        gl.emitter.on('eventOnce_bottleBreak', this.breakBottle, this);
        this.isHit = false;
        this.BODYTAG = gl.userinfo.get('BODYTAG');
    },

    bulletHit() {
        this.isHit = true;
    },

    breakBottle() {
        if (!this.node) return console.log('瓶子已销毁');
        this.isHit = true;
        gl.emitter.emit('event_hitCup', { pos: this.node.position, tag: this.BODYTAG.BULEGLASS });
        gl.emitter.emit('event_openBottle', { pos: this.node.position });
        gl.audio.play(this.breakAudio, false);
        this.node && this.node.destroy()
    },

    // update (dt) {},

    onDestroy() {
        gl.emitter.off('eventOnce_bottleBreak', this);
        if (!this.isHit) return;
        let sorce = gl.userinfo.get('sorce');
        gl.userinfo.set('sorce', ++sorce);
        let blueCount = gl.userinfo.get('blueCount');
        if (gl.userinfo.get('sorce') === blueCount) {
            gl.emitter.emit('event_gameWin');
        }
    },
});
