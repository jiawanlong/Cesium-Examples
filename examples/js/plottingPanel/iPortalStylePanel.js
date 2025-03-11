/* by jiawanlong*/
var data;
L.supermap.plotting.initIportalStylePanel = function(div, type, data, plotName){
    data = data;
    if(plotName === 'detail') {
        var stylePanel = document.getElementById(div);
        var pg = document.createElement("table");
        pg.id = "pg";
        pg.className = "easyui-propertygrid";
        stylePanel.appendChild(pg);
        $("#pg").propertygrid({
            showGroup:true,
            columns: [[
                { field: 'name', title: 'Name', width: 100, resizable: true },
                { field: 'value', title: 'Value', width: 100, resizable: true
                }
            ]]
        });
        showFeatureProperty(type,data);
    }else {
        var plotPanel = document.getElementById(div);
        var attrStyle = document.createElement("table");
        attrStyle.id = "attrStyle";
        attrStyle.className = "easyui-propertygrid";
        plotPanel.appendChild(attrStyle);
        $("#attrStyle").propertygrid({
            showGroup:true,
            columns: [[
                { field: 'name', title: 'Name', width: 100, resizable: true },
                { field: 'value', title: 'Value', width: 100, resizable: true
                }
            ]],
            onAfterEdit: afterModifySelectFeature
        });
        showEditFeatureProperty(type,data);
    }
    
}

