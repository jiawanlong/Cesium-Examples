/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

/**
 * @requires SuperMap/Util.js
 * @requires SuperMap/BaseTypes/Bounds.js
 * @requires SuperMap/CanvasLayer.js
 */

/**
 * Class: SuperMap.Layer.Siweidg
 * 云服务图层类。
 *     通过向SuperMap 云服务器发送请求得到 SuperMap 云服务发布的图层。
 *
 * Inherits from:
 *  - <SuperMap.Layer.CanvasLayer>
 */

SuperMap.Layer.Siweidg = SuperMap.Class(SuperMap.CanvasLayer, {

    /**
     * APIProperty: name
     * {String} 图层标识名称，默认为：Siweidg。
     */
    name: "Siweidg",
    
    /**
     * APIProperty: url
     * {String} 地图资源地址。默认为：http://www.isupermap.com/services/map-siweidg/rest/maps/${layerType}/tileImage.png?transparent=true&cacheEnabled=true&width=256&height=256&x=${x}&y=${y}&scale=${scale}
     */
    url: 'http://www.isupermap.com/services/map-siweidg/rest/maps/${layerType}/tileImage.png?transparent=true&cacheEnabled=true&width=256&height=256&x=${x}&y=${y}&scale=${scale}',
    
    /**
     * APIProperty: mapName
     * {String} 地图名称，默认为 siweidg。
     */
    mapName: "siweidg",
        
    /**
     * Property: layerType
     * {String} 地图类型，支持影像（image)，矢量（vector），透明图(transparent)等。
     */
    layerType: "vector",
	
	scales: [1.6901635716026557e-9, 3.3803271432053114e-9, 6.760654286410623e-9, 1.3521308572821245e-8, 2.704261714564249e-8, 5.408523429128498e-8, 1.0817046858256996e-7, 2.1634093716513993e-7, 4.3268187433027985e-7, 8.653637486605597e-7, 0.0000017307274973211194, 0.000003461454994642239, 0.000006922909989284478, 0.000013845819978568955, 0.00002769163995713791, 0.00005538327991427582, 0.00011076655982855164, 0.00022153311965710329, 0.00044306623931420657],

    /**
     * Constructor: SuperMap.Layer.CloudLayer
     * 云服务图层类。
     *
     * Parameters:
	 * layerType - {string} 设置地图类型
     * options - {Object}  附加到图层属性上的可选项。
     */
    initialize: function (options) {
        var me = this;
        //四维地图提供固定范围，比例尺的瓦片信息
        options = SuperMap.Util.extend({
            maxExtent: new SuperMap.Bounds(
                -2.00375083427892E7,
                -2.00375083427892E7,
                2.00375083427892E7,
                2.00375083427892E7
            ),
            //第19级分辨率为0.298817952474，但由于绝大部分城市和地区在此级别都无图，所以暂不增加
//            resolutions: [156605.46875, 78302.734375, 39151.3671875, 19575.68359375, 9787.841796875, 4893.9208984375, 2446.96044921875, 1223.48022460937, 611.740112304687, 305.870056152344, 152.935028076172, 76.4675140380859, 38.233757019043, 19.1168785095215, 9.55843925476074, 4.77921962738037, 2.38960981369019, 1.19480490684509, 0.597402453422546]
            resolutions: [156543.033928041, 78271.5169640203, 39135.7584820102,
                19567.8792410051, 9783.93962050254, 4891.96981025127, 2445.98490512563,
                1222.99245256282, 611.496226281409, 305.748113140704, 152.874056570352,
                76.4370282851761, 38.218514142588, 19.109257071294, 9.55462853564701,
                4.77731426782351, 2.38865713391175, 1.19432856695588, 0.597164283477938]

        }, options);
        SuperMap.CanvasLayer.prototype.initialize.apply(me, [me.name, me.url, null, options]);
        me.units = "meter";
    },
    
    /**
     * APIMethod: destroy
     * 解构CloudLayer类，释放资源。  
     */
    destroy: function () {
        var me = this;
        SuperMap.CanvasLayer.prototype.destroy.apply(me, arguments);
        me.mapName = null;
        me.name = null;
        me.url = null;
    },

    /**
     * APIMethod: clone
     * 创建当前图层的副本。
     *
     * Parameters:
     * obj - {Object} 
     *
     * Returns:
     * {<SuperMap.Layer.CloudLayer>}新的图层。
     */
    clone: function (obj) {
        var me = this;
        if (obj == null) {
            obj = new SuperMap.Layer.CloudLayer(
                me.name, me.url, me.layerName, me.getOptions());
        }
       
        obj = SuperMap.CanvasLayer.prototype.clone.apply(me, [obj]);

        return obj;
    },
    
    /** 
     * Method: getTileUrl
     * 获取瓦片的URL。
     *
     * Parameters:
     * xyz - {Object} 一组键值对，表示瓦片X, Y, Z方向上的索引。
     *
     * Returns
     * {String} 瓦片的 URL。
     */
    getTileUrl: function (xyz) {
        var me = this,
            url = me.url;
        return SuperMap.String.format(url, {
            layerType: me.layerType,
            x: xyz.x,
            y: xyz.y,
            scale: me.scales[xyz.z]
        });
    },

    CLASS_NAME: "SuperMap.Layer.CloudLayer"
});
