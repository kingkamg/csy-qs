let emitter = cc.Class({
    name: "emitter",
    properties: {

    },
    ctor: function () {
        this.event_list = [];
    },

    on(eventName, cb, target) {
        if (!eventName || !cb || !target) {
            //console.log("注册事件格式错误", eventName);
            return
        }
        this.event_list.push({ eventName: eventName, cb: cb, target: target });
        //console.log(`添加事件监听${eventName}成功`);
    },

    emit(eventName, params) {
        for (let i = 0; i < this.event_list.length; i++) {
            if (this.event_list[i]['eventName'] == eventName) {
                this.event_list[i]['cb'].call(this.event_list[i]['target'], params);
                //console.log(`发射事件${eventName}=`,params);
            }
        }
    },

    off(eventName, obj) {
        for (let i = this.event_list.length - 1; i >= 0; i--) {
            if (this.event_list[i]['eventName'] == eventName && this.event_list[i]['target'] == obj) {
                this.event_list.splice(i, 1);
                //console.log(`移除事件${eventName}成功`);
            }
        }
    },

    //只触发其中的一个监听 
    emitOnce(eventName, params) {
        for (let i = this.event_list.length - 1; i >= 0; i--) {
            if (this.event_list[i]['eventName'] == eventName) {
                this.event_list[i]['cb'].call(this.event_list[i]['target'], params);
                return;
                //console.log(`发射事件${eventName}=`,params);
            }
        }
    }

});

module.exports = new emitter();