/**
 * Created with JetBrains WebStorm.
 * User: liuyayun
 * Date: 13-5-27
 * Time: 上午10:06
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
 * 百度适配器类
 * @constructor
 */
SuperMap.Web.iConnector.Baidu = function(){

}

/**
 * Method:
 * 加载外部脚本，此处用于发送服务请求
 * @param xyUrl 请求地址
 * @param callback 回调函数
 */
SuperMap.Web.iConnector.Baidu.load_script = function(xyUrl, callback){
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = xyUrl;
    //借鉴了jQuery的script跨域方法
    script.onload = script.onreadystatechange = function(){
        if((!this.readyState || this.readyState === "loaded" || this.readyState === "complete")){
            callback && callback();
            // Handle memory leak in IE
            script.onload = script.onreadystatechange = null;
            if ( head && script.parentNode ) {
                head.removeChild( script );
            }
        }
    };
    // Use insertBefore instead of appendChild  to circumvent an IE6 bug.
    head.insertBefore( script, head.firstChild );
}
/**
 * Property:
 * 记录向百度服务器点坐标转换请求次数，用于服务器处理完成后定位回调函数
 * @type {number} 每请求一次服务器，会自动累加
 */
SuperMap.Web.iConnector.Baidu.eventsCounts = 0;
/**
 * Method:
 * 向百度服务器发送坐标转换请求，一次性最多支持20个点（百度服务器限制的）
 * @param points {Array}百度点BMap.Point数组
 * @param type  {Number} 0代表GPS坐标转百度坐标；2代表google坐标转百度坐标
 * @param id 唯一标示第几批点数组，对应了
 */
SuperMap.Web.iConnector.Baidu.transMore = function(points,type,id){
    var xyUrl = "http://api.map.baidu.com/ag/coord/convert?from=" + type + "&to=4&mode=1";
    var xs = [];
    var ys = [];
    var maxCnt = 20;//每次发送的最大个数，百度服务器一次性最多支持20个点的转换
    var send = function(){
        //一直累加，保证每一次请求后回调函数方便定位
        SuperMap.Web.iConnector.Baidu.eventsCounts++;
        var url = xyUrl + "&x=" + xs.join(",") + "&y=" + ys.join(",") + "&callback=window.SuperMap.Web.iConnector.Baidu.callbackFunction" + SuperMap.Web.iConnector.Baidu.eventsCounts;
        //这里的SuperMap.Web.iConnector.Baidu.eventsCounts肯定每一次都在累加，不一样，但是id可能会一样，点数据分20个的转换，可能会出现一个点数组里面超过20
        //个点，那么就必须分批转换，同属于一个点数组，这样id就会一样，方便他们全部转换完成后组合到一起
        var str = "window.SuperMap.Web.iConnector.Baidu.callbackFunction" +SuperMap.Web.iConnector.Baidu.eventsCounts + "=function(points){SuperMap.Web.iConnector.Baidu.circulatePointSend(points," + type+"," + id+ "); }";
        //动态创建回调函数
        eval(str);
        //动态创建script标签
        SuperMap.Web.iConnector.Baidu.load_script(url);
        xs = [];
        ys = [];
    }
    for(var index in points){
        if(index % maxCnt == 0 && index != 0){
            send();
        }
        xs.push(points[index].lng);
        ys.push(points[index].lat);
        if(index == points.length - 1){
            send();
        }
    }
}

/**
 * APIMethod:
 * 创建百度TileLayer，这里的TileLayer中切片的来源为iserver服务器
 * @param url {String} 地图服务的url地址，如：“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options 可选的参数
 * transparent - {Boolean} 设置切片是否透明，默认为true
 * cacheEnabled - {Boolean} 设置是否使用缓存，默认为false
 * layersID - {String} 设置临时图层的id，一般用于专题图的叠加使用
 * @returns {BMap.TileLayer} 返回百度的BMap.TileLayer对象
 */
