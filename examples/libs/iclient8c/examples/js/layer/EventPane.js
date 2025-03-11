
/**
 * @requires SuperMap/Layer.js
 * @requires SuperMap/Util.js
 */

/**
 * Class: SuperMap.Layer.EventPane
 * Base class for 3rd party layers.  Create a new event pane layer with the
 * <SuperMap.Layer.EventPane> constructor.
 *
 * Inherits from:
 *  - <SuperMap.Layer>
 */
SuperMap.Layer.EventPane = SuperMap.Class(SuperMap.Layer, {

    /**
     * APIProperty: smoothDragPan
     * {Boolean} smoothDragPan determines whether non-public/internal API
     *     methods are used for better performance while dragging EventPane
     *     layers. When not in sphericalMercator mode, the smoother dragging
     *     doesn't actually move north/south directly with the number of
     *     pixels moved, resulting in a slight offset when you drag your mouse
     *     north south with this option on. If this visual disparity bothers
     *     you, you should turn this option off, or use spherical mercator.
     *     Default is on.
     */
    smoothDragPan: true,

    /**
     * Property: isBaseLayer
     * {Boolean} EventPaned layers are always base layers, by necessity.
     */
    isBaseLayer: true,

    /**
     * APIProperty: isFixed
     * {Boolean} EventPaned layers are fixed by default.
     */
    isFixed: true,

    /**
     * Property: pane
     * {DOMElement} A reference to the element that controls the events.
     */
    pane: null,


    /**
     * Property: mapObject
     * {Object} This is the object which will be used to load the 3rd party library
     * in the case of the google layer, this will be of type GMap,
     * in the case of the ve layer, this will be of type VEMap
     */
    mapObject: null,


    /**
     * Constructor: SuperMap.Layer.EventPane
     * Create a new event pane layer
     *
     * Parameters:
     * name - {String}
     * options - {Object} Hashtable of extra options to tag onto the layer
     */
    initialize: function(name, options) {
        SuperMap.Layer.prototype.initialize.apply(this, arguments);
        if (this.pane == null) {
            this.pane = SuperMap.Util.createDiv(this.div.id + "_EventPane");
        }
    },

    /**
     * APIMethod: destroy
     * Deconstruct this layer.
     */
    destroy: function() {
        this.mapObject = null;
        this.pane = null;
        SuperMap.Layer.prototype.destroy.apply(this, arguments);
    },


    /**
     * Method: setMap
     * Set the map property for the layer. This is done through an accessor
     * so that subclasses can override this and take special action once
     * they have their map variable set.
     *
     * Parameters:
     * map - {<SuperMap.Map>}
     */
    setMap: function(map) {
        SuperMap.Layer.prototype.setMap.apply(this, arguments);

        this.pane.style.zIndex = parseInt(this.div.style.zIndex) + 1;
        this.pane.style.display = this.div.style.display;
        this.pane.style.width="100%";
        this.pane.style.height="100%";
        if (SuperMap.BROWSER_NAME == "msie") {
            this.pane.style.background =
                "url(" + SuperMap.Util.getImagesLocation() + "blank.gif)";
        }

        if (this.isFixed) {
            this.map.eventsDiv.appendChild(this.pane);
        } else {
            this.map.layerContainerDiv.appendChild(this.pane);
        }

        // once our layer has been added to the map, we can load it
        this.loadMapObject();

        // if map didn't load, display warning
        if (this.mapObject == null) {
            this.loadWarningMessage();
        }
    },

    /**
     * APIMethod: removeMap
     * On being removed from the map, we'll like to remove the invisible 'pane'
     *     div that we added to it on creation.
     *
     * Parameters:
     * map - {<SuperMap.Map>}
     */
    removeMap: function(map) {
        if (this.pane && this.pane.parentNode) {
            this.pane.parentNode.removeChild(this.pane);
        }
        SuperMap.Layer.prototype.removeMap.apply(this, arguments);
    },

    /**
     * Method: loadWarningMessage
     * If we can't load the map lib, then display an error message to the
     *     user and tell them where to go for help.
     *
     *     This function sets up the layout for the warning message. Each 3rd
     *     party layer must implement its own getWarningHTML() function to
     *     provide the actual warning message.
     */
    loadWarningMessage:function() {

        this.div.style.backgroundColor = "darkblue";

        var viewSize = this.map.getSize();

        var msgW = Math.min(viewSize.w, 300);
        var msgH = Math.min(viewSize.h, 200);
        var size = new SuperMap.Size(msgW, msgH);

        var centerPx = new SuperMap.Pixel(viewSize.w/2, viewSize.h/2);

        var topLeft = centerPx.add(-size.w/2, -size.h/2);

        var div = SuperMap.Util.createDiv(this.name + "_warning",
            topLeft,
            size,
            null,
            null,
            null,
            "auto");

        div.style.padding = "7px";
        div.style.backgroundColor = "yellow";

        div.innerHTML = this.getWarningHTML();
        this.div.appendChild(div);
    },

    /**
     * Method: getWarningHTML
     * To be implemented by subclasses.
     *
     * Returns:
     * {String} String with information on why layer is broken, how to get
     *          it working.
     */
    getWarningHTML:function() {
        //should be implemented by subclasses
        return "";
    },

    /**
     * Method: display
     * Set the display on the pane
     *
     * Parameters:
     * display - {Boolean}
     */
    display: function(display) {
        SuperMap.Layer.prototype.display.apply(this, arguments);
        this.pane.style.display = this.div.style.display;
    },

    /**
     * Method: setZIndex
     * Set the z-index order for the pane.
     *
     * Parameters:
     * zIndex - {int}
     */
    setZIndex: function (zIndex) {
        SuperMap.Layer.prototype.setZIndex.apply(this, arguments);
        this.pane.style.zIndex = parseInt(this.div.style.zIndex) + 1;
    },

    /**
     * Method: moveByPx
     * Move the layer based on pixel vector. To be implemented by subclasses.
     *
     * Parameters:
     * dx - {Number} The x coord of the displacement vector.
     * dy - {Number} The y coord of the displacement vector.
     */
    moveByPx: function(dx, dy) {
        SuperMap.Layer.prototype.moveByPx.apply(this, arguments);

        if (this.dragPanMapObject) {
            this.dragPanMapObject(dx, -dy);
        } else {
            this.moveTo(this.map.getCachedCenter());
        }
    },

    /**
     * Method: moveTo
     * Handle calls to move the layer.
     *
     * Parameters:
     * bounds - {<SuperMap.Bounds>}
     * zoomChanged - {Boolean}
     * dragging - {Boolean}
     */
    moveTo:function(bounds, zoomChanged, dragging) {
        SuperMap.Layer.prototype.moveTo.apply(this, arguments);

        if (this.mapObject != null) {

            var newCenter = this.map.getCenter();
            var newZoom = this.map.getZoom();

            if (newCenter != null) {

                var moOldCenter = this.getMapObjectCenter();
                var oldCenter = this.getOLLonLatFromMapObjectLonLat(moOldCenter);

                var moOldZoom = this.getMapObjectZoom();
                var oldZoom= this.getOLZoomFromMapObjectZoom(moOldZoom);

                if ( !(newCenter.equals(oldCenter)) ||
                    !(newZoom == oldZoom) ) {

                    if (!zoomChanged && oldCenter && this.dragPanMapObject &&
                        this.smoothDragPan) {
                        var oldPx = this.map.getViewPortPxFromLonLat(oldCenter);
                        var newPx = this.map.getViewPortPxFromLonLat(newCenter);
                        this.dragPanMapObject(newPx.x-oldPx.x, oldPx.y-newPx.y);
                    } else {
                        var center = this.getMapObjectLonLatFromOLLonLat(newCenter);
                        var zoom = this.getMapObjectZoomFromOLZoom(newZoom);
                        this.setMapObjectCenter(center, zoom, dragging);
                    }
                }
            }
        }
    },


    /********************************************************/
    /*                                                      */
    /*                 Baselayer Functions                  */
    /*                                                      */
    /********************************************************/

    /**
     * Method: getLonLatFromViewPortPx
     * Get a map location from a pixel location
     *
     * Parameters:
     * viewPortPx - {<SuperMap.Pixel>}
     *
     * Returns:
     *  {<SuperMap.LonLat>} An SuperMap.LonLat which is the passed-in view
     *  port SuperMap.Pixel, translated into lon/lat by map lib
     *  If the map lib is not loaded or not centered, returns null
     */
    getLonLatFromViewPortPx: function (viewPortPx) {
        var lonlat = null;
        if ( (this.mapObject != null) &&
            (this.getMapObjectCenter() != null) ) {
            var moPixel = this.getMapObjectPixelFromOLPixel(viewPortPx);
            var moLonLat = this.getMapObjectLonLatFromMapObjectPixel(moPixel);
            lonlat = this.getOLLonLatFromMapObjectLonLat(moLonLat);
        }
        return lonlat;
    },


    /**
     * Method: getViewPortPxFromLonLat
     * Get a pixel location from a map location
     *
     * Parameters:
     * lonlat - {<SuperMap.LonLat>}
     *
     * Returns:
     * {<SuperMap.Pixel>} An SuperMap.Pixel which is the passed-in
     * SuperMap.LonLat, translated into view port pixels by map lib
     * If map lib is not loaded or not centered, returns null
     */
    getViewPortPxFromLonLat: function (lonlat) {
        var viewPortPx = null;
        if ( (this.mapObject != null) &&
            (this.getMapObjectCenter() != null) ) {

            var moLonLat = this.getMapObjectLonLatFromOLLonLat(lonlat);
            var moPixel = this.getMapObjectPixelFromMapObjectLonLat(moLonLat);

            viewPortPx = this.getOLPixelFromMapObjectPixel(moPixel);
        }
        return viewPortPx;
    },

    /********************************************************/
    /*                                                      */
    /*               Translation Functions                  */
    /*                                                      */
    /*   The following functions translate Map Object and   */
    /*            OL formats for Pixel, LonLat              */
    /*                                                      */
    /********************************************************/

    //
    // TRANSLATION: MapObject LatLng <-> SuperMap.LonLat
    //

    /**
     * Method: getOLLonLatFromMapObjectLonLat
     * Get an OL style map location from a 3rd party style map location
     *
     * Parameters
     * moLonLat - {Object}
     *
     * Returns:
     * {<SuperMap.LonLat>} An SuperMap.LonLat, translated from the passed in
     *          MapObject LonLat
     *          Returns null if null value is passed in
     */
    getOLLonLatFromMapObjectLonLat: function(moLonLat) {
        var olLonLat = null;
        if (moLonLat != null) {
            var lon = this.getLongitudeFromMapObjectLonLat(moLonLat);
            var lat = this.getLatitudeFromMapObjectLonLat(moLonLat);
            olLonLat = new SuperMap.LonLat(lon, lat);
        }
        return olLonLat;
    },

    /**
     * Method: getMapObjectLonLatFromOLLonLat
     * Get a 3rd party map location from an OL map location.
     *
     * Parameters:
     * olLonLat - {<SuperMap.LonLat>}
     *
     * Returns:
     * {Object} A MapObject LonLat, translated from the passed in
     *          SuperMap.LonLat
     *          Returns null if null value is passed in
     */
    getMapObjectLonLatFromOLLonLat: function(olLonLat) {
        var moLatLng = null;
        if (olLonLat != null) {
            moLatLng = this.getMapObjectLonLatFromLonLat(olLonLat.lon,
                olLonLat.lat);
        }
        return moLatLng;
    },


    //
    // TRANSLATION: MapObject Pixel <-> SuperMap.Pixel
    //

    /**
     * Method: getOLPixelFromMapObjectPixel
     * Get an OL pixel location from a 3rd party pixel location.
     *
     * Parameters:
     * moPixel - {Object}
     *
     * Returns:
     * {<SuperMap.Pixel>} An SuperMap.Pixel, translated from the passed in
     *          MapObject Pixel
     *          Returns null if null value is passed in
     */
    getOLPixelFromMapObjectPixel: function(moPixel) {
        var olPixel = null;
        if (moPixel != null) {
            var x = this.getXFromMapObjectPixel(moPixel);
            var y = this.getYFromMapObjectPixel(moPixel);
            olPixel = new SuperMap.Pixel(x, y);
        }
        return olPixel;
    },

    /**
     * Method: getMapObjectPixelFromOLPixel
     * Get a 3rd party pixel location from an OL pixel location
     *
     * Parameters:
     * olPixel - {<SuperMap.Pixel>}
     *
     * Returns:
     * {Object} A MapObject Pixel, translated from the passed in
     *          SuperMap.Pixel
     *          Returns null if null value is passed in
     */
    getMapObjectPixelFromOLPixel: function(olPixel) {
        var moPixel = null;
        if (olPixel != null) {
            moPixel = this.getMapObjectPixelFromXY(olPixel.x, olPixel.y);
        }
        return moPixel;
    },

    CLASS_NAME: "SuperMap.Layer.EventPane"
});
