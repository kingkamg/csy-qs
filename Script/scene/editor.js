const goodsType={
    role: 0,            //主角
    bottleGas:1,
    buleGalss:2,
    glass:3,
    light:4,
    fan:5,
    mos:6,
    tv:7,
    Board01:8,
    Board02:9,
    Board03:10,
    Board04:11,
    Board05:12,
    Board06:13,
    Board07:14,
    Board08:15,
    Board09:16,
    Board10:17,
    Board11:18,
    Board12:19,
    Board13:20,
    wall:21,
};
cc.Class({
    extends: cc.Component,

    properties: {
        goodsList: cc.Node,
        editorNode: cc.Node,
        lab_pos: cc.Label,
        lab_name: cc.Label,
        lab_size: cc.Label,
        rotationExdit: cc.EditBox,
        xExdit: cc.EditBox,
        yExdit: cc.EditBox,
        widthExdit: cc.EditBox,
        heightExdit: cc.EditBox,
        levelExdit:cc.EditBox,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this.readJson();
    },
    init(){
        this.node.getChildByName("togame").active = gl.userinfo.isDevelop;
        this.sceneSize = cc.director.getWinSize();
        this.selectNode = null;
        this.addNodeListener();
        this.setLevel();
        this.drawMap();
        this.itemid = this.itemArr.length;
    },
    openList() {
        if (this.goodsList.active) {
            this.goodsList.active = false;
        } else {
            this.goodsList.active = true;
        }
    },
    //-----------------------
    addNodeListener() {
        let list = this.goodsList.children;
        for (let i = 0; i < list.length; i++) {
            list[i].on('touchstart', this.listStart, this);
        }
    },
    listStart(event) {
        this.openList();
        let curNode = cc.instantiate(event.target);
        curNode.parent = this.editorNode;
        curNode.on('touchstart', this.touchStart, this);
        curNode.on('touchmove', this.touchMove, this);
        curNode.on('touchend', this.touchEnd, this);

        let itemData = {};
        itemData.type = curNode.name;
        curNode.name = `${this.itemid}`;
        itemData.id = Number(curNode.name);
        itemData.x = curNode.x;
        itemData.y = curNode.y;
        itemData.width = curNode.width;
        itemData.height = curNode.height;
        itemData.rotation = curNode.rotation;
        this.itemArr.push(itemData);
        this.itemid++;
    },
    drawMap(){
        this.goodsList.active = false;
        this.editorNode.removeAllChildren();
        for(let i=0;i<this.itemArr.length; i++){
            let name = this.itemArr[i].type;
            let curNode = cc.instantiate(this.getGood(name));
            curNode.parent = this.editorNode;
            curNode.on('touchstart', this.touchStart, this);
            curNode.on('touchmove', this.touchMove, this);
            curNode.on('touchend', this.touchEnd, this);
            curNode.name = `${this.itemArr[i].id}`
            curNode.x = this.itemArr[i].x;
            curNode.y = this.itemArr[i].y;
            curNode.width = this.itemArr[i].width;
            curNode.height = this.itemArr[i].height;
            curNode.rotation = this.itemArr[i].rotation;
        }
    },
    getGood(name){
        return this.goodsList.getChildByName(name);
    },
    //--------------------------
    touchStart(event) {
        this.startPos = gl.userinfo.posChnange(event.touch.getLocation());
        this.selectNode = event.target;
    },
    touchMove(event) {
        this.movePos = gl.userinfo.posChnange(event.touch.getLocation());
        let offX = this.startPos.x - this.movePos.x;
        let offY = this.startPos.y - this.movePos.y;
        this.selectNode.x -= offX;
        this.selectNode.y -= offY;
        this.startPos = this.movePos;
    },
    touchEnd() {
        let itemData = this.getItemData(Number(this.selectNode.name));
        itemData.width = this.selectNode.width;
        itemData.height = this.selectNode.height;
        itemData.rotation = this.selectNode.rotation;
        itemData.x = this.selectNode.x;
        itemData.y = this.selectNode.y;
    },
    //------------------------
    startGame() {
        
    },
    //得到某个物品的属性
    getItemData(id){
        for(let i=0; i<this.itemArr.length;i++){
            if(this.itemArr[i].id == id){
                return this.itemArr[i];
            }
        }
    },
    //得到某一关的数据
    getLevelData(level){
        for(let i=0; i<this.levelData.length;i++){
            if(this.levelData[i].level == level){
                return this.levelData[i];
            }
        }
    },
    deletGoods() {
        if (!this.selectNode) return;
        for(let i=0; i<this.itemArr.length; i++){
            if(Number(this.selectNode.name) == this.itemArr[i].id){
                this.itemArr.splice(i,1);
                break;
            }
        }
        for(let i=0; i<this.itemArr.length; i++){
            this.itemArr[i].id = i;
        }
        this.selectNode.destroy();
        this.selectNode = null;
        this.lab_name.string = 'null';
        this.lab_pos.string = 'null';
        this.lab_size.string = 'null';
        cc.log("this.itemArr",this.itemArr)
    },
    setRotation() {
        let _rotation = Number(this.rotationExdit.string);
        if (!this.selectNode) return;
        this.selectNode.rotation = _rotation;
        this.rotationExdit.string = '';

        let item = this.getItemData(Number(this.selectNode.name));
        item.rotation = _rotation;
    },
    setX() {
        let _xPos = Number(this.xExdit.string);
        if (!this.selectNode) return;
        this.selectNode.x = _xPos;
        this.xExdit.string = '';

        let item = this.getItemData(Number(this.selectNode.name));
        item.x = _xPos;
    },
    setY() {
        let _yPos = Number(this.yExdit.string);
        if (!this.selectNode) return;
        this.selectNode.y = _yPos;
        this.yExdit.string = '';

        let item = this.getItemData(Number(this.selectNode.name));
        item.y = _yPos;
    },
    setWidth(){
        let _width = Number(this.widthExdit.string);
        if (!this.selectNode) return;
        this.selectNode.width = _width;
        this.widthExdit.string = '';

        let item = this.getItemData(Number(this.selectNode.name));
        item.width = _width;
    },
    setHeight(){
        let _height = Number(this.heightExdit.string);
        if (!this.selectNode) return;
        this.selectNode.height = _height;
        this.heightExdit.string = '';

        let item = this.getItemData(Number(this.selectNode.name));
        item.height = _height;
    },
    setLevel(){
        if(!this.levelExdit.string)this.levelExdit.string = 1;
        this.level = Number(this.levelExdit.string);
        for(let i=0; i<this.levelarr.length;i++){
            if(this.levelarr[i].level == this.level){
                this.itemArr = this.levelarr[i].itemArr;
                this.itemid = this.itemArr.length;
                this.drawMap();
                return;
            }
        }
        let levelData = {};
        levelData.level = this.level;
        levelData.itemArr = []; 
        this.itemid = 0;
        this.itemArr = levelData.itemArr;
        for(let i=0; i<this.levelarr.length; i++){
            if(this.level<this.levelarr[i].level){
                this.levelarr.splice(i,0,levelData);
                this.drawMap();
                return;
            }
        }
        this.levelarr.push(levelData);
        this.drawMap();
    },
    start() {

    },
    togame(){
        gl.userinfo.set("checkPoint",this.level)
        cc.director.loadScene('game');
    },
    //导出
    save() {
        cc.log(this.levelarr);
        let date = new Date();
        let month = date.getMonth() + 1; // 月
        let day = date.getDate();       //日
        let hour = date.getHours(); // 时
        let minutes = date.getMinutes(); // 分
        var seconds = date.getSeconds() //秒
        let str = `jdqsData-${month}-${day}-${hour}-${minutes}-${seconds}.json`
        cc.log(str);
        this.PSOT("http://192.168.30.44:8081/upfd", { fn: str, fd: JSON.stringify(this.levelarr) }, (data) => {
            console.log(data);
        })
        gl.userinfo.storageData("jdqsData",str);
    },
    update(dt) {
        if (this.selectNode) {
            this.lab_name.string = this.selectNode.name;
            this.lab_pos.string = this.selectNode.position
            this.lab_size.string = `width:${this.selectNode.width},height:${this.selectNode.height}`
        }
    },

    onDestroy(){
       
    },
    //================================
    PSOT (route, msg, next) {
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                let respone = xhr.responseText;
                let pone = JSON.parse(respone);
                console.log("post ", pone)
                next(pone);
            }
        };
        // note: In Internet Explorer, the timeout property may be set only after calling the open()
        // method and before calling the send() method.
        xhr.timeout = 5000;
        xhr.onerror = (error) => {
            console.log("出错啦 http.POST ...")
        }
        console.log("http.POST 发送数据: ", route, msg)
        xhr.open("POST", route, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
        xhr.send(JSON.stringify(msg));
    },
   readJson() {
        if (gl.userinfo.isDevelop) {
            let str = gl.userinfo.readData("jdqsData");
            // let str = "jdqsData-9-26-11-43-5.json";
            console.log("post")
            this.PSOT("http://192.168.30.44:8081/downfd", { ph: str }, (data) => {
                cc.log("!!!!!!!",data.fd)
                if(data.fd == ""){
                    this.levelarr = [];
                }else{
                    this.levelarr = JSON.parse(data.fd);
                }
                this.init();
            })
        } else {
            gl.readJSON("jdqsData-9-26-11-43-53.json").then(data => {
                this.levelarr = data;
                this.init();
            })
        }
    }
});
