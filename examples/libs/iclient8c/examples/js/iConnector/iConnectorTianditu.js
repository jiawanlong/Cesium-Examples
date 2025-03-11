/**
 * Created with JetBrains WebStorm.
 * User: liuyayun
 * Date: 13-5-27
 * Time: 上午9:56
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
 * 天地图适配器类
 * @constructor
 */
SuperMap.Web.iConnector.Tianditu = function(){

}


/**
 *  APIMethod:
 *  创建天地图的TTileLayer，这里的TTileLayer中切片的来源为iserver服务器
 *  当把此layer添加进map后，会从map里获取当前的投影是4326还是3857来动态的出图
 * @param url  {String}  地图服务的url地址，如：“localhost:8090/iserver/services/map-world/rest/maps/World”
 * @param options 可选的参数
 * transparent - {Boolean} 设置切片是否透明，默认为true
 * cacheEnabled - {Boolean} 设置是否使用缓存，默认为false
 * layersID - {String} 设置临时图层的id，一般用于专题图的叠加使用
 * @returns {TTileLayer} 返回天地图的TTileLayer对象
 */
SuperMap.Web.iConnector.Tianditu.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }
    var tileLayer = new TTileLayer();
    var layerUrl = url + "/image.png?redirect=false&width=256&height=256";

    //切片是否透明
    var transparent = true;
    if(options && options.transparent !=undefined)
    {
        transparent = options.transparent;
    }
    layerUrl += "&transparent=" + transparent;

    //是否是否使用缓存
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
    //计算分辨率和比例尺
    var resLen = 17;
    var resStart = 0;
    var resolutions4326 = [];
    var resolutions3857 = [];
    var dpi = 95.99999999999984;
    var scales4326 = [];
    var scales3857 = [];
    for(var i=resStart;i<=resLen;i++){
        var res4326 = 1.40625/Math.pow(2,i);
        resolutions4326.push(res4326);

        var scale4326 = 0.0254*360/dpi/res4326/Math.PI/2/6378137;
        scales4326.push(scale4326);
    }

    tileLayer.scales4326 = scales4326;

    for(var i=resStart;i<=resLen;i++){
        var res3857 = 156543.0339/Math.pow(2,i);
        resolutions3857.push(res3857);

        var scale3857 = 0.0254/dpi/res3857;
        scales3857.push(scale3857);
    }
    tileLayer.scales3857 = scales3857;





    tileLayer.setGetTileUrl(
        function(x,y,z)
        {
            if(this.myProjectionCodeName)
            {}
            else
            {
                //遍历一下tileLayer，需找当前的投影系属性名称
                var ps = this.tmaps;
                for ( var p in ps )
                {
                    if ( typeof ( ps [ p ]) == " function " )
                    {
                    }
                    else
                    { // p 为属性名称，ps[p]为对应属性的值
                        if(ps [ p ] == "EPSG:4326" || ps [ p ] == "EPSG:900913")
                        {
                            this.myProjectionCodeName = p;
                            break;
                        }
                    }
                }
            }


            var tileUrl = layerUrl;

            if(this.tmaps[this.myProjectionCodeName] == "EPSG:4326")
            {
                tileUrl +="&scale=" +this.scales4326[z];
                tileUrl += "&prjCoordSys={\"epsgCode\":4326}";
                var orginX = -180;var orginY = 90;
                //使用center来出图 （也可以使用bounds出图）
                var centerX = orginX + resolutions4326[z]   *x *256  + resolutions4326[z]*128;
                var centerY = orginY-( resolutions4326[z]   *y *256  + resolutions4326[z]*128)       ;
                tileUrl+= "&center={\"x\":" + centerX+",\"y\":" + centerY + "}" ;
                return tileUrl;
            }
            else if(this.tmaps[this.myProjectionCodeName] == "EPSG:900913")
            {
                var po = Math.pow(2,z);
                x-=po/2;
                y=po/2-y-1;
                //使用bounds出图（也可以使用center）
                var left = x*256*resolutions3857[z];
                var bottom = y*256*resolutions3857[z];
                var right = (x + 1)*256*resolutions3857[z];
                var top = (y + 1)*256*resolutions3857[z];
                //将bounds组合到url里面
                tileUrl += "&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";

                tileUrl +="&scale=" +this.scales3857[z];
                tileUrl += "&prjCoordSys={\"epsgCode\":3857}";
            }
            return tileUrl;
        }
    );
    return tileLayer;
}



/**
 * APIMethod:
 * 将其他坐标系下的点转换为天地图的点
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
 *                          new TLngLat(116.38,39.9),
 *                          new TLngLat(116.38,39.9)
 *                          ];
 * @param projection  {SuperMap.Projection} 待转换点的投影系（数组里面的所有点投影系都必须是统一的），默认为4326.
 * @returns {Array} 返回TLngLat对象的数组
 */
SuperMap.Web.iConnector.Tianditu.transferPoint = function(array,projection){
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
            //支持天地图的TLngLat的形式
            else if(array[i].getLng != undefined && array[i].getLat != undefined)
            {
                //首先转换为标准4326的坐标
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].getLng(),array[i].getLat()),projection,new SuperMap.Projection("EPSG:4326"));

            }
            var point = new TLngLat(smPoint.x,smPoint.y);
            points.push(point);
        }
        return points;
    }
}

/**
 * APIMethod:
 * 将其他坐标系下的线数组转换为天地图支持的线数组
 * @param array 线数组，支持两种形式
 * 1、var lines = [new SuperMap.Geometry.LineString(
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          )];
 * 2、var lines = [new TPolyline(
 *                          new TLngLat(116.38,39.9),
 *                          new TLngLat(116.38,39.9)
 *                          )];
 * @param projection  {SuperMap.Projection} 需要转换的线的坐标系
 * @returns {Array} 返回TPolyline对象的数组
 */
SuperMap.Web.iConnector.Tianditu.transferLine = function(array,projection){
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
                var points = SuperMap.Web.iConnector.Tianditu.transferPoint(array[i].components,pro);
                line = new TPolyline(points);
            }
            //支持TPolyline的对象
            else if(array[i].polygonType != undefined && array[i].getType() == 4)
            {
                var points = SuperMap.Web.iConnector.Tianditu.transferPoint(array[i].getLngLats(),pro);
                line = new TPolyline(points);
            }

            lines.push(line);
        }
        return lines;
    }
}

/**
 * APIMethod:
 * 将其他坐标系下的多边形数组转换为天地图支持的多边形数组
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
 * 2、var polygons = [new TPolygon(
 *                                  new TLngLat(116.3786889372559,39.90762965106183),
 *                                  new TLngLat(116.38632786853032,39.90795884517671),
 *                                  new TLngLat(116.38534009082035,39.897432133833574),
 *                                  new TLngLat(116.37624058825688,39.89789300648029)
 *                          )];
 * @param projection {SuperMap.Projection} 需要转换的多边形的坐标系
 * @returns {Array} 返回TPolygon对象的数组
 */
SuperMap.Web.iConnector.Tianditu.transferPolygon = function(array,projection){
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
                var points = SuperMap.Web.iConnector.Tianditu.transferPoint(array[i].getVertices(false),pro);
                polygon = new TPolygon(points);
            }

            //支持TPolyline的对象
            else if(array[i].getType != undefined && array[i].getType() == 5)
            {
                var points = SuperMap.Web.iConnector.Tianditu.transferPoint(array[i].getLngLats(),pro);
                polygon = new TPolygon(points);
            }

            polygons.push(polygon);
        }
        return polygons;
    }
}