function showFeatureProperty(type,item) {
    let rows = collectionPropertyGridRows(type,item);
    $('#pg').propertygrid('loadData', rows);
}
function showEditFeatureProperty(type,item) {
    let rows = collectionEditPropertyGridRows(type,item);
    $('#attrStyle').propertygrid('loadData', rows);
}
var groupDetail =["基本信息","地图图层列表","服务参照系","服务标识","服务范围","服务提供者"];
var groupEdit =["基本信息","服务参照系","服务标识","地理范围","服务提供者"];
function collectionPropertyGridRows(type,featuresParameter) {
    let rows = [];
    //基本信息
    rows = [
        { "name": "名称", "value":featuresParameter.title, "group": groupDetail[0]},
        { "name": "所有者", "value":featuresParameter.userName, "group": groupDetail[0]},
        { "name": "标签", "value": featuresParameter.tags.join(",").replace(","," "),"group": groupDetail[0]},
        { "name": "描述", "value": featuresParameter.description, "group": groupDetail[0]}
    ];
    switch (type){
        case 'MAP':
            rows.push(
                {
                    "name":'类型',
                    "value":featuresParameter.sourceType,
                    "group":groupDetail[0]
                },
                {
                    "name":'坐标系信息',
                    "value":featuresParameter.epsgCode,
                    "group":groupDetail[0]
                },
                {
                    "name":'中心点',
                    "value":featuresParameter.center?"("+featuresParameter.center.x+", "+featuresParameter.center.y+")":'',
                    "group":groupDetail[0]
                },
                {
                    "name":'地图范围',
                    "value":featuresParameter.extent?"左下角("+featuresParameter.extent.left+","+featuresParameter.extent.bottom+") 右上角("+featuresParameter.extent.right+","+featuresParameter.extent.top+")":'',
                    "group":groupDetail[0]
                },
                {
                    "name":'创建时间',
                    "value":new Date(parseInt(featuresParameter.createTime)).toLocaleString(),
                    "group":groupDetail[0]
                },
                {
                    "name":'修改时间',
                    "value":new Date(parseInt(featuresParameter.updateTime)).toLocaleString(),
                    "group":groupDetail[0]
                },
                {
                    "name":'访问数',
                    "value":featuresParameter.visitCount,
                    "group":groupDetail[0]
                }
            )
            if(featuresParameter.layers) {
                featuresParameter.layers.forEach(item => {
                    rows.push({
                        "name":item.title,
                        "value":item.hrefUrl,
                        "group":groupDetail[1]
                    })
                })
            }
            
        break;
        case 'SERVICE':
            rows[0].value = featuresParameter.resTitle;
            rows.push(
                {
                    "name":'地址',
                    "value":featuresParameter.linkPage,
                    "group":groupDetail[0]
                },
                {
                    "name":'代理地址',
                    "value":featuresParameter.proxiedUrl,
                    "group":groupDetail[0]
                },
                {
                    "name":'令牌获取地址',
                    "value":featuresParameter.tokenRefreshUrl,
                    "group":groupDetail[0]
                },
                {
                    "name":'类型',
                    "value":featuresParameter.type,
                    "group":groupDetail[0]
                },
                {
                    "name":'注册于',
                    "value":new Date(parseInt(featuresParameter.createTime)).toLocaleString(),
                    "group":groupDetail[0]
                },
                {
                    "name":'访问数',
                    "value":featuresParameter.visitCount,
                    "group":groupDetail[0]
                },
                {
                    "name":'坐标系',
                    "value":featuresParameter.metadata.refSysInfo?featuresParameter.metadata.refSysInfo.refSysID:'',
                    "group":groupDetail[2]
                },
                {
                    "name":'投影类型',
                    "value":featuresParameter.metadata.refSysInfo?featuresParameter.metadata.refSysInfo.mdCoRefSys.projection:'',
                    "group":groupDetail[2]
                },
                {
                    "name":'覆盖区域',
                    "value":featuresParameter.metadata.dataIdInfo?featuresParameter.metadata.dataIdInfo.dataIdent.dataExt.exDesc:'',
                    "group":groupDetail[3]
                },
                {
                    "name":'西边界',
                    "value":featuresParameter.metadata.dataIdInfo?featuresParameter.metadata.dataIdInfo.dataIdent.dataExt.geoEle.geoBndBox.westBL:'',
                    "group":groupDetail[4]
                },
                {
                    "name":'东边界',
                    "value":featuresParameter.metadata.dataIdInfo?featuresParameter.metadata.dataIdInfo.dataIdent.dataExt.geoEle.geoBndBox.eastBL:'',
                    "group":groupDetail[4]
                },
                {
                    "name":'南边界',
                    "value":featuresParameter.metadata.dataIdInfo?featuresParameter.metadata.dataIdInfo.dataIdent.dataExt.geoEle.geoBndBox.southBL:'',
                    "group":groupDetail[4]
                },
                {
                    "name":'北边界',
                    "value":featuresParameter.metadata.dataIdInfo?featuresParameter.metadata.dataIdInfo.dataIdent.dataExt.geoEle.geoBndBox.northBL:'',
                    "group":groupDetail[4]
                },
                {
                    "name":'个人名称',
                    "value":featuresParameter.metadata.mdContact?featuresParameter.metadata.mdContact.rpIndName:'',
                    "group":groupDetail[5]
                },
                {
                    "name":'组织名称',
                    "value":featuresParameter.metadata.mdContact?featuresParameter.metadata.mdContact.rpOrgName:'',
                    "group":groupDetail[5]
                },
                {
                    "name":'地址',
                    "value":featuresParameter.metadata.mdContact?featuresParameter.metadata.mdContact.rpCntInfo.cntAddress.delPoint:'',
                    "group":groupDetail[5]
                },
                {
                    "name":'电子邮件',
                    "value":featuresParameter.metadata.mdContact?featuresParameter.metadata.mdContact.rpCntInfo.cntAddress.EMailAdd:'',
                    "group":groupDetail[5]
                },
                {
                    "name":'电话',
                    "value":featuresParameter.metadata.mdContact?featuresParameter.metadata.mdContact.rpCntInfo.voiceNum:'',
                    "group":groupDetail[5]
                },
                {
                    "name":'传真',
                    "value":featuresParameter.metadata.mdContact?featuresParameter.metadata.mdContact.rpCntInfo.faxNum:'',
                    "group":groupDetail[5]
                }
            )
        break;
        case 'SCENE':
            rows[0].value = featuresParameter.name;
            rows.push(
                {
                    "name":'创建于',
                    "value":new Date(parseInt(featuresParameter.createTime)).toLocaleString(),
                    "group":groupDetail[0]
                },
                {
                    "name":'访问数',
                    "value":featuresParameter.visitCount,
                    "group":groupDetail[0]
                }
            )
        break;
        case 'DATA':
            rows[0].value = featuresParameter.fileName;
            rows.push(
                {
                    "name":'类型',
                    "value":featuresParameter.type,
                    "group":groupDetail[0]
                },
                {
                    "name":'数据范围',
                    "value":featuresParameter.dataMetaInfo?featuresParameter.dataMetaInfo.bounds:'',
                    "group":groupDetail[0]
                },
                {
                    "name":'坐标系',
                    "value":featuresParameter.dataMetaInfo?featuresParameter.dataMetaInfo.epsgCode:'',
                    "group":groupDetail[0]
                },
                {
                    "name":'数据提供者',
                    "value":featuresParameter.dataMetaInfo?featuresParameter.dataMetaInfo.providers:'',
                    "group":groupDetail[0]
                },
                {
                    "name":'修改时间',
                    "value":new Date(parseInt(featuresParameter.lastModfiedTime)).toLocaleString(),
                    "group":groupDetail[0]
                },
                {
                    "name":'下载次数',
                    "value":featuresParameter.downloadCount,
                    "group":groupDetail[0]
                },
                {
                    "name":'文件大小',
                    "value":(Number(featuresParameter.size)/1024).toFixed(2)+"KB",
                    "group":groupDetail[0]
                }
            )
        break;
        case 'INSIGHTS_WORKSPACE':
            rows[0].value = featuresParameter.name;
            rows.push(
                {
                    "name":'创建于',
                    "value":new Date(parseInt(featuresParameter.createTime)).toLocaleString(),
                    "group":groupDetail[0]
                },
                {
                    "name":'访问数',
                    "value":featuresParameter.visitCount,
                    "group":groupDetail[0]
                }
            )
        break;
        case 'MAP_DASHBOARD':
            rows[0].value = featuresParameter.name;
            rows.push(
                {
                    "name":'创建于',
                    "value":new Date(parseInt(featuresParameter.createTime)).toLocaleString(),
                    "group":groupDetail[0]
                },
                {
                    "name":'访问数',
                    "value":featuresParameter.visitCount,
                    "group":groupDetail[0]
                }
            )
        break;
    }
    return rows;
}
function collectionEditPropertyGridRows(type,featuresParameter){
    let rows = [];
    //基本信息
    rows = [
        { "name": "名称", "value":featuresParameter.title, "group": groupEdit[0],"editor":"text","key":"title"},
        { "name": "标签", "value": featuresParameter.tags.join(",").replace(","," "), "group": groupEdit[0],"editor":"text","key":"tags"},
        { "name": "描述", "value": featuresParameter.description, "group": groupEdit[0],"editor":"text","key":"description"}
    ];
    switch (type) {
        case 'SERVICE':
            rows[0].value = featuresParameter.resTitle;
            rows.push(
                {
                    "name":"令牌获取地址",
                    "value":featuresParameter.tokenRefreshUrl,
                    "group":groupEdit[0],
                    "editor":"text",
                    "key":"tokenRefreshUrl"
                },
                {
                    "name":"坐标系",
                    "value":featuresParameter.metadata.refSysInfo?featuresParameter.metadata.refSysInfo.refSysID:'',
                    "group":groupEdit[1],
                    "editor":"text",
                    "key":"refSysID"
                },
                {
                    "name":'投影类型',
                    "value":featuresParameter.metadata.refSysInfo?featuresParameter.metadata.refSysInfo.mdCoRefSys.projection:'',
                    "group":groupEdit[1],
                    "editor":"text",
                    "key":"projection"
                }, 
                {
                    "name":'覆盖区域',
                    "value":featuresParameter.metadata.dataIdInfo?featuresParameter.metadata.dataIdInfo.dataIdent.dataExt.exDesc:'',
                    "group":groupEdit[2],
                    "editor":"text",
                    "key":"region"
                }, {
                    "name":'西边界',
                    "value":featuresParameter.metadata.dataIdInfo?featuresParameter.metadata.dataIdInfo.dataIdent.dataExt.geoEle.geoBndBox.westBL:'',
                    "group":groupEdit[3],
                    "editor":"text",
                    "key":"west"
                }, {
                    "name":'东边界',
                    "value":featuresParameter.metadata.dataIdInfo?featuresParameter.metadata.dataIdInfo.dataIdent.dataExt.geoEle.geoBndBox.eastBL:'',
                    "group":groupEdit[3],
                    "editor":"text",
                    "key":"east"
                }, {
                    "name":'南边界',
                    "value":featuresParameter.metadata.dataIdInfo?featuresParameter.metadata.dataIdInfo.dataIdent.dataExt.geoEle.geoBndBox.southBL:'',
                    "group":groupEdit[3],
                    "editor":"text",
                    "key":"south"
                }, {
                    "name":'北边界',
                    "value":featuresParameter.metadata.dataIdInfo?featuresParameter.metadata.dataIdInfo.dataIdent.dataExt.geoEle.geoBndBox.northBL:'',
                    "group":groupEdit[3],
                    "editor":"text",
                    "key":"north"
                },
                {
                    "name":'个人名称',
                    "value":featuresParameter.metadata.mdContact?featuresParameter.metadata.mdContact.rpIndName:'',
                    "group":groupEdit[4],
                    "editor":"text",
                    "key":"personName"
                },
                {
                    "name":'组织名称',
                    "value":featuresParameter.metadata.mdContact?featuresParameter.metadata.mdContact.rpOrgName:'',
                    "group":groupEdit[4],
                    "editor":"text",
                    "key":"orgName"
                },
                {
                    "name":'地址',
                    "value":featuresParameter.metadata.mdContact?featuresParameter.metadata.mdContact.rpCntInfo.cntAddress.delPoint:'',
                    "group":groupEdit[4],
                    "editor":"text",
                    "key":"address"
                },
                {
                    "name":'电子邮件',
                    "value":featuresParameter.metadata.mdContact?featuresParameter.metadata.mdContact.rpCntInfo.cntAddress.EMailAdd:'',
                    "group":groupEdit[4],
                    "editor":"text",
                    "key":"email"
                },
                {
                    "name":'电话',
                    "value":featuresParameter.metadata.mdContact
                    ?featuresParameter.metadata.mdContact.rpCntInfo.voiceNum:'',
                    "group":groupEdit[4],
                    "editor":"text",
                    "key":"voiceNum"
                },
                {
                    "name":'传真',
                    "value":featuresParameter.metadata.mdContact?featuresParameter.metadata.mdContact.rpCntInfo.faxNum:'',
                    "group":groupEdit[4],
                    "editor":"text",
                    "key":"faxNum"
                }
            )
            break;
        case 'DATA':
            rows[0].value = featuresParameter.fileName.substring(0,featuresParameter.fileName.lastIndexOf("."));
            rows.push(
                {
                    "name":'数据范围',
                    "value":featuresParameter.dataMetaInfo?featuresParameter.dataMetaInfo.bounds:'',
                    "group":groupEdit[0],
                    "editor":"text",
                    "key":"bounds"
                },{
                    "name":'坐标系',
                    "value":featuresParameter.dataMetaInfo?featuresParameter.dataMetaInfo.epsgCode:'',
                    "group":groupEdit[0],
                    "editor":"text",
                    "key":"epsgCode"

                },{
                    "name":'地图预览URL',
                    "value":featuresParameter.dataMetaInfo?featuresParameter.dataMetaInfo.previewURL:'',
                    "group":groupEdit[0],
                    "editor":"text",
                    "key":"previewURL"

                }, {
                    "name":'数据提供者',
                    "value":featuresParameter.dataMetaInfo?featuresParameter.dataMetaInfo.providers:'',
                    "group":groupEdit[0],
                    "editor":"text",
                    "key":"providers"
                }
            )
            break;
        case 'SCENE':
            rows[0].value = featuresParameter.name;
            break;
        case 'INSIGHTS_WORKSPACE':
            rows[0].value = featuresParameter.name;
            break;
        case 'MAP_DASHBOARD':
            rows[0].value = featuresParameter.name;
            break;
    }
    return rows;
}
