/*!
 * author: sakitam-fdd <smilefdd@gmail.com> 
 * ol3-echarts v2.0.5
 * build-time: 2022-1-6 15:31
 * LICENSE: MIT
 * (c) 2017-2022 https://sakitam-fdd.github.io/ol3Echarts
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('openlayers'), require('echarts')) :
    typeof define === 'function' && define.amd ? define(['openlayers', 'echarts'], factory) :
    (global = global || self, global.ol3Echarts = factory(global.ol, global.echarts));
}(this, function (ol, echarts) { 'use strict';

    ol = ol && ol.hasOwnProperty('default') ? ol['default'] : ol;
    echarts = echarts && echarts.hasOwnProperty('default') ? echarts['default'] : echarts;

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var isObject = function (value) {
        var type = typeof value;
        return value !== null && (type === 'object' || type === 'function');
    };
    var merge = function (a, b) {
        Object.keys(b).forEach(function (key) {
            if (isObject(b[key]) && isObject(a[key])) {
                merge(a[key], b[key]);
            }
            else {
                a[key] = b[key];
            }
        });
        return a;
    };
    var bind = function (func, context) {
        var arguments$1 = arguments;

        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments$1[_i];
        }
        return function () {
            var arguments$1 = arguments;

            var innerArgs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                innerArgs[_i] = arguments$1[_i];
            }
            return func.apply(context, args.concat(Array.prototype.slice.call(innerArgs)));
        };
    };
    var arrayAdd = function (array, item) {
        var i = 0;
        var index;
        var length = array.length;
        for (; i < length; i++) {
            if (array[i].index === item.index) {
                index = i;
                break;
            }
        }
        if (index === undefined) {
            array.push(item);
        }
        else {
            array[index] = item;
        }
        return array;
    };
    var uuid = function () {
        function rd(a) {
            return a ? (a ^ Math.random() * 16 >> a / 4).toString(16)
                : ([1e7] + -[1e3] + -4e3 + -8e3 + -1e11).replace(/[018]/g, rd);
        }
        return rd();
    };
    function bindAll(fns, context) {
        fns.forEach(function (fn) {
            if (!context[fn]) {
                return;
            }
            context[fn] = context[fn].bind(context);
        });
    }
    function removeNode(node) {
        return node && node.parentNode ? node.parentNode.removeChild(node) : null;
    }
    function mockEvent(type, event) {
        var e = new MouseEvent(type, {
            bubbles: true,
            cancelable: true,
            button: event.pointerEvent.button,
            buttons: event.pointerEvent.buttons,
            clientX: event.pointerEvent.clientX,
            clientY: event.pointerEvent.clientY,
            zrX: event.pointerEvent.offsetX,
            zrY: event.pointerEvent.offsetY,
            movementX: event.pointerEvent.movementX,
            movementY: event.pointerEvent.movementY,
            relatedTarget: event.pointerEvent.relatedTarget,
            screenX: event.pointerEvent.screenX,
            screenY: event.pointerEvent.screenY,
            view: window,
        });
        e.zrX = event.pointerEvent.offsetX;
        e.zrY = event.pointerEvent.offsetY;
        e.event = e;
        return e;
    }

    var checkDecoded = function (json) { return !json.UTF8Encoding; };
    var decodePolygon = function (coordinate, encodeOffsets, encodeScale) {
        var result = [];
        var _a = [encodeOffsets[0], encodeOffsets[1]], prevX = _a[0], prevY = _a[1];
        for (var i = 0; i < coordinate.length; i += 2) {
            var x = coordinate.charCodeAt(i) - 64;
            var y = coordinate.charCodeAt(i + 1) - 64;
            x = (x >> 1) ^ -(x & 1);
            y = (y >> 1) ^ -(y & 1);
            x += prevX;
            y += prevY;
            prevX = x;
            prevY = y;
            result.push([x / encodeScale, y / encodeScale]);
        }
        return result;
    };
    var decode = function (json) {
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
            var _a = [geometry.coordinates, geometry.encodeOffsets], coordinates = _a[0], encodeOffsets = _a[1];
            for (var c = 0; c < coordinates.length; c++) {
                var coordinate = coordinates[c];
                if (geometry.type === 'Polygon') {
                    coordinates[c] = decodePolygon(coordinate, encodeOffsets[c], encodeScale);
                }
                else if (geometry.type === 'MultiPolygon') {
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
                properties: properties,
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    coordinates: geometries,
                },
            };
        });
        return {
            type: 'FeatureCollection',
            crs: {},
            features: _features,
        };
    }

    var pie = function (_options, serie, coordinateSystem) {
        serie.center = coordinateSystem.dataToPoint(serie.coordinates);
        return serie;
    };

    var bar = function (options, serie, coordinateSystem) {
        if (isObject(options.grid) && !Array.isArray(options.grid)) {
            console.log(options);
        }
        else if (Array.isArray(options.grid)) {
            options.grid = options.grid.map(function (gri, index) {
                var coorPixel = coordinateSystem.dataToPoint(options.series[index].coordinates);
                gri.left = coorPixel[0] - parseFloat(gri.width) / 2;
                gri.top = coorPixel[1] - parseFloat(gri.height) / 2;
                return gri;
            });
        }
        return serie;
    };

    var line = function (options, serie, coordinateSystem) {
        if (isObject(options.grid) && !Array.isArray(options.grid)) {
            console.log(options);
        }
        else if (Array.isArray(options.grid)) {
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
        bar: bar,
        line: line
    });

    var Map = ol.Map;
    var obj = ol.Object;
    var transform = ol.proj.transform;
    if (!Map.prototype.getOverlayContainer) {
        Map.prototype.getOverlayContainer = function (className) {
            className = className || 'ol-overlaycontainer';
            var viewport = this.getViewport();
            if (viewport) {
                var overlays = viewport.getElementsByClassName(className);
                return overlays && overlays.length > 0 ? overlays[0] : null;
            }
            return null;
        };
    }
    if (!Map.prototype.getOverlayContainerStopEvent) {
        Map.prototype.getOverlayContainerStopEvent = function (className) {
            className = className || 'ol-overlaycontainer-stopevent';
            var viewport = this.getViewport();
            if (viewport) {
                var overlays = viewport.getElementsByClassName(className);
                return overlays && overlays.length > 0 ? overlays[0] : null;
            }
            return null;
        };
    }
    var _options = {
        forcedRerender: false,
        forcedPrecomposeRerender: false,
        hideOnZooming: false,
        hideOnMoving: false,
        hideOnRotating: false,
        convertTypes: ['pie', 'line', 'bar'],
        insertFirst: false,
        stopEvent: false,
        polyfillEvents: false,
    };
    var EChartsLayer = (function (_super) {
        __extends(EChartsLayer, _super);
        function EChartsLayer(chartOptions, options, map) {
            var _this = this;
            var opts = Object.assign(_options, options);
            _this = _super.call(this, opts) || this;
            _this._options = opts;
            _this._chartOptions = chartOptions;
            _this.set('chartOptions', chartOptions);
            _this.$chart = null;
            _this.$container = undefined;
            _this._isRegistered = false;
            _this._initEvent = false;
            _this._incremental = [];
            _this._coordinateSystem = null;
            _this.coordinateSystemId = '';
            _this.prevVisibleState = '';
            bindAll([
                'redraw', 'onResize', 'onZoomEnd', 'onCenterChange',
                'onDragRotateEnd', 'onMoveStart', 'onMoveEnd',
                'mouseDown', 'mouseUp', 'onClick', 'mouseMove' ], _this);
            if (map)
                { _this.setMap(map); }
            return _this;
        }
        EChartsLayer.prototype.appendTo = function (map, forceIgnore) {
            if (forceIgnore === void 0) { forceIgnore = false; }
            this.setMap(map, forceIgnore);
        };
        EChartsLayer.prototype.getMap = function () {
            return this._map;
        };
        EChartsLayer.prototype.setMap = function (map, forceIgnore) {
            var _this = this;
            if (forceIgnore === void 0) { forceIgnore = false; }
            if (map && (forceIgnore || map instanceof Map)) {
                this._map = map;
                this._map.once('postrender', function () {
                    _this.handleMapChanged();
                });
                this._map.renderSync();
            }
            else {
                throw new Error('not ol map object');
            }
        };
        EChartsLayer.prototype.getChartOptions = function () {
            return this.get('chartOptions');
        };
        EChartsLayer.prototype.setChartOptions = function (options) {
            if (options === void 0) { options = {}; }
            this._chartOptions = options;
            this.set('chartOptions', options);
            this.clearAndRedraw();
            return this;
        };
        EChartsLayer.prototype.appendData = function (data, save) {
            if (save === void 0) { save = true; }
            if (data) {
                if (save) {
                    this._incremental = arrayAdd(this._incremental, {
                        index: this._incremental.length,
                        data: data.data,
                        seriesIndex: data.seriesIndex,
                    });
                }
                this.$chart.appendData({
                    data: data.data.copyWithin(),
                    seriesIndex: data.seriesIndex,
                });
            }
            return this;
        };
        EChartsLayer.prototype.clear = function (keep) {
            if (!keep) {
                this._incremental = [];
            }
            if (this.$chart) {
                this.$chart.clear();
            }
        };
        EChartsLayer.prototype.remove = function () {
            this.clear();
            if (this.$chart) {
                this.$chart.dispose();
            }
            if (this._initEvent && this.$container) {
                this.$container && removeNode(this.$container);
                this.unBindEvent();
            }
            delete this.$chart;
            delete this._map;
        };
        EChartsLayer.prototype.show = function () {
            this.setVisible(true);
        };
        EChartsLayer.prototype.innerShow = function () {
            if (this.$container) {
                this.$container.style.display = this.prevVisibleState;
                this.prevVisibleState = '';
            }
        };
        EChartsLayer.prototype.hide = function () {
            this.setVisible(false);
        };
        EChartsLayer.prototype.innerHide = function () {
            if (this.$container) {
                this.prevVisibleState = this.$container.style.display;
                this.$container.style.display = 'none';
            }
        };
        EChartsLayer.prototype.isVisible = function () {
            return this.$container && this.$container.style.display !== 'none';
        };
        EChartsLayer.prototype.showLoading = function () {
            if (this.$chart) {
                this.$chart.showLoading();
            }
        };
        EChartsLayer.prototype.hideLoading = function () {
            if (this.$chart) {
                this.$chart.hideLoading();
            }
        };
        EChartsLayer.prototype.setZIndex = function (zIndex) {
            if (this.$container) {
                if (typeof zIndex === 'number') {
                    zIndex = String(zIndex);
                }
                this.$container.style.zIndex = zIndex;
            }
        };
        EChartsLayer.prototype.getZIndex = function () {
            return this.$container && this.$container.style.zIndex;
        };
        EChartsLayer.prototype.setVisible = function (visible) {
            if (visible) {
                if (this.$container) {
                    this.$container.style.display = '';
                }
                this._chartOptions = this.getChartOptions();
                this.clearAndRedraw();
            }
            else {
                if (this.$container) {
                    this.$container.style.display = 'none';
                }
                this.clear(true);
                this._chartOptions = {};
                this.clearAndRedraw();
            }
        };
        EChartsLayer.prototype.render = function () {
            if (!this.$chart && this.$container) {
                this.$chart = echarts.init(this.$container);
                if (this._chartOptions) {
                    this.registerMap();
                    this.$chart.setOption(this.convertData(this._chartOptions), false);
                }
                this.dispatchEvent({
                    type: 'load',
                    source: this,
                    value: this.$chart,
                });
            }
            else if (this.isVisible()) {
                this.redraw();
            }
        };
        EChartsLayer.prototype.redraw = function () {
            this.clearAndRedraw();
        };
        EChartsLayer.prototype.updateViewSize = function (size) {
            if (!this.$container)
                { return; }
            this.$container.style.width = size[0] + "px";
            this.$container.style.height = size[1] + "px";
            this.$container.setAttribute('width', String(size[0]));
            this.$container.setAttribute('height', String(size[1]));
        };
        EChartsLayer.prototype.onResize = function (event) {
            var map = this.getMap();
            if (map) {
                var size = map.getSize();
                this.updateViewSize(size);
                this.clearAndRedraw();
                if (event) {
                    this.dispatchEvent({
                        type: 'change:size',
                        source: this,
                        value: size,
                    });
                }
            }
        };
        EChartsLayer.prototype.onZoomEnd = function () {
            this._options.hideOnZooming && this.innerShow();
            var map = this.getMap();
            if (map && map.getView()) {
                this.clearAndRedraw();
                this.dispatchEvent({
                    type: 'zoomend',
                    source: this,
                    value: map.getView().getZoom(),
                });
            }
        };
        EChartsLayer.prototype.onDragRotateEnd = function () {
            this._options.hideOnRotating && this.innerShow();
            var map = this.getMap();
            if (map && map.getView()) {
                this.clearAndRedraw();
                this.dispatchEvent({
                    type: 'change:rotation',
                    source: this,
                    value: map.getView().getRotation(),
                });
            }
        };
        EChartsLayer.prototype.onMoveStart = function () {
            this._options.hideOnMoving && this.innerHide();
            var map = this.getMap();
            if (map && map.getView()) {
                this.dispatchEvent({
                    type: 'movestart',
                    source: this,
                    value: map.getView().getCenter(),
                });
            }
        };
        EChartsLayer.prototype.onMoveEnd = function () {
            this._options.hideOnMoving && this.innerShow();
            var map = this.getMap();
            if (map && map.getView()) {
                this.clearAndRedraw();
                this.dispatchEvent({
                    type: 'moveend',
                    source: this,
                    value: map.getView().getCenter(),
                });
            }
        };
        EChartsLayer.prototype.onClick = function (event) {
            if (this.$chart) {
                this.$chart.getZr().painter.getViewportRoot().dispatchEvent(mockEvent('click', event));
            }
        };
        EChartsLayer.prototype.mouseDown = function (event) {
            if (this.$chart) {
                this.$chart.getZr().painter.getViewportRoot().dispatchEvent(mockEvent('mousedown', event));
            }
        };
        EChartsLayer.prototype.mouseUp = function (event) {
            if (this.$chart) {
                this.$chart.getZr().painter.getViewportRoot().dispatchEvent(mockEvent('mouseup', event));
            }
        };
        EChartsLayer.prototype.mouseMove = function (event) {
            if (this.$chart) {
                var target = event.originalEvent.target;
                while (target) {
                    if (target.className === 'ol-overlaycontainer-stopevent') {
                        this.$chart.getZr().painter.getViewportRoot().dispatchEvent(mockEvent('mousemove', event));
                        return;
                    }
                    target = target.parentElement;
                }
            }
        };
        EChartsLayer.prototype.onCenterChange = function () {
            var map = this.getMap();
            if (map && map.getView()) {
                this.clearAndRedraw();
                this.dispatchEvent({
                    type: 'change:center',
                    source: this,
                    value: map.getView().getCenter(),
                });
            }
        };
        EChartsLayer.prototype.handleMapChanged = function () {
            var map = this.getMap();
            if (this._initEvent && this.$container) {
                this.$container && removeNode(this.$container);
                this.unBindEvent();
            }
            if (!this.$container) {
                this.createLayerContainer();
                this.onResize(false);
            }
            if (map) {
                var container = this._options.stopEvent ? map.getOverlayContainerStopEvent() : map.getOverlayContainer();
                if (this._options.insertFirst) {
                    container.insertBefore(this.$container, container.childNodes[0] || null);
                }
                else {
                    container.appendChild(this.$container);
                }
                this.render();
                this.bindEvent(map);
            }
        };
        EChartsLayer.prototype.createLayerContainer = function () {
            this.$container = document.createElement('div');
            this.$container.style.position = 'absolute';
            this.$container.style.top = '0px';
            this.$container.style.left = '0px';
            this.$container.style.right = '0px';
            this.$container.style.bottom = '0px';
        };
        EChartsLayer.prototype.bindEvent = function (map) {
            var view = map.getView();
            if (this._options.forcedPrecomposeRerender) {
                map.on('precompose', this.redraw);
            }
            map.on('change:size', this.onResize);
            view.on('change:resolution', this.onZoomEnd);
            view.on('change:center', this.onCenterChange);
            view.on('change:rotation', this.onDragRotateEnd);
            map.on('movestart', this.onMoveStart);
            map.on('moveend', this.onMoveEnd);
            if (this._options.polyfillEvents) {
                map.on('pointerdown', this.mouseDown);
                map.on('pointerup', this.mouseUp);
                map.on('pointermove', this.mouseMove);
                map.on('click', this.onClick);
            }
            this._initEvent = true;
        };
        EChartsLayer.prototype.unBindEvent = function () {
            var map = this.getMap();
            if (!map)
                { return; }
            var view = map.getView();
            if (!view)
                { return; }
            map.un('precompose', this.redraw);
            map.un('change:size', this.onResize);
            view.un('change:resolution', this.onZoomEnd);
            view.un('change:center', this.onCenterChange);
            view.un('change:rotation', this.onDragRotateEnd);
            map.un('movestart', this.onMoveStart);
            map.un('moveend', this.onMoveEnd);
            if (this._options.polyfillEvents) {
                map.un('pointerdown', this.mouseDown);
                map.un('pointerup', this.mouseUp);
                map.un('pointermove', this.mouseMove);
                map.un('click', this.onClick);
            }
            this._initEvent = false;
        };
        EChartsLayer.prototype.clearAndRedraw = function () {
            if (!this.$chart || !this.isVisible())
                { return; }
            if (this._options.forcedRerender) {
                this.$chart.clear();
            }
            this.$chart.resize();
            if (this._chartOptions) {
                this.registerMap();
                this.$chart.setOption(this.convertData(this._chartOptions), false);
                if (this._incremental && this._incremental.length > 0) {
                    for (var i = 0; i < this._incremental.length; i++) {
                        this.appendData(this._incremental[i], false);
                    }
                }
            }
            this.dispatchEvent({
                type: 'redraw',
                source: this,
            });
        };
        EChartsLayer.prototype.registerMap = function () {
            if (!this._isRegistered) {
                this.coordinateSystemId = "openlayers_" + uuid();
                echarts.registerCoordinateSystem(this.coordinateSystemId, this.getCoordinateSystem(this._options));
                this._isRegistered = true;
            }
            if (this._chartOptions) {
                var series = this._chartOptions.series;
                if (series && isObject(series)) {
                    var convertTypes = this._options.convertTypes;
                    if (convertTypes) {
                        for (var i = series.length - 1; i >= 0; i--) {
                            if (!(convertTypes.indexOf(series[i].type) > -1)) {
                                series[i].coordinateSystem = this.coordinateSystemId;
                            }
                            series[i].animation = false;
                        }
                    }
                }
            }
        };
        EChartsLayer.prototype.convertData = function (options) {
            var series = options.series;
            if (series && series.length > 0) {
                if (!this._coordinateSystem) {
                    var Rc = this.getCoordinateSystem(this._options);
                    this._coordinateSystem = new Rc(this.getMap());
                }
                if (series && isObject(series)) {
                    var convertTypes = this._options.convertTypes;
                    if (convertTypes) {
                        for (var i = series.length - 1; i >= 0; i--) {
                            if (convertTypes.indexOf(series[i].type) > -1) {
                                if (series[i] && series[i].hasOwnProperty('coordinates')) {
                                    series[i] = charts[series[i].type](options, series[i], this._coordinateSystem);
                                }
                            }
                        }
                    }
                }
            }
            return options;
        };
        EChartsLayer.prototype.getCoordinateSystem = function (options) {
            var map = this.getMap();
            var coordinateSystemId = this.coordinateSystemId;
            var RegisterCoordinateSystem = function (map) {
                this.map = map;
                this._mapOffset = [0, 0];
                this.dimensions = ['lng', 'lat'];
                this.projCode = RegisterCoordinateSystem.getProjectionCode(this.map);
            };
            RegisterCoordinateSystem.dimensions = RegisterCoordinateSystem.prototype.dimensions || ['lng', 'lat'];
            RegisterCoordinateSystem.prototype.getZoom = function () {
                return this.map.getView().getZoom();
            };
            RegisterCoordinateSystem.prototype.setZoom = function (zoom) {
                return this.map.getView().setZoom(zoom);
            };
            RegisterCoordinateSystem.prototype.getViewRectAfterRoam = function () {
                return this.getViewRect().clone();
            };
            RegisterCoordinateSystem.prototype.setMapOffset = function (mapOffset) {
                this._mapOffset = mapOffset;
            };
            RegisterCoordinateSystem.prototype.dataToPoint = function (data) {
                var coords;
                if (data && Array.isArray(data) && data.length > 0) {
                    coords = data.map(function (item) {
                        var res = 0;
                        if (typeof item === 'string') {
                            res = Number(item);
                        }
                        else {
                            res = item;
                        }
                        return res;
                    });
                    var source = (options && options.source) || 'EPSG:4326';
                    var destination = (options && options.destination) || this.projCode;
                    var pixel = this.map.getPixelFromCoordinate(transform(coords, source, destination));
                    var mapOffset = this._mapOffset;
                    return [pixel[0] - mapOffset[0], pixel[1] - mapOffset[1]];
                }
                return [0, 0];
            };
            RegisterCoordinateSystem.prototype.pointToData = function (pixel) {
                var mapOffset = this._mapOffset;
                return this.map.getCoordinateFromPixel([pixel[0] + mapOffset[0], pixel[1] + mapOffset[1]]);
            };
            RegisterCoordinateSystem.prototype.getViewRect = function () {
                var size = this.map.getSize();
                return new echarts.graphic.BoundingRect(0, 0, size[0], size[1]);
            };
            RegisterCoordinateSystem.prototype.getRoamTransform = function () {
                return echarts.matrix.create();
            };
            RegisterCoordinateSystem.prototype.prepareCustoms = function () {
                var rect = this.getViewRect();
                return {
                    coordSys: {
                        type: coordinateSystemId,
                        x: rect.x,
                        y: rect.y,
                        width: rect.width,
                        height: rect.height,
                    },
                    api: {
                        coord: bind(this.dataToPoint, this),
                        size: bind(RegisterCoordinateSystem.dataToCoordsSize, this),
                    },
                };
            };
            RegisterCoordinateSystem.create = function (echartsModel) {
                echartsModel.eachSeries(function (seriesModel) {
                    if (seriesModel.get('coordinateSystem') === coordinateSystemId) {
                        seriesModel.coordinateSystem = new RegisterCoordinateSystem(map);
                    }
                });
            };
            RegisterCoordinateSystem.getProjectionCode = function (map) {
                var code = '';
                if (map) {
                    code = map.getView()
                        && map
                            .getView()
                            .getProjection()
                            .getCode();
                }
                else {
                    code = 'EPSG:3857';
                }
                return code;
            };
            RegisterCoordinateSystem.dataToCoordsSize = function (dataSize, dataItem) {
                var _this = this;
                if (dataItem === void 0) { dataItem = [0, 0]; }
                return [0, 1].map(function (dimIdx) {
                    var val = dataItem[dimIdx];
                    var p1 = [];
                    var p2 = [];
                    var halfSize = dataSize[dimIdx] / 2;
                    p1[dimIdx] = val - halfSize;
                    p2[dimIdx] = val + halfSize;
                    p1[1 - dimIdx] = dataItem[1 - dimIdx];
                    p2[1 - dimIdx] = dataItem[1 - dimIdx];
                    var offset = _this.dataToPoint(p1)[dimIdx] - _this.dataToPoint(p2)[dimIdx];
                    return Math.abs(offset);
                }, this);
            };
            return RegisterCoordinateSystem;
        };
        EChartsLayer.prototype.dispatchEvent = function (event) {
            return _super.prototype.dispatchEvent.call(this, event);
        };
        EChartsLayer.prototype.set = function (key, value, optSilent) {
            return _super.prototype.set.call(this, key, value, optSilent);
        };
        EChartsLayer.prototype.get = function (key) {
            return _super.prototype.get.call(this, key);
        };
        EChartsLayer.prototype.unset = function (key, optSilent) {
            return _super.prototype.unset.call(this, key, optSilent);
        };
        EChartsLayer.prototype.on = function (type, listener, optThis) {
            return _super.prototype.on.call(this, type, listener, optThis);
        };
        EChartsLayer.prototype.un = function (type, listener, optThis) {
            return _super.prototype.un.call(this, type, listener, optThis);
        };
        EChartsLayer.formatGeoJSON = formatGeoJSON;
        EChartsLayer.bind = bind;
        EChartsLayer.merge = merge;
        EChartsLayer.uuid = uuid;
        EChartsLayer.bindAll = bindAll;
        EChartsLayer.arrayAdd = arrayAdd;
        EChartsLayer.removeNode = removeNode;
        EChartsLayer.isObject = isObject;
        return EChartsLayer;
    }(obj));

    return EChartsLayer;

}));
//# sourceMappingURL=ol3Echarts.js.map
