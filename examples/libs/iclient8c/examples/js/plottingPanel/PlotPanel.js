
/**
 *
 * Class: SuperMap.Plotting.PlotPanel
 * 标绘面板类。
 *
 */
SuperMap.Plotting.PlotPanel = new SuperMap.Class({

    /**
     * Constant: EVENT_TYPES
     * {Array(String)}
     *
     * 此类支持的事件类型:
     * - *initializeCompleted* 标绘面板初始化成功触发该事件。
     * - *initializeFailed* 标绘面板初始化失败触发该事件。
     */
    EVENT_TYPES: ["initializeCompleted", "initializeFailed"],

    /**
     * APIProperty: events
     * {<SuperMap.Events>} 在 getLibInfosFailed 类中处理所有事件的对象，支持两种事件 processCompleted 、processFailed ，服务端成功返回查询结果时触发 processCompleted 事件，服务端返回查询结果失败时触发 processFailed 事件。
     *
     * 例如：
     *     (start code)
     * var myService = new SuperMap.REST.getLibInfosFailed(url);
     * myService.events.on({
     *     "processCompleted": getLibInfosComplted,
     *       "processFailed": getLibInfosFailed
     *       }
     * );
     * function getLibInfosComplted(getLibInfosCompltedEventArgs){//todo};
     * function getLibInfosFailed(getLibInfosFailedEventArgs){//todo};
     * (end)
     */
    events: null,

    /**
     * APIProperty: eventListeners
     * {Object} 监听器对象，在构造函数中设置此参数（可选），对 GetLibInfosService 支持的两个事件 processCompleted 、processFailed 进行监听，相当于调用 SuperMap.Events.on(eventListeners)。
     */
    eventListeners: null,

    /**
     * Property: serverUrl
     * {String}标绘服务URI
     */
    serverUrl: null,

    /**
     * Property: map
     * {SuperMap.Map}
     */
    map: null,

    /**
     * Property: drawFeature
     * {<SuperMap.Control.DrawFeature>} 绘制控件
     */
    drawFeature: null,

    /**
     * Property: isInializeOK
     * 标号库初始化是否完成。
     */
    isInializeOK: false,

    /**
     * Constructor: SuperMap.Plotting.PlotPanel
     * 标号库管理类。
     *
     * Parameters:
     * div - {String} 标绘面板div
     * url - {String} 标绘服务url
     * map - {<SuperMap.Map>}
     *
     * Returns:
     * {<SuperMap.Plotting.PlotPanel>}  结果类型对象。
     */
    initialize : function(div, url, map){
        if(url){
            this.serverUrl = url;
        }

        if(map && map !== null){
            this.map = map;
        }

        this.events = new SuperMap.Events(
            this, null, this.EVENT_TYPES, true
        );
        if (this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }

        var plotPanel = document.getElementById(div);

        var treeNodeStyle = document.createElement("div");
        //treeNodeStyle.style = "height: 50%; width: 100%; font-size: 16px; border: 1px solid #617775;overflow: scroll";
        treeNodeStyle.style.height = '50%';
        treeNodeStyle.style.width = '100%';
        treeNodeStyle.style.border = '1px solid #617775';
        treeNodeStyle.style.overflow ='scroll';

        var treeNode = document.createElement("div");
        treeNode.id = "tree";
        treeNode.className = "ztree";

        var iconNodeStyle = document.createElement("div");
        //iconNodeStyle.style = "height: 50%; width: 100%";
        iconNodeStyle.style.height = '50%';
        iconNodeStyle.style.width = '100%';

        this.iconNode = document.createElement("div");
        this.iconNode.id = "icon";
        //this.iconNode.style = "height: 100%; width: 100%; overflow: scroll;border: 1px solid #617775;";
        this.iconNode.style.height = '100%';
        this.iconNode.style.width = '100%';
        this.iconNode.style.border = '1px solid #617775';
        this.iconNode.style.overflow ='scroll';

        treeNodeStyle.appendChild(treeNode);
        iconNodeStyle.appendChild(this.iconNode);

        plotPanel.appendChild(treeNodeStyle);
        plotPanel.appendChild(iconNodeStyle);
    },

    isInitializeOK: function(){
        return this.isInializeOK;
    },

    setDrawFeature: function(drawFeature){
        this.drawFeature = drawFeature;
    },

    /**
     * APIMethod: initializeAsync
     * 初始化标绘面板。
     */
    initializeAsync : function(){
        function beforeClickTreeNode(treeId, treeNode){
            var tree = $.fn.zTree.getZTreeObj(treeId);
            if (treeNode.isParent) {
                tree.expandNode(treeNode);
                return false;
            } else {
                me.iconNode.innerHTML = "";
                me.createDrawNodes(treeNode, me.iconNode);
            }
        }

        var me = this;
        var plotting = SuperMap.Plotting.getInstance(this.map, this.serverUrl);
        var symbolLibManager = plotting.getSymbolLibManager();

        var setting = {
            view: {
                dblClickExpand: false,
                showLine: true,
                selectedMulti: false
            },
            data: {
                simpleData: {
                    enable:true,
                    idKey: "id",
                    pIdKey: "pId",
                    rootPId: 0
                }
            },
            callback: {
                beforeClick: beforeClickTreeNode
            }
        };

        if(symbolLibManager.isInitializeOK()){
            var symbolTreeData = this.analysisSymbolTree(symbolLibManager);

            $.fn.zTree.init($("#tree"), setting, symbolTreeData);

            this.isInitializeOK = true;
            this.events.triggerEvent("initializeCompleted");
        } else {
            function initializeCompleted(result){
                if(result.libIDs.length !== 0){
                    var symbolTreeData = this.analysisSymbolTree(symbolLibManager);

                    $.fn.zTree.init($("#tree"), setting, symbolTreeData);

                    this.isInitializeOK = true;
                    this.events.triggerEvent("initializeCompleted");
                }
            }

            symbolLibManager.events.on({"initializeCompleted": initializeCompleted,
                scope: this});
            symbolLibManager.initializeAsync();
        }
    },

    createDrawNodes: function(treeNode, iconNode){
        drawNodeClick = function(){
            if(me.map !== null){
                var controls = me.map.controls;
                for(var i = 0; i < controls.length; i++){
                    if(controls[i].CLASS_NAME === "SuperMap.Control.PlottingEdit"){
                        controls[i].deactivate();
                    }
                }
            }

            if(me.drawFeature === null){
                me.drawFeature = me.getDrawControl();
            }
            if(me.drawFeature !== null){
                me.drawFeature.handler.libID = this.libID;
                me.drawFeature.handler.symbolCode = this.symbolCode;
                me.drawFeature.handler.serverUrl = this.serverUrl;
                me.drawFeature.deactivate();
                me.drawFeature.activate();

            }
        }

        var me = this;
        var drawData = treeNode.drawData.drawNodes;

        var table = document.createElement("table");
        table.style.height = "100%";
        table.style.width = "100%";
        var i = 0;
        var rowLength = (drawData.length%3 === 0) ? drawData.length/3 : drawData.length/3+1;
        for(var j = 0; j < rowLength; j++){
            var tr = document.createElement("tr");
            for(var k = 0; k < 3; k++){
                if(drawData[i]){
                    //存储菜单信息
                    var td = document.createElement("td");
                    var drawNode = document.createElement("div");
                    drawNode.onclick = drawNodeClick;
                    drawNode.style.textAlign = "center";
                    drawNode.id = drawData[i].libID+ ""+ drawData[i].symbolCode;
                    drawNode.libID = drawData[i].libID;
                    drawNode.symbolCode = drawData[i].symbolCode;
                    drawNode.serverUrl = treeNode.drawData.serverUrl;
                    //图片
                    var img = document.createElement("img");
                    img.src = drawData[i].icon;
                    //文本
                    var text = document.createElement("div");
                    text.innerHTML =  drawData[i].symbolName;

                    drawNode.appendChild(img);
                    drawNode.appendChild(text);
                    td.appendChild(drawNode);

                    tr.appendChild(td);
                }
                i++;
            }
            table.appendChild(tr);
        }

        iconNode.appendChild(table);
    },

    analysisSymbolTree: function(symbolLibManager) {
        var treeData = [];
        var idIndex = this.addBasicCellTreeNodes(treeData);
        var idIndex1 = this.addNew(treeData);

        for(var i = 0; i < symbolLibManager.getSymbolLibNumber(); i++){
            var symbolLib = symbolLibManager.getSymbolLibByIndex(i);
            //console.log(symbolLib.libID);
            var rootSymbolInfo = symbolLib.getRootSymbolInfo();
            var rootSymbolIconUrl = symbolLib.getRootSymbolIconUrl();

            if(rootSymbolInfo.symbolNodeType === "SYMBOL_GROUP"){
                var rootNode = new Object();
                rootNode.id = idIndex+i;
                rootNode.pId = 0;
                rootNode.name = rootSymbolInfo.symbolName;
                rootNode.fullName = rootSymbolInfo.symbolName +"/";
                treeData.push(rootNode);

                idIndex = this.innerAnalysisSymbolTree(rootSymbolInfo.childNodes, treeData, rootNode, rootSymbolIconUrl);
            }

        }

        return treeData;
    },

    addBasicCellTreeNodes: function(treeData){
        var cellRootNode = new Object();
        cellRootNode.id = 1;
        cellRootNode.pId = 0;
        cellRootNode.name = "基本标号";
        cellRootNode.fullName = "BasicCell" +"/";
        cellRootNode.drawData = {serverUrl:this.serverUrl, drawNodes:[]};
        treeData.push(cellRootNode);

        var symbolCode = [24, 28, 29, 31, 34, 410, 32, 590, 360, 390, 400, 350, 26, 370, 380, 44, 48, 320
            , 1019, 1022,1024,321,1023,1025
            ,1013, 1014, 1016, 1017,1026, 1028
            ,1001, 1003, 1004];
        var symbolName = ["折线", "平行四边形", "圆", "椭圆", "注记", "正多边形", "多边形", "贝赛尔曲线", "闭合贝赛尔曲线"
            , "集结地", "大括号", "梯形", "矩形", "弓形", "扇形", "弧线", "平行线", "注记指示框"
            , "同心圆", "组合圆","标注框","多角标注框","自由线",  "节点链"
            , "跑道形", "八字形", "箭头线", "沿线注记","线型标注", "铁丝网"
            , "对象间连线", "多边形区域","扇形区域"];
        var cellId = cellRootNode.id + 1;
        for(var i = 0; i < symbolCode.length; i++){
            var drawCellNode = {
                id: cellId++,
                pId: 0,
                icon:"images/" + cellRootNode.fullName + symbolCode[i] + ".png",
                symbolCode: symbolCode[i],
                libID: 0,
                symbolName: symbolName[i]
            };
            cellRootNode.drawData.drawNodes.push(drawCellNode);
        }

        return cellId;
    },

    addNew: function(treeData){
        var cellRootNode = new Object();
        cellRootNode.id = 1;
        cellRootNode.pId = 0;
        cellRootNode.name = "航线对象";
        cellRootNode.drawData = {serverUrl:this.serverUrl, drawNodes:[]};
        treeData.push(cellRootNode);

        var symbolCode = [1005,1006,1007];
        var symbolName = ["航线1","航线2","航线3"];
        var cellId = cellRootNode.id + 1;
        for(var i = 0; i < symbolCode.length; i++){
            var drawCellNode = {
                id: cellId++,
                pId: 0,
                icon:"images/BasicCell/RouteIcon/" + symbolCode[i] + ".png",
                symbolCode: symbolCode[i],
                libID: 0,
                symbolName: symbolName[i]
            };
            cellRootNode.drawData.drawNodes.push(drawCellNode);
        }

        return cellId;
    },

    innerAnalysisSymbolTree: function(childSymbolInfos, treeData, parentNode, rootSymbolIconUrl){
        var drawData = [];
        var treeNodeId = parentNode.id+1;
        for(var i = 0; i < childSymbolInfos.length; i++){
            if(childSymbolInfos[i].symbolNodeType === "SYMBOL_GROUP"){
                var treeNode = new Object();
                treeNode.id = treeNodeId++;
                treeNode.pId = parentNode.id;
                treeNode.name = childSymbolInfos[i].symbolName;
                treeNode.fullName = parentNode.fullName + childSymbolInfos[i].symbolName+"/";
                treeData.push(treeNode);

                treeNodeId = this.innerAnalysisSymbolTree(childSymbolInfos[i].childNodes, treeData, treeNode, rootSymbolIconUrl);
            } else if(childSymbolInfos[i].symbolNodeType === "SYMBOL_NODE"){
                var drawNode = new Object();
                drawNode.id = treeNodeId++;
                drawNode.pId = parentNode.id;
                drawNode.icon = rootSymbolIconUrl + parentNode.fullName + childSymbolInfos[i].symbolCode + ".png";
                drawNode.symbolCode = childSymbolInfos[i].symbolCode;
                drawNode.libID = childSymbolInfos[i].libID;
                drawNode.symbolName = childSymbolInfos[i].symbolName + "_" + childSymbolInfos[i].symbolCode;
                drawData.push(drawNode);
            }
        }

        if(drawData.length !== 0){
            parentNode.drawData = {serverUrl:this.serverUrl, drawNodes:drawData};
        }

        return treeNodeId;
    },

    getDrawControl: function(){
        var plotLayers = map.getLayersByClass("SuperMap.Layer.PlottingLayer");
        var editPlottingLayer = null;
        for(var i = 0; i < plotLayers.length; i ++){
            if(plotLayers[i].isEditable === true){
                editPlottingLayer = plotLayers[i];
                break;
            }
        }

        if(editPlottingLayer === null){
            return null;
        }

        var controls = map.controls;
        for(var j = 0; j < controls.length; j++){
            if(controls[j].CLASS_NAME === "SuperMap.Control.DrawFeature"
                && editPlottingLayer === controls[j].layer && controls[j].handler
                && controls[j].handler.CLASS_NAME === "SuperMap.Handler.GraphicObject"){
                return controls[j];
            }
        }

        return null;
    },

    CLASS_NAME: "SuperMap.Plotting.PlotPanel"
});
