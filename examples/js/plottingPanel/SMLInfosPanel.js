/* by jiawanlong*/
L.supermap.plotting.initSMLInfosPanel = function(div, smlInfos, clickTreeNode){
    var smlInfosPanel = document.getElementById(div);

    var treeNodeStyle = document.createElement("div");
    treeNodeStyle.style.height = '100%';
    treeNodeStyle.style.width = '100%';
    treeNodeStyle.style.border = '1px solid #617775';
    treeNodeStyle.style.overflow ='scroll';

    var treeNode = document.createElement("div");
    treeNode.id = "tree";
    treeNode.className = "ztree";

    treeNodeStyle.appendChild(treeNode);

    smlInfosPanel.appendChild(treeNodeStyle);

    function beforeClickTreeNode(treeId, treeNode){
        var tree = $.fn.zTree.getZTreeObj(treeId);
        if (treeNode.isParent) {
            tree.expandNode(treeNode);
            if (treeNode.pId===1) {
                //me.clickSmlFileName = treeNode.name;
                if(clickTreeNode && typeof(clickTreeNode) === "function"){
                    clickTreeNode(treeNode.name)
                }
                //me.events.triggerEvent("clickTreeNode");
            }
            return false;
        }
    }

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

    var symbolTreeData = analysisSMLInfos(smlInfos);
    $.fn.zTree.init($("#tree"), setting, symbolTreeData);
}

function analysisSMLInfos(smlInfos){
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
}