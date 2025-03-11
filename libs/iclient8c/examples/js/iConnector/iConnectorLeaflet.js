/**
 * Created with JetBrains WebStorm.
 * User: liuyayun
 * Date: 13-5-27
 * Time: 下午3:06
 * To change this template use File | Settings | File Templates.
 */
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
 * Leaflet适配器类
 * @constructor
 */
SuperMap.Web.iConnector.Leaflet = function(){

}
/**
 *  APIMethod:
 *  创建Leaflet的图层L.tileLayer.canvas，这里的图层中切片的来源为iserver服务器（支持3857的地图和4326的地图）
 *  (start code)
 *  //新建map
 *   map = L.map('map',{
 *            center: [0, 0],
 *             zoom:2,
 *           crs:L.CRS.EPSG4326   //定义坐标参考系统
 *    });
 * //使用下面的方法将图层添加到map
 * var  tileLayer=   SuperMap.Web.iConnector.Leaflet.getLayer(url,{projection:"4326"});
 * tileLayer.addTo(map);
 * (end)
 * @param url  {String}  地图服务的url地址，如：“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options 可选的参数
 * transparent - {Boolean} 设置切片是否透明，默认为true
 * cacheEnabled - {Boolean} 设置是否使用缓存，默认为false
 * layersID - {String} 设置临时图层的id，一般用于专题图的叠加使用
 * projection-{String}设置图层的投影系，可设置为"3857"或者"4326"，默认为"3857"
 * @returns {Object} 返回Leaflet的扩展图层对象
 */
SuperMap.Web.iConnector.Leaflet.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }
    var layer = L.tileLayer.canvas();
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
    //如果有projection，并且只能是4326或者3857的地图。
    var projection="3857";
    if(options&&options.projection){
        if(options.projection==="4326"){
            projection="4326";
        }
    }
    layerUrl+="&projection="+projection;
    //计算分辨率和比例尺
    var resLen = 17;
    var resStart = 0;
    var resolutions=[];
    var dpi = 95.99999999999984;
    var scales=[];

    if(projection==="3857"){
        for(var i=resStart;i<=resLen;i++){
            var res3857 = 156543.0339/Math.pow(2,i);
            resolutions.push(res3857);
            var scale3857 = 0.0254/dpi/res3857;
            scales.push(scale3857);
        }
        layer.scales=scales;
    }
    else{
        for(var i=resStart;i<=resLen;i++){
            var res4326 = 1.40625/Math.pow(2,i);
            resolutions.push(res4326);
            var scale4326 = 0.0254*360/dpi/res4326/Math.PI/2/6378137;
            scales.push(scale4326);
        }
        layer.scales=scales;
    }

    layer.url = layerUrl;

    layer.drawTile = function(canvas, tilePoint, zoom){

        var ctx = canvas.getContext('2d');
        var x = tilePoint.x;
        var y = tilePoint.y;
        var po = Math.pow(2,zoom);

         x-=po/2;
         y=po/2-y-1;
         //使用bounds出图（也可以使用center）
         var left = x*256*resolutions[ zoom];
         var bottom = y*256*resolutions[zoom];
         var right = (x + 1)*256*resolutions[zoom];
         var top = (y + 1)*256*resolutions[zoom];
         //将bounds组合到url里面
         tileUrl =this.url + "&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";

         tileUrl +="&scale=" +scales[zoom];
         var epsg=projection==="3857"?3857:4326;
         tileUrl += "&prjCoordSys={\"epsgCode\":"+epsg+"}";
         this.preImage(tileUrl,function(){
         ctx.drawImage(this,0,0,256,256);
         });
    }
    layer.preImage = function(url,callback){
        var img = new Image(); //创建一个Image对象，实现图片的预下载
        img.src = url;

        if (img.complete) { // 如果图片已经存在于浏览器缓存，直接调用回调函数
            callback.call(img);
            return; // 直接返回，不用再处理onload事件
        }

        img.onload = function () { //图片下载完毕时异步调用callback函数。
            callback.call(img);//将回调函数的this替换为Image对象
        };
    }
    return layer;
}
/**
 * APIMethod:
 * 将其他坐标系下的点转换为Leaflet的点
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
 *                          new L.LatLng(39.9,116.38),
 *                          new L.LatLng(39.9,116.35)
 *                          ];
 * @param projection  {SuperMap.Projection} 待转换点的投影系（数组里面的所有点投影系都必须是统一的），默认为4326.
 * @returns {Array} 返回L.LatLng对象的数组
 */
