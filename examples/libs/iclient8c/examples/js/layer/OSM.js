
/**
 * @requires SuperMap/Util.js
 * @requires SuperMap/Layer/CanvasLayer.js
 */

/**
 * Class: SuperMap.Layer.OSM
 *    此图层可以访问OpenStreetMap的地图服务。
 *
 * Inherits from:
 *  - <SuperMap.Layer.CanvasLayer>
 */
SuperMap.Layer.OSM = SuperMap.Class(SuperMap.CanvasLayer, {

    /**
     * APIProperty: name
     * {String}图层名称，默认为“OpenStreetMap”，防止初始化时未设置图层名
     *
     */
    name: "OpenStreetMap",

    /**
     * Property: url
     * {String}默认的OpenStreetMap的三个服务器地址，不需要要用户设置
     */
    url: [
        'http://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'http://b.tile.openstreetmap.org/${z}/${x}/${y}.png',
        'http://c.tile.openstreetmap.org/${z}/${x}/${y}.png'
    ],

    /**
     * Property: attribution
     * {String} The layer attribution.
     */
    attribution: "Data CC-By-SA by <a style='white-space: nowrap' target='_blank' href='http://openstreetmap.org/'>OpenStreetMap</a>",

    /**
     * Constructor: SuperMap.Layer.OSM
     * 创建OSM图层，可以浏览OpenStreetMap地图
     * Example:
     * (code)
     *
     * var osm = new SuperMap.Layer.OSM("MyName");
     *                                    
     * (end)
     *
     *  默认为墨卡托投影，所以当需要地图定位以及添加元素在地图上时都需要坐标转换
     * Example:
     * (code)
     *
     * var markers = new SuperMap.Layer.Markers( "Markers" );
     * map.addLayer(markers);
     * var size = new SuperMap.Size(21,25);
     * var offset = new SuperMap.Pixel(-(size.w/2), -size.h);
     * var icon = new SuperMap.Icon('图片地址', size, offset);
     * markers.addMarker(new SuperMap.Marker(new SuperMap.LonLat(118,40 ).transform(
     * new SuperMap.Projection("EPSG:4326"),
     * map.getProjectionObject()),icon));
     *
     * (end)
     * Parameters:
     * name - {String} 图层名称
     */
    initialize: function(name, options) {
        options = SuperMap.Util.extend({
            projection: "EPSG:3857",
            numZoomLevels: 20
        }, options);
        SuperMap.CanvasLayer.prototype.initialize.apply(this,[name,this.url,{},options] );
    },

    /**
     * Method: clone
     */
    clone: function(obj) {
        if (obj == null) {
            obj = new SuperMap.Layer.OSM(
                this.name, this.url, this.getOptions());
        }
        obj = SuperMap.CanvasLayer.prototype.clone.apply(this, [obj]);
        return obj;
    },

    /**
     * APIMethod: destroy
     * 解构OSM类，释放资源。
     */
    destroy: function () {
        var me = this;
        SuperMap.CanvasLayer.prototype.destroy.apply(me, arguments);
    },
    /**
     * Method: getTileUrl
     * 获取瓦片的URL。
     *
     * Parameters:
     * xyz - {Object} 一组键值对，表示瓦片X, Y, Z方向上的索引。
     *
     * Returns
     * {String} 瓦片的 URL 。
     */
    getTileUrl: function (xyz) {
        var me = this,  url;

        if (SuperMap.Util.isArray(this.url)) {

            url = me.selectUrl(xyz, this.url);
        }
        url= SuperMap.String.format(url, {
            x: xyz.x,
            y: xyz.y,
            z: xyz.z
        });
        return  url;
    },
    /**
     * Method: selectUrl
     * 通过某种方式实现在一组url数组中选出合理的url
     * Parameters:
     * xyz - {Object} 一组键值对，表示瓦片X, Y, Z方向上的索引。
     * urls - {Array(String)} url数组
     *
     * Returns:
     * {String} 一个合理的url，主要用于出图访问多个服务器，提高效率
     */
    selectUrl: function(xyz, urls) {
        var id=Math.abs(xyz.x+xyz.y)%urls.length;
        var url=urls[id];
        return url;
    },
    CLASS_NAME: "SuperMap.Layer.OSM"
});
