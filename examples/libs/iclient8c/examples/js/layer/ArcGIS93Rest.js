
/**
 * @requires SuperMap/Layer/CanvasLayer.js
 * @requires SuperMap/Layer/Grid.js
 * @requires SuperMap/Tile/Image.js
 */

/**
 * Class: SuperMap.Layer.ArcGIS93Rest
 *  ArcGIS服务图层类。
 *     用于显示ArcGIS Server 9.3的地图，使用<SuperMap.Layer.ArcGIS93Rest>的
 *     构造函数可以创建ArcGIS93Rest图层，更多信息查看：
 *     http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/index.html ;
 *
 *
 * 
 * Inherits from:
 *  - <SuperMap.Layer.CanvasLayer>
 */
SuperMap.Layer.ArcGIS93Rest = SuperMap.Class(SuperMap.CanvasLayer, {

    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Hashtable of default parameter key/value pairs 
     */
    DEFAULT_PARAMS: {
        format: "png"
    },
        
    /**
     * APIProperty: isBaseLayer
     * {Boolean} 是否为底图（默认为true）
     */
    isBaseLayer: true,
    /**
     * Property: attribution
     * {String} The layer attribution.
     */
    attribution: "Data By <a style='white-space: nowrap' target='_blank' href='http://www.arcgisonline.cn/'>ESRI</a>",

    /**
     * Constructor: SuperMap.Layer.ArcGIS93Rest
     * 创建ArcGIS93Rest图层
     *
     * Example:
     * (code)
     *
     * var arcims = new SuperMap.Layer.ArcGIS93Rest("MyName",
     *                                    "http://sampleserver1.arcgisonline.com/ArcGIS/rest/services/Demographics/ESRI_Population_World/MapServer/export",
     *                                    {
     *                                      layers: "show:0,1,2"
     *                                    });
     * (end)
     *
     * Parameters:
     * name - {String} 图层名称
     * url - {String}  ArcGIS的REST服务url地址，服务地址目录为http://sampleserver1.arcgisonline.com/ArcGIS/rest/services
     * 或者http://www.arcgisonline.cn/ArcGIS/rest/services等，在目录下可以找到需要的具体服务
     * params - {Object} 设置到url上的可选参数。
     * options - {Object} 此类及其父类开放的属性。
     *
     * Allowed params properties:
     * layers - {String} 设置需要出现在导出地图中的图层。有四种方法来指定哪些图层需要显示：
     * show（只有在此列表中指定的图层才能用于出图）；
     * hide（除了在此列表中的所有图层都将用于出图）；
     * include（在默认图层外，额外增加的图层）；
     * exclude（在默认图层内部排除掉的图层）；
     *
     * Allowed options properties:
     * useCanvas - {Boolean} 是否使用Canvas绘制
     */
    initialize: function(name, url, params, options) {
        var me=this,newArguments = [];
        //将params参数转换为大写
        params = SuperMap.Util.upperCaseObject(params);
        newArguments.push(name, url, params, options);
        SuperMap.CanvasLayer.prototype.initialize.apply(me, newArguments);
        SuperMap.Util.applyDefaults(me.params, SuperMap.Util.upperCaseObject(me.DEFAULT_PARAMS));
                       
        //layer is transparent
        //如下代码暂不考虑
        if (this.params.TRANSPARENT && 
            this.params.TRANSPARENT.toString().toLowerCase() == "true") {
            
            // unless explicitly set in options, make layer an overlay
            if ( (options == null) || (!options.isBaseLayer) ) {
                this.isBaseLayer = false;
            } 
            
            // jpegs can never be transparent, so intelligently switch the 
            //  format, depending on the browser's capabilities
            if (this.params.FORMAT == "jpg") {
                this.params.FORMAT = SuperMap.Util.alphaHack() ? "gif"
                                                                 : "png";
            }
        }
    },    

    
    /**
     * APIMethod: destroy
     * 解构ArcGIS93Rest类，释放资源。
     */
    destroy: function() {
        // for now, nothing special to do here. 
        SuperMap.CanvasLayer.prototype.destroy.apply(this, arguments);
    },   
    
    /**
         * APIMethod: clone
         * 创建当前图层的副本
         * Parameters:
         * obj - {Object}
         * Returns:
         * {<SuperMap.Layer.ArcGIS93Rest>}
         */
    clone: function (obj) {
        
        if (obj == null) {
            obj = new SuperMap.Layer.ArcGIS93Rest(this.name,
                                           this.url,
                                           this.params,
                                           this.getOptions());
        }

        //get all additions from superclasses
        obj = SuperMap.CanvasLayer.prototype.clone.apply(this, [obj]);

        // copy/set any non-init, non-simple values here

        return obj;
    },
    
    
    /**
     * Method: getURL
     * 获取瓦片的URL。
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>} 瓦片的bounds。
     *
     * Returns:
     * {String} 瓦片的URL
     */
    getURL: function (bounds) {
        bounds = this.adjustBounds(bounds);

        // ArcGIS Server only wants the numeric portion of the projection ID.
        var projWords = this.projection.getCode().split(":");
        var srid = projWords[projWords.length - 1];

        var imageSize = this.getImageSize();
        //基于需求的考虑，很多参数都是默认的，并没有公开出来，
        // 以后有用得到的时候在这里修改，也可能会在此类里面添加几个属性来初始化
        //
        var newParams = {
            'BBOX': bounds.toBBOX(),
            'SIZE': imageSize.w + "," + imageSize.h,
            // We always want image, the other options were json, image with a whole lotta html around it, etc.
            'F': "image",
            'BBOXSR': srid,
            'IMAGESR': srid
        };

        // Now add the filter parameters.
        //设置图层筛选参数
        if (this.layerDefs) {
            var layerDefStrList = [];
            var layerID;
            for(layerID in this.layerDefs) {
                if (this.layerDefs.hasOwnProperty(layerID)) {
                    if (this.layerDefs[layerID]) {
                        layerDefStrList.push(layerID);
                        layerDefStrList.push(":");
                        layerDefStrList.push(this.layerDefs[layerID]);
                        layerDefStrList.push(";");
                    }
                }
            }
            if (layerDefStrList.length > 0) {
                newParams['LAYERDEFS'] = layerDefStrList.join("");
            }
        }
        var requestString = this.getFullRequestString(newParams);
        return requestString;
    },
    
    /**
     * Method: setLayerFilter
     * 在创建瓦片的时候修改layerDefs参数
     * Parameters:
     * id - {String} 对应的图层id
     * queryDef - {String} 需要替代以前参数的描述，
     * layerDefs主要用于筛选某个图层里面的信息，
     * 以便确定在出图的时候确定需要显示哪些信息，详情请查看：
     * http://sampleserver1.arcgisonline.com/ArcGIS/SDK/REST/export.html
     */
    setLayerFilter: function ( id, queryDef ) {
        if (!this.layerDefs) {
            this.layerDefs = {};
        }
        if (queryDef) {
            this.layerDefs[id] = queryDef;
        } else {
            delete this.layerDefs[id];
        }
    },
    
    /**
     * Method: clearLayerFilter
     * 清除参数layerDefs
     *
     * Parameters:
     * id - {String} 需要清除的图层的id
     */
    clearLayerFilter: function ( id ) {
        if (id) {
            delete this.layerDefs[id];
        } else {
            delete this.layerDefs;
        }
    },
    
    /**
     * Method: mergeNewParams
     * 动态的给基类创建一个params参数转换方法
     * 
     *
     *     当params改变时将这些参数转换为大写
     * 
     * Parameters:
     * newParams - {Object} 新改变的params参数
     */
    mergeNewParams:function(newParams) {
        var upperParams = SuperMap.Util.upperCaseObject(newParams);
        var newArguments = [upperParams];
        return SuperMap.CanvasLayer.prototype.mergeNewParams.apply(this,
                                                             newArguments);
    },

    CLASS_NAME: "SuperMap.Layer.ArcGIS93Rest"
});