SuperMap.Web.iConnector.Baidu.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }

    var tileLayer = new BMap.TileLayer();
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
    //计算百度分辨率数组
    //百度的zoom是从1开始增加的，对应数组里面就是0
    var res = Math.pow(2,17);
    var resAry= [];
    for (var i = 0; i < 17; i++)
    {
        resAry[i] = res;
        res *= 0.5;
    }
    //计算比例尺数组
    var scaAry = [];
    for(var i = 0;i<17;i++)
    {
        scaAry[i] = 0.0254/(96*resAry[i]);
    }
    //重写百度tileLayer的方法getTilesUrl
    tileLayer.getTilesUrl = function(tileCoord, zoom) {
        //计算切片的bounds范围
        var left = tileCoord.x*256*resAry[zoom-1];
        var bottom = tileCoord.y*256*resAry[zoom-1];
        var right = (tileCoord.x + 1)*256*resAry[zoom-1];
        var top = (tileCoord.y + 1)*256*resAry[zoom-1];
        //将bounds组合到url里面
        var myUrl = layerUrl + "&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";
        myUrl +=  "&scale=" + scaAry[zoom-1];
        //只能是3857
        myUrl += "&prjCoordSys={\"epsgCode\":3857}";
        return myUrl;
    }
    return tileLayer;

}

/**
 * APIMethod:
 * 将其他坐标系下的点转换为百度的点，首先会将其他投影系下的数据转换为4326投影系
 * @param array  点数组，支持四种形式的点：
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
 *                          new BMap.Point(116.38,39.9),
 *                          new BMap.Point(116.38,39.9)
 *                          ];
 * @param projection {SuperMap.Projection} 待转换点的投影系（数组里面的所有点投影系都必须是统一的）
 * @param callback {Function} 所绑定的回调函数  （回调函数会以数组形式返回转换后的点数组）
 * @param type {Number} 首先数据会在内部转换为4326坐标系，当为0时代表数据是标准GPS坐标转向百度坐标，当为2时代表数据是根据国家测绘局规定进行了统一偏移的数据（中国范围内的google数据就是其中之一）转向百度坐标，默认为0.
 */
SuperMap.Web.iConnector.Baidu.transferPoint = function(array,projection,callback,type){

    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        type = type || 0;
        var points = []
        //分几种不同的情况，现在只提供两种
        for(var i = 0;i<array.length;i++)
        {
            var smPoint;
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.LonLat")
            {
                //首先转换为标准4326的坐标
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].lon,array[i].lat),projection,new SuperMap.Projection("EPSG:4326"));

            }
            //支持{x:118,y:38}和SuperMap.Geometry.Point的形式，因为都存在x和y
            else if(array[i].x != undefined && array[i].y != undefined)
            {
                //首先转换为标准4326的坐标
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].x,array[i].y),projection,new SuperMap.Projection("EPSG:4326"));

            }
            //支持BMap.Point的形式
            else if(array[i].lng != undefined && array[i].lat != undefined)
            {
                //首先转换为标准4326的坐标
                smPoint =  SuperMap.Projection.transform(new SuperMap.Geometry.Point(array[i].lng,array[i].lat),projection,new SuperMap.Projection("EPSG:4326"));

            }
            var point = new BMap.Point(smPoint.x,smPoint.y);
            points.push(point);
        }
        SuperMap.Web.iConnector.Baidu.callbackPointEventCounts++;
        SuperMap.Web.iConnector.Baidu.callbackPointEvent[SuperMap.Web.iConnector.Baidu.callbackPointEventCounts]=callback;
        //初始转换前的点数组
        SuperMap.Web.iConnector.Baidu.startPointArray[SuperMap.Web.iConnector.Baidu.callbackPointEventCounts] = points;
        //清空转换后点的数组
        SuperMap.Web.iConnector.Baidu.endPointArray[SuperMap.Web.iConnector.Baidu.callbackPointEventCounts] = [];
        //开始转换
        SuperMap.Web.iConnector.Baidu.circulatePointSend(null,type,SuperMap.Web.iConnector.Baidu.callbackPointEventCounts);
    }
}

/**
 *  APIMethod:
 *  将其他坐标系下的线数组转换为百度支持的线数组 ，首先会将其他投影系下的数据转换为4326投影系
 * @param array 线数组，支持两种形式
 * 1、var lines = [new SuperMap.Geometry.LineString(
 *                          new SuperMap.Geometry.Point(116.1,38.9),
 *                          new SuperMap.Geometry.Point(116.1,38.9)
 *                          )];
 * 2、var lines = [new BMap.Polyline(
 *                          new BMap.Point(116.38,39.9),
 *                          new BMap.Point(116.38,39.9)
 *                          )];
 * @param projection {SuperMap.Projection} 需要转换的线的坐标系
 * @param callback {Function} 所绑定的回调函数（回调函数会以数组形式返回转换后的线数组）
 * @param type {Number} 首先数据会在内部转换为4326坐标系，当为0时代表数据是标准GPS坐标转向百度坐标，当为2时代表数据是根据国家测绘局规定进行了统一偏移的数据（中国范围内的google数据就是其中之一）转向百度坐标，默认为0.
 */
