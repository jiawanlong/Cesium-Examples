
/**
 * @requires SuperMap/Layer/SphericalMercator.js
 * @requires SuperMap/Layer/EventPane.js
 * @requires SuperMap/Layer/FixedZoomLevels.js
 * @requires SuperMap/Lang.js
 */

/**
 * Class: SuperMap.Layer.Google
 * Google图层类
 *
 * Inherits from:
 *  - <SuperMap.Layer.SphericalMercator>
 *  - <SuperMap.Layer.EventPane>
 *  - <SuperMap.Layer.FixedZoomLevels>
 */
SuperMap.Layer.Google = SuperMap.Class(
    SuperMap.Layer.EventPane,
    SuperMap.Layer.FixedZoomLevels, {

        /**
         * Constant: MIN_ZOOM_LEVEL
         * {Integer} 最小缩放等级，为0。
         */
        MIN_ZOOM_LEVEL: 0,

        /**
         * Constant: MAX_ZOOM_LEVEL
         * {Integer} 最大缩放等级，为21。
         */
        MAX_ZOOM_LEVEL: 21,

        /**
         * Constant: RESOLUTIONS
         * {Array(Float)} 分辨率数组。
         * 分辨率数组值为固定值，这样会更接近wms的标准投影。
         */
        RESOLUTIONS: [
            1.40625,
            0.703125,
            0.3515625,
            0.17578125,
            0.087890625,
            0.0439453125,
            0.02197265625,
            0.010986328125,
            0.0054931640625,
            0.00274658203125,
            0.001373291015625,
            0.0006866455078125,
            0.00034332275390625,
            0.000171661376953125,
            0.0000858306884765625,
            0.00004291534423828125,
            0.00002145767211914062,
            0.00001072883605957031,
            0.00000536441802978515,
            0.00000268220901489257,
            0.0000013411045074462891,
            0.00000067055225372314453
        ],

        /**
         * APIProperty: type
         * {GMapType} 指定需要获取的图层类型，默认值为unll，表示图层为“G_STREETS_MAP”。
         * Google服务提供的图层类型有：PHYSICAL、HYBRID、SATELLITE、STREETS。
         */
        type: null,

        /**
         * APIProperty: wrapDateLine
         * {Boolean} 允许水平方向调整。默认为true。
         * 当<sphericalMercator>为true时，设置此项为false可以限制水平方向调整。
         */
        wrapDateLine: true,

        /**
         * APIProperty: sphericalMercator
         * {Boolean} 是否使用墨卡托投影，默认值为false。
         * 如果使用墨卡托投影，将会导致所有与地图的互动实际上是与地图投影的互动，其支持矢量绘图，地图叠加等。
         */
        sphericalMercator: false,

        /**
         * Property: version
         * {Number} The version of the Google Maps API
         */
        version: null,

        /**
         * Constructor: SuperMap.Layer.Google
         * Google图层构造函数
         *
         *  Example：
         * (code)
         *
         *  var googlelayer = new SuperMap.Layer.Google( "Google Physical",
         *                {type: google.maps.MapTypeId.TERRAIN});
         *
         * (end)
         *
         * Parameters:
         * name - {String} 图层名称.
         * options - {Object} 一个options对象，该对象上的属性将会被设置到图层上。
         */
        initialize: function(name, options) {
            options = options || {};
            if(!options.version) {
                options.version = typeof GMap2 === "function" ? "2" : "3";
            }
            var mixin = SuperMap.Layer.Google["v" +
                options.version.replace(/\./g, "_")];
            if (mixin) {
                SuperMap.Util.applyDefaults(options, mixin);
            } else {
                throw "Unsupported Google Maps API version: " + options.version;
            }

            SuperMap.Util.applyDefaults(options, mixin.DEFAULTS);
            if (options.maxExtent) {
                options.maxExtent = options.maxExtent.clone();
            }

            SuperMap.Layer.EventPane.prototype.initialize.apply(this,
                [name, options]);
            SuperMap.Layer.FixedZoomLevels.prototype.initialize.apply(this,
                [name, options]);

            if (this.sphericalMercator) {
                SuperMap.Util.extend(this, SuperMap.Layer.SphericalMercator);
                this.initMercatorParameters();
            }
        },

        /**
         * Method: clone
         * 创建一个该图层的副本
         *
         * Returns:
         * {<SuperMap.Layer.Google>} An exact clone of this layer
         */
        clone: function() {
            /**
             * This method isn't intended to be called by a subclass and it
             * doesn't call the same method on the superclass.  We don't call
             * the super's clone because we don't want properties that are set
             * on this layer after initialize (i.e. this.mapObject etc.).
             */
            return new SuperMap.Layer.Google(
                this.name, this.getOptions()
            );
        },

        /**
         * APIMethod: setVisibility
         * 为图层设置可见性标记、相应的显示/隐藏及重绘。触发事件除非其他规定。
         *
         * 注意此visibility不再简单的是否为图层的style。display被设置为“block”。现在我们在图层类上存储一个‘visibility’状态属性，
         * 这样可以使我们记录是否要求一个图层存在可见性属性。当地图的分辨率在图层的范围之外的状况下，这个属性可能会被推翻。
         *
         * Parameters:
         * visible - {Boolean} 显示图层 (在范围内)
         */
        setVisibility: function(visible) {
            // sharing a map container, opacity has to be set per layer
            var opacity = this.opacity == null ? 1 : this.opacity;
            SuperMap.Layer.EventPane.prototype.setVisibility.apply(this, arguments);
            this.setOpacity(opacity);
        },

        /**
         * APIMethod: display
         * 显示或隐藏图层
         *
         * Parameters:
         * display - {Boolean}
         */
        display: function(visible) {
            if (!this._dragging) {
                this.setGMapVisibility(visible);
            }
            SuperMap.Layer.EventPane.prototype.display.apply(this, arguments);
        },

        /**
         * Method: moveTo
         * 移动
         * Parameters:
         * bound - {<SuperMap.Bounds>}
         * zoomChanged - {Boolean} 说明何时zoom开始变化，当图层必须做一些初始化工作的时候。
         * dragging - {Boolean}
         */
        moveTo: function(bounds, zoomChanged, dragging) {
            this._dragging = dragging;
            SuperMap.Layer.EventPane.prototype.moveTo.apply(this, arguments);
            delete this._dragging;
        },

        /**
         * APIMethod: setOpacity
         * 为全部图层设置不透明度。
         *
         * Parameter:
         * opacity - {Float}
         */
        setOpacity: function(opacity) {
            if (opacity !== this.opacity) {
                if (this.map != null) {
                    this.map.events.triggerEvent("changelayer", {
                        layer: this,
                        property: "opacity"
                    });
                }
                this.opacity = opacity;
            }
            // Though this layer's opacity may not change, we're sharing a container
            // and need to update the opacity for the entire container.
            if (this.getVisibility()) {
                var container = this.getMapContainer();
                SuperMap.Util.modifyDOMElement(
                    container, null, null, null, null, null, null, opacity
                );
            }
        },

        /**
         * APIMethod: destroy
         * 清理此图层.
         */
        destroy: function() {
            /**
             * We have to override this method because the event pane destroy
             * deletes the mapObject reference before removing this layer from
             * the map.
             */
            if (this.map) {
                this.setGMapVisibility(false);
                var cache = SuperMap.Layer.Google.cache[this.map.id];
                if (cache && cache.count <= 1) {
                    this.removeGMapElements();
                }
            }
            SuperMap.Layer.EventPane.prototype.destroy.apply(this, arguments);
        },

        /**
         * Method: removeGMapElements
         * Remove all elements added to the dom.  This should only be called if
         * this is the last of the Google layers for the given map.
         */
        removeGMapElements: function() {
            var cache = SuperMap.Layer.Google.cache[this.map.id];
            if (cache) {
                // remove shared elements from dom
                var container = this.mapObject && this.getMapContainer();
                if (container && container.parentNode) {
                    container.parentNode.removeChild(container);
                }
                var termsOfUse = cache.termsOfUse;
                if (termsOfUse && termsOfUse.parentNode) {
                    termsOfUse.parentNode.removeChild(termsOfUse);
                }
                var poweredBy = cache.poweredBy;
                if (poweredBy && poweredBy.parentNode) {
                    poweredBy.parentNode.removeChild(poweredBy);
                }
            }
        },

        /**
         * APIMethod: removeMap
         * On being removed from the map, also remove termsOfUse and poweredBy divs
         *
         * Parameters:
         * map - {<SuperMap.Map>}
         */
        removeMap: function(map) {
            // hide layer before removing
            if (this.visibility && this.mapObject) {
                this.setGMapVisibility(false);
            }
            // check to see if last Google layer in this map
            var cache = SuperMap.Layer.Google.cache[map.id];
            if (cache) {
                if (cache.count <= 1) {
                    this.removeGMapElements();
                    delete SuperMap.Layer.Google.cache[map.id];
                } else {
                    // decrement the layer count
                    --cache.count;
                }
            }
            // remove references to gmap elements
            delete this.termsOfUse;
            delete this.poweredBy;
            delete this.mapObject;
            delete this.dragObject;
            SuperMap.Layer.EventPane.prototype.removeMap.apply(this, arguments);
        },

        //
        // TRANSLATION: MapObject Bounds <-> SuperMap.Bounds
        //

        /**
         * APIMethod: getOLBoundsFromMapObjectBounds
         *
         * Parameters:
         * moBounds - {Object}
         *
         * Returns:
         * {<SuperMap.Bounds>} An <SuperMap.Bounds>, translated from the
         *                       passed-in MapObject Bounds.
         *                       Returns null if null value is passed in.
         */
        getOLBoundsFromMapObjectBounds: function(moBounds) {
            var olBounds = null;
            if (moBounds != null) {
                var sw = moBounds.getSouthWest();
                var ne = moBounds.getNorthEast();
                if (this.sphericalMercator) {
                    sw = this.forwardMercator(sw.lng(), sw.lat());
                    ne = this.forwardMercator(ne.lng(), ne.lat());
                } else {
                    sw = new SuperMap.LonLat(sw.lng(), sw.lat());
                    ne = new SuperMap.LonLat(ne.lng(), ne.lat());
                }
                olBounds = new SuperMap.Bounds(sw.lon,
                    sw.lat,
                    ne.lon,
                    ne.lat );
            }
            return olBounds;
        },

        /**
         * APIMethod: getWarningHTML
         *
         * Returns:
         * {String} String with information on why layer is broken, how to get
         *          it working.
         */
        getWarningHTML:function() {
            return SuperMap.i18n("googleWarning");
        },


        /************************************
         *                                  *
         *   MapObject Interface Controls   *
         *                                  *
         ************************************/


        // Get&Set Center, Zoom

        /**
         * APIMethod: getMapObjectCenter
         *
         * Returns:
         * {Object} The mapObject's current center in Map Object format
         */
        getMapObjectCenter: function() {
            return this.mapObject.getCenter();
        },

        /**
         * APIMethod: getMapObjectZoom
         *
         * Returns:
         * {Integer} The mapObject's current zoom, in Map Object format
         */
        getMapObjectZoom: function() {
            return this.mapObject.getZoom();
        },


        /************************************
         *                                  *
         *       MapObject Primitives       *
         *                                  *
         ************************************/


        // LonLat

        /**
         * APIMethod: getLongitudeFromMapObjectLonLat
         *
         * Parameters:
         * moLonLat - {Object} MapObject LonLat format
         *
         * Returns:
         * {Float} Longitude of the given MapObject LonLat
         */
        getLongitudeFromMapObjectLonLat: function(moLonLat) {
            return this.sphericalMercator ?
                this.forwardMercator(moLonLat.lng(), moLonLat.lat()).lon :
                moLonLat.lng();
        },

        /**
         * APIMethod: getLatitudeFromMapObjectLonLat
         *
         * Parameters:
         * moLonLat - {Object} MapObject LonLat format
         *
         * Returns:
         * {Float} Latitude of the given MapObject LonLat
         */
        getLatitudeFromMapObjectLonLat: function(moLonLat) {
            var lat = this.sphericalMercator ?
                this.forwardMercator(moLonLat.lng(), moLonLat.lat()).lat :
                moLonLat.lat();
            return lat;
        },

        // Pixel

        /**
         * APIMethod: getXFromMapObjectPixel
         *
         * Parameters:
         * moPixel - {Object} MapObject Pixel format
         *
         * Returns:
         * {Integer} X value of the MapObject Pixel
         */
        getXFromMapObjectPixel: function(moPixel) {
            return moPixel.x;
        },

        /**
         * APIMethod: getYFromMapObjectPixel
         *
         * Parameters:
         * moPixel - {Object} MapObject Pixel format
         *
         * Returns:
         * {Integer} Y value of the MapObject Pixel
         */
        getYFromMapObjectPixel: function(moPixel) {
            return moPixel.y;
        },

        CLASS_NAME: "SuperMap.Layer.Google"
    });

