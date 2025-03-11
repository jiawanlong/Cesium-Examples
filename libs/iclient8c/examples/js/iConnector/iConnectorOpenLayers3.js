//判定一下是否存在了SuperMap.Web，如果没有则初始化一个
if(SuperMap.Web == undefined )
{
    SuperMap.Web = new Object();
}
//判定一下是否存在了SuperMap.Web.iConnector，如果没有则初始化一个
if(SuperMap.Web.iConnector == undefined )
{
    SuperMap.Web.iConnector = new Object();
}
/**
 * Class:
 * OpenLayers3适配器类
 * @constructor
 */
SuperMap.Web.iConnector.OpenLayers3 = function(){

}
/**
 *  APIMethod:
 *  创建OpenLayers3的图层new ol.Layer.Tile，这里的图层中切片的来源为iserver服务器（支持3857的地图和4326的地图）
 * @param url  {String}  地图服务的url地址，如：“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options 可选的参数
 * transparent - {Boolean} 设置切片是否透明，默认为true
 * cacheEnabled - {Boolean} 设置是否使用缓存，默认为false
 * layersID - {String} 设置临时图层的id，一般用于专题图的叠加使用
 * @returns {Object} 返回OpenLayers3的扩展图层对象
 */
SuperMap.Web.iConnector.OpenLayers3.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }
    var tileLayer= new ol.layer.Tile({
        source:getSource()
    });
    var layerUrl = url + "/image.png?redirect=false&width=256&height=256";

    //切片是否透明
    var transparent = true;
    if(options && options.transparent !=undefined)
    {
        transparent = options.transparent;
    }
    layerUrl += "&transparent=" + transparent;

    //是否使用缓存
    var cacheEnabled = false;
    if(options && options.cacheEnabled !=undefined)
    {
        cacheEnabled = options.cacheEnabled;
    }
    layerUrl += "&cacheEnabled=" + cacheEnabled;

    //如果有layersID，则是在使用专题图
    if(options && options.layersID !=undefined)
    {
        layerUrl += "&layersID=" +options.layersID;
    }
    //如果有pro，并且只能是4326或者3857的地图。
    var pro="3857";
    if(options&&options.pro){
        if(options.pro==="4326"){
            pro="4326";
        }
    }
    layerUrl+="&projection="+pro;
    //计算分辨率和比例尺
    var resLen = 17;
    var resStart = 0;
    var dpi = 95.99999999999984;
    var scales3857=[];
    var scales4326=[];
    var resolutions3857=[];
    var resolutions4326=[];

    for(var i=resStart;i<=resLen;i++){
        var res3857 = 156543.0339/Math.pow(2,i);

        resolutions3857.push(res3857);

        var scale3857 = 0.0254/dpi/res3857;
        scales3857.push(scale3857);
    }
    tileLayer.scales=scales3857;


    for(var i=resStart;i<=resLen;i++){
        var res4326 = 1.40625/Math.pow(2,i);
        resolutions4326.push(res4326);

        var scale4326 = 0.0254*360/dpi/res4326/Math.PI/2/6378137;
        scales4326.push(scale4326);
    }
    tileLayer.scales=scales4326;

    function getSource(){

        var tileUrl;
        var source= new ol.source.TileImage({
            tileUrlFunction:function(tileCoord, pixelRatio, projection){
                var z=tileCoord[0], x= tileCoord[1],y =tileCoord[2];
                if(pro==="3857"){
                    x-= Math.pow(2,z-1);
                    y+=Math.pow(2,z-1);
                    var left = x*256*resolutions3857[z];
                    var bottom = y*256*resolutions3857[z];
                    var right = (x + 1)*256*resolutions3857[z];
                    var top = (y+1)*256*resolutions3857[z];
                    tileUrl  = layerUrl+"&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";
                    tileUrl +="&scale=" +scales3857[z];

                }
                else if(pro==="4326"){
                    x-= Math.pow(2,z-1);
                    y+=Math.pow(2,z-1);
                    var left = x*256*resolutions4326[z];
                    var bottom = y*256*resolutions4326[z];
                    var right = (x + 1)*256*resolutions4326[z];
                    var top = (y+1)*256*resolutions4326[z];
                    tileUrl  = layerUrl+"&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";
                    tileUrl +="&scale=" +scales4326[z];

                }
                var epsg=pro==="3857"?3857:4326;
                tileUrl += "&prjCoordSys={\"epsgCode\":"+epsg+"}";
                return tileUrl;
            }
        });
        return  source;
    }
    return tileLayer;
}
/**
 * APIMethod:
 * 将其他坐标系下的点转换为OpenLayers3的点
 * @param array 点数组，支持四种形式的点：
 * 1、var points = [
 *                          {x:116.1,y:38.9},
 *                          {x:114.1,y:34.1}
 *                          ];
 * 2、var points = [
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          ];
 * 3、var points = [
 *                          new SuperMap.LonLat(116.1,38.9),
 *                          new SuperMap.LonLat(116.1,38.4)
 *                          ];
 * 4、var points = [
 *                          new ol.geom.Point([39.9,116.38]),
 *                          new ol.geom.Point([39.9,116.35])
 *                          ];
 * @param projection  {SuperMap.Projection} 待转换点的投影系（数组里面的所有点投影系都必须是统一的），默认为4326.
 * @returns {Array} 返回ol.geom.Point对象的数组
 */
