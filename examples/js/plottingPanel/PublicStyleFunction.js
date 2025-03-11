var group = ["标号","解除锁定","对象可见性","常用:点", "主线", "衬线", "填充","注记", "子标号" ];
var displayName =["锁定","可见性","LibID","Code"];
var displayLineStyleName = [ "线宽", "线颜色","线型","线透明度" ];
var displaySurroundLineName = ["衬线类型", "衬线宽", "衬线颜色", "衬线透明度"];
var displayFillStyleName = ["填充", "填充色", "填充透明度","渐变填充方式","填充背景色","填充背景透明度","渐变填充角度","渐变填充水平偏移","渐变填充竖直偏移"];
var displayNameDot = ["旋转角度", "随图缩放", "镜像", "标号级别","位置点偏移","偏移线类型","宽高锁定","标号Width", "标号Height"];
var displayTextContentName =["注记内容", "注记位置", "注记大小", "注记颜色", "注记字体","注记距离",
    "字间距","字宽百分比","字体描边", "描边色", "描边宽度",
    "文字背景", "背景色", "文字阴影", "阴影色", "阴影偏移量X", "阴影偏移量Y"];
var groupNew =["组合类型","箭头类型","沿线类型","边框属性","半径","轨道设置","节点设置","连线类型","折线设置"];
var displayNameNew = ["箭头","箭身","箭尾",
    "起始","终止",
    "路径线","贝塞尔曲线","显示箭头","避让",
    "标注框边框","圆角边框","对象标注边框",
    "半径类型","半径角度","注记一","注记二",
    "卫星轨道",
    "节点类型","节点旋转角度",
    "对象间连线",
    "折线显示",
    "文字对齐方式"];
function collectionPropertyGridRows(featuresParameter) {
    var features = [];
    var styles=[];
    for(var i=0;i<featuresParameter.length;i++){
         styles.push(featuresParameter[i].style);
         if(featuresParameter[i].geometry === undefined) {
             features.push(featuresParameter[i]);
         }else{
             features.push(featuresParameter[i].geometry);
         }
    }
    var rows = [];
    if(features.length === 0){
        return rows = [];
    }
    var dotSelectFeatures = [];
    var algoSelectFeatures = [];
    var sameFeatures = [];
    var otherFeatures = [];
    var selectfeatures = [];
    for(var i = 0; i < features.length; i++){
        if(features[i].libID === features[0].libID && features[i].code === features[0].code) {
            sameFeatures.push(features[i]);//是否是同一个标号
        }
    }
    if(sameFeatures.length !== features.length){
        for(var i = 0; i < features.length; i++){
            if(features[i].symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL){
                dotSelectFeatures.push(features[i]);//是否全是不同点标号
            } else if(features[i].symbolType === SuperMap.Plot.SymbolType.ALGOSYMBOL){
                algoSelectFeatures.push(features[i]); //是否全是不同线面标号
            } else {
                otherFeatures.push(features[i]);
            }
        }
    }
    if(sameFeatures.length === features.length){
        selectfeatures = features;
    } else if(dotSelectFeatures.length === features.length){
        selectfeatures = dotSelectFeatures;
    } else if(algoSelectFeatures.length === features.length){
        selectfeatures = algoSelectFeatures;
    } else if(dotSelectFeatures.length > 0 && algoSelectFeatures.length > 0 && otherFeatures.length === 0 ){
        selectfeatures = features;
    } else if(otherFeatures.length > 0){
        selectfeatures = features;
    }
    var  selectfeature = selectfeatures[0];
    var styleObject = styles[0];

    if(selectfeatures.length === sameFeatures.length){
        rows = [
            { "name": "标号几何ID", "value":selectfeature.symbolType, "group": group[0] },
            { "name": "标号库ID", "value": selectfeature.libID, "group": group[0] },
            { "name": "标号Code", "value": selectfeature.code, "group": group[0] },
            { "name": "标号名字", "value": selectfeature.symbolName, "group": group[0]}
        ];
    }

    //标号锁定
    var lockedObj = new Object();
    lockedObj.group = group[1];
    lockedObj.name = displayName[0];
    lockedObj.editor = {"type": 'checkbox', "options": {"on": true, "off": false}};
    lockedObj.value = checkboxValueToString(selectfeature.getLocked());
    //标号可见性
    var visibilityObj = new Object();
    visibilityObj.group = group[2];
    visibilityObj.name = displayName[1];
    visibilityObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getDisplayRows()}};
    //visibilityObj.value = displayToString(selectfeature.style.display);
    visibilityObj.value = displayToString(styleObject.display);
    rows.push(lockedObj);
    if(selectfeature.getLocked()) {
        return rows;
    }
    rows.push(visibilityObj);
    if(selectfeatures.length===sameFeatures.length || selectfeatures.length===dotSelectFeatures.length ||selectfeatures.length===algoSelectFeatures.length) {
        rows = rows.concat(symbolPropertyObject(selectfeature,styleObject));
    }
    //addExtendProperty(rows,selectfeature);
    return rows;

}

function checkboxValueToString(checkboxValue){
    if(checkboxValue === true){
        return "true";
    } else if(checkboxValue === false){
        return "false";
    }
}
function fromCheckboxValue(checkboxStr){
    if(checkboxStr === "true"){
        return true;
    } else if(checkboxStr === "false"){
        return false;
    }
}
/***
 * 对象可见性
 */
function getDisplayRows() {
    var rows = [];
    rows.push({"value": "display", "text": "显示"});
    rows.push({"value": "none", "text": "不显示"});
    return rows;
}
function displayToString(display) {
    if(display &&display === "none"){
        return "不显示";
    }
    return "显示";
}
/**
 * 8C使用线型
 */
function get8CLineStyleRows() {
    var rows = [];
    rows.push({"value": "solid", "text": "solid"});
    rows.push({"value": "dot", "text": "dot"});
    rows.push({"value": "dash", "text": "dash"});
    rows.push({"value": "dashdot", "text": "dashdot"});
    rows.push({"value": "longdash", "text": "longdash"});
    rows.push({"value": "longdashdot", "text": "longdashdot"});
    return rows;
}
/**
 * 9D使用线型
 */
function lineStyleToString(lineStyle) {
    if(lineStyle == 1)
        return "长虚线";
    else if(lineStyle == 2)
        return "由点构成的直线";
    else if(lineStyle == 3)
        return "由线划线段组成的直线";
    else if(lineStyle == 4)
        return "由重复的线划点图案构成的直线";
    else if(lineStyle == 0)
        return "实线";
    else if(lineStyle)
        return "实线";
}
function getLineStyleRows() {
    var rows = [];
    rows.push({"value": "0", "text": "实线"});//实线(solid)
    rows.push({"value": "1", "text": "长虚线"});//长虚线(longdash) //虚线(dash)
    rows.push({"value": "2", "text": "由点构成的直线"});//由点构成的直线(dot)
    rows.push({"value": "3", "text": "由线划线段组成的直线"});//由线划线段组成的直线(dashdot)(longdashdot)
    rows.push({"value": "4", "text": "由重复的线划点图案构成的直线"});//由重复的划线点图案构成的直线
    return rows;
}
/**
 *注记位置
 */
function getAnnotationRows(geometry){
    var annotations = [];
    annotations.push({"value": "0", "text": "左上"});
    annotations.push({"value": "1", "text": "左下"});
    annotations.push({"value": "2", "text": "右上"});
    annotations.push({"value": "3", "text": "右下"});
    annotations.push({"value": "4", "text": "上"});
    annotations.push({"value": "5", "text": "下"});
    annotations.push({"value": "6", "text": "左"});
    annotations.push({"value": "7", "text": "右"});
    if(geometry.symbolData && geometry.symbolData.middleMarkExist)
        annotations.push({"value": "8", "text": "中间"});
    return annotations;
}
function annotationToString(annotation) {
    if(annotation === 0)
        return "左上";
    else if(annotation === 1)
        return "左下";
    else if(annotation === 2)
        return "右上";
    else if(annotation === 3)
        return "右下";
    else if(annotation === 4)
        return "上";
    else if(annotation === 5)
        return "下";
    else if(annotation === 6)
        return "左";
    else if(annotation === 7)
        return "右";
    else if(annotation === 8)
        return "中间";
}
/**
 * 标号级别
 */
