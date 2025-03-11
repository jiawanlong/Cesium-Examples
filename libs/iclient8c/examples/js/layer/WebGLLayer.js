/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/
/**
 * Class: SuperMap.Layer.WebGLLayer
 * 使用webgl方式进行渲染的图层
 * 使用此图层依赖了部分矩阵计算，所以需要引用examples/js/glMatrix-0.9.5.min.js库
 * Inherits from:
 *  - <SuperMap.Layer.Grid>
 */

SuperMap.Layer.WebGLLayer = SuperMap.Class(SuperMap.Layer.Grid, {

    /**
     * Constant: DEFAULT_PARAMS
     * {Object} 设置到瓦片url请求上的参数的默认值。
     *  transparent（图层是否透明,默认为false）
     *  和cacheEnabled（是否使用服务端的缓存，默认为true）
     */
    DEFAULT_PARAMS: {
        //maxVisibleVertex: 360000,
        transparent: false,
        cacheEnabled: true
    },

    /**
     * Property: prjStr
     * {String}
     * 投影键值串，在图层初始化完成时赋值。例如：prjCoordSys={"epsgCode":3857}
     * 内部使用，不公开
     */
    prjStr1: null,

    /**
     * Property: getmapstatusservice
     * {String}
     */
    getMapStatusService: null,

    /**
     * Property: viewBounds
     * {Object} 地图窗口显示区域的范围。
     */
    viewBounds: null,

    /**
     * Property: viewer
     * {Object} 用户显示视窗。
     */
    viewer: null,

    /**
     * Property: scale
     * {Number} 地图的显示比例尺。
     */
    scale: null,


    /**
     * Property: overlapDisplayed
     * {Boolean} 地图对象在同一范围内时，是否重叠显示，默认为true。
     */
    overlapDisplayed: true,

    /**
     * Property: redirect
     * {Boolean} 是否重定向，HTTP 传输中的一个概念。如果为 true，则将请求重定向到图片的真实地址；
     * 如果为 false，则响应体中是图片的字节流。默认为 false，不进行重定向。
     */
    redirect: false,

    /**
     * Property: overlapDisplayedOptions
     * {<SuperMap.REST.OverlapDisplayedOptions>} 避免地图对象压盖显示的过滤选项，
     * 当 overlapDisplayed为 false 时有效，用来增强对地图对象压盖时的处理。
     */
    overlapDisplayedOptions: null,


    /**
     * Property: useCanvas
     * {Boolean} 设置是否将一个图层用Canvas元素显示，默认为true，只能为true
     * 
     */
    useCanvas: true,
    
    /**
     * Property: canvas
     * 当useCanvas为true时，此Canvas作为所有瓦片的现实容器。
     */
    canvas: null, 
    
    /**
     * Property: canvasContext
     * {Canvas} WEBGL的上下文。
     */    
    canvasContext: null,

    /**
     * Property: lastResolution
     * canvas最后一次绘制的分辨率。
     */
    lastResolution: null,
    
    /**
     * Property: lastCanvasPosition
     * canvas最后一次绘制时，距左上角的位置。
     */
    lastCanvasPosition: null,
    
    /**
     * Property: redrawCanvas
     * Indicates if the canvas element should be reset before
     * the next tile is drawn.
     * 表明canvas元素是否需要在绘制之前重置，默认为false。
     */
    redrawCanvas: false,

    /**
     * Property: format
     * {String} 地图服务的图片格式。
     *     默认值为 png ，目前支持 png、jpg、bmp、gif。
     */
    format: "png",
    
    /**
     * Property: dpi
     * {Float} 屏幕上每英寸包含像素点的个数。
     * 该参数结合图层比例尺可以推算出该比例尺下图层的分辨率。
     */
    dpi: null,
    
    /**
     * Property: isBaseLayer
     * {Boolean} 图层是否为底图，默认为true。
     */
    isBaseLayer: true, 
    
    /**
     * Property: tileOriginCorner
     * {String} 网格的原点位置。(当<tileOrigin>属性未被设置时，此属性有效)。
     *     可选的值包括"tl" (左上), "tr" (右上), "bl" (左下), and "br"(右下)， 默认为 "tl"。
     */
    tileOriginCorner: "tl",
    
    /**
     * Property: datumAxis
     * {Number} 地理坐标系统椭球体长半轴。用户自定义地图的Options时，若未指定该参数的值，
     * 则DPI默认按照WGS84参考系的椭球体长半轴6378137来计算。
     */
    datumAxis: null,

    /**
     * Property: timeoutID
     * {Number} 记录setTimeout的索引值。
     */    
    timeoutID :null,
    
    /**
     * Property: memoryImg
     * {Object} 存放已经加载的图片作为缓存。
     * 在每次图层状态改变时需要重绘，就会首先读取此缓存内部是否已经存在此图片，
     * 如果存在直接取出进行绘制，不存在再向服务器发送请求。
     * 这样可以提高效率，并且在断网状态下也可以查看缓存的图片。
     */
    memoryImg: null,
    
    /**
     * Property: memoryKeys
     * {Array} 保存已经缓存图片的key值。
     * 每一张图片有对应一个key，如x0y1z2，
     * 代表缩放级别为2下的第一横排，第二竖排的图片（从左上角开始计算）.
     */
    memoryKeys:[],

    /**
     * APIProperty: bufferImgCount
     * {Number} 用来记录内存中缓存图片的数量，默认值为 1000。
     * 为了减少网络访问量，在使用 Canvas 模式时，图层会将访问过的图片保存在内存中，
     * 如果访问的图片数量超过该属性定义的值，那么新访问的图片会替换已经缓存的图片。
     */
    bufferImgCount:1000,

    /**
     * Property: isFirstLoad
     * {Bool} 记录是否第一次加载，默认为true。
     */    
    isFirstLoad: true,
    
    /**
     * Property: zoomDuration
     * {Number} 设置两次滚轮事件触发的间隔，如果两次滚轮触发时间差小于500ms。
     * 则放弃前一次滚轮事件。（设置此属性的同时设置<SuperMap.Handler.MouseWheel>的interval属性，会产生错误）
     */  
    zoomDuration:500,
    
    /**
     * Property: isZoomming
     * {bool} 记录是否在缩放。
     */  
    isZoomming: null,
          
    /**
     * Property: useHighSpeed
     * {bool} 记录是否采用高速读图策略。
     */ 
    useHighSpeed:true,
    
    /**
     * Property: changeDx
     * {Interger} 记录位置的改变量。
     */ 
    changeDx: null,
    /**
     * Property: changeDy
     * {Interger} 记录位置的改变量。
     */ 
    changeDy: null,

    /**
     * Property: lenColumn
     * {Interger} 记录当前grid的col长度。
     */
    lenColumn: null,

    /**
     * Property: lenRow
     * {Interger} 记录当前grid的row长度。
     */
    lenRow: null,
    
    /**
     * Porperty: sdcardPath
     * {String} 记录手机当前SDCard位置。
     */
    sdcardPath:null,
    
    /**
     * Porperty: storageType
     * {String} 离线存储类型为文件格式。
     */
    storageType:"File",

    /**
     * Porperty: transitionObj
     * {Object} 缩放动画对象。
     */
    transitionObj: null,

    /**
     * Property: inZoom
     * {Boolean} 当前地图操作是否在缩放过程中。
     */
    inZoom: false,
    
    /**
     * Constructor: SuperMap.Layer.WebGLLayer
     * 使用webgl方式进行渲染的图层
     *
     * Parameters:
     * name - {String}  图层名称。
     * url - {String} 图层的服务地址。
     * params - {Object} 设置到url上的可选参数。
     * options - {Object} 附加到图层属性上的可选项，父类与此类开放的属性。
     */
    initialize: function (name, url, params, options) {
        //通过浏览器获取部分信息
        var me = this, broz = SuperMap.Browser;
        //me.tileSize = new SuperMap.Size(256, 256);
        //判断是否为移动端，如果是，那么设置缓存图片上限为500，比电脑上少了一半（考虑到手持端内存）
        if(!!SuperMap.isApp)me.bufferImgCount = 500;
        SuperMap.Layer.Grid.prototype.initialize.apply(me, arguments);
        //reports the progress of a tile filter
        if(me.useCanvas) {
            //通过浏览器的判定决定是否支持Canvas绘制
            me.useCanvas = SuperMap.Util.supportCanvas();
        }
        //如果为android手持端，那么不能支持Canvas绘制
        if(broz.device === 'android') {
            me.useCanvas = false;
        }
        
        if (SuperMap.isApp) {
            //me.sdcardPath = "file://" + window.plugins.localstoragemanager.getsdcard().sdcard + "/";
            cordova.exec(function(obj){
				me.sdcardPath = "file://" + obj.sdcard + "/";
			}, function(e){}, "LocalStoragePlugin","getsdcard", []);
            me.useCanvas = true;
        }
        
        if(me.useCanvas) {
            me.canvas = document.createElement("canvas");
            me.canvas.id = "Canvas_" + me.id;
            me.canvas.style.position = "absolute";       
            me.div.appendChild(me.canvas);                     
            me.canvasContext = me.canvas.getContext('experimental-webgl');
            me.transitionObj = new SuperMap.Animal(me);
            me.memoryImg = {};    
        }
        
        //如果是Canvas策略采用高速出图 。
        me.useHighSpeed = me.useCanvas ? true : false;            
        me.isFirstLoad = true;

        //子类的代码
        SuperMap.Util.applyDefaults(me.params, me.DEFAULT_PARAMS);
        me.events.addEventType("layerInitialized");
        me.events.addEventType("loadError");
        if (me.params.transparent) {
            if (me.format === "jpg") {
                me.format = SuperMap.Util.alphaHack() ? "gif" : "png";
            }
            if (me.format === "bmp") {
                me.format = SuperMap.Util.alphaHack() ? "bmp" : "png";
            }
        }
        if (typeof me.params.clipRegion !== "undefined") {
            if (me.params.clipRegion instanceof SuperMap.Geometry) {
                me.params.clipRegionEnabled = true;
                var sg = SuperMap.REST.ServerGeometry.fromGeometry(me.params.clipRegion);
                me.params.clipRegion = SuperMap.Util.toJSON(sg);
            } else {
                delete me.params.clipRegion;
            }
        }
        if (typeof me.params.layersID !== "undefined") {
            if (!me.params.layersID){
                delete me.params.layersID;
            }
        }
        if (me.params.redirect) {
            me.redirect = true;
        }

        //用户传Layer的地图单位
        if(me.units){
            me.units = me.units.toLowerCase();
        }

        if(me.dpi && me.maxExtent &&(me.resolutions || me.scales)) {
            //如果设置了dpi、maxExtent、resolutions或者是scales,则不需要向服务端发出请求获取图层信息
        }else if(!me.dpi && (!me.viewBounds || !me.viewer || !me.scale)) {
            //当在options中设置viewBounds 、viewer 、scale 、units 、datumAxis，则计算dpi
            if (!!SuperMap.isApp) {
                var layerContext = {
                    tile:me
                };

                cordova.exec(function(layerContext){
                    return function(r){
                        layerContext.tile.getAppStatusSucceed(layerContext,r);
                    }
                }(layerContext), function(e){},
                    "LocalStoragePlugin","getconfig",
                    [this.name,this.storageType]
                );
            } else{
                var strServiceUrl = me.url;
                if (SuperMap.Util.isArray(url)) {
                    strServiceUrl = url[0];
                }
                var getMapStatusService = new SuperMap.REST.MapService(strServiceUrl,
                    {eventListeners: {processCompleted: me.getStatusSucceed, scope: me,
                        processFailed: me.getStatusFailed}, projection: me.projection});
                getMapStatusService.processAsync();
            }
        }
        if (me.projection) {
            if(typeof me.projection == "string") {
                me.projection = new SuperMap.Projection(me.projection);
            }

            var arr = me.projection.getCode().split(":");
            if (arr instanceof Array && arr.length == 2) {
                me.prjStr1 = "{\"epsgCode\":" + arr[1] + "}";
            }
        }
    },

    getAppStatusSucceed:function(layerContext,r) {
        var mapStatus = r.json;
        var me = this;
        if (mapStatus != "false")
        {
            mapStatus = eval('(' + mapStatus + ')');
            var bounds = mapStatus.bounds;
            bounds = new SuperMap.Bounds(bounds.left,bounds.bottom,bounds.right,bounds.top);
            me.maxExtent = bounds;
            if(mapStatus.dpi){
                me.dpi = mapStatus.dpi;
                me.options.scales = mapStatus.scales;
                me.units = mapStatus.unit;
                me.datumAxis = 6378137;
            }
            else{
                var viewBounds = mapStatus.viewBounds,
                    coordUnit = mapStatus.coordUnit,
                    viewer = mapStatus.viewer,
                    scale = mapStatus.scale,
                    datumAxis = mapStatus.datumAxis;
                //将jsonObject转化为SuperMap.Bounds，用于计算dpi。
                viewBounds = new SuperMap.Bounds(viewBounds.left,viewBounds.bottom,viewBounds.right,viewBounds.top);
                me.viewBounds = viewBounds;

                viewer = new SuperMap.Size(viewer.rightBottom.x, viewer.rightBottom.y);
                me.viewer = viewer;
                me.scale = scale;

                coordUnit = coordUnit.toLowerCase();
                me.units = me.units || coordUnit;
                me.datumAxis = datumAxis;

                me.dpi = SuperMap.Util.calculateDpi(viewBounds, viewer, scale, me.units, datumAxis);
            }
            me.events.triggerEvent('layerInitialized',me);
        }else{
            var strServiceUrl = me.url;
            if (SuperMap.Util.isArray(me.url)) {
                strServiceUrl = me.url[0];
            }
            var getMapStatusService = new SuperMap.REST.MapService(strServiceUrl,
                {eventListeners:{processCompleted: me.getStatusSucceed, scope: me,
                    processFailed: me.getStatusFailed}, projection: me.projection});
            getMapStatusService.processAsync();
        }
    },

    /**
     * Method: setMapStatus
     * 计算Dpi，设置maxExtent。
     */
    getStatusSucceed: function(mapStatus) {
        var me = this;

        if (mapStatus.result){
            // 当用户未设置scales，visibleScales存在值、visibleScalesEnable为true时,使layer.scales=visibleScales。
            var visScales = null;
            var orResult = mapStatus.originResult;
            if(orResult){
                visScales = orResult.visibleScales;
                if(!me.scales && orResult.visibleScalesEnabled && (visScales &&visScales.length&&visScales.length>0))
                {
                    this.options.scales=visScales;
                }
            }

            var mapStatus = mapStatus.result;
            var bounds = mapStatus.bounds, viewBounds = mapStatus.viewBounds,
                coordUnit = mapStatus.coordUnit,
                viewer = mapStatus.viewer,
                scale = mapStatus.scale,
                datumAxis = mapStatus.datumAxis;
            //将jsonObject转化为SuperMap.Bounds，用于计算dpi。
            viewBounds = new SuperMap.Bounds(viewBounds.left,viewBounds.bottom,viewBounds.right,viewBounds.top);
            me.viewBounds = viewBounds;

            viewer = new SuperMap.Size(viewer.rightBottom.x, viewer.rightBottom.y);
            me.viewer = viewer;
            me.scale = scale;

            bounds = new SuperMap.Bounds(bounds.left,bounds.bottom,bounds.right,bounds.top);
            me.maxExtent = bounds;

            coordUnit = coordUnit.toLowerCase();
            me.units = me.units || coordUnit;
            me.datumAxis = datumAxis;

            me.dpi = SuperMap.Util.calculateDpi(viewBounds, viewer, scale, me.units, datumAxis);

            if (!!SuperMap.isApp){
                //window.plugins.localstoragemanager.savaconfig(this.name,mapStatus);
                cordova.exec(function(){}, function(e){}, "LocalStoragePlugin","savaconfig", [this.name,mapStatus]);
            }

            me.events.triggerEvent('layerInitialized',me);
        }
    },

    /**
     * Method: getStatusFailed
     * 获取图层状态失败
     */
    getStatusFailed: function(failedMessage) {
        var me = this;
        me.events.triggerEvent('loadError',failedMessage);
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
        var me = this,
            newParams,
            tileSize = me.tileSize,
            scale = me.scales[xyz.z];
        //在没有设置任何投影的情况下，比例尺可能大于1，为了提高容错能力，注释掉比例尺矫正函数。 maoshuyu
        //scale = SuperMap.Util.normalizeScale(scale);
        if(!scale)scale = this.getScaleForZoom(xyz.z);
        newParams = {
            "width" : tileSize.w,
            "height" : tileSize.h,
            "x" : xyz.x,
            "y" : xyz.y,
            "scale" : scale,
            //hansj，忽略后面的注释//由于服务器关于缓存有问题，所以redirect先设为false。
            "redirect" : me.redirect
        };
        if (SuperMap.Credential.CREDENTIAL) {
            newParams[SuperMap.Credential.CREDENTIAL.name] = SuperMap.Credential.CREDENTIAL.getValue();
        }
        if (!me.params.cacheEnabled) {
            newParams.t = new Date().getTime();
        }
        if (typeof me.params.layersID !== "undefined" && typeof newParams.layersID == "undefined") {
            if (me.params.layersID && me.params.layersID.length > 0){
                newParams.layersID = me.params.layersID;
            }
        }

        if (me.prjStr1) {
            newParams.prjCoordSys = me.prjStr1;
        }

        return me.getFullRequestString(newParams);
    },

    /**
     * Method: getFullRequestString
     * 将参数与URL合并，获取完整的请求地址。（重写基类方法）
     *
     * Parameters:
     * newParams - {Object}
     * altUrl - {String}
     *
     * Returns:
     * {String}
     */
    getFullRequestString:function(newParams, altUrl) {
        var me = this,
            url = altUrl || this.url,
            allParams, paramsString, urlParams;
        allParams = SuperMap.Util.extend({}, me.params),
            allParams = SuperMap.Util.extend(allParams, newParams);

        if(allParams.overlapDisplayed === false) {
            me.overlapDisplayedOptions = allParams.overlapDisplayedOptions;
            me.overlapDisplayed = allParams.overlapDisplayed;
            delete allParams.overlapDisplayed;
            delete allParams.overlapDisplayedOptions;
        }
        paramsString = SuperMap.Util.getParameterString(allParams);

        if (SuperMap.Util.isArray(url)) {
            var s = "" + newParams.x + newParams.y;
            url = me.selectUrl(s, url);
        }
        url = url + "/tileImage." + me.format;
        urlParams = SuperMap.Util.upperCaseObject(SuperMap.Util.getParameters(url));
        for (var key in allParams) {
            if(key.toUpperCase() in urlParams) {
                delete allParams[key];
            }
        }
        paramsString = SuperMap.Util.getParameterString(allParams);
        if( me.tileOrigin ){
            paramsString = paramsString + "&origin={\"x\":" + me.tileOrigin.lon + "," + "\"y\":" + me.tileOrigin.lat + "}";
        }
        if(me.overlapDisplayed === false) {
            me.overlapDisplayedOptions = me.overlapDisplayedOptions ? me.overlapDisplayedOptions : new SuperMap.REST.OverlapDisplayedOptions();
            paramsString += "&overlapDisplayed=false&overlapDisplayedOptions="+ me.overlapDisplayedOptions.toString();
        }

        return SuperMap.Util.urlAppend(url, paramsString);
    },

    /**
     * Method: mergeNewParams
     * 动态修改URL的参数。(重写基类方法)
     *
     * Parameters:
     * newParams - {Object}
     *
     * Returns
     * {Boolean} 修改是否成功。
     */
    mergeNewParams: function (newParams) {
        if (typeof (newParams.clipRegion) != "undefined") {
            if (newParams.clipRegion instanceof SuperMap.Geometry) {
                newParams.clipRegionEnabled = true;
                var sg = SuperMap.REST.ServerGeometry.fromGeometry(newParams.clipRegion);
                newParams.clipRegion = SuperMap.Util.toJSON(sg);
            } else {
                delete newParams.clipRegion;
            }
        }
        return SuperMap.Layer.HTTPRequest.prototype.mergeNewParams.apply(this, [newParams]);
    },
    
    /**
     * Method: removeMap
     * rewrite Grid.removeMap method to clear '_timeoutId'
     * Called when the layer is removed from the map.
     *
     * Parameters:
     * map - {<SuperMap.Map>} The map.
     */
    removeMap: function(map) {
        SuperMap.Layer.Grid.prototype.removeMap.apply(this, [map])
        this._timeoutId && window.clearTimeout(this._timeoutId); 
        this._timeoutId = null;
    },
    
    /**
     * APIMethod: destroy
     * 解构Layer类，释放资源。  
     */
    destroy: function () {
        var me = this;

        if(me.getMapStatusService) {
            me.getMapStatusService.events.listeners = null;
            me.getMapStatusService.destroy();
        }
        me.viewBounds = null;
        me.viewer = null;
        me.scale = null;

        SuperMap.Layer.Grid.prototype.destroy.apply(me, arguments);
        me.format = null;
        me.dpi = null;
        me.datumAxis = null;
        me.isBaseLayer = null;
        me.tileOriginCorner = null;
        me.tileSize = null;
        me.bufferContext = null;
        if(me.transitionObj){
            me.transitionObj.destroy();
            me.trnasitionObj = null;
        }
        if (me.useCanvas) {
            me.canvas = null;
            me.memoryImg = null;
        }

        me.DEFAULT_PARAMS = null;
    },
    
    /**
     * APIMethod: clone
     * 创建当前图层的副本。
     *
     * Parameters:
     * obj - {Object} 
     *
     * Returns:
     * {<SuperMap.SuperMap.Layer>} 新创建的图层
     */
    clone: function (obj) {
        var me = this;
        if (obj == null) {
            obj = new SuperMap.Layer.WebGLLayer(
                me.name, me.url, me.params, me.getOptions());
        }
       
        obj = SuperMap.Layer.Grid.prototype.clone.apply(me, [obj]);
        obj._timeoutId = null;
        return obj;
    },
    
    /**
     * Method: moveTo
     * 当map移动时，出发此事件. 所有的瓦片移动操作实际是
     * 由map完成, moveTo's 的任务是接受一个bounds，并且确定
     * 此bounds下的所请求的图片是否被预加载。
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}
     * zoomChanged - {Boolean}
     * dragging - {Boolean}
     */
    moveTo: function(bounds, zoomChanged, dragging) {
        var me = this,
            ratio = this.lastResolution / this.map.getResolution(),
            style = this.map.layerContainerDiv.style,
            left = parseInt(style.left),
            top = parseInt(style.top);
        
        this.inZoom = zoomChanged ? true: false;
        this.changeDx = -left; 
        this.changeDy = -top;
        //如果是缩放出发的moveto，不进行fixposition。
        //当在缩放时进行平移，不能触发fixPosition()，因为
        //新图没有读出来，会出图错误。
        if(!zoomChanged && !me.isZoomming && me.useCanvas){
            this.fixPosition();
        }
        SuperMap.Layer.HTTPRequest.prototype.moveTo.apply(me, arguments);
        bounds = bounds || me.map.getExtent();

        // 当操作为移动时候，并不重绘整个canvas
        me.redrawCanvas = zoomChanged;
        me.dragging = dragging;
        
        // the new map resolution
        var resolution = this.map.getResolution();

        // 当一切缩放属性都添加完后才能进行缩放动画。
        if (me.useCanvas && ratio!=1) {
            if (!zoomChanged || dragging || (this.lastResolution === null) || (this.lastCanvasPosition === null)) {
            } else {
                var lefttop = this.getLayerPxFromLonLat(this.lastCanvasPosition);
                if(!this.map.isIEMultipTouch){
//                    this.transitionObj.begin(this.canvas, lefttop);
                }
            }
        }

        if (bounds != null) {            
            // 当grid为空，或是进行缩放必须重绘整个canvas
            var forceReTile = !me.grid.length || zoomChanged;
            // 获取所有tiles的bounds
            var tilesBounds = me.getTilesBounds();            
            if (this.singleTile) {
                if ( forceReTile || 
                     (!dragging && !tilesBounds.containsBounds(bounds))) {
                     if(zoomChanged && this.transitionEffect !== 'resize') {
                         this.removeBackBuffer();
                     }

                     if(!zoomChanged || this.transitionEffect === 'resize') {
                         this.applyBackBuffer(resolution);
                     }
                     
                    this.initSingleTile(bounds);
                }
            } else {
                if (forceReTile || !tilesBounds.containsBounds(bounds, true)) {
                    if(this.useCanvas){
                        //判断是否第一次加载
                        if(this.isFirstLoad){
                            this.redrawCanvas = true;
                            this.inZoom = true;
                            this.isFirstLoad = false;
                        }
                    }
                    if(this.zoomDuration && me.useCanvas) {
                        this.resetCanvas();
                        this.isZoomming = true;
                        window.clearTimeout(this._timeoutId);
                        this._timeoutId = window.setTimeout(
                            SuperMap.Function.bind(function(){
                                this.initGriddedTiles(bounds);
                            }, this),
                            this.zoomDuration
                        );
                    } else {
                        if(zoomChanged && this.transitionEffect === 'resize') {
                            this.applyBackBuffer(resolution);
                        }
                        this.initGriddedTiles(bounds);
                    }
                } else {
                    this.scheduleMoveGriddedTiles();
                }
            }
        }
        
        //通过改变量计算缩放前canvas左上角的地理位置。
        if (me.useCanvas){
            //获取改变量的位置。
            var canvasPosition = new SuperMap.Pixel(this.changeDx, this.changeDy); 
            //通过改变量计算canvas的地理位置。
            this.lastCanvasPosition = this.map.getLonLatFromLayerPx(canvasPosition);
        }
    },
    
    /**
     * Method: scheduleMoveGriddedTiles
     * 将移动tile加入计划当中去。
     */
    scheduleMoveGriddedTiles: function() {
        if(this.useHighSpeed){
            this.moveGriddedTiles();
        }else{
            this.timerId && window.clearTimeout(this.timerId);
            this.timerId = window.setTimeout(
                this._moveGriddedTiles,
                this.tileLoadingDelay
            );
        }
    },
    
    /**
     * Method: moveGriddedTiles
     */
    moveGriddedTiles: function() {
        var shifted = true;
        var buffer = this.buffer || 1;
        var tlLayer = this.grid[0][0].position;
        var offsetX = -this.changeDx;
        var offsetY = -this.changeDy;
        var tlViewPort = tlLayer.add(offsetX, offsetY);
        if (tlViewPort.x > -this.tileSize.w * (buffer - 1)) {
            this.shiftColumn(true);
        } else if (tlViewPort.x < -this.tileSize.w * buffer) {
            this.shiftColumn(false);
        } else if (tlViewPort.y > -this.tileSize.h * (buffer - 1)) {
            this.shiftRow(true);
        } else if (tlViewPort.y < -this.tileSize.h * buffer) {
            this.shiftRow(false);
        } else {
            shifted = false;
        }
        if (shifted) {
            if(this.useHighSpeed){
                this.moveGriddedTiles();
            }else{
                this.timerId = window.setTimeout(this._moveGriddedTiles, 0);
            }
        } else {
            //tiles have shifted already，so we can do something.
            //e.g. We can draw images in those tiles on a canvas, if no image is contained in tile,
            //we draw nothing.
        }
    },
    
    /**
     * Method: moveByPx
     * 重写父类方法。
     */
    moveByPx: function(dx, dy) {
        this._timeoutId && window.clearTimeout(this._timeoutId);
        //记录每次的改变量。
        this.changeDx +=dx;
        this.changeDy +=dy;
        if(this.useHighSpeed){
            this.fixPosition();
            this.scheduleMoveGriddedTiles();
        }
    },
    
    /**
     * Method: fixPosition
     * 平移逻辑。
     */
    fixPosition: function(){
        var tile, tileImg, i, j,
            me = this;
        //清空webgl
        me.canvasContext.viewport(0, 0, me.canvasContext.viewportWidth, me.canvasContext.viewportHeight);
//        me.canvasContext.clear(me.canvasContext.COLOR_BUFFER_BIT | me.canvasContext.DEPTH_BUFFER_BIT);
        for(i=0; i<this.lenRow; i++){
            for(j=0; j<this.lenColumn; j++){
                tile = me.grid[i][j];
                tileImg = tile.lastImage;
                //firefox，即使图片加载失败，complete属性依然为true，故用width和height判断
                //IE，图片加载失败时，width为28，height为30，故用complete判断。
                if((tileImg != null) && (tile.shouldDraw === true) && 
                        (tileImg.width > 0 && tileImg.height > 0) && 
                        tileImg.complete){
                    var positionX = tile.position.x - me.changeDx;
                    var positionY = tile.position.y - me.changeDy;
                    if(tile.lastImage.firstInView){
                        if(me.getExtent().containsLonLat(tile.bounds.getCenterLonLat())){
                            tile.lastImage.firstInView = false;
                        }
                        else if(me.getExtent().intersectsBounds(tile.bounds)){
                            tile.setFirstInView();
                        }
                    }
                    me.drawCanvasTile2(tile.lastImage, positionX, positionY, false);
                }
            }
        }
    },
    
    /**
     * Method: addTile
     * Gives subclasses of Grid the opportunity to create an 
     * OpenLayer.Tile of their choosing. The implementer should initialize 
     * the new tile and take whatever steps necessary to display it.
     *
     * Parameters
     * bounds - {<SuperMap.Bounds>}
     * position - {<SuperMap.Pixel>}
     *
     * Returns:
     * {<SuperMap.Tile>} The added SuperMap.Tile
     */
    addTile: function(bounds,position) {
        // 修改Tile类 todo
        if(this.useCanvas){
            return new SuperMap.Tile.WebGLImage(this, position, bounds, null, this.tileSize, this.useCanvas)
        }else{
            var tile = new this.tileClass(
                this, position, bounds, null, this.tileSize, this.tileOptions
            );
            this.events.triggerEvent("addtile", {tile: tile});
            return tile;
        }
    },
    
    /**
     * Method: drawCanvasTile
     * 当Image加载完成后，将image显示到canvas上。
     * 
     * Parameters:
     * image - {<Image>} The tile to draw
     * position - {<SuperMap.Pixel>} The position of the tile.
     */
    drawCanvasTile: function(image,  position) {
        if (this.dragging) {
            return;
        }
        if(this.inZoom){
            image.firstInView = false;
        }
        this.resetCanvas();
        var mapStyle = this.map.layerContainerDiv.style;
        var left = parseInt(mapStyle.left),
            top = parseInt(mapStyle.top); 
        //解决ie||移动设备下canvas绘图出错。
        if(SuperMap.Browser.name === 'msie'){
            var context = {
                layer: this,
                position: position,
                image: image,
                mapStyle: mapStyle
            };    
            var _drawCanvasIE = SuperMap.Function.bind(this.drawCanvasIE, context);
            window.setTimeout(_drawCanvasIE,100);
        }else{
            //通过position来绘制图片解决白线问题
            this.drawCanvasTile2(image, position.x + left, position.y + top);
        }
    },

    /**
     * Method: drawImgData
     * canvas上绘制imgdata字符串
     * 
     * Parameters:
     * imgData - {<String>} imgdata字符串
     * p - {<SuperMap.Pixel>} tile的位置.
     */
    drawImgData:function(imgData,p){
        var mapStyle = this.map.layerContainerDiv.style;
        var left = parseInt(mapStyle.left),
            top = parseInt(mapStyle.top);
//        this.canvasContext.putImageData(imgData, p.x+left, p.y+top);
    },
    
    //在ie/移动设备下解决连续绘canvas出错而设置的函数。
    drawCanvasIE:function(){
        this.layer.drawCanvasTile2(this.image, this.position.x + parseInt(this.mapStyle.left), this.position.y + parseInt(this.mapStyle.top));
    },
    shaderProgram:null,
    /**
     * Method: drawCanvasTile2
     * 将image显示到canvas上。
     * 
     * Parameters:
     * image - {<Image>} 要绘制的图块对象
     * positionX - {Number} tile在canvas中的x坐标
     * positionY - {Number} tile在canvas中的y坐标
     * clear - {boolean} 是否需要重新清除。
     */
    drawCanvasTile2: function(image, positionX, positionY, clear){
        clear = clear || true;
        if(image){
            var gl =  this.canvasContext;
            var shaderProgram;
            if(true)
            {
                //初始化渲染器
                var fragmentShader = this.getShader(gl, "fragment");
                var vertexShader = this.getShader(gl, "vertex");

                shaderProgram = gl.createProgram();
                gl.attachShader(shaderProgram, vertexShader);
                gl.attachShader(shaderProgram, fragmentShader);
                gl.linkProgram(shaderProgram);

                if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                    alert("Could not initialise shaders");
                }

                gl.useProgram(shaderProgram);

                shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
                gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

                shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
                gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

                shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
                shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
                shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
            }

            //计算瓦片位置
            var cubeVertexPositionBuffer00 = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer00);
            var w = gl.viewportWidth;
            var h = gl.viewportHeight;
            var nScale;
            if(w >= h)
            {
                nScale = this.tileSize.h/h;
            }
            else
            {
                nScale = this.tileSize.h/w;
            }
            //定义256*256的矩形在当前视图中的矩阵
            var vertices = [
                -1*nScale, -1*nScale,  0,
                1*nScale, -1*nScale,  0,
                1*nScale,  1*nScale,  0,
                -1*nScale,  1*nScale,  0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            cubeVertexPositionBuffer00.itemSize = 3;
            cubeVertexPositionBuffer00.numItems = 4;

            var cubeVertexTextureCoordBuffer00 = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer00);
            var textureCoords = [
                0.0, 0.0,
                1.0, 0.0,
                1.0, 1.0,
                0.0, 1.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
            cubeVertexTextureCoordBuffer00.itemSize = 2;
            cubeVertexTextureCoordBuffer00.numItems = 4;

            var cubeVertexIndexBuffer00 = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer00);
            var cubeVertexIndices = [
                0, 1, 2,      0, 2, 3
            ];
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
            cubeVertexIndexBuffer00.itemSize = 1;
            cubeVertexIndexBuffer00.numItems = 6;

            //加入图片
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.bindTexture(gl.TEXTURE_2D, null);

            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

            var pMatrix = mat4.create();
            var mvMatrix = mat4.create();
            mat4.perspective(90, gl.viewportWidth / gl.viewportHeight, 1, 100.0, pMatrix);

            mat4.identity(mvMatrix);
            //进行平移
            var x = (positionX - w/2 )*2*nScale/this.tileSize.h + nScale;
            var y = (h/2 - positionY)*2*nScale/this.tileSize.h - nScale;
            mat4.translate(mvMatrix, [x, y, -1.0]);

            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer00);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer00.itemSize, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexTextureCoordBuffer00);
            gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, cubeVertexTextureCoordBuffer00.itemSize, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.uniform1i(shaderProgram.samplerUniform, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer00);
            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
            gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer00.numItems, gl.UNSIGNED_SHORT, 0);
        }
    },
    /**
     * Method: getShader
     * 初始化着色器
     *
     * Parameters:
     * gl - {<WebGLRenderingContext>} webgl上下文
     * name - {String} 可以为片元着色器“fragment”或顶点着色器“vertex”
     */
    getShader:function(gl,name){
        var shader;
        var str = "";
        if(name == "fragment" )
        {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
            str = "precision mediump float;    varying vec2 vTextureCoord;    uniform sampler2D uSampler;void main(void){gl_FragColor = texture2D(uSampler, vec2(vTextureCoord.s, vTextureCoord.t));}";
        }
        else if(name == "vertex" )
        {
            shader = gl.createShader(gl.VERTEX_SHADER);
            str = "attribute vec3 aVertexPosition;    attribute vec2 aTextureCoord;    uniform mat4 uMVMatrix;    uniform mat4 uPMatrix;    varying vec2 vTextureCoord;    void main(void) {    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);    vTextureCoord = aTextureCoord;    }";
        }
        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    },

    /**
     * Method: resetCanvas
     * 移动canvas到原点，并清除canvas上的所有东西 
     */
    resetCanvas: function() {            
        // because the layerContainerDiv has shifted position (for non canvas layers), reposition the canvas.
        if (this.redrawCanvas) {
            this.redrawCanvas = false;
            // clear canvas by reseting the size
            // broken in Chrome 6.0.458.1:
            // http://code.google.com/p/chromium/issues/detail?id=49151
            this.canvas.width = this.map.viewPortDiv.clientWidth;
            this.canvas.height = this.map.viewPortDiv.clientHeight;
            this.canvasContext.viewportWidth = this.canvas.width;
            this.canvasContext.viewportHeight = this.canvas.height;

            //清空webgl
            this.canvasContext.clearColor(0.0, 0.0, 0.0, 0);
            this.canvasContext.enable(this.canvasContext.DEPTH_TEST);
            this.canvasContext.viewport(0, 0, this.canvasContext.viewportWidth, this.canvasContext.viewportHeight);
            this.canvasContext.clear(this.canvasContext.COLOR_BUFFER_BIT | this.canvasContext.DEPTH_BUFFER_BIT);
            if (this.useCanvas) {
                // store the current resolution and canvas position for transition
                this.lastResolution = this.map.getResolution(); 
            }
            return true;
        }
        return false;
    },
    
    //重写grid里的initGriddedTiles
    initGriddedTiles:function(bounds) {
        this.isZoomming = false;
        SuperMap.Layer.Grid.prototype.initGriddedTiles.apply(this,arguments);
        this.lenRow = this.grid.length;
        this.lenColumn = this.grid[0].length;
    },
    
    /**
     * Method: getLayerPxFromLonLat
     * A wrapper for the <SuperMap.Map.getLayerPxFromLonLat()> method,
     * which takes into account that the canvas element has a fixed size and 
     * it always moved back to the original position.
     * 
     * Parameters:
     * lonlat - {<SuperMap.LonLat>}经纬度
     *
     * Returns:
     * {<SuperMap.Pixel>}像素点
     */
    getLayerPxFromLonLat: function(lonlat) {
        return this.usesCanvas ? this.map.getPixelFromLonLat(lonlat) : 
            this.map.getLayerPxFromLonLat(lonlat);
    },
    
    /**
     * Method: getLayerPxFromLonLat
     * A wrapper for the <SuperMap.Map.getViewPortPxFromLayerPx()> method.
     * 
     * Parameters:
     * layerPx - {<SuperMap.Pixel>}
     * 
     * Returns:
     * {<SuperMap.Pixel>}
     */ 
    getViewPortPxFromLayerPx: function(layerPx) {
        return this.useCanvas ? layerPx : this.map.getViewPortPxFromLayerPx(layerPx);
    },
    
    /**
     * Method: getURL
     * 根据瓦片的bounds获取URL。
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}  瓦片的bounds。
     *
     * Returns:
     * {String} 瓦片的URL。
     */
    getURL: function (bounds) {
        var me = this,
            xyz;
        bounds = me.adjustBounds(bounds);
        xyz = me.getXYZ(bounds);
        return me.getTileUrl(xyz);
    },
    
    /**
     * Method: getXYZ
     * 根据瓦片的bounds获取xyz值。
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}  瓦片的bounds。
     *
     * Returns:
     * {Object} 一组键值对，表示瓦片X, Y, Z方向上的索引。
     */
    getXYZ: function (bounds) {
        var me = this,
            x, y, z,
            map = me.map,
            res = map.getResolution(),
            tOrigin = me.getTileOrigin(),
            tileSize = me.tileSize;
        x = Math.round((bounds.left - tOrigin.lon) / (res * tileSize.w));
        y = Math.round((tOrigin.lat - bounds.top) / (res * tileSize.h));
        z = map.getZoom();
        return {"x": x, "y": y, "z": z};
    },
    
    /**
     * Method: getMemoryImg
     * 根据瓦片的bounds获取内存中该记录的image。
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}  瓦片的bounds。
     *
     * Returns:
     * {Object} image对象，不存在返回null
     */
    getMemoryImg: function(bounds){
        var me = this, key = me.getXYZ(bounds);
        key = "x" + key.x + "y" + key.y + "z" + key.z;
        return me.memoryImg[key];
    },
    
    /**
     * Method: addMemoryImg
     * 记录瓦片bounds和对应的图片信息。
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}  瓦片的bounds。
     * image - {<Image>} 瓦片对应的图片信息
     *
     */
    addMemoryImg:function(bounds, image, context){

        var me = this;// key = me.getXYZ(bounds);

        if(me.bufferImgCount == 0)
            return;

        var newImgTag = context.newImgTag;
        if(newImgTag&&newImgTag!=""){
            //删除缓存图片
            if(me.memoryKeys.length >= me.bufferImgCount){
                var keyDel = me.memoryKeys.shift();
                me.memoryImg[keyDel] = null;
                delete me.memoryImg[keyDel];
            }
            var keys = newImgTag.split("_");
            var key = "x" + keys[0] + "y" + keys[1] + "z" + keys[2];
            //缓存图片并保存索引。
            me.memoryImg[key] = image;
            me.memoryKeys.push(key);
        }
    },
    
    /** 
     * Method: initResolutions
     * 初始化Resolutions数组。（重写基类方法）
     */
    initResolutions: function () {
        // 我们想要得到resolutions，以下是我们的策略：
        // 1. 如果在layer配置中定义了resolutions和scales，使用它们，
        // 2. 如果在layer配置中定义resolutions，使用它，
        // 3. 否则，如果在layer配置中定义scales，那么从这些scales中得出resolutions，
        // 4. 再者，试图从在layer配置中设置的 maxResolution,minResolution, numZoomLevels, maxZoomLevel 计算出resolutions，
        // 5. 如果在map中设置了resolutions和scales，使用它们，
        // 6. 如果我们仍然没有获得resolutions，并且resolutions在map中已经定义了，使用它们，
        // 7. 否则，如果scales在map中定义了，那么从scales中得出resolutions，
        // 8. 再者，试图从在map中设置的maxResolution, minResolution, numZoomLevels, maxZoomLevel 计算出resolutions。
        
        var me = this, 
            i, len, p, startZoomLevel,
            props = {}, 
            alwaysInRange = true;
        
        //如果在layer中定义了resolutions和scales，直接使用layer的resolutions和scales，并且通过它们计算出
        //maxResolution, minResolution, numZoomLevels, maxScale和minScale
        if (me.resolutions && me.scales) {
            var len = me.resolutions.length;
            me.resolutions.sort(function(a, b) {
                return (b - a);
            });
            if (!me.maxResolution) {
                me.maxResolution = me.resolutions[0];
            }

            if (!me.minResolution) {
                me.minResolution = me.resolutions[len-1];
            }
            me.scales.sort(function(a, b) {
                return (a - b);
            });
            if (!me.maxScale) {
                me.maxScale = me.scales[len-1];
            }

            if (!me.minScale) {
                me.minScale = me.scales[0];
            }
            me.numZoomLevels = len;
            return;
        }

        // 从layer的配置中获得计算resolutions的数据。
        for (i = 0, len = me.RESOLUTION_PROPERTIES.length; i < len; i++) {
            p = me.RESOLUTION_PROPERTIES[i];
            props[p] = me.options[p];
            if (alwaysInRange && me.options[p]) {
                alwaysInRange = false;
            }
        }
        
        if (me.alwaysInRange == null) {
            me.alwaysInRange = alwaysInRange;
        }
        
        // 如果没有得到resolutions，利用scales计算resolutions。
        if (props.resolutions == null) {
            props.resolutions = me.resolutionsFromScales(props.scales);
        }

        // 如果仍没有得到resolutions，利用layer配置中设置的
        //maxResolution,minResolution, numZoomLevels, maxZoomLevel 计算出resolutions
        if (props.resolutions == null) {
            props.resolutions = me.calculateResolutions(props);
        }
        
        //如果没有从layer的配置数据中获得resolutions，并且map中同时设置了resolutions和scales，直接使用它们，
        //并且通过它们计算出maxResolution, minResolution, numZoomLevels, maxScale和minScale
        if (me.map.resolutions && me.map.scales) {
            me.resolutions = me.map.resolutions;
            me.scales = me.map.scales;
            var len = me.resolutions.length;
            me.resolutions.sort(function(a, b) {
                return (b - a);
            });
            if (!me.maxResolution) {
                me.maxResolution = me.resolutions[0];
            }

            if (!me.minResolution) {
                me.minResolution = me.resolutions[len-1];
            }
            me.scales.sort(function(a, b) {
                return (a - b);
            });
            if (!me.maxScale) {
                me.maxScale = me.scales[len-1];
            }

            if (!me.minScale) {
                me.minScale = me.scales[0];
            }
            me.numZoomLevels = len;
            return;
        }
        
        //如果此时仍没有计算出resolutions，那么先从baselayer上获取,之后从map中获得（方法同上），最后再计算。
        if (props.resolutions == null) {
            for (i = 0, len = me.RESOLUTION_PROPERTIES.length; i<len; i++) {
                p = me.RESOLUTION_PROPERTIES[i];
                props[p] = me.options[p] != null ?
                    me.options[p] : me.map[p];
            }
            if (props.resolutions == null) {
                props.resolutions = me.resolutionsFromScales(props.scales);
            }
            if (props.resolutions == null) {
                if(me.map.baseLayer!=null){
                    props.resolutions = me.map.baseLayer.resolutions;
                }
            }            
            if (props.resolutions == null) {
                props.resolutions = me.calculateResolutions(props);
            }
        }

        var maxRes;
        if (me.options.maxResolution && me.options.maxResolution !== "auto") {
            maxRes = me.options.maxResolution;
        }
        if (me.options.minScale) {
            maxRes = SuperMap.Util.getResolutionFromScaleDpi(me.options.minScale, me.dpi, me.units, me.datumAxis);
        }

        var minRes;
        if (me.options.minResolution && me.options.minResolution !== "auto") {
            minRes = me.options.minResolution;
        }
        if (me.options.maxScale) {
            minRes = SuperMap.Util.getResolutionFromScaleDpi(me.options.maxScale, me.dpi, me.units, me.datumAxis);
        }

        if (props.resolutions) {

            props.resolutions.sort(function(a, b) {
                return (b - a);
            });
            
            if (!maxRes) {
                maxRes = props.resolutions[0];
            }

            if (!minRes) {
                var lastIdx = props.resolutions.length - 1;
                minRes = props.resolutions[lastIdx];
            }
        }

        me.resolutions = props.resolutions;
        if (me.resolutions) {
            len = me.resolutions.length;
            me.scales = [len];
            if(me.map.baseLayer){
                startZoomLevel = this.calculateResolutionsLevel(me.resolutions);
            }
            else{
                startZoomLevel = 0;
            }
            for (i = startZoomLevel; i < len + startZoomLevel; i++) {
                me.scales[i] = SuperMap.Util.getScaleFromResolutionDpi(me.resolutions[i- startZoomLevel], me.dpi, me.units, me.datumAxis);
            }
            me.numZoomLevels = len;
        }
        me.minResolution = minRes;
        if (minRes) {
            me.maxScale = SuperMap.Util.getScaleFromResolutionDpi(minRes, me.dpi, me.units, me.datumAxis);
        }
        me.maxResolution = maxRes;
        if (maxRes) {
            me.minScale = SuperMap.Util.getScaleFromResolutionDpi(maxRes, me.dpi, me.units, me.datumAxis);
        }
    },
    
    /** 
     * Method: calculateResolutionsLevel
     * 根据resolutions数组计算scale数组。
     *
     * Parameters:
     * resolutions - {Array({Number})}resolutions数组
     */
    calculateResolutionsLevel: function(resolutions){
        var me = this, j, len, resolution,
                 baseLayerResolutions;
        baseLayerResolutions = me.map.baseLayer.resolutions;
        len = baseLayerResolutions.length;
        resolution = resolutions[0];
        for(j=0; j<len; j++){
            if(resolution == baseLayerResolutions[j]){
                return j;
            }
        }
        return 0;
    },

    /** 
     * Method: resolutionsFromScales
     * 根据scales数组计算resolutions数组。（重写基类方法）
     *
     * Parameters:
     * scales - {Array({Number})}scales数组。
     */
    resolutionsFromScales: function (scales) {
        if (scales == null) {
            return;
        }
        var me = this,
            resolutions, len;
        len = scales.length;
        resolutions = [len];
        for (var i = 0; i < len; i++) {
            resolutions[i] = SuperMap.Util.getResolutionFromScaleDpi(
            scales[i], me.dpi, me.units, me.datumAxis);
        }
        return resolutions;
    },
    
    /**
     * Method: calculateResolutions
     * 根据已提供的属性计算resolutions数组。（重写基类方法）
     *
     * Parameters:
     * props - {Object} 
     *
     * Return:
     * {Array({Number})} resolutions数组.
     */
    calculateResolutions: function (props) {
        var me = this,
            maxResolution = props.maxResolution;
        if (props.minScale != null) {
            maxResolution = SuperMap.Util.getResolutionFromScaleDpi(props.minScale, me.dpi, me.units, me.datumAxis);
        } else if (maxResolution == "auto" && me.maxExtent != null) {
            var viewSize, wRes, hRes;
            viewSize = me.map.getSize();
            wRes = me.maxExtent.getWidth() / viewSize.w;
            hRes = me.maxExtent.getHeight() / viewSize.h;
            maxResolution = Math.max(wRes, hRes);
        }

        var minResolution = props.minResolution;
        if (props.maxScale != null) {
            minResolution = SuperMap.Util.getResolutionFromScaleDpi(props.maxScale, me.dpi, me.units, me.datumAxis);
        } else if (props.minResolution == "auto" && me.minExtent != null) {
            var viewSize, wRes, hRes;
            viewSize = me.map.getSize();
            wRes = me.minExtent.getWidth() / viewSize.w;
            hRes = me.minExtent.getHeight()/ viewSize.h;
            minResolution = Math.max(wRes, hRes);
        }

        if(typeof maxResolution !== "number" &&
            typeof minResolution !== "number" &&
            this.maxExtent != null) {
            // maxResolution for default grid sets assumes that at zoom
            // level zero, the whole world fits on one tile.
            var tileSize = this.map.getTileSize();
            maxResolution = Math.max(
                this.maxExtent.getWidth() / tileSize.w,
                this.maxExtent.getHeight() / tileSize.h
            );
        }

        var maxZoomLevel = props.maxZoomLevel;
        var numZoomLevels = props.numZoomLevels;
        if (typeof minResolution === "number" &&
            typeof maxResolution === "number" && numZoomLevels === undefined) {
            var ratio = maxResolution / minResolution;
            numZoomLevels = Math.floor(Math.log(ratio) / Math.log(2)) + 1;
        } else if (numZoomLevels === undefined && maxZoomLevel != null) {
            numZoomLevels = maxZoomLevel + 1;
        }

        if (typeof numZoomLevels !== "number" || numZoomLevels <= 0 ||
            (typeof maxResolution !== "number" &&
               typeof minResolution !== "number")) {
            return;
        }

        var resolutions = [numZoomLevels];
        var base = 2;
        if (typeof minResolution == "number" && typeof maxResolution == "number") {
            base = Math.pow(
                    (maxResolution / minResolution),
                (1 / (numZoomLevels - 1))
            );
        }

        if (typeof maxResolution === "number") {
            for (var i = 0; i < numZoomLevels; i++) {
                resolutions[i] = maxResolution / Math.pow(base, i);
            }
        } else {
            for (i = 0; i < numZoomLevels; i++) {
                resolutions[numZoomLevels - 1 - i] =
                    minResolution * Math.pow(base, i);
            }
        }

        return resolutions;
    },
    
    CLASS_NAME: "SuperMap.Layer.WebGLLayer"

});
