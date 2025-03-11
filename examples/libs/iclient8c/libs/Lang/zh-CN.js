/**
 * @requires SuperMap/Lang.js
 */

/**
 * Namespace: SuperMap.Lang["zh-CN"]
 * Dictionary for Simplified Chinese.  Keys for entries are used in calls to
 *     <SuperMap.Lang.translate>.  Entry bodies are normal strings or
 *     strings formatted for use with <SuperMap.String.format> calls.
 */
SuperMap.Lang["zh-CN"] = {

    'unhandledRequest': "未处理的请求，返回值为 ${statusText}",

    'Permalink': "永久链接",

    'Overlays': "叠加层",

    'Base Layer': "基础图层",

    'LayerSwitcher': "图层选择",

    'noFID': "无法更新feature，缺少FID。",

    'browserNotSupported':
        "你使用的浏览器不支持矢量渲染。当前支持的渲染方式包括：\n${renderers}",

    // console message
    'minZoomLevelError':
        "minZoomLevel属性仅适合用于" +
        "使用了固定缩放级别的图层。这个 " +
        "wfs 图层检查 minZoomLevel 是过去遗留下来的。" +
        "然而，我们不能移除它，" +
        "而破坏依赖于它的基于OL的应用程序。" +
        "因此，我们废除了它 -- minZoomLevel 。" +
        "请改用min/max resolution 设置。",

    'commitSuccess': "WFS Transaction: 成功。 ${response}",

    'commitFailed': "WFS Transaction: 失败。 ${response}",

    'googleWarning':
        "Google图层不能正确加载。<br><br>" +
        "要消除这个信息，请在右上角的" +
        "图层控制面板中选择其他的基础图层。<br><br>" +
        "这种情况很可能是没有正确的包含Google地图脚本库，" +
        "或者是没有在你的站点上" +
        "使用的正确的Google Maps API密匙。<br><br>",

    'getLayerWarning':
        "${layerType} 图层不能正确加载。<br><br>" +
        "要消除这个信息，请在右上角的" +
        "图层控制面板中选择其他的基础图层。<br><br>" +
        "这种情况很可能是没有正确的包含" +
        "${layerLib} 脚本库。<br><br>",

    'Scale = 1 : ${scaleDenom}': "比例尺 = 1 : ${scaleDenom}",

    // console message
    'reprojectDeprecated':
        "你正在使用 ${layerName} 图层上的'reproject'选项。" +
        "这个选项已经不再使用：" +
        "它是被设计用来支持显示商业的地图数据，" + 
        "不过现在该功能可以通过使用Spherical Mercator来实现。" +
        "更多信息请参阅帮助文档。",

    // console message
    'methodDeprecated':
        "该方法已经不再被支持，将被移除。" +
        "请使用 ${newMethod} 方法来替代。",

    'end': '',
    'mi': "英里",
    'km': "公里",
    'm': "米",
    'ft': "英尺",

    'supermap_cloud_map': '&copy;2016 高德软件 GS(2015)2681号',

    'tencent_map':'&copy;2017 Tencent - GS(2016)930号 - Data&copy; NavInfo',

    //矢量地图编辑器
    'editorName':"矢量地图编辑器",
    'layerList':"图层列表",
    'point':"点图层",
    'line':"线图层",
    'region':"面图层",
    'text':"文本图层",
    'advanceSetting':"高级设置",
    'hideAdvanceSetting':"隐藏",
    "hideEditor":"隐藏编辑器",
    "showEditor":"打开编辑器",
    "closeEditor":"关闭编辑器",
    //point
    'pointFileLabel':"点图片地址",
    'pointFileTitle':"点符号的图片的完整URL地址",
    'pointFillLabel':"矢量点填充色",
    'pointFillTitle':"矢量点符号的填充颜色值",
    'pointRadiusLabel':"矢量点半径",
    'pointRadiusTitle':"矢量点的半径",
    'pointHaloRadiusLabel':"矢量点边界宽度",
    'pointHaloRadiusTitle':"矢量点的边界宽度",
    'pointHaloColorLabel':"矢量点边界颜色值",
    'pointHaloColorTitle':"矢量点边界颜色值",
    'pointDxLabel':"横向偏移值",
    'pointDxTitle':"点符号的横向偏移值",
    'pointDyLabel':"纵向偏移值",
    'pointDyTitle':"点符号的纵向偏移值",
    'pointOpacityLabel':"透明度",
    'pointOpacityTitle':"点符号的透明度",
    'pointCompOpLabel':"叠加运算方式",
    'pointCompOpTitle':"点与点相互叠加里使用的覆盖或者是异或等运算方式",
    //line
    'lineColorLabel':"线的颜色",
    'lineColorTitle':"线的填充颜色",
    'lineOpacityLabel':"线透明度",
    'lineOpacityTitle':"线的透明度",
    'lineWidthLabel':"线宽",
    'lineWidthTitle':"线的宽度值",
    'lineCapLabel':"线帽",
    'lineCapTitle':"线端点的样式",
    'lineJoinLabel':"线连接处样式",
    'lineJoinTitle':"线连接处的样式",
    'lineMiterlimitLabel':"线连接处截留长度",
    'lineMiterlimitTitle':"线连接处截留的长度",
    'lineDashOffsetLabel':"虚线模式的偏移值",
    'lineDashOffsetTitle':"虚线模式的偏移值",
    'lineDasharrayLabel':"虚线的模式",
    'lineDasharrayTitle':"虚线的模式,格式为用逗号隔开的数据，比如:10,15,10,25",
    'lineOffsetLabel':"线偏移值",
    'lineOffsetTitle':"线的偏移值",
    'lineCompOpLabel':"叠加方式",
    'lineCompOpTitle':"线与线之间相互叠加里使用的覆盖或者是异或等运算方式",
    //region
    'polygonFillLabel':"填充色",
    'polygonFillTitle':"面的填充颜色",
    'polygonDxLabel':"横向偏移值",
    'polygonDxTitle':"面的横向偏移值",
    'polygonDyLabel':"纵向偏移值",
    'polygonDyTitle':"面的纵向偏移值",
    'polygonOpacityLabel':"填充透明度",
    'polygonOpacityTitle':"面的透明度",
    'polygonCompOpLabel':"叠加方式",
    'polygonCompOpTitle':"面与面之间相互叠加里使用的覆盖或者是异或等运算方式",
    //text
    'textSizeLabel':"字体大小",
    'textSizeTitle':"字体大小",
    'textFaceNameLabel':"字体",
    'textFaceNameTitle':"字体",
    'textAlignLabel':"水平对齐方式",
    'textAlignTitle':"文本的水平对齐方式",
    'textVerticalAlignmentLabel':"垂直对齐方式",
    'textVerticalAlignmentTitle':"文本的垂直对齐方式",
    'textHaloRadiusLabel':"文本边框宽度",
    'textHaloRadiusTitle':"文本的外围边框的宽度",
    'textHaloColorLabel':"文本边框颜色",
    'textHaloColorTitle':"文本的外围边框的颜色",
    'textFillLabel':"文本颜色",
    'textFillTitle':"文本的颜色值",
    'textOpacityLabel':"透明度",
    'textOpacityTitle':"文本的透明度",
    'textDxLabel':"横向偏移",
    'textDxTitle':"文本的横向偏移值",
    'textDyLabel':"纵向偏移值",
    'textDyTitle':"文本的纵向偏移值",
    'textCompOpLabel':"叠加方式",
    'textCompOpTitle':"文本之间相互叠加里使用的覆盖或者是异或等运算方式",
    'expandingPointContent':"展",
    'volleyPointContent':"齐",
    'rendezvousPointContent':"会",
    'supplyPointContent':"补",
	//symbolAlgo
	'symbolAlgo_17703':"加",
	'symbolAlgo_17704':"急",
	'symbolAlgo_21600':"冲",
	'symbolAlgo_28000_1':"危",
	'symbolAlgo_28000_2':"中",
	'symbolAlgo_28000_3':"轻",
	'symbolAlgo_31304':"慑阻",
	'symbolAlgo_3010301':"调",
	'symbolAlgo_3010303':"出",
	'symbolAlgo_3010304':"协",

    'symbolAlgo_2121505':"火",
    'symbolAlgo_2121506':"墩",
    'symbolAlgo_2121507':"复",
    'symbolAlgo_2121601':"遥",
    'symbolAlgo_2121602':"障",
    'symbolAlgo_30010':"?",
    'symbolAlgo_3001101':"集",
    'symbolAlgo_3001102':"暴",
    'symbolAlgo_3001103':"骚",
    'symbolAlgo_3001104':"私",
    'symbolAlgo_3001105':"盗",
    'symbolAlgo_30020':"水",
    'symbolAlgo_3002001':"震",
    'symbolAlgo_3002004':"火",
    'symbolAlgo_30025':"滞",
    'symbolAlgo_5010301':"调",
    'symbolAlgo_5010303':"出",
    'symbolAlgo_5010304':"协",
    'symbolAlgo_5010401':"JZ",
    'symbolAlgo_5022001':"ZD0",
    'symbolAlgo_5034801':"催",
    "symbolAlgo_60203":"避",
    'symbolAlgo_60301':"爆",
    'symbolAlgo_6030101':"挖",
    'symbolAlgo_6030102':"浇",
    'symbolAlgo_6030103':"砌",
    'symbolAlgo_6030104':"装",
    'symbolAlgo_6030105':"石",
    'symbolAlgo_6030106':"沙",
    'symbolAlgo_6030107':"练",
    'symbolAlgo_60304':"隧",

    'symbolAlgo_3002501':"踏",
    'symbolAlgo_30026':"灾",
    'symbolAlgo_40104':"缉",
    'symbolAlgo_4030301':"标",
    'symbolAlgo_4030302':"劝",
    'symbolAlgo_4030303':"疏",
    'symbolAlgo_40304':"警",
    'symbolAlgo_4030401':"警",

    //basic symbol
    'polyLine':"折线",
    'parallelogram':"平行四边形",
    'circle':"圆",
    'ellipse':"椭圆",
    'annotation':"注记",
    'regularPolygon':"正多边形",
    'polygon':"多边形",
    'bezier':"贝塞尔曲线",
    'closedBesselCurve':"闭合贝塞尔曲线",
    'kidney':"集结地",
    'brace':"大括号",
    'trapezoid':"梯形",
    'rectangle':"矩形",
    'chord':"弓形",
    'sector':"扇形",
    'arc':"弧线",
    'parallel':"平行线",
    'annoframe':"注记指示框",
    'tooltipBoxM':"多角标注框",
    'runway':"跑道线",
    'curveEight':"八字形",
    'arrowLine':"箭头线",
    'pathText':"沿线注记",
    'concentricCircle':"同心圆",
    'combinedCircle':"组合圆",
    'freeCurve':"自由线",
    'nodeChain':"节点链",
    'lineMarking':"线型标注",
    'symbolTextBox':"标注框",
    'picture': "图片",
    'editableContentBox':'可编辑注记框',
    'wire': '铁丝网',

    'parallelFlatArrow':"平行平耳箭头",
    'multipleArrow':"多箭头",
    'trapezoidalFlatArrow':"梯形平耳箭头",
    'besselPointArrow':"贝塞尔尖耳箭头",
    'besselArrow':"普通贝塞尔箭头",
    'doubleArrow':"钳击箭头",
    'brokenSpaceTriangleArrow':"折线空三角箭头",
    'besselDovetailArrow':"贝塞尔燕尾箭头",
    'ordinaryLineArrow':"普通折线箭头",
    'besselPointedEarsTailArrow':"贝塞尔尖耳燕尾箭头",
    'besselTipArrow':"贝塞尔尖耳单点箭头",
    'besselArrowNoGraph':"普通贝塞尔箭头(不随图)",
    'brokenSpaceTriangleArrowNoGraph':"折线空三角箭头(不随图)",
    'besselPointedEarsTailArrowNoGraph':"贝塞尔尖耳燕尾箭头(不随图)",
    'ordinaryLineArrowNoGraph':"普通折线箭头(不随图)",
    'combianationArrow':"组合箭头",
    'symbolAlgo_311':'进攻方向',
    'symbolAlgo_317':'钳击',

    //new obj
    'airDeployment':"空军兵力部署",
    'airRoute':"空军航线",
    'arcRegion':"扇形区域",
    'flagGroup':"多旗",
    'lineRelation':"对象间连线",
    'polygonRegion':"多边形区域管理",
    'navyRoute':"海军航线",
    'missileRoute':"导弹航线",
    'navyDeployment':"海军兵力部署",
    'satelliteTimeWindows':"卫星可见时间窗",
    'satellite':"卫星",
    'symbolText':"对象标注",
    'symbolText1':"对象标注(带指示线)",
    'interferenceBeam':"干扰波束",
    'groupObject':"组合对象",

    //routeNodeTypeName
    'RENDEZVOUS': "会合点",
    'EXPANDING': "展开点",
    'VOLLEY': "齐射点",
    'STANDBY': "待机点",
    'SUPPLY': "补给点",
    'TAKEOFF': "起飞点",
    'INITIAL': "初始点",
    'VISUALINITAL': "可视初始点",
    'LANCH': "发射点",
    'TURNING': "转弯点",
    'AIMING': "瞄准点",
    'COMMONROUTE': "普通航路点",
    'WEAPONLAUNCH': "武器发射点",
    'TARGET': "目标点",
    'ATTACK':"攻击点",
    'SUPPRESS':"压制点",
    'EIGHTSPIRAL':"八字盘旋点",
    'HAPPYVALLEY':"跑马圈点",
    'LITERATESIGN':"标牌文字",
    'textContent':"请输入文本",

    'undoStackOverflow': '撤销的栈溢出',

    //Mapviewer
    'noContent':'无内容',
    'lableTitle': '_标签图层'

};
