/* COPYRIGHT 2012 SUPERMAP
 * 本程序只能在有效的授权许可下使用。
 * 未经许可，不得以任何手段擅自使用或传播。*/

 /**
 * @requires SuperMap/Tile.js
 */
 
/**
 * Class: SuperMap.Tile.WebGLImage
 * 瓦片拼接类（webgl）。
 * 用于管理图层图像拼贴。
 *
 * Inherits from:
 *  - <SuperMap.Tile>
 */
 
SuperMap.Tile.WebGLImage = SuperMap.Class(SuperMap.Tile, {

    /** 
     * Property: url
     * {String} The URL of the image being requested. No default. Filled in by
     * layer.getURL() function.
     * 图片的url。
     */
    url: null,
    
    /** 
     * Property: newImgTag
     * {String} tile最近请求的image的标签。
     */
    newImgTag:null,
    
    /** 
     * Property: canvasType
     */    
    canvasType: null,
    
    /**
     * Property: frame
     * {DOMElement} The canvas element is appended to the frame.  Any gutter on
     * the canvas will be hidden behind the frame. 
     */ 
    frame: null,
    
    /**
     * Property: isLoading
     * {Boolean} Indicates if the tile is currently waiting on a loading image. 
     */ 
    isLoading: false,
    
    /** 
     * Property: canvas
     * {DOMElement} The canvas element on which the image is drawn.
     */
    canvas: null,
    
    /** 
     * Property: lastImage
     * {Image} The last requested image object. This property is used to make sure
     *      that only the recent image is drawn.
     */
    lastImage: null,
    
    /** 
     * Property: lastBounds
     * {<SuperMap.Bounds>} The bounds of the last requested image, needed for 
     *      VirtualCanvasImage.displayImage().
     */
    lastBounds: null,
    
    /**
     * Property: isBackBuffer
     * {Boolean} Is this tile a back buffer tile?
     */
    isBackBuffer: false,
        
    /**
     * Property: backBufferTile
     * {<SuperMap.Tile>} A clone of the tile used to create transition
     *     effects when the tile is moved or changes resolution.
     */
    backBufferTile: null,
    
     /**
     * Property: fadingTimer
     * {Number} 记录fading动画的索引ID
     *
     */
    fadingTimer:null,

    /**
     * Constructor: SuperMap.Tile.WebGLImage
     * 瓦片拼接类。
     * 
     * Parameters:
     * layer - {<SuperMap.Layer>} 瓦片所在的图层。
     * position - {<SuperMap.Pixel>}左上角的点。
     * bounds - {<SuperMap.Bounds>}瓦片大小。
     * url - {<String>}瓦片对应的url地址。
     * size - {<SuperMap.Size>}瓦片的size。
     * canvasType -
     */   
    initialize: function(layer, position, bounds, url, size, canvasType) {
        var me = this;
        SuperMap.Tile.prototype.initialize.apply(me, arguments);
        me.url = url; //deprecated remove me
        me.canvasType = canvasType;        
        me.events.addEventType("reprojectionProgress");
        me.events.addEventType("filterProgress");
    },

    /** 
     * APIMethod: destroy
     * 解构 WebGLImage 类，释放资源。
     */
    destroy: function() {
        SuperMap.Tile.prototype.destroy.apply(this, arguments);
        var me = this;
        me.lastImage = null;
        me.canvas = null;
        me.canvasContext = null;
        // clean up the backBufferTile if it exists
        if (me.backBufferTile) {
            me.backBufferTile.destroy();
            me.backBufferTile = null;
            me.layer.events.unregister("loadend", me, me.hideBackBuffer);
        }
    },

    /**
     * Method: clone
     * 创建当前类的副本。
     * Parameters:
     * obj - {<SuperMap.Tile.Image>} The tile to be cloned
     *
     * Returns:
     * {<SuperMap.Tile.Image>} An exact clone of this <SuperMap.Tile.WebGLImage>
     */
    clone: function (obj) {
        var me = this;
        if (obj == null) {
            obj = new SuperMap.Tile.WebGLImage(me.layer,
                                            me.position, 
                                            me.bounds, 
                                            me.url, 
                                            me.size,
                                            me.canvasType);        
        } 
        //pick up properties from superclass
        obj = SuperMap.Tile.prototype.clone.apply(me, [obj]);
        // a new canvas element should be created for the clone
        obj.canvas = null;
        return obj;
    },
    
    /**
     * Method: draw
     * Check that a tile should be drawn, and draw it. Starts a
     * transition if the layer requests one.
     * 
     * Returns:
     * {Boolean} Always returns true.
     */
    draw: function() {
        var me = this;
        if (me.layer != me.layer.map.baseLayer && me.layer.reproject) {
            me.bounds = me.getBoundsFromBaseLayer(me.position);
        }
        var drawTile = SuperMap.Tile.prototype.draw.apply(me, arguments);
        me.startTransition(drawTile);
        if (!drawTile) {
            return;
        }
        if (me.isLoading) {
            // if we're already loading, send 'reload' instead of 'loadstart'.
            me.events.triggerEvent("reload"); 
        } else {
            me.isLoading = true;
            me.events.triggerEvent("loadstart");
        }
        return me.renderTile();  
    },
    
    /**
     * Method: startTransition
     * Creates a backbuffer tile (if it does not exist already)
     * and then displays this tile. 
     * 
     * Parameters:
     * drawTile - {<Boolean>} Should the tile be drawn?
     */
    startTransition: function(drawTile) {
        // <SuperMap.CanvasLayer.> takes care about the transition  
    },
    
    /**
     * Method: renderTile
     * Creates the canvas element and sets the URL.
     * 
     * Returns:
     * {Boolean} Always returns true.
     */
    renderTile: function() {
        var me = this;    
        me.url = me.layer.getURL(me.bounds);
        me.positionImage(); 
        return true;
    },
    
    /**
     * Method: createImage
     * Creates the image and starts loading it.
     */
    createImage: function() {
        //如果在缓存的内存图片可以找到的话，就不再创建图片，直接调用图片的onLoad事件的响应函数
        //不过这里需要注意，制作专题图的时候，需要清除已经缓存的内存图片
        //否则有可能看不到专题图的图片。        
    
        if (this.lastImage !== null && !this.lastImage.complete) {
            // 平移多次时候将不会请求图片，chrome下不能用。 https://bugs.webkit.org/show_bug.cgi?id=35377
            this.lastImage.src = '';
        }            
        
        //先查看内存中是否有保存
        var me = this, image = me.layer.getMemoryImg(me.bounds);        
        me.lastBounds = me.bounds.clone();        
        if (image) {
            me.newImgTag = "";
            //找到就显示
            me.lastImage = image;
            me.layer.drawCanvasTile(image, me.position);
            if(me.firstInView){
                me.setFirstInView();
            }
        } else {
            //构造新的image对象
            var key = me.layer.getXYZ(me.bounds);
            //如果使用andriod加载，则需本地加载完成后重新设置url。否则直接加载
            if (!SuperMap.isApp) {
                me.newImgTag = key.x + "_" + key.y + "_" + key.z;
                me.loadTileImage();
            } else{
                var strX = key.x,
                    strY = key.y,
                    strZ;
                if(me.layer instanceof SuperMap.Layer.CloudLayer || me.layer.storageType=="db"){
                    strZ = key.z;
                } else{
                    strZ = me.layer.scales[key.z].toExponential();
                }
                var canvasImageContext = {
                    tile: me,
                    X: strX,
                    Y: strY,
                    Z: strZ,
                    viewRequestID: me.layer.map.viewRequestID
                };
                me.newImgTag = strX + "_" + strY + "_" + strZ;
                // var saveUrlProxy = function() {
                    // this.tile.onLoadsaveUrlFunction(this);
                // }
                me.lastImage = new Image();
        
        var methodName = me.getMethodName();
        var callBack = function(canvasImageContext,methodName){
            return function(r){
            window[methodName] = null;
            canvasImageContext.tile.onLoadsaveUrlFunction(canvasImageContext,r);
            }
        }(canvasImageContext,methodName);
        window[methodName] = callBack;
                /*window.plugins.localstoragemanager.getImg(me.url, me.layer.name, strX, strY, strZ,methodName,
                    function(){},
                    function(e){//errorfunction
                    }
                ); */
                cordova.exec(function(){}, function(e){}, "LocalStoragePlugin","getImg", [me.url, me.layer.name, strX, strY, strZ,methodName]);
            }
        }
    },
    
    getMethodName:function(){
    var dateTime=new Date();
    var yy=dateTime.getFullYear();
    var MM1=dateTime.getMonth()+1;  //因为1月这个方法返回为0，所以加1
    var dd=dateTime.getDate();
        var hh=dateTime.getHours();
        var mm=dateTime.getMinutes();
    var ss=dateTime.getSeconds();
    var ms = dateTime.getMilliseconds();
    
    var name = "getImgFromLocal_"+yy+MM1+dd+hh+mm+ss+ms+(Math.round(Math.random()*10000));
    return name;
    },
    
    //重置本地URL，加载图片
    onLoadsaveUrlFunction:function(canvasImageContext, r) {
        var me = this;
        var nowImgTag = r.x + "_" + r.y + "_" + r.z;
        if(me.newImgTag != nowImgTag){
            return;
        }
        if(r.data){
            if(r.data=="null"){
            return false;
            }
            var src = "data:image/jpeg;base64,"+r.data;
        }
        else{
            var src = me.layer.sdcardPath + "SuperMap/" + me.layer.name + "/" +
                        canvasImageContext.Z + "/" + canvasImageContext.X + "_" + canvasImageContext.Y + ".png";
        }
            me.url = src;
            me.loadTileImage();
    },
    
    /**
     * Method: loadTileImage
     * 通过url加载图片，并对加载后的图片做缓存处理
     */
    loadTileImage: function(){
        var me = this, 
            image = new Image();
        image.firstInView = true;
        me.lastImage = image;
        var context = { 
            image: image,
            tile: me,
            viewRequestID: me.layer.map.viewRequestID,
            newImgTag: me.newImgTag
            //bounds: me.bounds.clone()// todo: do we still need the bounds? guess no
            //urls: this.layer.url.slice() // todo: for retries?
        };
        
        var onLoadFunctionProxy = function() {
            if(this.tile.newImgTag == this.newImgTag){
                this.tile.onLoadFunction(this);    
            }
        };
        var onErrorFunctionProxy = function() {
            this.tile.onErrorFunction(this);
        };
            
        image.onload = SuperMap.Function.bind(onLoadFunctionProxy, context); 
        image.onerror = SuperMap.Function.bind(onErrorFunctionProxy, context);
        //图片的url赋予给image后就会从服务器获取到图片
        image.src = me.url;
    },
    
    /**
     * Method: positionImage
     * Sets the position and size of the tile's frame and
     * canvas element.
     */
    positionImage: function() {
        var me = this;
        // if the this layer doesn't exist at the point the image is
        // returned, do not attempt to use it for size computation
        if (!me.layer) {
            return;
        }
        me.createImage();
    },
    
    /**
     * Method: onLoadFunction  
     * Called when an image successfully finished loading. Draws the
     * image on the canvas.  图片加载成功后在canvas上进行绘制
     * 
     * Parameters:
     * context - {<Object>} The context from the onload event.
     */
    onLoadFunction: function(context) {
        if ((this.layer === null) ||
                (context.viewRequestID !== this.layer.map.viewRequestID) ||
                (context.image !== this.lastImage)) {
            return;
        }
        this.canvasContext = null;
        var image = context.image;
        if(context.tile.shouldDraw){
            //绘制图片

            this.displayImage(image,context.newImgTag);
        }
        //保存图片缓存
        this.layer.addMemoryImg(this.lastBounds, image, context);
    },

    /**
     * APIMethod: drawImgData
     *
     * 重新绘制进行像素操作后的imgdata
     *
     * Parameters:
     * imgData - {<String>} canvas.toDataURL()得到的图片字符串
     * evt - {<Object>}  tileloaded事件返回的事件对象，layer.events.on({tileloaded: function(evt) {}})
     */
    drawImgData:function(imgData,evt){
        var m,idx=evt.idx;

        m = new Image();
        m.onload = function(me,m,idx){
            return function(){
                if(idx==me.newImgTag){
                    //m.firstInView = true;
                    me.lastImage = m;
                    me.layer.drawCanvasTile(m, me.position);
                }
            }
        }(this,m,idx);
        if(idx==this.newImgTag){
            m.src = imgData;
        }
    },
    

    
    /**
     * Method: displayImage
     * Takes care of resizing the canvas and then draws the 
     * canvas.
     * 
     * Parameters:
     * image - {Image/Canvas} The image to display
     * idx - {String} tile的标记
     */
    displayImage: function(image,idx) {
        var me = this,
            layer = me.layer;
        if (layer.canvasFilter && !image.filtered) {
            // if a filter is set, apply the filter first and
            // then use the result
            me.filter(image);
            return;
        }

        if(image.firstInView){
            me.setFirstInView();
        }

        //绘制图片
        layer.fixPosition();
//        layer.drawCanvasTile(image, me.position);
        //更新图片状态
        me.isLoading = false; 



        me.events.triggerEvent("loadend",{"idx":idx});
    },

    /**
     * Method: onErrorFunction
     * Called when an image finished loading, but not successfully. 
     * 
     * Parameters:
     * context - {<Object>} The context from the onload event.
     */    
    onErrorFunction: function(context) {
        var me = this;
        //图片请求失败，就不绘这个tile，防止调用canvasContext.drawImage方法出错。
        if (context.image !== me.lastImage) {
            /* Do not trigger 'loadend' when a new image was request
             * for this tile, because then 'reload' was triggered instead
             * of 'loadstart'.
             * If we would trigger 'loadend' now, Grid would get confused about
             * its 'numLoadingTiles'.
             */
            return;
        }
        //retry? with different url?

        me._attempts = (me._attempts) ? (me._attempts + 1) : 1;
        if (me._attempts <= SuperMap.IMAGE_RELOAD_ATTEMPTS) {
            if (me.layer.url && SuperMap.Util.isArray(me.layer.url) && me.layer.url.length > 1){
                me.layer._attempts = me._attempts;
                me.draw();
                return ;
            }
        }else
        {
            me._attempts = 0;
        }
        
        me.events.triggerEvent("loadend");
    },
    /**
     * Method: setFirstInView
     *
     */
    setFirstInView: function(){
        var me = this;
        if(!me.fadingTimer){
            var context = {
                canvasImage:me,
                image: me.lastImage
            };
            me.fadingTimer = window.setTimeout(SuperMap.Function.bind(me.setNotFirstInView, context),100);
        }
    },
    /**
     * Method: setNotFirstInView
     *
     */
    setNotFirstInView: function(){
        var me = this;
       // me.lastImage.firstInView = false;
        me.image.firstInView = false;
        window.clearTimeout(me.canvasImage.fadingTimer);
        me.canvasImage.fadingTimer = null;
        me.canvasImage.displayImage(me.image);
    },
    /** 
     * Method: show
     * Show the tile. Called in <SuperMap.Tile.showTile()>.
     */
    show: function() {},
    
    /** 
     * Method: hide
     * Hide the tile.  To be implemented by subclasses (but never called).
     */
    hide: function() { },
 
    /** 
     * Method: isTooBigCanvas
     * Used to avoid that the backbuffer canvas gets too big when zooming in very fast.
     * Otherwise drawing the canvas would take too long and lots of memory would be
     * required. 
     */
    isTooBigCanvas: function(size) {
        return size.w > 5000;    
    },
    /**
     * Method: moveTo
     *
     */
    moveTo: function (bounds, position, redraw) {
        if (redraw == null) {
            redraw = true;
        }
        this.bounds = bounds.clone();
        this.position = position.clone();
        //设置不重置canvas    
        this.layer.redrawCanvas = false;
        if (redraw) {
            this.draw();
        }
    },

    CLASS_NAME: "SuperMap.Tile.WebGLImage"
  });  