/**
 * Property: SuperMap.Layer.Google.cache
 * {Object} Cache for elements that should only be created once per map.
 */
SuperMap.Layer.Google.cache = {};


/**
 * Constant: SuperMap.Layer.Google.v2
 *
 * Mixin providing functionality specific to the Google Maps API v2.
 */
SuperMap.Layer.Google.v2 = {

    /**
     * Property: termsOfUse
     * {DOMElement} Div for Google's copyright and terms of use link
     */
    termsOfUse: null,

    /**
     * Property: poweredBy
     * {DOMElement} Div for Google's powered by logo and link
     */
    poweredBy: null,

    /**
     * Property: dragObject
     * {GDraggableObject} Since 2.93, Google has exposed the ability to get
     *     the maps GDraggableObject. We can now use this for smooth panning
     */
    dragObject: null,

    /**
     * Method: loadMapObject
     * Load the GMap and register appropriate event listeners. If we can't
     *     load GMap2, then display a warning message.
     */
    loadMapObject:function() {
        if (!this.type) {
            this.type = G_NORMAL_MAP;
        }
        var mapObject, termsOfUse, poweredBy;
        var cache = SuperMap.Layer.Google.cache[this.map.id];
        if (cache) {
            // there are already Google layers added to this map
            mapObject = cache.mapObject;
            termsOfUse = cache.termsOfUse;
            poweredBy = cache.poweredBy;
            // increment the layer count
            ++cache.count;
        } else {
            // this is the first Google layer for this map

            var container = this.map.viewPortDiv;
            var div = document.createElement("div");
            div.id = this.map.id + "_GMap2Container";
            div.style.position = "absolute";
            div.style.width = "100%";
            div.style.height = "100%";
            container.appendChild(div);

            // create GMap and shuffle elements
            try {
                mapObject = new GMap2(div);

                // move the ToS and branding stuff up to the container div
                termsOfUse = div.lastChild;
                container.appendChild(termsOfUse);
                termsOfUse.style.zIndex = "1100";
                termsOfUse.style.right = "";
                termsOfUse.style.bottom = "";
                termsOfUse.className = "olLayerGoogleCopyright";

                poweredBy = div.lastChild;
                container.appendChild(poweredBy);
                poweredBy.style.zIndex = "1100";
                poweredBy.style.right = "";
                poweredBy.style.bottom = "";
                poweredBy.className = "olLayerGooglePoweredBy gmnoprint";

            } catch (e) {
                throw(e);
            }
            // cache elements for use by any other google layers added to
            // this same map
            SuperMap.Layer.Google.cache[this.map.id] = {
                mapObject: mapObject,
                termsOfUse: termsOfUse,
                poweredBy: poweredBy,
                count: 1
            };
        }

        this.mapObject = mapObject;
        this.termsOfUse = termsOfUse;
        this.poweredBy = poweredBy;

        // ensure this layer type is one of the mapObject types
        if (SuperMap.Util.indexOf(this.mapObject.getMapTypes(),
            this.type) === -1) {
            this.mapObject.addMapType(this.type);
        }

        //since v 2.93 getDragObject is now available.
        if(typeof mapObject.getDragObject == "function") {
            this.dragObject = mapObject.getDragObject();
        } else {
            this.dragPanMapObject = null;
        }

        if(this.isBaseLayer === false) {
            this.setGMapVisibility(this.div.style.display !== "none");
        }

    },

    /**
     * APIMethod: onMapResize
     */
    onMapResize: function() {
        // workaround for resizing of invisible or not yet fully loaded layers
        // where GMap2.checkResize() does not work. We need to load the GMap
        // for the old div size, then checkResize(), and then call
        // layer.moveTo() to trigger GMap.setCenter() (which will finish
        // the GMap initialization).
        if(this.visibility && this.mapObject.isLoaded()) {
            this.mapObject.checkResize();
        } else {
            if(!this._resized) {
                var layer = this;
                var handle = GEvent.addListener(this.mapObject, "load", function() {
                    GEvent.removeListener(handle);
                    delete layer._resized;
                    layer.mapObject.checkResize();
                    layer.moveTo(layer.map.getCenter(), layer.map.getZoom());
                });
            }
            this._resized = true;
        }
    },

    /**
     * Method: setGMapVisibility
     * Display the GMap container and associated elements.
     *
     * Parameters:
     * visible - {Boolean} Display the GMap elements.
     */
    setGMapVisibility: function(visible) {
        var cache = SuperMap.Layer.Google.cache[this.map.id];
        if (cache) {
            var container = this.mapObject.getContainer();
            if (visible === true) {
                this.mapObject.setMapType(this.type);
                container.style.display = "";
                this.termsOfUse.style.left = "";
                this.termsOfUse.style.display = "";
                this.poweredBy.style.display = "";
                cache.displayed = this.id;
            } else {
                if (cache.displayed === this.id) {
                    delete cache.displayed;
                }
                if (!cache.displayed) {
                    container.style.display = "none";
                    this.termsOfUse.style.display = "none";
                    // move ToU far to the left in addition to setting display
                    // to "none", because at the end of the GMap2 load
                    // sequence, display: none will be unset and ToU would be
                    // visible after loading a map with a google layer that is
                    // initially hidden.
                    this.termsOfUse.style.left = "-9999px";
                    this.poweredBy.style.display = "none";
                }
            }
        }
    },

    /**
     * Method: getMapContainer
     *
     * Returns:
     * {DOMElement} the GMap container's div
     */
    getMapContainer: function() {
        return this.mapObject.getContainer();
    },

    //
    // TRANSLATION: MapObject Bounds <-> SuperMap.Bounds
    //

    /**
     * APIMethod: getMapObjectBoundsFromOLBounds
     *
     * Parameters:
     * olBounds - {<SuperMap.Bounds>}
     *
     * Returns:
     * {Object} A MapObject Bounds, translated from olBounds
     *          Returns null if null value is passed in
     */
    getMapObjectBoundsFromOLBounds: function(olBounds) {
        var moBounds = null;
        if (olBounds != null) {
            var sw = this.sphericalMercator ?
                this.inverseMercator(olBounds.bottom, olBounds.left) :
                new SuperMap.LonLat(olBounds.bottom, olBounds.left);
            var ne = this.sphericalMercator ?
                this.inverseMercator(olBounds.top, olBounds.right) :
                new SuperMap.LonLat(olBounds.top, olBounds.right);
            moBounds = new GLatLngBounds(new GLatLng(sw.lat, sw.lon),
                new GLatLng(ne.lat, ne.lon));
        }
        return moBounds;
    },


    /************************************
     *                                  *
     *   MapObject Interface Controls   *
     *                                  *
     ************************************/


    // Get&Set Center, Zoom

    /**
     * APIMethod: setMapObjectCenter
     * Set the mapObject to the specified center and zoom
     *
     * Parameters:
     * center - {Object} MapObject LonLat format
     * zoom - {int} MapObject zoom format
     */
    setMapObjectCenter: function(center, zoom) {
        this.mapObject.setCenter(center, zoom);
    },

    /**
     * APIMethod: dragPanMapObject
     *
     * Parameters:
     * dX - {Integer}
     * dY - {Integer}
     */
    dragPanMapObject: function(dX, dY) {
        this.dragObject.moveBy(new GSize(-dX, dY));
    },


    // LonLat - Pixel Translation

    /**
     * APIMethod: getMapObjectLonLatFromMapObjectPixel
     *
     * Parameters:
     * moPixel - {Object} MapObject Pixel format
     *
     * Returns:
     * {Object} MapObject LonLat translated from MapObject Pixel
     */
    getMapObjectLonLatFromMapObjectPixel: function(moPixel) {
        return this.mapObject.fromContainerPixelToLatLng(moPixel);
    },

    /**
     * APIMethod: getMapObjectPixelFromMapObjectLonLat
     *
     * Parameters:
     * moLonLat - {Object} MapObject LonLat format
     *
     * Returns:
     * {Object} MapObject Pixel transtlated from MapObject LonLat
     */
    getMapObjectPixelFromMapObjectLonLat: function(moLonLat) {
        return this.mapObject.fromLatLngToContainerPixel(moLonLat);
    },


    // Bounds

    /**
     * APIMethod: getMapObjectZoomFromMapObjectBounds
     *
     * Parameters:
     * moBounds - {Object} MapObject Bounds format
     *
     * Returns:
     * {Object} MapObject Zoom for specified MapObject Bounds
     */
    getMapObjectZoomFromMapObjectBounds: function(moBounds) {
        return this.mapObject.getBoundsZoomLevel(moBounds);
    },

    /************************************
     *                                  *
     *       MapObject Primitives       *
     *                                  *
     ************************************/


    // LonLat

    /**
     * APIMethod: getMapObjectLonLatFromLonLat
     *
     * Parameters:
     * lon - {Float}
     * lat - {Float}
     *
     * Returns:
     * {Object} MapObject LonLat built from lon and lat params
     */
    getMapObjectLonLatFromLonLat: function(lon, lat) {
        var gLatLng;
        if(this.sphericalMercator) {
            var lonlat = this.inverseMercator(lon, lat);
            gLatLng = new GLatLng(lonlat.lat, lonlat.lon);
        } else {
            gLatLng = new GLatLng(lat, lon);
        }
        return gLatLng;
    },

    // Pixel

    /**
     * APIMethod: getMapObjectPixelFromXY
     *
     * Parameters:
     * x - {Integer}
     * y - {Integer}
     *
     * Returns:
     * {Object} MapObject Pixel from x and y parameters
     */
    getMapObjectPixelFromXY: function(x, y) {
        return new GPoint(x, y);
    }

};