SuperMap.Web.iConnector.Baidu.transferLine = function(array,projection,callback,type){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        type = type || 0;
        var lines = [];
        for(var i = 0;i<array.length;i++)
        {
            var pointsStart = [];
            var pointsEnd = [];
            //支持supermap的LineString
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.Geometry.LineString")
            {
                pointsStart = array[i].components;
                for(var j = 0;j<pointsStart.length;j++)
                {
                    pointsEnd.push(SuperMap.Projection.transform(pointsStart[j],projection,new SuperMap.Projection("EPSG:4326")));
                }

            }
            //支持百度的Polyline
            else if(array[i].constructor == BMap.Polyline)
            {
                pointsStart = array[i].getPath();
                for(var j = 0;j<pointsStart.length;j++)
                {
                    pointsEnd.push(SuperMap.Projection.transform(new SuperMap.Geometry.Point(pointsStart[j].lng,pointsStart[j].lat),projection,new SuperMap.Projection("EPSG:4326")));
                }
            }
            lines.push(pointsEnd);
        }
        SuperMap.Web.iConnector.Baidu.callbackLineEventCounts++;
        SuperMap.Web.iConnector.Baidu.callbackLineEvent[SuperMap.Web.iConnector.Baidu.callbackLineEventCounts]=callback;
        //初始转换前的
        SuperMap.Web.iConnector.Baidu.startLineArray[SuperMap.Web.iConnector.Baidu.callbackLineEventCounts] = lines;
        //清空转换后
        SuperMap.Web.iConnector.Baidu.endLineArray[SuperMap.Web.iConnector.Baidu.callbackLineEventCounts] = [];
        SuperMap.Web.iConnector.Baidu.circulateLineSend(null,type,SuperMap.Web.iConnector.Baidu.callbackLineEventCounts);
    }
}

/**
 *  APIMethod:
 *  将其他坐标系下的面数组转换为百度支持的面数组，首先会将其他投影系下的数据转换为4326投影系
 * @param array 面数组，支持两种形式
 * 1、var polygons = [new SuperMap.Geometry.Polygon(
 *                          [new SuperMap.Geometry.LinearRing(
 *                                  new SuperMap.Geometry.Point(116.3786889372559,39.90762965106183),
 *                                  new SuperMap.Geometry.Point(116.38632786853032,39.90795884517671),
 *                                  new SuperMap.Geometry.Point(116.38534009082035,39.897432133833574),
 *                                  new SuperMap.Geometry.Point(116.37624058825688,39.89789300648029)
 *                                  )
 *                           ]
 *                        )];
 * 2、var polygons = [new BMap.Polygon(
 *                                  new BMap.Point(116.3786889372559,39.90762965106183),
 *                                  new BMap.Point(116.38632786853032,39.90795884517671),
 *                                  new BMap.Point(116.38534009082035,39.897432133833574),
 *                                  new BMap.Point(116.37624058825688,39.89789300648029)
 *                          )];
 * @param projection {SuperMap.Projection} 需要转换的面的坐标系
 * @param callback {Function} 所绑定的回调函数（回调函数会以数组形式返回转换后的面数组）
 * @param type {Number} 首先数据会在内部转换为4326坐标系，当为0时代表数据是标准GPS坐标转向百度坐标，当为2时代表数据是根据国家测绘局规定进行了统一偏移的数据（中国范围内的google数据就是其中之一）转向百度坐标，默认为0.
 */
SuperMap.Web.iConnector.Baidu.transferPolygon = function(array,projection,callback,type){
    if((typeof array) == "object" && array != null && array.constructor == Array)
    {
        type = type || 0;
        var polygons = [];
        for(var i = 0;i<array.length;i++)
        {
            var pointsStart = [];
            var pointsEnd = [];
            //支持supermap的LineString
            if(array[i].CLASS_NAME && array[i].CLASS_NAME == "SuperMap.Geometry.Polygon")
            {
                pointsStart = array[i].getVertices(false);
                for(var j = 0;j<pointsStart.length;j++)
                {
                    pointsEnd.push(SuperMap.Projection.transform(pointsStart[j],projection,new SuperMap.Projection("EPSG:4326")));
                }

            }
            //支持百度的Polygon
            else if(array[i].constructor == BMap.Polygon)
            {
                pointsStart = array[i].getPath();
                for(var j = 0;j<pointsStart.length;j++)
                {
                    pointsEnd.push(SuperMap.Projection.transform(new SuperMap.Geometry.Point(pointsStart[j].lng,pointsStart[j].lat),projection,new SuperMap.Projection("EPSG:4326")));
                }
            }
            polygons.push(pointsEnd);
        }
        SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts++;
        SuperMap.Web.iConnector.Baidu.callbackPolygonEvent[SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts]=callback;
        //初始转换前的
        SuperMap.Web.iConnector.Baidu.startPolygonArray[SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts] = polygons;
        //清空转换后
        SuperMap.Web.iConnector.Baidu.endPolygonArray[SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts] = [];
        SuperMap.Web.iConnector.Baidu.circulatePolygonSend(null,type,SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts);
    }
}