function symbolRankToString(symbolRank) {
    if(symbolRank == 0)
        return "无级别";
    else if(symbolRank == 1)
        return "军区级";
    else if(symbolRank == 2)
        return "副大军区级";
    else if(symbolRank == 3)
        return "集团军级";
    else if(symbolRank == 4)
        return "师级";
    else if(symbolRank == 5)
        return "旅级";
    else if(symbolRank == 6)
        return "团级";
    else if(symbolRank == 7)
        return "营级";
    else if(symbolRank == 8)
        return "连级";
    else if(symbolRank == 9)
        return "排级";
}
function getSymbolRankRows(geometry) {
    var symbolRanks = [];
    if(geometry.symbolData && geometry.symbolData.symbolRanks){
        symbolRanks = geometry.symbolData.symbolRanks;
    }
    var rows = [];
    rows.push({"value": "0", "text": "无级别"});
    for(var i = 0; i < symbolRanks.length; i++)
    {
        if(symbolRanks[i] == 1)
            rows.push({"value": "1", "text": "军区级"});
        else if(symbolRanks[i] == 2)
            rows.push({"value": "2", "text": "副大军区级"});
        else if(symbolRanks[i] == 3)
            rows.push({"value": "3", "text": "集团军级"});
        else if(symbolRanks[i] == 4)
            rows.push({"value": "4", "text": "师级"});
        else if(symbolRanks[i] == 5)
            rows.push({"value": "5", "text": "旅级"});
        else if(symbolRanks[i] == 6)
            rows.push({"value": "6", "text": "团级"});
        else if(symbolRanks[i] == 7)
            rows.push({"value": "7", "text": "营级"});
        else if(symbolRanks[i] == 8)
            rows.push({"value": "8", "text": "连级"});
        else if(symbolRanks[i] == 9)
            rows.push({"value": "9", "text": "排级"});
    }
    return rows;
}
/**
 * 衬线
 */
function surroundLineTypeToString(symbolType, surroundLineType) {
    if(symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL){
        if(surroundLineType === 0)
            return "无衬线";
        else if(surroundLineType === 1)
            return "有衬线";
    } else {
        if(surroundLineType === 0)
            return "无衬线";
        else if(surroundLineType === 1)
            return "内侧衬线";
        else if(surroundLineType === 2)
            return "外侧衬线";
        else if(surroundLineType === 3)
            return "双侧衬线";
    }
}
function getSurroundLineTypeRows(symbolType) {
    var rows = [];
    if(symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL){
        rows.push({"value": "0", "text": "无衬线"});
        rows.push({"value": "1", "text": "有衬线"});
    } else {
        rows.push({"value": "0", "text": "无衬线"});
        rows.push({"value": "1", "text": "内侧衬线"});
        rows.push({"value": "2", "text": "外侧衬线"});
        rows.push({"value": "3", "text": "双侧衬线"});
    }
    return rows;
}
/**
 * 填充
 */
function fillGradientModeToString(fillGradientMode) {
    if(fillGradientMode === "NONE"){
        return "无渐变";
    } else if(fillGradientMode === "LINEAR"){
        return "线性渐变";
    } else if(fillGradientMode === "RADIAL"){
        return "辐射渐变";
    } else {
        return "无渐变";
    }
}
function getFillGradientModeRows() {
    var rows = [];
    rows.push({"value": "NONE", "text": "无渐变"});
    rows.push({"value": "LINEAR", "text": "线性渐变"});
    rows.push({"value": "RADIAL", "text": "辐射渐变"});
    return rows;
}
function fillToString(fillSymbolID,selectfeature) {
        if(fillSymbolID === 0){
            return "实填充";
        } else if(fillSymbolID === 1){
            return "无填充";
        }
    if (selectfeature.symbolType !== SuperMap.Plot.SymbolType.SYMBOLTEXT) {
       if(fillSymbolID === 2){
            return "向上斜填充";
        } else if(fillSymbolID === 3){
            return "十字填充";
        } else if(fillSymbolID === 4){
            return "交叉填充";
        } else if(fillSymbolID === 5){
            return "反斜线填充";
        } else if(fillSymbolID === 6){
            return "水平填充";
        } else if(fillSymbolID === 7){
            return "竖直填充";
        }

    }

}
function getFillRows(selectfeature) {
    var rows = [];
    rows.push({"value": 0, "text": "实填充"});
    rows.push({"value": 1, "text": "无填充"});
    if (selectfeature.symbolType !== SuperMap.Plot.SymbolType.SYMBOLTEXT) {
        rows.push({"value": 2, "text": "向上斜填充"});
        rows.push({"value": 3, "text": "十字填充"});
        rows.push({"value": 4, "text": "交叉填充"});
        rows.push({"value": 5, "text": "反斜线填充"});
        rows.push({"value": 6, "text": "水平填充"});
        rows.push({"value": 7, "text": "竖直填充"});
    }
    return rows;
}
/**
 * 偏移线类型
 */
function positionOffsetTypeToString(positionOffsetType) {
    if(positionOffsetType === 0){
        return "直线";
    } else if(positionOffsetType === 1){
        return "线粗渐变";
    }
}
function getPositionOffsetTypeRows() {
    var rows = [];
    rows.push({"value": "0", "text": "直线"});
    rows.push({"value": "1", "text": "线粗渐变"});
    return rows;
}
/**
 * 沿线注记
 */
function getShowRows() {
    var rows = [];
    rows.push({"value": "true", "text": "显示"});
    rows.push({"value": "false", "text": "不显示"});
    return rows;
}
function showToString(show){
    if(show === true){
        return "显示";
    } else if(show === false){
        return "不显示";
    }
}
function relLineTextToString(relLineText) {
    if(relLineText === SuperMap.Plot.RelLineText.ONLINE)
        return "线上";
    else if(relLineText === SuperMap.Plot.RelLineText.ONLEFTLINE)
        return "线左";
    else if(relLineText === SuperMap.Plot.RelLineText.ONRIGHTLINE)
        return "线右";
    else if(relLineText === SuperMap.Plot.RelLineText.ONBOTHLINE)
        return "双侧";
}
function getRelLineTextRows(){
    var annotations = [];
    annotations.push({"value": "0", "text": "线上"});
    annotations.push({"value": "1", "text": "线左"});
    annotations.push({"value": "2", "text": "线右"});
    annotations.push({"value": "3", "text": "双侧"});
    return annotations;
}
/***
 * 对象间连线
 */
function lineRelationTypeToString(lineRelationType) {
    if (lineRelationType == 0)
        return "实直线";
    else if (lineRelationType == 1)
        return "虚直线";
    else if (lineRelationType == 2)
        return "箭头线";
}
function getLineRelationTypeRows() {
    var rows = [];
    rows.push({"value": "0", "text": "实直线"});
    rows.push({"value": "1", "text": "虚直线"});
    rows.push({"value": "2", "text": "箭头线"});
    return rows;
}
/**
 * 航线节点类型
 */
