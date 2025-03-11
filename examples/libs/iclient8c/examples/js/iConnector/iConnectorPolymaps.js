/**
 * Created with JetBrains WebStorm.
 * User: CC
 * Date: 14-12-23
 * Time: 下午3:36
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
 * PolyMaps适配器类
 *  没有点线面对应的接口 ，所以这样就不涉及点线面的转换
 * @constructor
 * @deprecated
 */
SuperMap.Web.iConnector.PolyMaps = function(){

}
/**
 *  APIMethod:
 *  创建PolyMaps的图层 po.layer，这里的图层中切片的来源为iserver服务器（支持3857的地图和4326的地图）
 * @param url  {String}  地图服务的url地址，如：“http://localhost:8090/iserver/services/map-china400/rest/maps/China”
 * @param options 可选的参数
 * transparent - {Boolean} 设置切片是否透明，默认为true
 * cacheEnabled - {Boolean} 设置是否使用缓存，默认为false
 * layersID - {String} 设置临时图层的id，一般用于专题图的叠加使用
 * projection-{String}设置图层的投影系，可设置为"3857"或者"4326"，默认为"3857"
 * @returns {Object} 返回Leaflet的扩展图层对象
 */
SuperMap.Web.iConnector.PolyMaps.getLayer = function(url,options){
    if(url == undefined)
    {
        return;
    }
    var image = po.layer(load, unload);
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
    //如果有projection，并且只能是4326或者3857的地图。
    var projection="3857";
    if(options&&options.projection){
        if(options.projection==="4326"){
            projection="4326";
        }
    }
    layerUrl+="&projection="+projection;

    function load(tile) {
        //计算分辨率和比例尺
        var resLen = 17;
        var resStart =0;
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
            image.scales=scales;
        }
        else{
            for(var i=resStart;i<=resLen;i++){
                var res4326 = 1.40625/Math.pow(2,i);
                resolutions.push(res4326);

                var scale4326 = 0.0254*360/dpi/res4326/Math.PI/2/6378137;
                scales.push(scale4326);
            }
            image.scales=scales;
        }

        var cx=tile.column ;
        var cy=-tile.row;
        var z=tile.zoom;
        cx-= Math.pow(2,z-1);
        cy+=Math.pow(2,z-1)-1;

        //使用bounds出图（也可以使用center）
        var left = cx*256*resolutions[z];
        var bottom = cy*256*resolutions[z];
        var right = (cx + 1)*256*resolutions[z];
        var top = (cy + 1)*256*resolutions[z];

        var element = tile.element = po.svg("image"),
            size = image.map().tileSize();
        element.setAttribute("preserveAspectRatio", "none");
        element.setAttribute("width", size.x);
        element.setAttribute("height", size.y);
        var tileUrl = layerUrl;
        //将bounds组合到url里面
        tileUrl+= "&viewBounds=" +"{\"leftBottom\" : {\"x\":" + left +",\"y\":" + bottom +"},\"rightTop\" : {\"x\":" + right +",\"y\":" +top + "}}";

        tileUrl +="&scale=" +scales[z];
        var epsg=projection==="3857"?3857:4326;
        tileUrl += "&prjCoordSys={\"epsgCode\":"+epsg+"}";
        element.setAttribute("opacity", 0);

        if (tileUrl != null) {
            tile.request = po.queue.image(element, tileUrl, function(img) {
                delete tile.request;
                tile.ready = true;
                tile.img = img;
                element.removeAttribute("opacity");
                image.dispatch({type: "load", tile: tile});
            });
        } else {
            tile.ready = true;
            image.dispatch({type: "load", tile: tile});
        }
    }
    function unload(tile) {
        if (tile.request) tile.request.abort(true);
    }
    return image;
}

