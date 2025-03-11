/**
 * @requires SuperMap.Feature.Theme.js
 * @requires SuperMap.Feature.Theme.Graph.js
 *
 */

/**
 * Class: SuperMap.Feature.Theme.Circle
 * 圆
 *
 * 符号 Circle 配置对象 symbolSetting（<SuperMap.Layer.RankSymbol::setting>） 可设属性如下：
 *
 * Symbolizer properties:
 * codomain - {Array{Number}} 图表允许展示的数据值域，长度为 2 的一维数组，第一个元素表示值域下限，第二个元素表示值域上限，必设参数。
 * maxR - {Number} 圆形的最大半径。
 * minR - {Number} 圆形的最小半径。
 * fillColor - {String} 圆形的填充色，如：fillColor: "#FFB980"。
 * circleStyle - {Object} 圆形的基础 style，此参数控制圆形基础样式，优先级低于 circleStyleByFields 和 circleStyleByCodomain。
 * decimalNumber - {Number} 数据值数组 dataValues 元素值小数位数，数据的小数位处理参数，取值范围：[0, 16]。如果不设置此参数，在取数据值时不对数据做小数位处理。
 * circleHoverStyle - {Object} 圆 形 hover 状态时的样式，circleHoverAble 为 true 时有效。
 * circleHoverAble - {Object} 是否允许圆形使用 hover 状态，默认允许。同时设置 circleHoverAble 和 circleClickAble 为 false，可以直接屏蔽图形对专题图层事件的响应。
 * circleClickAble - {Object} 是否允许圆形被点击，默认允许。同时设置 circleHoverAble 和 circleClickAble 为 false，可以直接屏蔽图形对专题图层事件的响应。
 *
 * Inherits:
 *  - <SuperMap.Feature.Theme.RankSymbol>
 */
SuperMap.Feature.Theme.Circle = SuperMap.Class(SuperMap.Feature.Theme.RankSymbol, {

    /**
     * Constructor: SuperMap.Feature.Theme.Circle
     * 创建一个圆形。
     *
     * Parameters:
     * data - {<SuperMap.Feature.Vector>}  用户数据，必设参数。
     * layer - {<SuperMap.Layer.RankSymbol>} 此专题要素所在图层，必设参数。
     * fields - {Array{String}} data 中的参与此图表生成的字段名称，必设参数。
     * setting - {Object} 图表配置对象，必设参数。
     * lonlat - {<SuperMap.LonLat>} 专题要素地理位置。默认为 data 指代的地理要素 Bounds 中心。
     *
     * Returns:
     * {<SuperMap.Feature.Theme.Circle>} 返回一个圆图。
     */
    initialize: function(data, layer, fields, setting, lonlat) {
        SuperMap.Feature.Theme.RankSymbol.prototype.initialize.apply(this, arguments);
    },

    /**
     * APIMethod: destroy
     * 销毁此专题要素。调用 destroy 后此对象所以属性置为 null。
     */
    destroy: function() {
        SuperMap.Feature.Theme.Graph.prototype.destroy.apply(this, arguments);
    },

    //装配图形（扩展接口）
    assembleShapes: function(){
        //默认填充颜色
        var defaultFillColor = "#ff9277";

        // setting 属性是否已成功赋值
        if(!this.setting) return false;
        var sets = this.setting;
        // 检测 setting 的必设参数
        if(!(sets.codomain)) return false;

        // 数据
        var decimalNumber = (typeof(sets.decimalNumber) !== "undefined" && !isNaN(sets.decimalNumber))? sets.decimalNumber: -1;
        var dataEffective = SuperMap.Feature.Theme.getDataValues(this.data, this.fields, decimalNumber);
        this.dataValues = dataEffective? dataEffective: [];

        // 数据值数组
        var fv = this.dataValues;
        //if(fv.length != 1) return;       // 没有数据 或者数据不唯一
        //if(fv[0] < 0) return;            //数据为负值

        //用户应该定义最大 最小半径  默认最大半径MaxR:100 最小半径MinR:0;
        if(!sets.maxR) sets.maxR = 100;
        if(!sets.minR) sets.minR = 0;

        // 值域范围
        var codomain = this.DVBCodomain;

        // 重要步骤：定义Circle数据视图框中单位值的含义，单位值：1所代表的长度
        // 用户定义了值域范围
        if(codomain && codomain[1] - codomain[0] > 0){
            this.DVBUnitValue = sets.maxR/(codomain[1] - codomain[0]);
        }
        else{
            this.DVBUnitValue = sets.maxR/maxValue;
        }

        var uv = this.DVBUnitValue;
        //圆半径
        var r = fv[0]*uv + sets.minR;
        this.width = 2*r;
        this.height = 2*r;

        // 重要步骤：初始化参数
        if(!this.initBaseParameter()) return;

        //假如用户设置了值域范围 没有在值域范围直接返回
        if(codomain){
            if(fv[0] < codomain[0] || fv[0] > codomain[1]) { return; }
        }

        var dvbCenter = this.DVBCenterPoint;        // 数据视图框中心作为圆心

        //圆形对象参数
        var circleSP = new SuperMap.Feature.ShapeParameters.Circle(dvbCenter[0],dvbCenter[1],r);

        //circleSP.sytle 初始化
        circleSP.style = SuperMap.Feature.ShapeFactory.ShapeStyleTool(null,sets.circleStyle,null,null,0);
        //图形的填充颜色
        if(typeof (sets.fillColor) !== "undefined"){
            //用户自定义
            circleSP.style.fillColor = sets.fillColor;
        }else{
            //当前默认
            circleSP.style.fillColor = defaultFillColor;
        }
        //圆形 Hover样式
        circleSP.highlightStyle = SuperMap.Feature.ShapeFactory.ShapeStyleTool(null,sets.circleHoverStyle);
        //圆形 Hover 与 click 设置
        if(typeof(sets.circleHoverAble) !== "undefined"){
            circleSP.hoverable = sets.circleHoverAble;
        }
        if(typeof(sets.circleClickAble) !== "undefined"){
            circleSP.clickable = sets.circleClickAble;
        }

        //图形携带的数据信息
        circleSP.refDataID = this.data.id;
        circleSP.dataInfo = {
            field: this.fields[0],
            r: r,
            value: fv[0]
        };

        // 创建扇形并把此扇形添加到图表图形数组
        this.shapes.push(this.shapeFactory.createShape(circleSP));

        // 重要步骤：将图形转为由相对坐标表示的图形，以便在地图平移缩放过程中快速重绘图形
        // （统计专题图模块从结构上要求使用相对坐标，assembleShapes() 函数必须在图形装配完成后调用 shapesConvertToRelativeCoordinate() 函数）
        this.shapesConvertToRelativeCoordinate();
    },

    CLASS_NAME: "SuperMap.Feature.Theme.Circle"
});