function routeNodeTypeToString(routeNodeType) {
    if (routeNodeType === SuperMap.Plot.RouteNodeType.AIMING)
        return "瞄准点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.COMMONROUTE)
        return "普通航路点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.EXPANDING)
        return "展开点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.INITIAL)
        return "初始点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.LANCH)
        return "发射点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.RENDEZVOUS)
        return "会合点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.STANDBY)
        return "待机点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.SUPPLY)
        return "补给点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.TAKEOFF)
        return "起飞点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.TURNING)
        return "转弯点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.VISUALINITAL)
        return "可视初始点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.VOLLEY)
        return "齐射点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.WEAPONLAUNCH)
        return "武器发射点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.TARGET)
        return "目标点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.ATTACK)
        return "攻击点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.SUPPRESS)
        return "压制点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.EIGHTSPIRAL)
        return "八字盘旋点";
    else if (routeNodeType == SuperMap.Plot.RouteNodeType.HAPPYVALLEY)
        return "跑马圈点";
}
function getRouteNodeTypeRows() {
    var rows = [];
    rows.push({"value": "AIMING", "text": "瞄准点"});
    rows.push({"value": "COMMONROUTE", "text": "普通航路点"});
    rows.push({"value": "EXPANDING", "text": "展开点"});
    rows.push({"value": "INITIAL", "text": "初始点"});
    rows.push({"value": "LANCH", "text": "发射点"});
    rows.push({"value": "RENDEZVOUS", "text": "会合点"});
    rows.push({"value": "STANDBY", "text": "待机点"});
    rows.push({"value": "SUPPLY", "text": "补给点"});
    rows.push({"value": "TAKEOFF", "text": "起飞点"});
    rows.push({"value": "TURNING", "text": "转弯点"});
    rows.push({"value": "VISUALINITAL", "text": "可视初始点"});
    rows.push({"value": "VOLLEY", "text": "齐射点"});
    rows.push({"value": "WEAPONLAUNCH", "text": "武器发射点"});
    rows.push({"value": "TARGET", "text": "目标点"});
    rows.push({"value": "ATTACK", "text": "攻击点"});
    rows.push({"value": "SUPPRESS", "text": "压制点"});
    rows.push({"value": "EIGHTSPIRAL", "text": "八字盘旋点"});
    rows.push({"value": "HAPPYVALLEY", "text": "跑马圈点"});
    return rows;
}
/**
 *箭头线
 */
function arrowTypeToString(arrowType) {
    if (arrowType == 0)
        return "双线箭头";
    else if (arrowType == 1)
        return "实心三角形";
    else if (arrowType == 2)
        return "无箭头";
}
function getArrowTypeRows() {
    var rows = [];
    rows.push({"value": "0", "text": "双线箭头"});
    rows.push({"value": "1", "text": "实心三角形"});
    rows.push({"value": "2", "text": "无箭头"});
    return rows;
}
/**
 * 扇形区域
 */
function radiusTypeToString(radiusType) {
    if (radiusType == 0)
        return "不显示";
    else if (radiusType == 1)
        return "直线";
    else if (radiusType == 2)
        return "箭头线";
}
function getRadiusTypeRows() {
    var rows = [];
    rows.push({"value": "0", "text": "不显示"});
    rows.push({"value": "1", "text": "直线"});
    rows.push({"value": "2", "text": "箭头线"});
    return rows;
}
/**
 * 标注框
 */
function textBoxTypeToString(textBoxType) {
    if (textBoxType == 0)
        return "带角矩形边框";
    else if (textBoxType == 1)
        return "矩形边框";
    else if (textBoxType == 3)
        return "无边框";
}
function getTextBoxTypeRows() {
    var rows = [];
    rows.push({"value": "0", "text": "带角矩形边框"});
    rows.push({"value": "1", "text": "矩形边框"});
    rows.push({"value": "3", "text": "无边框"});
    return rows;
}
/**
 * 线型标注框
 */
function lineMarkingTypeToString(lineMarkingType) {
    if(lineMarkingType === 1){
        return "矩形边框";
    } else if(lineMarkingType === 2){
        return "线型底边";
    }
}
function getLineMarkingTypeRows() {
    var rows = [];
    rows.push({"value": "1", "text": "矩形边框"});
    rows.push({"value": "2", "text": "线型底边"});
    return rows;
}
/**
 * 复合箭头
 * 箭头、箭身、箭尾
 */
function getArrowHeadTypeRows() {
    var rows = [];
    rows.push({"value": "0", "text": "双线箭头"});
    rows.push({"value": "2", "text": "燕尾箭头"});
    rows.push({"value": "3", "text": "实心三角形"});
    rows.push({"value": "6", "text": "新燕尾箭头"});
    rows.push({"value": "-1", "text": "无箭头"});
    return rows;
}
function arrowHeadTypeToString(arrowHeadType) {
    if (arrowHeadType == 0)
        return "双线箭头";
    else if (arrowHeadType == 2)
        return "燕尾箭头";
    else if (arrowHeadType == 3)
        return "实心三角形";
    else if (arrowHeadType == 6)
        return "新燕尾箭头";
    else if (arrowHeadType == -1)
        return "无箭头";
}
function arrowBodyTypeToString(arrowBodyType) {
    if (arrowBodyType == 0)
        return "折线";
    else if (arrowBodyType == 1)
        return "贝塞尔曲线";
    else if (arrowBodyType == 5)
        return "新增箭身";

}
function getArrowBodyTypeRows() {
    var rows = [];
    rows.push({"value": "0", "text": "折线"});
    rows.push({"value": "1", "text": "贝塞尔曲线"});
    rows.push({"value": "5", "text": "新增箭身"});
    return rows;
}
function arrowTailTypeToString(arrowTailType) {
    if (arrowTailType == 0)
        return "无箭尾";
    else if (arrowTailType == 1)
        return "直线箭尾";
    else if (arrowTailType == 3)
        return "燕尾箭尾";
}
function getArrowTailTypeRows() {
    var rows = [];
    rows.push({"value": "0", "text": "无箭尾"});
    rows.push({"value": "1", "text": "直线箭尾"});
    rows.push({"value": "3", "text": "燕尾箭尾"});
    return rows;
}
/**
 * 线面标号子标号
 */
function libIDToString(libID) {
    if (libID == 421)
        return "421(警用库)";
    else if (libID == 100)
        return "100(军队库)";
    else if (libID == 123)
        return "123(武警库)";
    else if (libID == 900)
        return "900(人防库)";
}
function subSymbolsTypeString(subSymbolsLength,geometry){
    if(subSymbolsLength===0){
        return "";
    }else {
        if(geometry.libID===100){
            if(geometry.getSubSymbols()[0].code === 100){
                return "陆军";
            }else if(geometry.getSubSymbols()[0].code === 200){
                return "海军";
            }else if(geometry.getSubSymbols()[0].code === 300) {
                return "空军";
            }
        }else if(geometry.libID===123){
            if(geometry.getSubSymbols()[0].code === 10101){
                return "武装警察部队";
            }else if(geometry.getSubSymbols()[0].code === 10102){
                return "防爆装甲";
            }else if(geometry.getSubSymbols()[0].code === 10103) {
                return "火炮";
            }
        }else if(geometry.libID===900){
            if(geometry.getSubSymbols()[0].code === 910200){
                return "人民防空重点城市";
            }else if(geometry.getSubSymbols()[0].code === 910300){
                return "人民防空基本指挥所";
            }else if(geometry.getSubSymbols()[0].code === 910402) {
                return "水路抢修专业队";
            }
        }else if(geometry.libID===0){
            if(geometry.getSubSymbols()[0].code === 9){
                return "刑警";
            }else if(geometry.getSubSymbols()[0].code === 80103){
                return "交警";
            }else if(geometry.getSubSymbols()[0].code === 80109){
                return "专业警";
            }
        }
    }
}
function getSubSymbolsTypeRows(geometry){
    var rows = [];
    rows.push({"value": "0", "text": ""});
    if(geometry.libID===100){
        rows.push({"value": "100", "text": "陆军"});
        rows.push({"value": "200", "text": "海军"});
        rows.push({"value": "300", "text": "空军"});
    }else if(geometry.libID===123){
        rows.push({"value": "10101", "text": "武装警察部队"});
        rows.push({"value": "10102", "text": "防爆装甲"});
        rows.push({"value": "10103", "text": "火炮"});
    }else if(geometry.libID===900){
        rows.push({"value": "910200", "text": "人民防空重点城市"});
        rows.push({"value": "910300", "text": "人民防空基本指挥所"});
        rows.push({"value": "910402", "text": "水路抢修专业队"});
    }else if(geometry.libID===0){
        rows.push({"value": "9", "text": "刑警"});
        rows.push({"value": "80103", "text": "交警"});
        rows.push({"value": "80109", "text": "专业警"});
    }
    return rows;
}
/**
 * 文字对齐
 * 注记指示框、标注框、多角标注框、线型标注框
 */
