
/**
 * @requires SuperMap/Layer/CanvasLayer.js
 * @requires SuperMap/Layer/Grid.js
 * @requires SuperMap/Tile/Image.js
 */

/**
 * Class: SuperMap.Layer.Tianditu
 * 天地图服务图层类。
 *     用于显示天地图的地图服务，使用<SuperMap.Layer.Tianditu>的
 *     构造函数可以创建天地图图层，更多信息查看：
 *
 * Inherits from:
 *  - <SuperMap.Layer.CanvasLayer>
 */
SuperMap.Layer.Tianditu = SuperMap.Class(SuperMap.CanvasLayer, {

    /**
     * APIProperty: layerType
     * {String} 图层类型.(vec:矢量图层，img:影像图层，ter:地形图层)
     */
    layerType:"vec",    //(vec:矢量图层，cva:矢量标签图层，img:影像图层,cia:影像标签图层，ter:地形,cta:地形标签图层)

    /**
     * APIProperty: isLabel
     * {Boolean} 是否是标签图层.
     */
    isLabel:false,

    /**
     * Property: attribution
     * {String} The layer attribution.
     */
    attribution: "Data by <a style='white-space: nowrap' target='_blank' href='http://www.tianditu.com'>Tianditu</a>",

    /**
     * Property: url
     * {String} 图片url.
     */
    url:"http://t${num}.tianditu.com/DataServer?T=${type}_${proj}&x=${x}&y=${y}&l=${z}",

    //cva_url:"http://t${num}.tianditu.com/DataServer?T=cva_${proj}&x=${x}&y=${y}&l=${z}",

    /**
     * Property: zOffset
     * {Number} 图片url中z值偏移量
     */
    zOffset:1,

    /**
     * APIProperty: dpi
     * {Float} 屏幕上每英寸包含像素点的个数。
     * 该参数结合图层比例尺可以推算出该比例尺下图层的分辨率.默认为96。
     */
    dpi: 96,

    /**
     * Constructor: SuperMap.Layer.Tianditu
     * 创建天地图图层
     *
     * Example:
     * (code)
     * var tiandituLayer = new SuperMap.Layer.Tianditu();
     * (end)
     */
    initialize: function (options) {
        var me = this;
        me.name = "Tianditu";

//        options = SuperMap.Util.extend({
//            maxExtent: new SuperMap.Bounds(
//                minX, minY, maxX, maxY
//            ),
//            tileOrigin:new SuperMap.LonLat(minX, maxY),
//            //maxResolution:maxResolution,
//            //minResolution:minResolution,
//            resolutions:resolutions,
//            units:me.units,
//            projection:me.projection
//        }, options);
        SuperMap.CanvasLayer.prototype.initialize.apply(me, [me.name, me.url, null, options]);
    },

    /**
     * APIMethod: clone
     * 创建当前图层的副本。
     *
     * Parameters:
     * obj - {Object}
     *
     * Returns:
     * {<SuperMap.Layer.Tianditu>}  新的图层。
     */
    clone: function (obj) {
        var me = this;
        if (obj == null) {
            obj = new SuperMap.Layer.Tianditu(
                me.name, me.url, me.params, me.getOptions());
        }

        obj = SuperMap.CanvasLayer.prototype.clone.apply(me, [obj]);
        obj._timeoutId = null;

        return obj;
    },

    /**
     * Method: getTileUrl
     * 获取每个tile的图片url
     *
     * Parameters:
     * xyz - {Object}
     */
    getTileUrl:function(xyz){
        var me = this;
        url = me.url;

        var proj = this.projection;
        if(proj.getCode){
            proj = proj.getCode();
        }

        if(proj=="EPSG:4326"){
            var proj = "c"
        }
        else{
            var proj = "w";
        }

        var x = xyz.x;
        var y = xyz.y;

        var z = xyz.z+me.zOffset;
        var num = Math.abs((xyz.x + xyz.y) % 7);

        var lt = this.layerType;
        if(this.isLabel){
            if(this.layerType=="vec")lt="cva"
            if(this.layerType=="img")lt="cia"
            if(this.layerType=="ter")lt="cta"
        }

        url = SuperMap.String.format(url, {
            num: num,
            x: x,
            y: y,
            z: z,
            proj:proj,
            type:lt
        });
        return url;
    },

    /**
     * Method: setMap
     * Set the map property for the layer. This is done through an accessor
     *     so that subclasses can override this and take special action once
     *     they have their map variable set.
     *
     *     Here we take care to bring over any of the necessary default
     *     properties from the map.
     *
     * Parameters:
     * map - {<SuperMap.Map>}
     */
    setMap: function(map) {
        SuperMap.CanvasLayer.prototype.setMap.apply(this, [map]);
        var proCode = null;
        var proj = this.projection||map.projection;
        if(proj){
            if(proj.getCode){
                proCode = proj.getCode();
            }
            else{
                proCode = proj;
            }
        }
        this.setTiandituParam(proCode);
    },

    /**
     * Method: setTiandituParam
     * 设置出图相关参数
     *
     * Parameters:
     * projection - {String} 投影坐标系
     */
    setTiandituParam:function(projection){
        var lt = this.layerType;
        if(lt=="vec"){
            var resLen = 17;
            var resStart = 0;
            this.zOffset = 1;
            this.numZoomLevels = 17;
        }
        else if(lt=="img"){
            var resLen = 17;
            var resStart = 0;
            this.zOffset = 1;
            this.numZoomLevels = 17;
        }
        else if(lt=="ter"){
            var resLen = 13;
            var resStart = 0;
            this.zOffset = 1;
            this.numZoomLevels = 13;
        }
        if(projection=="EPSG:4326"){
            var minX = -180;
            var minY = -90;
            var maxX= 180;
            var maxY= 90;

            //var maxResolution = 156543.0339;
            //var minResolution = 0.5971642833709717;

            var resolutions = [];
            for(var i=resStart;i<resLen;i++){
                resolutions.push(1.40625/2/Math.pow(2,i));
            }

            this.units = "degree";
            this.projection = new SuperMap.Projection("EPSG:4326");

            this.maxExtent=new SuperMap.Bounds(
                minX, minY, maxX, maxY
            );
            this.tileOrigin = new SuperMap.LonLat(minX, maxY);
            this.resolutions = resolutions;
        }
        else{
            var minX = -20037508.3392;
            var minY = -20037508.3392;
            var maxX= 20037508.3392;
            var maxY= 20037508.3392;

            //var maxResolution = 156543.0339;
            //var minResolution = 0.5971642833709717;

            var resolutions = [];
            for(var i=resStart;i<resLen;i++){
                resolutions.push(156543.0339/2/Math.pow(2,i));
            }
            //this.numZoomLevels = 18;

            this.units = "m";
            this.projection = new SuperMap.Projection("EPSG:3857");

            this.maxExtent=new SuperMap.Bounds(
                minX, minY, maxX, maxY
            );
            this.tileOrigin = new SuperMap.LonLat(minX, maxY);
            this.resolutions = resolutions;
        }
    },

    CLASS_NAME: 'SuperMap.Layer.Tianditu'
});