/*!
 *
 *     Copyright (c) 2014 Teralytics AG
 *     Copyright© 2000-2017 SuperMap Software Co. Ltd
 *     Leaflet.D3SvgOverlay.(https://github.com/SuperMap/Leaflet.D3SvgOverlay)
 *     license: MIT
 *     version: v2.2.0
 * 
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.d3SvgOverlay = exports.D3SvgOverlay = undefined;

var _leaflet = __webpack_require__(2);

var _leaflet2 = _interopRequireDefault(_leaflet);

var _d = __webpack_require__(3);

var d3 = _interopRequireWildcard(_d);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Tiny stylesheet bundled here instead of a separate file
/**
 * Copyright 2015 Teralytics AG
 *
 * @author Kirill Zhuravlev <kirill.zhuravlev@teralytics.ch>
 *
 * Adapted to d3 v4 by SuperMap.
 */

if (_leaflet2.default.version >= "1.0") {
    d3.select("head").append("style").attr("type", "text/css").text("g.d3-overlay *{pointer-events:visiblePainted;}");
}

// Class definition
var D3SvgOverlay = exports.D3SvgOverlay = (_leaflet2.default.version < "1.0" ? _leaflet2.default.Class : _leaflet2.default.Layer).extend({
    includes: _leaflet2.default.version < "1.0" ? _leaflet2.default.Mixin.Events : [],
    version: "2.2",

    _undef: function _undef(a) {
        return typeof a == "undefined";
    },

    _options: function _options(options) {
        if (this._undef(options)) {
            return this.options;
        }
        options.zoomHide = this._undef(options.zoomHide) ? false : options.zoomHide;
        options.zoomDraw = this._undef(options.zoomDraw) ? true : options.zoomDraw;
        return this.options = options;
    },

    _disableLeafletRounding: function _disableLeafletRounding() {
        this._leaflet_round = _leaflet2.default.Point.prototype._round;
        _leaflet2.default.Point.prototype._round = function () {
            return this;
        };
    },

    _enableLeafletRounding: function _enableLeafletRounding() {
        _leaflet2.default.Point.prototype._round = this._leaflet_round;
    },

    draw: function draw() {
        this._disableLeafletRounding();
        this._drawCallback(this.selection, this.projection, this.map.getZoom());
        this._enableLeafletRounding();
    },

    initialize: function initialize(drawCallback, options) {
        // (Function(selection, projection)), (Object)options
        this._options(options || {});
        this._drawCallback = drawCallback;
    },

    // Handler for "viewreset"-like events, updates scale and shift after the animation
    _zoomChange: function _zoomChange(evt) {
        this._disableLeafletRounding();
        var newZoom = this._undef(evt.zoom) ? this.map._zoom : evt.zoom; // "viewreset" event in Leaflet has not zoom/center parameters like zoomanim
        this._zoomDiff = newZoom - this._zoom;
        this._scale = Math.pow(2, this._zoomDiff);
        this.projection.scale = this._scale;
        this._shift = this.map.latLngToLayerPoint(this._wgsOrigin)._subtract(this._wgsInitialShift.multiplyBy(this._scale));

        var shift = ["translate(", this._shift.x, ",", this._shift.y, ") "];
        var scale = ["scale(", this._scale, ",", this._scale, ") "];
        this._rootGroup.attr("transform", shift.concat(scale).join(""));

        if (this.options.zoomDraw) {
            this.draw();
        }
        this._enableLeafletRounding();
    },

    onAdd: function onAdd(map) {
        this.map = map;
        var _layer = this;

        // SVG element
        if (_leaflet2.default.version < "1.0") {
            map._initPathRoot();
            this._svg = d3.select(map._panes.overlayPane).select("svg");
            this._rootGroup = this._svg.append("g");
        } else {
            this._svg = _leaflet2.default.svg();
            map.addLayer(this._svg);
            this._rootGroup = d3.select(this._svg._rootGroup).classed("d3-overlay", true);
        }
        this._rootGroup.classed("leaflet-zoom-hide", this.options.zoomHide);
        this.selection = this._rootGroup;

        var me = this;
        var oldOn = d3.selection.prototype.on;
        d3.selection.prototype.on = function (t, n, e) {
            oldOn.apply(me.selection, [t, n, e]);
            me.map.on(t, function () {
                me.selection.dispatch(t);
            });
        };

        // Init shift/scale invariance helper values
        this._pixelOrigin = map.getPixelOrigin();
        this._wgsOrigin = _leaflet2.default.latLng([0, 0]);
        this._wgsInitialShift = this.map.latLngToLayerPoint(this._wgsOrigin);
        this._zoom = this.map.getZoom();
        this._shift = _leaflet2.default.point(0, 0);
        this._scale = 1;

        // Create projection object
        this.projection = {
            latLngToLayerPoint: function latLngToLayerPoint(latLng, zoom) {
                zoom = _layer._undef(zoom) ? _layer._zoom : zoom;
                var projectedPoint = _layer.map.project(_leaflet2.default.latLng(latLng), zoom)._round();
                return projectedPoint._subtract(_layer._pixelOrigin);
            },
            layerPointToLatLng: function layerPointToLatLng(point, zoom) {
                zoom = _layer._undef(zoom) ? _layer._zoom : zoom;
                var projectedPoint = _leaflet2.default.point(point).add(_layer._pixelOrigin);
                return _layer.map.unproject(projectedPoint, zoom);
            },
            unitsPerMeter: 256 * Math.pow(2, _layer._zoom) / 40075017,
            map: _layer.map,
            layer: _layer,
            scale: 1
        };
        this.projection._projectPoint = function (x, y) {
            var point = _layer.projection.latLngToLayerPoint(new _leaflet2.default.LatLng(y, x));
            this.stream.point(point.x, point.y);
        };
        this.projection.pathFromGeojson = d3.geoPath().projection(d3.geoTransform({ point: this.projection._projectPoint }));

        // Compatibility with v.1
        this.projection.latLngToLayerFloatPoint = this.projection.latLngToLayerPoint;
        this.projection.getZoom = this.map.getZoom.bind(this.map);
        this.projection.getBounds = this.map.getBounds.bind(this.map);
        this.selection = this._rootGroup;

        if (_leaflet2.default.version < "1.0") map.on("viewreset", this._zoomChange, this);

        // Initial draw
        this.draw();
    },

    // Leaflet 1.0
    getEvents: function getEvents() {
        return { zoomend: this._zoomChange };
    },

    onRemove: function onRemove(map) {
        if (_leaflet2.default.version < "1.0") {
            map.off("viewreset", this._zoomChange, this);
            this._rootGroup.remove();
        } else {
            this._svg.remove();
        }
    },

    addTo: function addTo(map) {
        map.addLayer(this);
        return this;
    }

});

// Factory method
var d3SvgOverlay = exports.d3SvgOverlay = function d3SvgOverlay(drawCallback, options) {
    return new D3SvgOverlay(drawCallback, options);
};
_leaflet2.default.supermap = _leaflet2.default.supermap || {};
_leaflet2.default.supermap.d3Layer = d3SvgOverlay;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(0);

/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = L;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = d3;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(1);
module.exports = __webpack_require__(0);


/***/ })
/******/ ]);