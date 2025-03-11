/*!
 * author: FDD <smileFDD@gmail.com> 
 * ol3-echarts v1.3.6
 * build-time: 2018-12-22 14:19
 * LICENSE: MIT
 * (c) 2017-2018 https://sakitam-fdd.github.io/ol3Echarts
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('echarts'), require('openlayers')) :
  typeof define === 'function' && define.amd ? define(['echarts', 'openlayers'], factory) :
  (global.ol3Echarts = factory(global.echarts,global.ol));
}(this, (function (echarts,ol) { 'use strict';

  echarts = echarts && echarts.hasOwnProperty('default') ? echarts['default'] : echarts;
  ol = ol && ol.hasOwnProperty('default') ? ol['default'] : ol;

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  var isObject = function isObject(value) {
    var type = typeof value === 'undefined' ? 'undefined' : _typeof(value);
    return value !== null && (type === 'object' || type === 'function');
  };

  var merge = function merge(a, b) {
    for (var key in b) {
      if (isObject(b[key]) && isObject(a[key])) {
        merge(a[key], b[key]);
      } else {
        a[key] = b[key];
      }
    }
    return a;
  };

  var getTarget = function getTarget(selector) {
    var doc = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;

    var dom = function () {
      var found = void 0;
      return doc && /^#([\w-]+)$/.test(selector) ? (found = doc.getElementById(RegExp.$1)) ? [found] : [] : Array.prototype.slice.call(/^\.([\w-]+)$/.test(selector) ? doc.getElementsByClassName(RegExp.$1) : /^[\w-]+$/.test(selector) ? doc.getElementsByTagName(selector) : doc.querySelectorAll(selector));
    }();
    return dom;
  };

  var map = function map(obj, cb, context) {
    if (!(obj && cb)) {
      return;
    }
    if (obj.map && obj.map === Array.prototype.map) {
      return obj.map(cb, context);
    } else {
      var result = [];
      for (var i = 0, len = obj.length; i < len; i++) {
        result.push(cb.call(context, obj[i], i, obj));
      }
      return result;
    }
  };

  var bind = function bind(func, context) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function () {
      return func.apply(context, args.concat(Array.prototype.slice.call(arguments)));
    };
  };

  var arrayAdd = function arrayAdd(array, item) {
    var i = 0;
    var index = void 0;
    var length = array.length;
    for (; i < length; i++) {
      if (array[i]['seriesIndex'] === item['seriesIndex']) {
        index = i;
      }
    }
    if (index === undefined) {
      array.push(item);
    } else {
      array[index] = item;
    }
    return array;
  };

  var checkDecoded = function checkDecoded(json) {
    if (json.UTF8Encoding) {
      return false;
    } else {
      return true;
    }
  };

  var decode = function decode(json) {
    if (checkDecoded(json)) {
      return json;
    }
    var encodeScale = json.UTF8Scale;
    if (encodeScale == null) {
      encodeScale = 1024;
    }
    var features = json.features;
    for (var f = 0; f < features.length; f++) {
      var feature = features[f];
      var geometry = feature.geometry;
      var _ref = [geometry.coordinates, geometry.encodeOffsets],
          coordinates = _ref[0],
          encodeOffsets = _ref[1];

      for (var c = 0; c < coordinates.length; c++) {
        var coordinate = coordinates[c];
        if (geometry.type === 'Polygon') {
          coordinates[c] = decodePolygon(coordinate, encodeOffsets[c], encodeScale);
        } else if (geometry.type === 'MultiPolygon') {
          for (var c2 = 0; c2 < coordinate.length; c2++) {
            var polygon = coordinate[c2];
            coordinate[c2] = decodePolygon(polygon, encodeOffsets[c][c2], encodeScale);
          }
        }
      }
    }

    json.UTF8Encoding = false;
    return json;
  };

  var decodePolygon = function decodePolygon(coordinate, encodeOffsets, encodeScale) {
    var _ref2 = [[], encodeOffsets[0], encodeOffsets[1]],
        result = _ref2[0],
        prevX = _ref2[1],
        prevY = _ref2[2];

    for (var i = 0; i < coordinate.length; i += 2) {
      var x = coordinate.charCodeAt(i) - 64;
      var y = coordinate.charCodeAt(i + 1) - 64;

      x = x >> 1 ^ -(x & 1);
      y = y >> 1 ^ -(y & 1);

      x += prevX;
      y += prevY;
      prevX = x;
      prevY = y;

      result.push([x / encodeScale, y / encodeScale]);
    }
    return result;
  };

  function formatGeoJSON (json) {
    var geoJson = decode(json);
    var _features = echarts.util.map(echarts.util.filter(geoJson.features, function (featureObj) {
      return featureObj.geometry && featureObj.properties && featureObj.geometry.coordinates.length > 0;
    }), function (featureObj) {
      var properties = featureObj.properties;
      var geo = featureObj.geometry;
      var coordinates = geo.coordinates;
      var geometries = [];
      if (geo.type === 'Polygon') {
        geometries.push(coordinates[0]);
      }
      if (geo.type === 'MultiPolygon') {
        echarts.util.each(coordinates, function (item) {
          if (item[0]) {
            geometries.push(item[0]);
          }
        });
      }
      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: geometries
        },
        properties: properties
      };
    });
    return {
      type: 'FeatureCollection',
      crs: {},
      features: _features
    };
  }

  var _getCoordinateSystem = function _getCoordinateSystem(map$$1) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var RegisterCoordinateSystem = function RegisterCoordinateSystem() {
      this._mapOffset = [0, 0];
      this.dimensions = ['lng', 'lat'];
      this.projCode_ = this._getProjectionCode();
    };

    RegisterCoordinateSystem.prototype.dimensions = ['lng', 'lat'];

    RegisterCoordinateSystem.dimensions = RegisterCoordinateSystem.prototype.dimensions;

    RegisterCoordinateSystem.prototype.getZoom = function () {
      return map$$1.getView().getZoom();
    };

    RegisterCoordinateSystem.prototype.setZoom = function (zoom) {
      return map$$1.getView().setZoom(zoom);
    };

    RegisterCoordinateSystem.prototype.getViewRectAfterRoam = function () {
      return this.getViewRect().clone();
    };

    RegisterCoordinateSystem.prototype.setMapOffset = function (mapOffset) {
      this._mapOffset = mapOffset;
    };

    RegisterCoordinateSystem.prototype.dataToPoint = function (coords) {
      if (coords && Array.isArray(coords) && coords.length > 0) {
        coords = coords.map(function (item) {
          if (typeof item === 'string') {
            item = Number(item);
          }
          return item;
        });
      }
      var source = options['source'] || 'EPSG:4326';
      var destination = options['destination'] || this.projCode_;
      var pixel = map$$1.getPixelFromCoordinate(ol.proj.transform(coords, source, destination));
      var mapOffset = this._mapOffset;
      return [pixel[0] - mapOffset[0], pixel[1] - mapOffset[1]];
    };

    RegisterCoordinateSystem.prototype._getProjectionCode = function () {
      var code = '';
      if (map$$1) {
        code = map$$1.getView() && map$$1.getView().getProjection().getCode();
      } else {
        code = 'EPSG:3857';
      }
      return code;
    };

    RegisterCoordinateSystem.prototype.pointToData = function (pixel) {
      var mapOffset = this._mapOffset;
      return map$$1.getCoordinateFromPixel([pixel[0] + mapOffset[0], pixel[1] + mapOffset[1]]);
    };

    RegisterCoordinateSystem.prototype.getViewRect = function () {
      var size = map$$1.getSize();
      return new echarts.graphic.BoundingRect(0, 0, size[0], size[1]);
    };

    RegisterCoordinateSystem.prototype.getRoamTransform = function () {
      return echarts.matrix.create();
    };

    RegisterCoordinateSystem.prototype.prepareCustoms = function (data) {
      var rect = this.getViewRect();
      return {
        coordSys: {
          type: 'openlayers',
          x: rect.x,
          y: rect.y,
          width: rect.width,
          height: rect.height
        },
        api: {
          coord: bind(this.dataToPoint, this),
          size: bind(RegisterCoordinateSystem.dataToCoordSize, this)
        }
      };
    };

    RegisterCoordinateSystem.dataToCoordSize = function (dataSize, dataItem) {
      dataItem = dataItem || [0, 0];
      return map([0, 1], function (dimIdx) {
        var val = dataItem[dimIdx];
        var halfSize = dataSize[dimIdx] / 2;
        var p1 = [],
            p2 = [];

        p1[dimIdx] = val - halfSize;
        p2[dimIdx] = val + halfSize;
        p1[1 - dimIdx] = p2[1 - dimIdx] = dataItem[1 - dimIdx];
        return Math.abs(this.dataToPoint(p1)[dimIdx] - this.dataToPoint(p2)[dimIdx]);
      }, this);
    };

    RegisterCoordinateSystem.create = function (echartModel, api) {
      echartModel.eachSeries(function (seriesModel) {
        if (seriesModel.get('coordinateSystem') === 'openlayers') {
          seriesModel.coordinateSystem = new RegisterCoordinateSystem(map$$1);
        }
      });
    };

    return RegisterCoordinateSystem;
  };

  var pie = function pie(options, serie, coordinateSystem) {
    serie.center = coordinateSystem.dataToPoint(serie.coordinates);
    return serie;
  };

  var bar = function bar(options, serie, coordinateSystem) {
    if (isObject(options.grid) && !Array.isArray(options.grid)) {
      console.log(options);
    } else if (Array.isArray(options.grid)) {
      options.grid = options.grid.map(function (gri, index) {
        var coorPixel = coordinateSystem.dataToPoint(options.series[index].coordinates);
        gri.left = coorPixel[0] - parseFloat(gri.width) / 2;
        gri.top = coorPixel[1] - parseFloat(gri.height) / 2;
        return gri;
      });
    }
    return serie;
  };



  var charts = /*#__PURE__*/Object.freeze({
    pie: pie,
    bar: bar
  });

  var _options = {
    forcedRerender: false,
    forcedPrecomposeRerender: false,
    hideOnZooming: false,
    hideOnMoving: false,
    hideOnRotating: false,
    convertTypes: ['pie', 'line', 'bar']
  };

  var ol3Echarts = function (_ol$Object) {
    inherits(ol3Echarts, _ol$Object);

    function ol3Echarts(chartOptions) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var map$$1 = arguments[2];
      classCallCheck(this, ol3Echarts);

      var _this = possibleConstructorReturn(this, _ol$Object.call(this));

      _this.$options = merge(_options, options);

      _this.$chartOptions = chartOptions;

      _this.$chart = null;

      _this.$Map = null;

      _this._isRegistered = false;

      _this._incremental = [];

      _this._coordinateSystem = null;

      if (map$$1) _this.appendTo(map$$1);
      return _this;
    }

    ol3Echarts.prototype.appendTo = function appendTo(map$$1) {
      if (map$$1 && map$$1 instanceof ol.Map) {
        this.$Map = map$$1;
        this.$Map.once('postrender', this.render, this);
        this.$Map.renderSync();
        this._unRegisterEvents();
        this._registerEvents();
      } else {
        throw new Error('not map object');
      }
    };

    ol3Echarts.prototype.getChartOptions = function getChartOptions() {
      return this.$chartOptions;
    };

    ol3Echarts.prototype.setChartOptions = function setChartOptions() {
      var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      this.$chartOptions = options;
      this.$Map.once('postrender', this.render, this);
      this.$Map.renderSync();
      return this;
    };

    ol3Echarts.prototype.appendData = function appendData(data) {
      var save = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (data) {
        if (save) {
          this._incremental = arrayAdd(this._incremental, {
            data: data.data,
            seriesIndex: data.seriesIndex
          });
        }

        this.$chart.appendData({
          data: data.data.copyWithin(),
          seriesIndex: data.seriesIndex
        });
      }
      return this;
    };

    ol3Echarts.prototype.clear = function clear() {
      this._incremental = [];
      this.$chart.clear();
    };

    ol3Echarts.prototype.getMap = function getMap() {
      return this.$Map;
    };

    ol3Echarts.prototype._isVisible = function _isVisible() {
      return this.$container && this.$container.style.display === '';
    };

    ol3Echarts.prototype.show = function show() {
      if (this.$container) {
        this.$container.style.display = '';
      }
    };

    ol3Echarts.prototype.hide = function hide() {
      if (this.$container) {
        this.$container.style.display = 'none';
      }
    };

    ol3Echarts.prototype.remove = function remove() {
      this.$chart.clear();
      this.$chart.dispose();
      this._unRegisterEvents();
      this._incremental = [];
      delete this.$chart;
      delete this.$Map;
      this.$container.parentNode.removeChild(this.$container);
    };

    ol3Echarts.prototype.showLoading = function showLoading() {
      if (this.$chart) {
        this.$chart.showLoading();
      }
    };

    ol3Echarts.prototype.hideLoading = function hideLoading() {
      if (this.$chart) {
        this.$chart.hideLoading();
      }
    };

    ol3Echarts.prototype._createLayerContainer = function _createLayerContainer(map$$1, options) {
      var viewPort = map$$1.getViewport();
      var container = this.$container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '0px';
      container.style.left = '0px';
      container.style.right = '0px';
      container.style.bottom = '0px';
      var _target = getTarget(options['target'], viewPort);
      if (_target && _target[0] && _target[0] instanceof Element) {
        _target[0].appendChild(container);
      } else {
        var _target2 = getTarget('.ol-overlaycontainer', viewPort);
        if (_target2 && _target2[0] && _target2[0] instanceof Element) {
          _target2[0].appendChild(container);
        } else {
          viewPort.appendChild(container);
        }
      }
    };

    ol3Echarts.prototype._resizeContainer = function _resizeContainer() {
      var size = this.getMap().getSize();
      this.$container.style.height = size[1] + 'px';
      this.$container.style.width = size[0] + 'px';
    };

    ol3Echarts.prototype._clearAndRedraw = function _clearAndRedraw() {
      if (!this.$chart || this.$container && this.$container.style.display === 'none') {
        return;
      }
      this.dispatchEvent({
        type: 'redraw',
        source: this
      });
      if (this.$options.forcedRerender) {
        this.$chart.clear();
      }
      this.$chart.resize();
      if (this.$chartOptions) {
        this._registerMap();
        this.$chart.setOption(this.reConverData(this.$chartOptions), false);
        if (this._incremental && this._incremental.length > 0) {
          for (var i = 0; i < this._incremental.length; i++) {
            this.appendData(this._incremental[i], false);
          }
        }
      }
    };

    ol3Echarts.prototype.onResize = function onResize() {
      this._resizeContainer();
      this._clearAndRedraw();
      this.dispatchEvent({
        type: 'change:size',
        source: this
      });
    };

    ol3Echarts.prototype.onZoomEnd = function onZoomEnd() {
      this.$options['hideOnZooming'] && this.show();
      this._clearAndRedraw();
      this.dispatchEvent({
        type: 'zoomend',
        source: this
      });
    };

    ol3Echarts.prototype.onDragRotateEnd = function onDragRotateEnd() {
      this.$options['hideOnRotating'] && this.show();
      this._clearAndRedraw();
      this.dispatchEvent({
        type: 'change:rotation',
        source: this
      });
    };

    ol3Echarts.prototype.onMoveStart = function onMoveStart() {
      this.$options['hideOnMoving'] && this.hide();
      this.dispatchEvent({
        type: 'movestart',
        source: this
      });
    };

    ol3Echarts.prototype.onMoveEnd = function onMoveEnd() {
      this.$options['hideOnMoving'] && this.show();
      this._clearAndRedraw();
      this.dispatchEvent({
        type: 'moveend',
        source: this
      });
    };

    ol3Echarts.prototype.onCenterChange = function onCenterChange(event) {
      this._clearAndRedraw();
      this.dispatchEvent({
        type: 'change:center',
        source: this
      });
    };

    ol3Echarts.prototype._registerEvents = function _registerEvents() {
      var Map = this.$Map;
      var view = Map.getView();
      if (this.$options.forcedPrecomposeRerender) {
        Map.on('precompose', this.reRender, this);
      }
      Map.on('change:size', this.onResize, this);
      view.on('change:resolution', this.onZoomEnd, this);
      view.on('change:center', this.onCenterChange, this);
      view.on('change:rotation', this.onDragRotateEnd, this);
      Map.on('movestart', this.onMoveStart, this);
      Map.on('moveend', this.onMoveEnd, this);
    };

    ol3Echarts.prototype._unRegisterEvents = function _unRegisterEvents() {
      var Map = this.$Map;
      var view = Map.getView();
      Map.un('change:size', this.onResize, this);
      if (this.$options.forcedPrecomposeRerender) {
        Map.un('precompose', this.reRender, this);
      }
      view.un('change:resolution', this.onZoomEnd, this);
      view.un('change:center', this.onCenterChange, this);
      view.un('change:rotation', this.onDragRotateEnd, this);
      Map.un('movestart', this.onMoveStart, this);
      Map.un('moveend', this.onMoveEnd, this);
    };

    ol3Echarts.prototype._registerMap = function _registerMap() {
      if (!this._isRegistered) {
        echarts.registerCoordinateSystem('openlayers', _getCoordinateSystem(this.getMap(), this.$options));
        this._isRegistered = true;
      }
      var series = this.$chartOptions.series;
      if (series && isObject(series)) {
        for (var i = series.length - 1; i >= 0; i--) {
          if (!(this.$options.convertTypes.indexOf(series[i]['type']) > -1)) {
            series[i]['coordinateSystem'] = 'openlayers';
          }
          series[i]['animation'] = false;
        }
      }
    };

    ol3Echarts.prototype.reConverData = function reConverData(options) {
      var series = options['series'];
      if (series && series.length > 0) {
        if (!this._coordinateSystem) {
          var _cs = _getCoordinateSystem(this.getMap(), this.$options);
          this._coordinateSystem = new _cs();
        }
        if (series && isObject(series)) {
          for (var i = series.length - 1; i >= 0; i--) {
            if (this.$options.convertTypes.indexOf(series[i]['type']) > -1) {
              if (series[i] && series[i].hasOwnProperty('coordinates')) {
                series[i] = charts[series[i]['type']](options, series[i], this._coordinateSystem);
              }
            }
          }
        }
      }
      return options;
    };

    ol3Echarts.prototype.render = function render() {
      if (!this.$container) {
        this._createLayerContainer(this.$Map, this.$options);
        this._resizeContainer();
      }
      if (!this.$chart) {
        this.$chart = echarts.init(this.$container);
        if (this.$chartOptions) {
          this._registerMap();
          this.$chart.setOption(this.reConverData(this.$chartOptions), false);
        }
      } else if (this._isVisible()) {
        this.$chart.resize();
        this.reRender();
      }
    };

    ol3Echarts.prototype.reRender = function reRender() {
      this._clearAndRedraw();
    };

    return ol3Echarts;
  }(ol.Object);

  ol3Echarts.getTarget = getTarget;
  ol3Echarts.merge = merge;
  ol3Echarts.map = map;
  ol3Echarts.bind = bind;
  ol3Echarts.formatGeoJSON = formatGeoJSON;

  return ol3Echarts;

})));