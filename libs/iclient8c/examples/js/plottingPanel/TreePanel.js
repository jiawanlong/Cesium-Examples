
/**
 *
 * Class: SuperMap.Plotting.PlotPanel
 * 标绘面板类。
 *
 */
SuperMap.Plotting.TreePanel = new SuperMap.Class({

    /**
     * Constant: EVENT_TYPES
     * {Array(String)}
     *
     * 此类支持的事件类型:
     * - *clickTreeNode* 点击态势图文件列表上节点时触发。
     */
    EVENT_TYPES: ["clickTreeNode"],

    /**
     * APIProperty: events
     * {<SuperMap.Events>} 在 TreePanel 类中处理所有事件的对象，支持两种事件 initializeCompleted ，初始化完成时触发 initializeCompleted 事件。
     *
     * 例如：
     *     (start code)
     * var treePanel = SuperMap.Plotting.TreePanel(url);
     * treePanel.events.on({
     *     "clickTreeNode": clickTreeNode
     *       }
     * );
     * treePanel.initializeTree(smlInfos);
     * (end)
     */
    events: null,

    /**
     * APIProperty: eventListeners
     * {Object} 监听器对象，在构造函数中设置此参数（可选），对 TreePanel 支持的两个事件 initializeCompleted 进行监听，相当于调用 SuperMap.Events.on(eventListeners)。
     */
    eventListeners: null,

    /**
     * APIProperty: 点击的节点态势图文件名
     */
    clickSmlFileName: "",

    /**
     * Constructor: SuperMap.Plotting.TreePanel
     * 态势图列表UI面板。
     *
     * Parameters:
     * div - {String} 态势图列表UI面板div
     *
     * Returns:
     * {<SuperMap.Plotting.TreePanel>}  结果类型对象。
     */
    initialize : function(div){

        this.events = new SuperMap.Events(
            this, null, this.EVENT_TYPES, true
        );
        if (this.eventListeners instanceof Object) {
            this.events.on(this.eventListeners);
        }

        var plotPanel = document.getElementById(div);

        var treeNodeStyle = document.createElement("div");

        treeNodeStyle.style.height = '100%';
        treeNodeStyle.style.width = '100%';
        treeNodeStyle.style.border = '1px solid #617775';
        treeNodeStyle.style.overflow ='scroll';

        var treeNode = document.createElement("div");
        treeNode.id = "tree";
        treeNode.className = "ztree";

        treeNodeStyle.appendChild(treeNode);

        plotPanel.appendChild(treeNodeStyle);
    },


    /**
     * APIMethod: initializeTree
     * 初始化态势图列表UI面板。
     *
     * Parameters:
     * smlInfos - {Array(Object)} 需要展示的态势图列表。
     */
    initializeTree : function(smlInfos){
        function beforeClickTreeNode(treeId, treeNode){
            var tree = $.fn.zTree.getZTreeObj(treeId);
            if (treeNode.isParent) {
                tree.expandNode(treeNode);
                if (treeNode.pId===1) {
                    me.clickSmlFileName = treeNode.name;
                    me.events.triggerEvent("clickTreeNode");
                }
                return false;
            }
        }

        var me = this;
        var setting = {
            view: {
                dblClickExpand: false,
                showLine: true,
                selectedMulti: false,
                showIcon:false
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

        var symbolTreeData = this.analysisSMLInfos(smlInfos);

        $.fn.zTree.init($("#tree"), setting, symbolTreeData);
    },

    /**
     * Method: analysisSMLInfos
     * 初始化态势图列表UI面板的树节点信息。
     *
     * Parameters:
     * smlInfos - {Array(Object)} 需要展示的态势图列表。
     */
    analysisSMLInfos:function(smlInfos){
        var treeData = [];

        var cellRootNode = new Object();
        cellRootNode.id = 1;
        cellRootNode.pId = 0;
        cellRootNode.name = "态势图文件列表";
        cellRootNode.fullName = "态势图文件列表" +"/";
        treeData.push(cellRootNode);

        var cellId = cellRootNode.id + 1;


        var nid= cellId+1;
        for(var i = 0; i < smlInfos.length; i++){
            var info = new SuperMap.Plot.SMLInfoStruct(smlInfos[i]);

            var result = info;

            var rootNode = new Object();
            rootNode.id = cellId++;
            rootNode.pId = 1;
            rootNode.name = smlInfos[i].SMLFileName;
            treeData.push(rootNode);


            cellId = rootNode.id + 1;

            var key = ["SMLAuthor","SMLDepat","SMLDesc","SMLName","SMLSeclevel","SMLTime"];
            var value = [result.SMLAuthor,result.SMLDepat,result.SMLDesc,result.SMLName,result.SMLSeclevel,result.SMLTime];

            for(var j = 0; j < 6; j++){
                var chrootNode = new Object();
                chrootNode.id = cellId++;
                chrootNode.pId = rootNode.id;
                chrootNode.name = key[j]+":"+value[j];

                treeData.push(chrootNode);
            }
        }

        return treeData;
    },

    CLASS_NAME: "SuperMap.Plotting.TreePanel"
});
