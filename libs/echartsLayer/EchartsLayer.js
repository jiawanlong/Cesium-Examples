/*!
 *     Copyright (c) 2016 @thinkinggis
 *     Copyright© 2000-2017 SuperMap Software Co. Ltdnpm
 *     echartsLayer.
 *     github: https://github.com/SuperMap/echartsLayer
 *     license: MIT
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("echarts"));
	else if(typeof define === 'function' && define.amd)
		define(["echarts"], factory);
	else if(typeof exports === 'object')
		exports["EchartsLayer"] = factory(require("echarts"));
	else
		root["EchartsLayer"] = factory(root["echarts"]);
})(window, function(__WEBPACK_EXTERNAL_MODULE__0__) {
return /******/ (function(modules) { // webpackBootstrap
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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE__0__;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

__webpack_require__(2)
var EchartsLayer=__webpack_require__(6)
module.exports=EchartsLayer;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;/**
 * GLMap component extension
 */
!(__WEBPACK_AMD_DEFINE_RESULT__ = (function (require) {
  __webpack_require__(0).registerCoordinateSystem(
    'GLMap', __webpack_require__(3)
  )
  __webpack_require__(4)
  __webpack_require__(5)

  // Action
  __webpack_require__(0).registerAction({
    type: 'GLMapRoam',
    event: 'GLMapRoam',
    update: 'updateLayout'
  }, function (payload, ecModel) {})

  return {
    version: '1.0.0'
  }
}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))




/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function (require) {
    var echarts = __webpack_require__(0)

    function GLMapCoordSys(GLMap, api) {
        this._GLMap = GLMap
        this.dimensions = ['lng', 'lat']
        this._mapOffset = [0, 0]

        this._api = api
    }

    GLMapCoordSys.prototype.dimensions = ['lng', 'lat']

    GLMapCoordSys.prototype.setMapOffset = function (mapOffset) {
        this._mapOffset = mapOffset
    }

    GLMapCoordSys.prototype.getBMap = function () {
        return this._GLMap
    }

    GLMapCoordSys.prototype.fixLat=function(lat) {
        if(lat>=90){
            return 89.99999999999999;
        }
        if(lat<=-90){
            return -89.99999999999999;
        }
        return  lat;
    }

    GLMapCoordSys.prototype.dataToPoint = function (data) {
        data[1]= this.fixLat(data[1]);
        var px = this._GLMap.project(data)

        var mapOffset = this._mapOffset

        return [px.x - mapOffset[0], px.y - mapOffset[1]]
    }

    GLMapCoordSys.prototype.pointToData = function (pt) {
        var mapOffset = this._mapOffset
        var pt = this._bmap.project(
            [pt[0] + mapOffset[0],
                pt[1] + mapOffset[1]]
        )
        return [pt.lng, pt.lat]
    }

    GLMapCoordSys.prototype.getViewRect = function () {
        var api = this._api
        return new echarts.graphic.BoundingRect(0, 0, api.getWidth(), api.getHeight())
    }

    GLMapCoordSys.prototype.getRoamTransform = function () {
        return echarts.matrix.create()
    }

    GLMapCoordSys.prototype.prepareCustoms = function (data) {
        var zrUtil = echarts.util;

        var rect = this.getViewRect();
        return {
            coordSys: {
                // The name exposed to user is always 'cartesian2d' but not 'grid'.
                type: 'GLMap',
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height
            },
            api: {
                coord: zrUtil.bind(this.dataToPoint, this),
                size: zrUtil.bind(dataToCoordSize, this)
            }
        };

        function dataToCoordSize(dataSize, dataItem) {
            dataItem = dataItem || [0, 0];
            return zrUtil.map([0, 1], function (dimIdx) {
                var val = dataItem[dimIdx];
                var halfSize = dataSize[dimIdx] / 2;
                var p1 = [];
                var p2 = [];
                p1[dimIdx] = val - halfSize;
                p2[dimIdx] = val + halfSize;
                p1[1 - dimIdx] = p2[1 - dimIdx] = dataItem[1 - dimIdx];
                return Math.abs(this.dataToPoint(p1)[dimIdx] - this.dataToPoint(p2)[dimIdx]);
            }, this);
        }
    }

    // For deciding which dimensions to use when creating list data
    GLMapCoordSys.dimensions = GLMapCoordSys.prototype.dimensions

    GLMapCoordSys.create = function (ecModel, api) {
        var coordSys;

        ecModel.eachComponent('GLMap', function (GLMapModel) {
            var viewportRoot = api.getZr().painter.getViewportRoot()
            var GLMap = echarts.glMap;
            coordSys = new GLMapCoordSys(GLMap, api)
            coordSys.setMapOffset(GLMapModel.__mapOffset || [0, 0])
            GLMapModel.coordinateSystem = coordSys
        })

        ecModel.eachSeries(function (seriesModel) {
            if (seriesModel.get('coordinateSystem') === 'GLMap') {
                seriesModel.coordinateSystem = coordSys
            }
        })
    }

    return GLMapCoordSys
}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function (require) {

    return __webpack_require__(0).extendComponentModel({
        type: 'GLMap',

        getBMap: function () {
            // __bmap is injected when creating BMapCoordSys
            return this.__GLMap;
        },

        defaultOption: {
            roam: false
        }
    });
}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_RESULT__;!(__WEBPACK_AMD_DEFINE_RESULT__ = (function (require) {
  return __webpack_require__(0).extendComponentView({
    type: 'GLMap',

    render: function (GLMapModel, ecModel, api) {
      var rendering = true

      var glMap = __webpack_require__(0).glMap


      var viewportRoot = api.getZr().painter.getViewportRoot()
      var coordSys = GLMapModel.coordinateSystem
      var moveHandler = function (type, target) {
        if (rendering) {
          return
        }
        // var offsetEl = viewportRoot.parentNode.parentNode.parentNode
        var offsetEl = document.getElementsByClassName('mapboxgl-map')[0];

        var mapOffset = [
          -parseInt(offsetEl.style.left, 10) || 0,
          -parseInt(offsetEl.style.top, 10) || 0
        ]
        viewportRoot.style.left = mapOffset[0] + 'px'
        viewportRoot.style.top = mapOffset[1] + 'px'

        coordSys.setMapOffset(mapOffset)
        GLMapModel.__mapOffset = mapOffset

        api.dispatchAction({
          type: 'GLMapRoam'
        })
      }

      function zoomEndHandler () {
        if (rendering) {
          return
        }
        api.dispatchAction({
          type: 'GLMapRoam'
        })
      }

      glMap.off('move', this._oldMoveHandler)
      // FIXME
      // Moveend may be triggered by centerAndZoom method when creating coordSys next time
      // glMap.removeEventListener('moveend', this._oldMoveHandler)
      glMap.off('zoomend', this._oldZoomEndHandler)
      glMap.on('move', moveHandler)
      // glMap.addEventListener('moveend', moveHandler)
      glMap.on('zoomend', zoomEndHandler)

      this._oldMoveHandler = moveHandler
      this._oldZoomEndHandler = zoomEndHandler

      var roam = GLMapModel.get('roam')
      if (roam && roam !== 'scale') {
        // todo 允许拖拽
      }else {
        // todo 不允许拖拽
      }
      if (roam && roam !== 'move') {
        // todo 允许移动
      }else {
        // todo 不允许允许移动
      }



      rendering = false
    }
  })
}).call(exports, __webpack_require__, exports, module),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__))


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

function EchartsLayer(map) {
  var echarts = __webpack_require__(0);
  const mapContainer = map.getCanvasContainer();
  this._container = document.createElement('div');
  this._container.style.width = map.getCanvas().style.width;
  this._container.style.height = map.getCanvas().style.height;
  this._container.setAttribute('id', 'echarts');
  this._container.setAttribute('class', 'echartMap');
  this._map = map;
  mapContainer.appendChild(this._container);
  this.chart = echarts.init(this._container);
  echarts.glMap = map;
  this.resize();
}
EchartsLayer.prototype.remove = function() {
  var _this = this;
  this._map._listeners.move.forEach(function(element) {
    if (element.name === 'moveHandler') {
      _this._map.off('move', element);
    }
  });
  this._map._listeners.move.forEach(function(element) {
    if (element.name === 'zoomEndHandler') {
      _this._map.off('zoomend', element);
    }
  });

  // this._map.off('move', this._map._listeners.move[1]);
  // this._map.off('zoomend', this._map._listeners.moveend[1]);
  this.chart.clear();
  if(this._container.parentNode)
  this._container.parentNode.removeChild(this._container);
  this._map = undefined;
};
EchartsLayer.prototype.resize = function() {
  const me = this;
  window.onresize = function() {
    me._container.style.width = me._map.getCanvas().style.width;
    me._container.style.height = me._map.getCanvas().style.height;
    me.chart.resize();
  };
};
module.exports = EchartsLayer;


/***/ })
/******/ ]);
});