SuperMap.Web.iConnector.OpenLayers3.transferPoint = function(array,projection){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        var pro = projection || new SuperMap.Projection("EPSG:4326");
        var points = []
        //分几种不同的情况
        for(var i = 0;i<array.length;i++)
        {
            var smPoint;
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.LonLat")
            {
                //首先转换为标准4326的坐标
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].lon,array[i].lat),pro,new SuperMap.Projection("EPSG:4326"));

            }
            //支持{x:118,y:38}和SuperMap.Geometry.Point的形式，因为都存在x和y
            else if(array[i].x != undefined && array[i].y != undefined)
            {
                //首先转换为标准4326的坐标
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].x,array[i].y),pro,new SuperMap.Projection("EPSG:4326"));

            }
            //支持OpenLayers3的LatLng的形式
            else if(array[i].lat != undefined && array[i].lng != undefined)
            {
                //首先转换为标准4326的坐标
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].lng,array[i].lat),projection,new SuperMap.Projection("EPSG:4326"));

            }
            var point = new ol.geom.Point([smPoint.x,smPoint.y]);
            points.push(point);
        }
        return points;
    }
}
/**
 * APIMethod:
 * 将其他坐标系下的线数组转换为OpenLayers3支持的线数组
 * @param array 线数组，支持两种形式
 * 1、var lines = [new SuperMap.Geometry.LineString(
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          )];
 * 2、var lines = [new  ol.geom.LineString(  [39.9,116.38],[0,0])];
 *
 *
 * @param projection  {SuperMap.Projection} 需要转换的线的坐标系
 * @returns {Array} 返回LineString对象的数组
 */
SuperMap.Web.iConnector.OpenLayers3.transferLine = function(array,projection){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        var pro = projection || new SuperMap.Projection("EPSG:4326");
        var lines = [];
        //分几种不同的情况，现在只提供两种
        for(var i = 0;i<array.length;i++)
        {
            var line;
            //支持supermap的LineString
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.Geometry.LineString")
            {
                var points = SuperMap.Web.iConnector.OpenLayers3.transferPoint(array[i].components,pro);

                line = new ol.geom.LineString(getcoordinate(points));
            }
            else if(array[i].polygonType != undefined && array[i].getType() == 4)
            {
                var points = SuperMap.Web.iConnector.Tianditu.transferPoint(array[i].getLngLats(),pro);
                line = new ol.geom.LineString(getcoordinate(points));
            }
            lines.push(line);
        }
        return lines;
    }
}
function getcoordinate(points){
    var coordinates=[];
    for(var i=0;i<points.length;i++){
        coordinates.push(points[i].getCoordinates());
    }
    return coordinates;
}

/**
 * APIMethod:
 * 将其他坐标系下的多边形数组转换为OpenLayers3支持的多边形数组
 * @param array 多边形数组，支持两种形式：
 * 1、var polygons = [new SuperMap.Geometry.Polygon(
 *                          [new SuperMap.Geometry.LinearRing(
 *                                  new SuperMap.Geometry.Point(116.3786889372559,39.90762965106183),
 *                                  new SuperMap.Geometry.Point(116.38632786853032,39.90795884517671),
 *                                  new SuperMap.Geometry.Point(116.38534009082035,39.897432133833574),
 *                                  new SuperMap.Geometry.Point(116.37624058825688,39.89789300648029)
 *                                  )
 *                           ]
 *                        )];
 * 2、var polygons = [new ol.geom.Polygon([[39.9,116.38],[0,0],[30.34,110.34]])];
 *
 * @param projection {SuperMap.Projection} 需要转换的多边形的坐标系
 * @returns {Array} 返回Polygon对象的数组
 */
SuperMap.Web.iConnector.OpenLayers3.transferPolygon = function(array,projection){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        var pro = projection || new SuperMap.Projection("EPSG:4326");
        var polygons = [];
        //分几种不同的情况，现在只提供两种
        for(var i = 0;i<array.length;i++)
        {
            var polygon;
            //支持supermap的Polygon
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.Geometry.Polygon")
            {
                var points = SuperMap.Web.iConnector.OpenLayers3.transferPoint(array[i].getVertices(false),pro);
                polygon = new ol.geom.Polygon([getcoordinate(points)]);
            }

            //支持Polygon的对象
            else if(array[i].getType != undefined && array[i].getType() == 5)
            {
                var points = SuperMap.Web.iConnector.OpenLayers3.transferPoint(array[i].getLngLats(),pro);
                polygon = new ol.geom.Polygon([getcoordinate(points)]);
            }

            polygons.push(polygon);
        }
        return polygons;
    }
}