SuperMap.Web.iConnector.Leaflet.transferPoint = function(array,projection){
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
            //支持leaflet的L.LatLng的形式
            else if(array[i].lat != undefined && array[i].lng != undefined)
            {
                //首先转换为标准4326的坐标
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].lng,array[i].lat),projection,new SuperMap.Projection("EPSG:4326"));

            }
            var traPoint = SuperMap.Web.iConnector.Leaflet.transfer(smPoint.x,smPoint.y);
            var point = new L.LatLng(traPoint.lat,traPoint.lng);
            points.push(point);
        }
        return points;
    }
}
/**
 * APIMethod:
 * 将其他坐标系下的线数组转换为leaflet支持的线数组
 * @param array 线数组，支持两种形式
 * 1、var lines = [new SuperMap.Geometry.LineString(
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          )];
 * 2、var lines = [new L.Polyline(
 *                              [
 *                                  new L.LatLng(39.9,116.38),
 *                                  new L.LatLng(39.4,116.38)
 *                              ]
 *                          )];
 * @param projection  {SuperMap.Projection} 需要转换的线的坐标系
 * @returns {Array} 返回L.Polyline对象的数组
 */
SuperMap.Web.iConnector.Leaflet.transferLine = function(array,projection){
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
                var points = SuperMap.Web.iConnector.Leaflet.transferPoint(array[i].components,pro);
                line = new L.Polyline(points);
            }
            //支持L.Polyline的对象
            else if(array[i].constructor == L.Polyline)
            {
                var points = SuperMap.Web.iConnector.Leaflet.transferPoint(array[i].getLatLngs(),pro);
                line = new L.Polyline(points);
            }

            lines.push(line);
        }
        return lines;
    }
}
/**
 * APIMethod:
 * 将其他坐标系下的多边形数组转换为leaflet支持的多边形数组
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
 * 2、var polygons = [new L.Polygon(
 *                                  [
 *                                      new L.LatLng(39.90762965106183,116.3786889372559),
 *                                      new L.LatLng(39.90795884517671,116.38632786853032),
 *                                      new L.LatLng(39.897432133833574,116.38534009082035),
 *                                      new L.LatLng(39.89789300648029,116.37624058825688)
 *                                  ]
 *                          )];
 * @param projection {SuperMap.Projection} 需要转换的多边形的坐标系
 * @returns {Array} 返回L.Polygon对象的数组
 */
SuperMap.Web.iConnector.Leaflet.transferPolygon = function(array,projection){
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
                var points = SuperMap.Web.iConnector.Leaflet.transferPoint(array[i].getVertices(false),pro);
                polygon = new L.Polygon(points);
            }

            //支持TPolyline的对象
            else if(array[i].constructor  == L.Polygon)
            {
                var points = SuperMap.Web.iConnector.Leaflet.transferPoint(array[i].getLatLngs(),pro);
                polygon = new L.Polygon(points);
            }

            polygons.push(polygon);
        }
        return polygons;
    }
}
/**
 * APIMethod:
 * 数据纠偏方法，未实现。
 * 由于底图和数据都存在标准和偏移的情况，当用户的底图和数据都是标准或者偏移的，那不需要实现此方法，如果不一致需要用户实现两者之间的转换
 * 当用户需要纠偏时，则需要覆盖此方法，内部每次转换前会调用此方法，将待转换的经度坐标和纬度坐标传进来，通过用户的方式实现纠偏后按照形如
 * {lng:116.4,lat:39.4}的格式返回即可
 *
 * @param lng {Number} 需要纠偏的经度坐标
 * @param lat {Number} 需要纠偏的纬度坐标
 * @returns {Object} 返回一个Object对象，如：{lng:116.4,lat:39.4}
 */
SuperMap.Web.iConnector.Leaflet.transfer = function(lng,lat){
    return {lng:lng,lat:lat};
}