function fontAlignTypeToString(alignType) {
    if(alignType === 'lm')
        return "左对齐";
    else if(alignType === 'rm')
        return "右对齐";
    else if(alignType === 'cm')
        return "中间对齐";
    else if(alignType === 'lt')
        return "左上对齐";
    else if(alignType === 'lb')
        return "左下对齐";
    else if(alignType === 'rt')
        return "右上对齐";
    else if(alignType === 'rb')
        return "右下对齐";
}
function getFontAlignTypeRows() {
    var rows = [];
    rows.push({"value": "0", "text": "左对齐"});
    rows.push({"value": "1", "text": "右对齐"});
    rows.push({"value": "2", "text": "居中对齐"});
    rows.push({"value": "3", "text": "左上对齐"});
    rows.push({"value": "4", "text": "左下对齐"});
    rows.push({"value": "5", "text": "右上对齐"});
    rows.push({"value": "6", "text": "右下对齐"});
    return rows;
}
function fontAlignTypeValue (value) {
    if (value === '0'){
        return 'lm';
    }else if(value === '1'){
        return 'rm';
    }else if (value === '2'){
        return 'cm';
    }else if (value === '3'){
        return 'lt';
    }else if (value === '4'){
        return 'lb';
    }else if (value === '5'){
        return 'rt';
    }else if (value === '6'){
        return 'rb';
    }
}


//判断标号类型分类
function checkSymbolType(selectfeature){
   if( selectfeature.symbolType === SuperMap.Plot.SymbolType.GROUPOBJECT ||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.FLAGGROUP||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.AIRROUTE||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.NAVYROUTE||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.MISSILEROUTE||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.ROUTENODE||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.LITERATESIGN||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.SATELLITE||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.SATELLITETIMEWINDOWS||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.NAVYDEPLOYMENT||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.AIRDEPLOYMENT||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT||
       selectfeature.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT1 ||
       selectfeature.symbolType===SuperMap.Plot.SymbolType.TEXTSYMBOL
      ) {
       return false;
   }else{
       return true;
   }
}

function isCanAddText(selectfeature){
        if( selectfeature.symbolType === SuperMap.Plot.SymbolType.POLYLINESYMBOL ||//直线
            selectfeature.symbolType === SuperMap.Plot.SymbolType.PARALLELOGRAM ||//平行四边形
            selectfeature.symbolType === SuperMap.Plot.SymbolType.CIRCLESYMBOL ||//圆
            selectfeature.symbolType === SuperMap.Plot.SymbolType.ELLIPSESYMBOL ||//椭圆
            selectfeature.symbolType === SuperMap.Plot.SymbolType.REGULARPOLYGON ||//正多边形
            selectfeature.symbolType === SuperMap.Plot.SymbolType.ARBITRARYPOLYGONSYMBOL ||//任意多边形
            selectfeature.symbolType === SuperMap.Plot.SymbolType.POLYBEZIERSYMBOL ||//贝塞尔曲线
            selectfeature.symbolType === SuperMap.Plot.SymbolType.POLYBEZIERCLOSESYMBOL ||//闭合贝塞尔曲线
            selectfeature.symbolType === SuperMap.Plot.SymbolType.KIDNEY ||//集结地
            selectfeature.symbolType === SuperMap.Plot.SymbolType.BRACESYMBOL ||//大括号
            selectfeature.symbolType === SuperMap.Plot.SymbolType.TRAPEZOIDSYMBOL ||//梯形
            selectfeature.symbolType === SuperMap.Plot.SymbolType.RECTANGLESYMBOL ||//矩形
            selectfeature.symbolType === SuperMap.Plot.SymbolType.CHORDSYMBOL ||//弓形
            selectfeature.symbolType === SuperMap.Plot.SymbolType.PIESYMBOL ||//扇形
            selectfeature.symbolType === SuperMap.Plot.SymbolType.ARCSYMBOL ||//弧线
            selectfeature.symbolType === SuperMap.Plot.SymbolType.PARALLELLINE ||//平行线
            selectfeature.symbolType === SuperMap.Plot.SymbolType.ANNOFRAMESYMBOL ||//注记指示框
            selectfeature.symbolType === SuperMap.Plot.SymbolType.CONCENTRICCIRCLE||//同心圆
            selectfeature.symbolType === SuperMap.Plot.SymbolType.COMBINATIONALCIRCLE||//组合圆
            selectfeature.symbolType === SuperMap.Plot.SymbolType.ANNOFRAMESYMBOLM ||//多角标注框
            selectfeature.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXTBOX ||//标注框
            selectfeature.symbolType === SuperMap.Plot.SymbolType.FREECURVE ||//自由曲线
            selectfeature.symbolType === SuperMap.Plot.SymbolType.NODECHAIN ||//节点链
            selectfeature.symbolType === SuperMap.Plot.SymbolType.RUNWAY ||//跑道形
            selectfeature.symbolType === SuperMap.Plot.SymbolType.CURVEEIGHT ||//8字形
            selectfeature.symbolType === SuperMap.Plot.SymbolType.ARROWLINE ||//箭头线
            selectfeature.symbolType === SuperMap.Plot.SymbolType.PATHTEXT ||//沿线注记
            selectfeature.symbolType === SuperMap.Plot.SymbolType.POLYGONREGION ||//多边形区域
            selectfeature.symbolType === SuperMap.Plot.SymbolType.ARCREGION ||//扇形区域
            selectfeature.symbolType === SuperMap.Plot.SymbolType.LINEMARKING //线型标注
        ){
            return true;
        }
}