/**
 * Property:
 * 记录转换前的点数组的数组
 * @type {Array}  BMap.Point数组的数组
 * 首先本身是一个数组，每一个数据代表某一批点数组，每批点数组又是多个点组成的
 */
SuperMap.Web.iConnector.Baidu.startPointArray = [];
/**
 * Property:
 * 记录转成后的点数组的数组
 * @type {Array}   BMap.Point数组的数组
 * 首先本身是一个数组，每一个数据代表某一批点数组，每批点数组又是多个点组成的
 */
SuperMap.Web.iConnector.Baidu.endPointArray = [];
/**
 * Property:
 * 记录用户注册的点回调函数数组
 * @type {Array} 回调函数数组
 */
SuperMap.Web.iConnector.Baidu.callbackPointEvent = [];
/**
 * Property:
 * 记录当前为第多少批点数组需要进行转换
 * @type {number} 默认为-1，每有一批点数组需要转换就自加1
 */
SuperMap.Web.iConnector.Baidu.callbackPointEventCounts = -1;
/**
 * Method:
 * 每次服务器转换完点后的回调函数，在此判定是否将所有点全部转换，如果没有则继续转换
 * @param xyResults 服务器传回的坐标集合
 * @param id 代表此次转换完的点是属于第id批的点数组，避免回调函数出错
 * @param type {Number} 首先数据会在内部转换为4326坐标系，当为0时代表数据是标准GPS坐标转向百度坐标，当为2时代表数据是根据国家测绘局规定进行了统一偏移的数据（中国范围内的google数据就是其中之一）转向百度坐标，默认为0.
 */
SuperMap.Web.iConnector.Baidu.circulatePointSend = function(xyResults,type,id){

    if(xyResults !=null)
    {
        for(var index in xyResults){
            xyResult = xyResults[index];
            if(xyResult.error != 0){continue;}//出错就直接返回;
            var resultPoint = new BMap.Point(xyResult.x, xyResult.y);
            SuperMap.Web.iConnector.Baidu.endPointArray[id].push(resultPoint);
        }
    }

    //如果点已经全部转换，则直接将所有点传递给外部用户，否则继续转换
    if(SuperMap.Web.iConnector.Baidu.startPointArray[id].length == 0)
    {
        SuperMap.Web.iConnector.Baidu.callbackPointEvent[id](SuperMap.Web.iConnector.Baidu.endPointArray[id],type,id);
    }
    else
    {
        var pots = [];
        if(SuperMap.Web.iConnector.Baidu.startPointArray[id].length>20)
        {
            pots = SuperMap.Web.iConnector.Baidu.startPointArray[id].splice(0,20);
        }
        else
        {
            pots = SuperMap.Web.iConnector.Baidu.startPointArray[id].splice(0,SuperMap.Web.iConnector.Baidu.startPointArray[id].length);
        }
        SuperMap.Web.iConnector.Baidu.transMore(pots,type,id);
    }

}
/**
 *  Property:
 *  记录转换前的线数组的数组
 * @type {Array} 线数组的数组
 * 首先本身是一个数组，每一个数据代表某一批线数组，每批线数组又是多条线组成的，每一条线其实又是点数组
 */
SuperMap.Web.iConnector.Baidu.startLineArray = [];
/**
 * Property:
 * 记录转换后的线数组的数组
 * @type {Array}  BMap.Polyline数组的数组
 * 首先本身是一个数组，每一个数据代表某一批BMap.Polyline线数组，每批线数组又是多条BMap.Polyline线组成的
 */
SuperMap.Web.iConnector.Baidu.endLineArray = [];
/**
 * Property:
 * 记录用户注册的线回调函数数组
 * @type {Array} 回调函数数组
 */