function symbolPropertyObject(selectfeature,styleObject) {

    //线形：线宽
    var lineWidthObj = new Object();
    lineWidthObj.group = group[4];
    lineWidthObj.name = displayLineStyleName[0];
    lineWidthObj.editor = "text";
    if(styleObject.weight !==undefined){
        lineWidthObj.value = styleObject.weight;
    }else{
        if(selectfeature.symbolType === SuperMap.Plot.SymbolType.GROUPOBJECT){
            lineWidthObj.value = selectfeature.getStrokeWidth();
        }else{
            lineWidthObj.value = styleObject.strokeWidth;
        }
    }


    //线形：线色
    var lineColorObj = new Object();
    lineColorObj.group = group[4];
    lineColorObj.name = displayLineStyleName[1];
    lineColorObj.editor = "colorpicker";
    if(styleObject.color !==undefined){
        lineColorObj.value = styleObject.color;
    }else{
        if(selectfeature.symbolType === SuperMap.Plot.SymbolType.GROUPOBJECT){
            lineColorObj.value = selectfeature.getStrokeColor();
        }else{
            lineColorObj.value = styleObject.strokeColor;
        }
    }

    //线形：线型
    var lineStyleObj = new Object();
    lineStyleObj.group = group[4];
    lineStyleObj.name = displayLineStyleName[2];
    if(styleObject.lineSymbolID !== undefined){
        lineStyleObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getLineStyleRows()}};
        lineStyleObj.value = lineStyleToString(styleObject.lineSymbolID);
    }else{
        lineStyleObj.editor = { "type": 'combobox', "options": { "valueField": 'value', "textField": 'text', "data": get8CLineStyleRows() }};
        lineStyleObj.value = styleObject.strokeDashstyle;
    }


    //线形：线透明度
    var lineOpaqueRateObj = new Object();
    lineOpaqueRateObj.group = group[4];
    lineOpaqueRateObj.name = displayLineStyleName[3];
    lineOpaqueRateObj.editor = "text";
    if( styleObject.opacity !==undefined){
        lineOpaqueRateObj.value = styleObject.opacity;
    }else{
        lineOpaqueRateObj.value = styleObject.strokeOpacity;
    }


    //衬线：衬线类型
    var surroundLineTypeObj = new Object();
    surroundLineTypeObj.group = group[5];
    surroundLineTypeObj.name = displaySurroundLineName[0];
    surroundLineTypeObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getSurroundLineTypeRows(selectfeature.symbolType)}};
    if(checkSymbolType(selectfeature)===true){
        surroundLineTypeObj.value = surroundLineTypeToString(selectfeature.symbolType, selectfeature.getSurroundLineType());
    }

    //衬线：衬线宽
    var surroundLineWidthObj = new Object();
    surroundLineWidthObj.group = group[5];
    surroundLineWidthObj.name = displaySurroundLineName[1];
    surroundLineWidthObj.editor = "text";
    surroundLineWidthObj.value = styleObject.surroundLineWidth;

    //衬线：衬线色
    var surroundLineColorObj = new Object();
    surroundLineColorObj.group = group[5];
    surroundLineColorObj.name = displaySurroundLineName[2];
    surroundLineColorObj.editor = "colorpicker";
    surroundLineColorObj.value = styleObject.surroundLineColor;

    //衬线：衬线透明度
    var surroundLineColorOpaObj = new Object();
    surroundLineColorOpaObj.group = group[5];
    surroundLineColorOpaObj.name = displaySurroundLineName[3];
    surroundLineColorOpaObj.editor = "text";
    surroundLineColorOpaObj.value = styleObject.surroundLineColorOpacity;

    //填充：填充
    var fillObj = new Object();
    fillObj.group = group[6];
    fillObj.name = displayFillStyleName[0];
    fillObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getFillRows(selectfeature)}};
    fillObj.value = fillToString(parseFloat(styleObject.fillSymbolID),selectfeature);

    //填充：填充色
    var fillforeColorObj = new Object();
    fillforeColorObj.group = group[6];
    fillforeColorObj.name = displayFillStyleName[1];
    fillforeColorObj.editor = "colorpicker";
    fillforeColorObj.value = styleObject.fillColor;

    //填充：填充透明度
    var fillOpaqueRateObj = new Object();
    fillOpaqueRateObj.group = group[6];
    fillOpaqueRateObj.name = displayFillStyleName[2];
    fillOpaqueRateObj.editor = "text";
    fillOpaqueRateObj.value = styleObject.fillOpacity;

    //填充：渐变填充方式
    var fillGradientModeObj = new Object();
    fillGradientModeObj.group = group[6];
    fillGradientModeObj.name = displayFillStyleName[3];
    fillGradientModeObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getFillGradientModeRows()}};
    fillGradientModeObj.value = fillGradientModeToString(styleObject.fillGradientMode);

    //填充：填充背景色
    var fillBackColorObj = new Object();
    fillBackColorObj.group = group[6];
    fillBackColorObj.name = displayFillStyleName[4];
    fillBackColorObj.editor = "colorpicker";
    fillBackColorObj.value = styleObject.fillBackColor;

    //填充：填充背景透明度
    var fillBackOpacityObj = new Object();
    fillBackOpacityObj.group = group[6];
    fillBackOpacityObj.name = displayFillStyleName[5];
    fillBackOpacityObj.editor = "text";
    fillBackOpacityObj.value = styleObject.fillBackOpacity;

    //填充：渐变填充角度
    var fillBackAngleObj = new Object();
    fillBackAngleObj.group = group[6];
    fillBackAngleObj.name = displayFillStyleName[6];
    fillBackAngleObj.editor = "text";
    fillBackAngleObj.value = styleObject.fillAngle;

    //填充：渐变填充水平偏移
    var fillBackXObj = new Object();
    fillBackXObj.group = group[6];
    fillBackXObj.name = displayFillStyleName[7];
    fillBackXObj.editor = "text";
    fillBackXObj.value = styleObject.fillCenterOffsetX;

    //填充：渐变填充竖直偏移
    var fillBackYObj = new Object();
    fillBackYObj.group = group[6];
    fillBackYObj.name = displayFillStyleName[8];
    fillBackYObj.editor = "text";
    fillBackYObj.value = styleObject.fillCenterOffsetY;

    //注记：注记内容
    var textContentObj = new Object();
    textContentObj.group = group[7];
    textContentObj.name = displayTextContentName[0];
    textContentObj.editor = "text";
    textContentObj.value = selectfeature.getTextContent();
    //注记：注记位置
    var markPosObj  = new Object();
    markPosObj.group = group[7];
    markPosObj.name = displayTextContentName[1];
    if (selectfeature.symbolType === SuperMap.Plot.SymbolType.PATHTEXT) {
        markPosObj.editor = { "type": 'combobox', "options": { "valueField": 'value', "textField": 'text', "data": getRelLineTextRows(selectfeature.getRelLineText()) }};
        markPosObj.value = relLineTextToString(selectfeature.getRelLineText());
    }else{
        markPosObj.editor = { "type": 'combobox', "options": { "valueField": 'value', "textField": 'text', "data": getAnnotationRows(selectfeature) }};
        markPosObj.value = annotationToString(selectfeature.getTextPosition());
    }
    //注记：注记字体大小
    var fontSizeObj  = new Object();
    fontSizeObj.group = group[7];
    fontSizeObj.name = displayTextContentName[2];
    fontSizeObj.editor = "text";
    fontSizeObj.value = styleObject.fontSize;

    //注记：注记字体颜色
    var fontColorObj  = new Object();
    fontColorObj.group = group[7];
    fontColorObj.name = displayTextContentName[3];
    fontColorObj.editor = "colorpicker";
    fontColorObj.value = styleObject.fontColor;


    //注记：注记字体名称
    var fontFamilyObj  = new Object();
    fontFamilyObj.group = group[7];
    fontFamilyObj.name = displayTextContentName[4];
    fontFamilyObj.editor = "text";
    fontFamilyObj.value = styleObject.fontFamily;


    //注记：注记与标号的间距
    var fontSpaceObj  = new Object();
    fontSpaceObj.group = group[7];
    fontSpaceObj.name = displayTextContentName[5];
    fontSpaceObj.editor = "text";
    if (selectfeature.symbolType === SuperMap.Plot.SymbolType.PATHTEXT || selectfeature.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL){
        fontSpaceObj.value = selectfeature.getSpace();
    }
    //注记：字间距
    var fontSpaceObj1  = new Object();
    fontSpaceObj1.group = group[7];
    fontSpaceObj1.name = displayTextContentName[6];
    fontSpaceObj1.editor = "text";
    fontSpaceObj1.value = styleObject.fontSpace;

    //注记：字宽百分比
    var fontPercentObj  = new Object();
    fontPercentObj.group = group[7];
    fontPercentObj.name = displayTextContentName[7];
    fontPercentObj.editor = "text";
    fontPercentObj.value = styleObject.fontPercent;
    //注记：字体描边
    var fontStrokeObj  = new Object();
    fontStrokeObj.group = group[7];
    fontStrokeObj.name = displayTextContentName[8];
    fontStrokeObj.editor = { "type": 'checkbox', "options":{ "on":true, "off":false }};
    fontStrokeObj.value = checkboxValueToString(styleObject.fontStroke);
    //注记：描边色
    var fontStrokeColorObj  = new Object();
    fontStrokeColorObj.group = group[7];
    fontStrokeColorObj.name = displayTextContentName[9];
    fontStrokeColorObj.editor = "colorpicker";
    fontStrokeColorObj.value = styleObject.fontStrokeColor;
    //注记：描边宽度
    var fontStrokeWidthObj  = new Object();
    fontStrokeWidthObj.group = group[7];
    fontStrokeWidthObj.name = displayTextContentName[10];
    fontStrokeWidthObj.editor = "text";
    fontStrokeWidthObj.value = styleObject.fontStrokeWidth;
    //注记：文字背景
    var fontBackObj  = new Object();
    fontBackObj.group = group[7];
    fontBackObj.name = displayTextContentName[11];
    fontBackObj.editor = { "type": 'checkbox', "options":{ "on":true, "off":false }};
    fontBackObj.value = checkboxValueToString(styleObject.fontBackground);
    //注记：背景色
    var fontBackColorObj  = new Object();
    fontBackColorObj.group = group[7];
    fontBackColorObj.name = displayTextContentName[12];
    fontBackColorObj.editor = "colorpicker";
    fontBackColorObj.value = styleObject.fontBackgroundColor;
    //注记：文字阴影
    var fontShadowObj  = new Object();
    fontShadowObj.group = group[7];
    fontShadowObj.name = displayTextContentName[13];
    fontShadowObj.editor = { "type": 'checkbox', "options":{ "on":true, "off":false }};
    fontShadowObj.value = checkboxValueToString(styleObject.fontShadow);
    //注记：阴影色
    var fontShadowColorObj  = new Object();
    fontShadowColorObj.group = group[7];
    fontShadowColorObj.name = displayTextContentName[14];
    fontShadowColorObj.editor = "colorpicker";
    fontShadowColorObj.value = styleObject.fontShadowColor;
    //注记：阴影偏移量X
    var fontShadowOffsetXObj  = new Object();
    fontShadowOffsetXObj.group = group[7];
    fontShadowOffsetXObj.name = displayTextContentName[15];
    fontShadowOffsetXObj.editor = "text";
    fontShadowOffsetXObj.value = styleObject.fontShadowOffsetX;
    //注记：阴影偏移量Y
    var fontShadowOffsetYObj  = new Object();
    fontShadowOffsetYObj.group = group[7];
    fontShadowOffsetYObj.name = displayTextContentName[16];
    fontShadowOffsetYObj.editor = "text";
    fontShadowOffsetYObj.value = styleObject.fontShadowOffsetY;


    var rows = [];
    //线形
    var lineRows = [];
    lineRows.push(lineWidthObj);
    lineRows.push(lineColorObj);
    lineRows.push(lineStyleObj);
    lineRows.push(lineOpaqueRateObj);
    //衬线
    var surroundLineRows =[];
    surroundLineRows.push(surroundLineTypeObj);
    surroundLineRows.push(surroundLineWidthObj);
    surroundLineRows.push(surroundLineColorObj);
    surroundLineRows.push(surroundLineColorOpaObj);
    //填充
    var fillRows =[];
    fillRows.push(fillObj);
    fillRows.push(fillGradientModeObj);
    if(styleObject.fillGradientMode === "NONE" && styleObject.fillSymbolID === 0){
        fillRows.push(fillforeColorObj);
        fillRows.push(fillOpaqueRateObj);
    }else if(styleObject.fillGradientMode === "NONE" &&
        styleObject.fillSymbolID !== 0 &&
        styleObject.fillSymbolID !== 1){
        fillRows.push(fillforeColorObj);
        fillRows.push(fillOpaqueRateObj);
        fillRows.push(fillBackColorObj);
        fillRows.push(fillBackOpacityObj);
    }else if(styleObject.fillGradientMode !== "NONE"){
        fillRows.push(fillforeColorObj);
        fillRows.push(fillOpaqueRateObj);
        fillRows.push(fillBackColorObj);
        if(styleObject.fillGradientMode === "LINEAR"){
            fillRows.push(fillBackAngleObj);
        }
        fillRows.push(fillBackXObj);
        if(styleObject.fillGradientMode === "RADIAL"){
            fillRows.push(fillBackYObj);
        }
    }



    //文字
    var textRows = [];
    textRows.push(textContentObj);
    textRows.push(fontColorObj);
    textRows.push(fontFamilyObj);
    textRows.push(fontSizeObj);
    if (selectfeature.symbolType === SuperMap.Plot.SymbolType.PATHTEXT ||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL) {
        textRows.push(markPosObj);
        if(selectfeature.getTextPosition() !== 8){
            textRows.push(fontSpaceObj);
        }
    }
    if(selectfeature.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL ||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.TEXTSYMBOL
    ){
        textRows.push(fontPercentObj);
        textRows.push(fontSpaceObj1);
        textRows.push(fontStrokeObj);
        if (styleObject.fontStroke === true) {
            textRows.push(fontStrokeColorObj);
            textRows.push(fontStrokeWidthObj);
        }
        textRows.push(fontBackObj);
        if(styleObject.fontBackground === true){
            textRows.push(fontBackColorObj);
        }
        textRows.push(fontShadowObj);
        if (styleObject.fontShadow === true) {
            textRows.push(fontShadowColorObj);
            textRows.push(fontShadowOffsetXObj);
            textRows.push(fontShadowOffsetYObj);
        }
    }



     //图元文本
    if(selectfeature.symbolType === SuperMap.Plot.SymbolType.TEXTSYMBOL){
        rows = rows.concat(textRows);
    }
    if(selectfeature.symbolType === SuperMap.Plot.SymbolType.GROUPOBJECT||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.FLAGGROUP||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.AIRROUTE||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.NAVYROUTE||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.MISSILEROUTE||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.LITERATESIGN||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.AIRDEPLOYMENT||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT1||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.SATELLITETIMEWINDOWS||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.NAVYDEPLOYMENT
    ){
        rows = rows.concat(lineRows);
       if(selectfeature.symbolType === SuperMap.Plot.SymbolType.AIRDEPLOYMENT||
           selectfeature.symbolType === SuperMap.Plot.SymbolType.NAVYDEPLOYMENT){
           rows = rows.concat(fillRows);
       }
        if(selectfeature.symbolType === SuperMap.Plot.SymbolType.NAVYDEPLOYMENT||
            selectfeature.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT1){
            rows.push(textContentObj);
            rows.push(fontColorObj);
            rows.push(fontFamilyObj);
            rows.push(fontSizeObj);
        }
    }

    //点标号自己独有属性
    if(selectfeature.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL){
        //常用：点：旋转角度
        var dotSymbolRotateObj  = new Object();
        dotSymbolRotateObj.group = group[3];
        dotSymbolRotateObj.name = displayNameDot[0];
        dotSymbolRotateObj.editor = "text";
        dotSymbolRotateObj.value = selectfeature.getRotate();
        //常用：点：随图缩放
        var dotScaleByMap  = new Object();
        dotScaleByMap.group = group[3];
        dotScaleByMap.name = displayNameDot[1];
        dotScaleByMap.editor = { "type": 'checkbox', "options":{ "on":true, "off":false }};
        dotScaleByMap.value = checkboxValueToString(selectfeature.getScaleByMap());
        //常用：点：镜像
        var dotSymbolNegativeImageObj  = new Object();
        dotSymbolNegativeImageObj.group = group[3];
        dotSymbolNegativeImageObj.name = displayNameDot[2];
        dotSymbolNegativeImageObj.editor = { "type": 'checkbox', "options":{ "on":true, "off":false }};
        dotSymbolNegativeImageObj.value = checkboxValueToString(selectfeature.getNegativeImage());
        //常用：点：标号级别
        var dotSymbolRankObj  = new Object();
        dotSymbolRankObj.group = group[3];
        dotSymbolRankObj.name = displayNameDot[3];
        dotSymbolRankObj.editor = { "type": 'combobox', "options": { "valueField": 'value', "textField": 'text', "data": getSymbolRankRows(selectfeature) }};
        dotSymbolRankObj.value = symbolRankToString(selectfeature.getSymbolRank());
        //常用：点：位置点偏移
        var dotPositionOffset  = new Object();
        dotPositionOffset.group = group[3];
        dotPositionOffset.name = displayNameDot[4];
        dotPositionOffset.editor = { "type": 'checkbox', "options":{ "on":true, "off":false }};
        dotPositionOffset.value = checkboxValueToString(selectfeature.getPositionOffset());
        //常用：点：偏移线类型
        var dotPositionOffsetType  = new Object();
        dotPositionOffsetType.group = group[3];
        dotPositionOffsetType.name = displayNameDot[5];
        dotPositionOffsetType.editor = { "type": 'combobox', "options": { "valueField": 'value', "textField": 'text', "data": getPositionOffsetTypeRows() }};
        dotPositionOffsetType.value = positionOffsetTypeToString(selectfeature.getPositionOffsetType());
        //常用：点:宽高限定
        var dotSymbolWidthHeightLimit  = new Object();
        dotSymbolWidthHeightLimit.group = group[3];
        dotSymbolWidthHeightLimit.name = displayNameDot[6];
        dotSymbolWidthHeightLimit.editor = { "type": 'checkbox', "options":{ "on":true, "off":false }};
        dotSymbolWidthHeightLimit.value = checkboxValueToString(selectfeature.getWidthHeightLimit());
        //常用：点：军标大小
        var dotSymbolWidthObj = new Object();
        dotSymbolWidthObj.group = group[3];
        dotSymbolWidthObj.name = displayNameDot[7];
        dotSymbolWidthObj.editor = "text";
        dotSymbolWidthObj.value = selectfeature.getSymbolSize().w;
        var dotSymbolHeightObj = new Object();
        dotSymbolHeightObj.group = group[3];
        dotSymbolHeightObj.name = displayNameDot[8];
        dotSymbolHeightObj.editor = "text";
        dotSymbolHeightObj.value = selectfeature.getSymbolSize().h;

        var dotSymbolRows = [];
        dotSymbolRows.push(dotSymbolRotateObj);
        dotSymbolRows.push(dotScaleByMap);
        dotSymbolRows.push(dotSymbolNegativeImageObj);
        dotSymbolRows.push(dotSymbolRankObj);
        dotSymbolRows.push(dotPositionOffset);
        dotSymbolRows.push(dotPositionOffsetType);
        dotSymbolRows.push(dotSymbolWidthHeightLimit);
        dotSymbolRows.push(dotSymbolWidthObj);
        dotSymbolRows.push(dotSymbolHeightObj);
        dotSymbolRows = dotSymbolRows.concat(lineRows);
        dotSymbolRows = dotSymbolRows.concat(surroundLineRows);
        dotSymbolRows = dotSymbolRows.concat(fillRows);
        dotSymbolRows = dotSymbolRows.concat(textRows);
        rows = rows.concat(dotSymbolRows);
    }

    if(selectfeature.symbolType !== SuperMap.Plot.SymbolType.DOTSYMBOL && checkSymbolType(selectfeature) === true){
        var algoSymbolRows =[];
        //线面标号子标号
        for (var i = 0; i < selectfeature.getSubSymbols().length; i++) {
            var objectSubCode = new Object();
            objectSubCode.group = group[8];
            objectSubCode.name = displayName[3];
            objectSubCode.editor = { "type": 'combobox', "options": { "valueField": 'value', "textField": 'text', "data": getSubSymbolsTypeRows(selectfeature) }};
            objectSubCode.index = i;
            objectSubCode.value = selectfeature.getSubSymbols()[i].code;
            algoSymbolRows.push(objectSubCode);
        }
        if((0 === selectfeature.getSubSymbols().length && selectfeature.libID === 0 && selectfeature.code === 1025)||
            (0 === selectfeature.getSubSymbols().length && selectfeature.libID === 100 && selectfeature.code === 25200)||
            (0 === selectfeature.getSubSymbols().length && selectfeature.libID === 100 && selectfeature.code === 3020901)||
            (0 === selectfeature.getSubSymbols().length && selectfeature.libID === 100 && selectfeature.code === 23400) ||
            (0 === selectfeature.getSubSymbols().length && selectfeature.libID === 100 && selectfeature.code === 30800) ||
            (0 === selectfeature.getSubSymbols().length && selectfeature.libID === 100 && selectfeature.code === 26400)
        ){
            var objectSubCode1 = new Object();
            objectSubCode1.group = group[8];
            objectSubCode1.name = displayName[3];
            objectSubCode1.editor = { "type": 'combobox', "options": { "valueField": 'value', "textField": 'text', "data": getSubSymbolsTypeRows(selectfeature) }};
            objectSubCode1.index = i;
            objectSubCode1.value = subSymbolsTypeString(selectfeature.getSubSymbols().length,selectfeature);
            algoSymbolRows.push(objectSubCode1);
        }
        if(selectfeature.code === 1025 && selectfeature.getSubSymbols().length > 0){
            var objectLibID = new Object();
            objectLibID.group = group[8];
            objectLibID.name = displayName[2];
            objectLibID.editor = "text";
            objectLibID.value = libIDToString(selectfeature.getSubSymbols()[0].libID);
            algoSymbolRows.push(objectLibID);
        }
        //四个点以上含4个点可以设置成折线显示
        if ((selectfeature.getLatLngs().length >3)&&(typeof selectfeature.canPolylineConnectLocationPoint !== "undefined" && selectfeature.canPolylineConnectLocationPoint()=== true )) {
            var algoLineType = new Object();
            algoLineType.group = groupNew[8];
            algoLineType.name = displayNameNew[20];
            algoLineType.editor = {"type": 'checkbox', "options": {"on": true, "off": false}};
            algoLineType.value = checkboxValueToString(selectfeature.getPolylineConnectLocationPoint());
            algoSymbolRows.push(algoLineType);
        }
        algoSymbolRows = algoSymbolRows.concat(lineRows);
        algoSymbolRows = algoSymbolRows.concat(surroundLineRows);
        algoSymbolRows = algoSymbolRows.concat(fillRows);
        if(isCanAddText(selectfeature)===true){
            algoSymbolRows = algoSymbolRows.concat(textRows);
        }
        rows = rows.concat(algoSymbolRows);
    }

    //注记指示框、多角标注框、标注框、线型标注框
    if (selectfeature.symbolType === SuperMap.Plot.SymbolType.ANNOFRAMESYMBOL||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.ANNOFRAMESYMBOLM||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXTBOX||
        selectfeature.symbolType === SuperMap.Plot.SymbolType.LINEMARKING){
        //文字对齐方式
        var fontAlignType  = new Object();
        fontAlignType.group = group[7];
        fontAlignType.name = displayNameNew[21];
        fontAlignType.editor = { "type": 'combobox', "options": { "valueField": 'value', "textField": 'text', "data": getFontAlignTypeRows() }};
        fontAlignType.value =  fontAlignTypeToString(styleObject.labelAlign);
        rows.push(fontAlignType);
        //标注框边框
        if(selectfeature.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXTBOX){
            //标注框边框
            var textBoxTypeObj  = new Object();
            textBoxTypeObj.group = groupNew[3];
            textBoxTypeObj.name = displayNameNew[9];
            textBoxTypeObj.editor = { "type": 'combobox', "options": { "valueField": 'value', "textField": 'text', "data": getTextBoxTypeRows() }};
            textBoxTypeObj.value = textBoxTypeToString(selectfeature.getTextBoxType());
            //圆角边框
            var roundBoxObj  = new Object();
            roundBoxObj.group = groupNew[3];
            roundBoxObj.name = displayNameNew[10];
            roundBoxObj.editor = { "type": 'checkbox', "options":{ "on":true, "off":false }};
            roundBoxObj.value = checkboxValueToString(selectfeature.getRoundBox());

            rows.push(textBoxTypeObj);
            rows.push(roundBoxObj);
        }
        //线型标注框边框
        if(selectfeature.symbolType === SuperMap.Plot.SymbolType.LINEMARKING){
            var lineMarkingTextBoxTypeObj  = new Object();
            lineMarkingTextBoxTypeObj.group = groupNew[3];
            lineMarkingTextBoxTypeObj.name = displayNameNew[9];
            lineMarkingTextBoxTypeObj.editor = { "type": 'combobox', "options": { "valueField": 'value', "textField": 'text', "data": getLineMarkingTypeRows() }};
            lineMarkingTextBoxTypeObj.value = lineMarkingTypeToString(selectfeature.getTextBoxType());
            rows.push(lineMarkingTextBoxTypeObj);
        }
    }

    //箭头线自己独有属性
    if (selectfeature.symbolType === SuperMap.Plot.SymbolType.ARROWLINE && selectfeature.libID === 0) {
        var arrowTypeStartObj = new Object();
        arrowTypeStartObj.group = groupNew[1];
        arrowTypeStartObj.name = displayNameNew[3];
        arrowTypeStartObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getArrowTypeRows(selectfeature)}};
        arrowTypeStartObj.value = arrowTypeToString(selectfeature.getStartArrowType());
        var arrowTypeEndObj = new Object();
        arrowTypeEndObj.group = groupNew[1];
        arrowTypeEndObj.name = displayNameNew[4];
        arrowTypeEndObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getArrowTypeRows(selectfeature)}};
        arrowTypeEndObj.value = arrowTypeToString(selectfeature.getEndArrowType());
        rows.push(arrowTypeStartObj);
        rows.push(arrowTypeEndObj);
    }


    //沿线注记自己独有属性
    if (selectfeature.symbolType === SuperMap.Plot.SymbolType.PATHTEXT) {
        var showPathLineObj = new Object();
        showPathLineObj.group = groupNew[2];
        showPathLineObj.name = displayNameNew[5];
        showPathLineObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getShowRows()}};
        showPathLineObj.value = showToString(selectfeature.getShowPathLine());
        var isCurveObj = new Object();
        isCurveObj.group = groupNew[2];
        isCurveObj.name = displayNameNew[6];
        isCurveObj.editor = {"type": 'checkbox', "options": {"on": true, "off": false}};
        isCurveObj.value = checkboxValueToString(selectfeature.getIsCurveLine());
        var showPathLineArrowObj = new Object();
        showPathLineArrowObj.group = groupNew[2];
        showPathLineArrowObj.name = displayNameNew[7];
        showPathLineArrowObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getShowRows()}};
        showPathLineArrowObj.value = showToString(selectfeature.getShowPathLineArrow());
        var isAvoidObj = new Object();
        isAvoidObj.group = groupNew[2];
        isAvoidObj.name = displayNameNew[8];
        isAvoidObj.editor = {"type": 'checkbox', "options": {"on": true, "off": false}};
        isAvoidObj.value = checkboxValueToString(selectfeature.getIsAvoidLine());
        rows.push(showPathLineObj);
        rows.push(isCurveObj);
        rows.push(showPathLineArrowObj);
        if(selectfeature.getRelLineText() === SuperMap.Plot.RelLineText.ONLINE){
            rows.push(isAvoidObj);
        }
    }

    //对象间连线
    if (selectfeature.symbolType ===  SuperMap.Plot.SymbolType.LINERELATION) {
        var lineRelationTypeObj = new Object();
        lineRelationTypeObj.name = displayNameNew[19];
        lineRelationTypeObj.value = lineRelationTypeToString(selectfeature.getLineRelationType());
        lineRelationTypeObj.group = groupNew[7];
        lineRelationTypeObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getLineRelationTypeRows()}};
        rows.push(lineRelationTypeObj);
    }
    //扇形区域
    if (selectfeature.symbolType === SuperMap.Plot.SymbolType.ARCREGION) {
        if (selectfeature.radiusLineType != null){
            var radiusLineTypeObj = new Object();
            radiusLineTypeObj.name = displayNameNew[12];
            radiusLineTypeObj.value = radiusTypeToString(selectfeature.getRadiusLineType());
            radiusLineTypeObj.group = groupNew[4];
            radiusLineTypeObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getRadiusTypeRows(selectfeature)}};
            rows.push(radiusLineTypeObj);
        }
        if (selectfeature.radiusText != null) {
            var radiusPosAngleObj = new Object();
            radiusPosAngleObj.name = displayNameNew[13];
            radiusPosAngleObj.value = selectfeature.getRadiusTextPos();
            radiusPosAngleObj.group = groupNew[4];
            radiusPosAngleObj.editor = "text";
            var upTextObj = new Object();
            upTextObj.name = displayNameNew[14];
            upTextObj.value = selectfeature.getRadiusText(0);
            upTextObj.group = groupNew[4];
            upTextObj.editor = "text";
            var downTextObj = new Object();
            downTextObj.name = displayNameNew[15];
            downTextObj.value = selectfeature.getRadiusText(1);
            downTextObj.group = groupNew[4];
            downTextObj.editor = "text";

            rows.push(radiusPosAngleObj);
            rows.push(upTextObj);
            rows.push(downTextObj);
        }

    }

    //航线
    if (selectfeature.symbolType === SuperMap.Plot.SymbolType.ROUTENODE) {
        rows = rows.concat(lineRows);
        var routeNodeTypeObj = new Object();
        routeNodeTypeObj.name = displayNameNew[17];
        routeNodeTypeObj.value = routeNodeTypeToString(selectfeature.routeNode.type);
        routeNodeTypeObj.group = groupNew[6];
        routeNodeTypeObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getRouteNodeTypeRows()}};
        var routeNodeRotate = new Object();
        routeNodeRotate.name = displayNameNew[18];
        routeNodeRotate.value = selectfeature.routeNode.rotate;
        routeNodeRotate.group = groupNew[6];
        routeNodeRotate.editor = "text";
        rows.push(routeNodeTypeObj);
        if (selectfeature.routeNode.type === SuperMap.Plot.RouteNodeType.STANDBY) {
            rows.push(routeNodeRotate);
        }
    }

    //对象标注的标注内容和标注边框
    if (selectfeature.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT) {
        var textContentObj1 = new Object();
        textContentObj1.group = group[7];
        textContentObj1.name = displayTextContentName[0];
        textContentObj1.editor = "text";
        textContentObj1.value = selectfeature.symbolTexts[0].textContent;
        rows.push(textContentObj1);
        if(selectfeature.symbolTexts.length == 2){
            var textContentObj2 = new Object();
            textContentObj2.group = group[7];
            textContentObj2.name = displayTextContentName[0] + "2";
            textContentObj2.editor = "text";
            textContentObj2.value = selectfeature.symbolTexts[1].textContent;
            rows.push(textContentObj2);
        }
        rows.push(fontColorObj);
        rows.push(fontFamilyObj);
        rows.push(fontSizeObj);
        var symbolTextFrameObj  = new Object();
        symbolTextFrameObj.group = groupNew[3];
        symbolTextFrameObj.name = displayNameNew[11];
        symbolTextFrameObj.editor = { "type": 'checkbox', "options":{ "on":true, "off":false }};
        symbolTextFrameObj.value = checkboxValueToString(selectfeature.getFrame());
        rows.push(symbolTextFrameObj);
        if(selectfeature.getFrame() === true){
            rows.push(lineWidthObj);
            rows.push(lineColorObj);
            rows.push(lineOpaqueRateObj);
            rows.push(fillObj);
            rows.push(fillforeColorObj);
            rows.push(fillOpaqueRateObj);




        }

    }


    //卫星
    if (selectfeature.symbolType === SuperMap.Plot.SymbolType.SATELLITE) {
        var visibleObj = new Object();
        visibleObj.name = displayNameNew[16];
        visibleObj.value = showToString(selectfeature.getVisible());
        visibleObj.group = groupNew[5];
        visibleObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getShowRows()}};
        rows = rows.concat(lineRows);
        rows.push(textContentObj);
        rows.push(fontColorObj);
        rows.push(fontFamilyObj);
        rows.push(fontSizeObj);
        rows.push(visibleObj);
    }

    //复合箭头自己独有属性
    if (selectfeature.libID === 22 && selectfeature.code === 1016) {
        var arrowHeadTypeObj = new Object();
        arrowHeadTypeObj.group = groupNew[0];
        arrowHeadTypeObj.name = displayNameNew[0];
        arrowHeadTypeObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getArrowHeadTypeRows()}};
        arrowHeadTypeObj.value = arrowHeadTypeToString(selectfeature.getArrowHeadType());

        var arrowBodyTypeObj = new Object();
        arrowBodyTypeObj.group = groupNew[0];
        arrowBodyTypeObj.name =  displayNameNew[1];
        arrowBodyTypeObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getArrowBodyTypeRows()}};
        arrowBodyTypeObj.value = arrowBodyTypeToString(selectfeature.getArrowBodyType());

        var arrowTailTypepeObj = new Object();
        arrowTailTypepeObj.group = groupNew[0];
        arrowTailTypepeObj.name = displayNameNew[2];
        arrowTailTypepeObj.editor = {"type": 'combobox', "options": {"valueField": 'value', "textField": 'text', "data": getArrowTailTypeRows()}};
        arrowTailTypepeObj.value = arrowTailTypeToString(selectfeature.getArrowTailType());

        rows.push(arrowHeadTypeObj);
        rows.push(arrowBodyTypeObj);
        rows.push(arrowTailTypepeObj);
    }
    return rows;
}