SuperMap.Web.iConnector.Baidu.callbackLineEvent = [];
/**
 * Property:
 *  记录当前为第多少批线数组需要进行转换
 * @type {number}  默认为-1，每有一批线数组需要转换就自加1
 */
SuperMap.Web.iConnector.Baidu.callbackLineEventCounts = -1;
/**
 * Method:
 * 每次服务器转换完线后的回调函数，在此判定是否将所有线全部转换，如果没有则继续转换
 * @param points  转换后的每一条线的点集合
 * @param id 代表此次转换完的线是属于第id批的线数组，避免回调函数出错
 * @param type {Number} 首先数据会在内部转换为4326坐标系，当为0时代表数据是标准GPS坐标转向百度坐标，当为2时代表数据是根据国家测绘局规定进行了统一偏移的数据（中国范围内的google数据就是其中之一）转向百度坐标，默认为0.
 */
SuperMap.Web.iConnector.Baidu.circulateLineSend = function(points,type,id){
    if(points !=null)
    {
        var line =new BMap.Polyline(points, {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});
        SuperMap.Web.iConnector.Baidu.endLineArray[id].push(line);
    }
    if(SuperMap.Web.iConnector.Baidu.startLineArray[id].length == 0)
    {
        SuperMap.Web.iConnector.Baidu.callbackLineEvent[id](SuperMap.Web.iConnector.Baidu.endLineArray[id]);
    }
    else
    {
        var pots = SuperMap.Web.iConnector.Baidu.startLineArray[id].splice(0,1);
        SuperMap.Web.iConnector.Baidu.transferPoint(pots[0],new SuperMap.Projection("EPSG:4326"),SuperMap.Web.iConnector.Baidu.circulateLineSend,type);
    }
}
/**
 *  Property:
 *  记录转换前的面数组的数组
 * @type {Array} 面数组的数组
 * 首先本身是一个数组，每一个数据代表某一批面数组，每批面数组又是多个面组成的，每一个面其实又是点数组组成的
 */
SuperMap.Web.iConnector.Baidu.startPolygonArray = [];
/**
 * Property:
 * 记录转换后的面数组的数组
 * @type {Array}  BMap.Polygon数组的数组
 * 首先本身是一个数组，每一个数据代表某一批BMap.Polygon面数组，每批面数组又是多个BMap.Polygon面组成的
 */
SuperMap.Web.iConnector.Baidu.endPolygonArray = [];
/**
 * Property:
 * 记录用户注册的面回调函数数组
 * @type {Array}  回调函数数组
 */
SuperMap.Web.iConnector.Baidu.callbackPolygonEvent = [];
/**
 * Property:
 *  记录当前为第多少批面数组需要进行转换
 * @type {number}  默认为-1，每有一批面数组需要转换就自加1
 */
SuperMap.Web.iConnector.Baidu.callbackPolygonEventCounts = -1;
/**
 * Method:
 * 每次服务器转换完面后的回调函数，在此判定是否将所有面全部转换，如果没有则继续转换
 * @param points  转换后的每一个面的点集合
 * @param id 代表此次转换完的面是属于第id批的面数组，避免回调函数出错
 * @param type {Number} 首先数据会在内部转换为4326坐标系，当为0时代表数据是标准GPS坐标转向百度坐标，当为2时代表数据是根据国家测绘局规定进行了统一偏移的数据（中国范围内的google数据就是其中之一）转向百度坐标，默认为0.
 */
SuperMap.Web.iConnector.Baidu.circulatePolygonSend = function(points,type,id){
    if(points !=null)
    {
        var polygon =new BMap.Polygon(points, {strokeColor:"blue", strokeWeight:6, strokeOpacity:0.5});
        SuperMap.Web.iConnector.Baidu.endPolygonArray[id].push(polygon);
    }
    if(SuperMap.Web.iConnector.Baidu.startPolygonArray[id].length == 0)
    {
        SuperMap.Web.iConnector.Baidu.callbackPolygonEvent[id](SuperMap.Web.iConnector.Baidu.endPolygonArray[id]);
    }
    else
    {
        var pots = SuperMap.Web.iConnector.Baidu.startPolygonArray[id].splice(0,1);
        SuperMap.Web.iConnector.Baidu.transferPoint(pots[0],new SuperMap.Projection("EPSG:4326"),SuperMap.Web.iConnector.Baidu.circulatePolygonSend,type);
    }
}











