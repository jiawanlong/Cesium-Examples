/*!
 * author: joe <qj5657@gmail.com>
 * cesium-wind 1.0.3
 * build-time: 2020-9-23 11:17
 * LICENSE: MIT
 * (c) 2020-2020 https://github.com/QJvic/cesium-wind
 */

(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('cesium/Cesium')) :
    typeof define === 'function' && define.amd ? define(['exports', 'cesium/Cesium'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CesiumWind = {}, global.Cesium));
}(this, (function (exports, Cesium) { 'use strict';

    /*!
     * author: sakitam-fdd <smilefdd@gmail.com> 
     * wind-core v1.0.0-alpha.9
     * build-time: 2020-7-5 23:35
     * LICENSE: MIT
     * (c) 2017-2020 https://github.com/sakitam-fdd/wind-layer#readme
     */
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

    function __spreadArrays() {
        var arguments$1 = arguments;

        for (var s = 0, i = 0, il = arguments.length; i < il; i++) { s += arguments$1[i].length; }
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            { for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                { r[k] = a[j]; } }
        return r;
    }

    if (!Array.isArray) {
        // @ts-ignore
        Array.isArray = function (arg) {
            return Object.prototype.toString.call(arg) === '[object Array]';
        };
    }
    if (typeof Object.assign != 'function') {
        // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, "assign", {
            value: function assign(target, varArgs) {
                var arguments$1 = arguments;

                if (target == null) { // TypeError if undefined or null
                    throw new TypeError('Cannot convert undefined or null to object');
                }
                var to = Object(target);
                for (var index = 1; index < arguments.length; index++) {
                    var nextSource = arguments$1[index];
                    if (nextSource != null) { // Skip over if undefined or null
                        for (var nextKey in nextSource) {
                            // Avoid bugs when hasOwnProperty is shadowed
                            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                to[nextKey] = nextSource[nextKey];
                            }
                        }
                    }
                }
                return to;
            },
            writable: true,
            configurable: true
        });
    }
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var symToStringTag = typeof Symbol !== 'undefined' ? Symbol.toStringTag : undefined;
    function baseGetTag(value) {
        if (value === null) {
            return value === undefined ? '[object Undefined]' : '[object Null]';
        }
        if (!(symToStringTag && symToStringTag in Object(value))) {
            return toString.call(value);
        }
        var isOwn = hasOwnProperty.call(value, symToStringTag);
        var tag = value[symToStringTag];
        var unmasked = false;
        try {
            value[symToStringTag] = undefined;
            unmasked = true;
        }
        catch (e) {
        }
        var result = Object.prototype.toString.call(value);
        if (unmasked) {
            if (isOwn) {
                value[symToStringTag] = tag;
            }
            else {
                delete value[symToStringTag];
            }
        }
        return result;
    }
    /**
     * 判断是否为函数
     * @param value
     * @returns {boolean}
     */
    function isFunction(value) {
        if (!isObject(value)) {
            return false;
        }
        var tag = baseGetTag(value);
        return tag === '[object Function]' || tag === '[object AsyncFunction]' ||
            tag === '[object GeneratorFunction]' || tag === '[object Proxy]';
    }
    /**
     * 判断是否为对象
     * @param value
     * @returns {boolean}
     */
    function isObject(value) {
        var type = typeof value;
        return value !== null && (type === 'object' || type === 'function');
    }
    /**
     * 判断是否为合法字符串
     * @param value
     * @returns {boolean}
     */
    function isString(value) {
        if (value == null) {
            return false;
        }
        return typeof value === 'string' || (value.constructor !== null && value.constructor === String);
    }
    /**
     * 判断是否为数字
     * @param value
     * @returns {boolean}
     */
    function isNumber(value) {
        return Object.prototype.toString.call(value) === '[object Number]' && !isNaN(value);
    }
    /**
     * check is array
     * @param arr
     */
    function isArray(arr) {
        return Array.isArray(arr);
    }
    /**
     * assign object
     * @param target
     * @param sources
     */
    function assign(target) {
        var arguments$1 = arguments;

        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments$1[_i];
        }
        return Object.assign.apply(Object, __spreadArrays([target], sources));
    }
    /**
     * Get floored division
     * @param a
     * @param n
     * @returns {Number} returns remainder of floored division,
     * i.e., floor(a / n). Useful for consistent modulo of negative numbers.
     * See http://en.wikipedia.org/wiki/Modulo_operation.
     */
    function floorMod(a, n) {
        return a - n * Math.floor(a / n);
    }
    /**
     * 检查值是否合法
     * @param val
     * @returns {boolean}
     */
    function isValide(val) {
        return val !== undefined && val !== null && !isNaN(val);
    }
    /**
     * format gfs json to vector
     * @param data
     */
    function formatData(data) {
        var uComp;
        var vComp;
        {
            console.time('format-data');
        }
        data.forEach(function (record) {
            switch (record.header.parameterCategory + "," + record.header.parameterNumber) {
                case "1,2":
                case "2,2":
                    uComp = record;
                    break;
                case "1,3":
                case "2,3":
                    vComp = record;
                    break;
            }
        });
        // @ts-ignore
        if (!vComp || !uComp)
            { return; }
        var header = uComp.header;
        var vectorField = new Field({
            xmin: header.lo1,
            ymin: header.la1,
            xmax: header.lo2,
            ymax: header.la2,
            deltaX: header.dx,
            deltaY: header.dy,
            cols: header.nx,
            rows: header.ny,
            us: uComp.data,
            vs: vComp.data
        });
        {
            console.timeEnd('format-data');
        }
        return vectorField;
    }
    /**
     * 移除 dom
     * @param node
     * @returns {removeDomNode}
     */
    function removeDomNode(node) {
        if (!node) {
            return null;
        }
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
        return node;
    }

    // from: https://sourcegraph.com/github.com/IHCantabria/Leaflet.CanvasLayer.Field/-/blob/src/Vector.js?utm_source=share
    var Vector = /** @class */ (function () {
        function Vector(u, v) {
            this.u = u;
            this.v = v;
            this.m = this.magnitude();
        }
        /**
         * the vector value
         * 向量值（流体强度）
         * @returns {Number}
         */
        Vector.prototype.magnitude = function () {
            // Math.pow(u, 2)
            // Math.pow(v, 2)
            return Math.sqrt(this.u * this.u + this.v * this.v);
        };
        /**
         * Angle in degrees (0 to 360º) --> Towards
         * 流体方向
         * N is 0º and E is 90º
         * @returns {Number}
         */
        Vector.prototype.directionTo = function () {
            var verticalAngle = Math.atan2(this.u, this.v);
            var inDegrees = verticalAngle * (180.0 / Math.PI);
            if (inDegrees < 0) {
                inDegrees += 360.0;
            }
            return inDegrees;
        };
        /**
         * Angle in degrees (0 to 360º) From x-->
         * N is 0º and E is 90º
         * @returns {Number}
         */
        Vector.prototype.directionFrom = function () {
            var a = this.directionTo();
            return (a + 180.0) % 360.0;
        };
        return Vector;
    }());

    var Field = /** @class */ (function () {
        function Field(params) {
            this.grid = [];
            this.xmin = params.xmin;
            this.xmax = params.xmax;
            this.ymin = params.ymin;
            this.ymax = params.ymax;
            this.cols = params.cols; // 列数
            this.rows = params.rows; // 行数
            this.us = params.us; //
            this.vs = params.vs;
            this.deltaX = params.deltaX; // x 方向增量
            this.deltaY = params.deltaY; // y方向增量
            if (this.deltaY < 0 && this.ymin < this.ymax) {
                console.warn('[wind-core]: The data is flipY');
            }
            else {
                this.ymin = Math.min(params.ymax, params.ymin);
                this.ymax = Math.max(params.ymax, params.ymin);
            }
            this.isFields = true;
            var cols = Math.ceil((this.xmax - this.xmin) / params.deltaX); // 列
            var rows = Math.ceil((this.ymax - this.ymin) / params.deltaY); // 行
            if (cols !== this.cols || rows !== this.rows) {
                console.warn('[wind-core]: The data grid not equal');
            }
            // Math.floor(ni * Δλ) >= 360;
            // lon lat 经度 纬度
            this.isContinuous = Math.floor(this.cols * params.deltaX) >= 360;
            this.wrappedX = 'wrappedX' in params ? params.wrappedX : this.xmax > 180; // [0, 360] --> [-180, 180];
            this.grid = this.buildGrid();
            this.range = this.calculateRange();
        }
        // from https://github.com/sakitam-fdd/wind-layer/blob/95368f9433/src/windy/windy.js#L110
        Field.prototype.buildGrid = function () {
            var grid = [];
            var p = 0;
            var _a = this, rows = _a.rows, cols = _a.cols, us = _a.us, vs = _a.vs;
            for (var j = 0; j < rows; j++) {
                var row = [];
                for (var i = 0; i < cols; i++, p++) {
                    var u = us[p];
                    var v = vs[p];
                    var valid = this.isValid(u) && this.isValid(v);
                    row[i] = valid ? new Vector(u, v) : null;
                }
                if (this.isContinuous) {
                    row.push(row[0]);
                }
                grid[j] = row;
            }
            return grid;
        };
        Field.prototype.release = function () {
            this.grid = [];
        };
        /**
         * grib data extent
         * 格点数据范围
         */
        Field.prototype.extent = function () {
            return [
                this.xmin,
                this.ymin,
                this.xmax,
                this.ymax ];
        };
        /**
         * Bilinear interpolation for Vector
         * 针对向量进行双线性插值
         * https://en.wikipedia.org/wiki/Bilinear_interpolation
         * @param   {Number} x
         * @param   {Number} y
         * @param   {Number[]} g00
         * @param   {Number[]} g10
         * @param   {Number[]} g01
         * @param   {Number[]} g11
         * @returns {Vector}
         */
        Field.prototype.bilinearInterpolateVector = function (x, y, g00, g10, g01, g11) {
            var rx = 1 - x;
            var ry = 1 - y;
            var a = rx * ry;
            var b = x * ry;
            var c = rx * y;
            var d = x * y;
            var u = g00.u * a + g10.u * b + g01.u * c + g11.u * d;
            var v = g00.v * a + g10.v * b + g01.v * c + g11.v * d;
            return new Vector(u, v);
        };
        /**
         * calculate vector value range
         */
        Field.prototype.calculateRange = function () {
            if (!this.grid || !this.grid[0])
                { return; }
            var rows = this.grid.length;
            var cols = this.grid[0].length;
            // const vectors = [];
            var min;
            var max;
            // @from: https://stackoverflow.com/questions/13544476/how-to-find-max-and-min-in-array-using-minimum-comparisons
            for (var j = 0; j < rows; j++) {
                for (var i = 0; i < cols; i++) {
                    var vec = this.grid[j][i];
                    if (vec !== null) {
                        var val = vec.m || vec.magnitude();
                        // vectors.push();
                        if (min === undefined) {
                            min = val;
                        }
                        else if (max === undefined) {
                            max = val;
                            // update min max
                            // 1. Pick 2 elements(a, b), compare them. (say a > b)
                            min = Math.min(min, max);
                            max = Math.max(min, max);
                        }
                        else {
                            // 2. Update min by comparing (min, b)
                            // 3. Update max by comparing (max, a)
                            min = Math.min(val, min);
                            max = Math.max(val, max);
                        }
                    }
                }
            }
            return [min, max];
        };
        /**
         * 检查 uv是否合法
         * @param x
         * @private
         */
        Field.prototype.isValid = function (x) {
            return x !== null && x !== undefined;
        };
        Field.prototype.getWrappedLongitudes = function () {
            var xmin = this.xmin;
            var xmax = this.xmax;
            if (this.wrappedX) {
                if (this.isContinuous) {
                    xmin = -180;
                    xmax = 180;
                }
                else {
                    // not sure about this (just one particular case, but others...?)
                    xmax = this.xmax - 360;
                    xmin = this.xmin - 360;
                    /* eslint-disable no-console */
                    // console.warn(`are these xmin: ${xmin} & xmax: ${xmax} OK?`);
                    // TODO: Better throw an exception on no-controlled situations.
                    /* eslint-enable no-console */
                }
            }
            return [xmin, xmax];
        };
        Field.prototype.contains = function (lon, lat) {
            var _a = this.getWrappedLongitudes(), xmin = _a[0], xmax = _a[1];
            var longitudeIn = lon >= xmin && lon <= xmax;
            var latitudeIn;
            if (this.deltaY >= 0) {
                latitudeIn = lat >= this.ymin && lat <= this.ymax;
            }
            else {
                latitudeIn = lat >= this.ymax && lat <= this.ymin;
            }
            return longitudeIn && latitudeIn;
        };
        /**
         * 获取经纬度所在的位置索引
         * @param lon
         * @param lat
         */
        Field.prototype.getDecimalIndexes = function (lon, lat) {
            var i = floorMod(lon - this.xmin, 360) / this.deltaX; // calculate longitude index in wrapped range [0, 360)
            var j = (this.ymax - lat) / this.deltaY; // calculate latitude index in direction +90 to -90
            return [i, j];
        };
        /**
         * Nearest value at lon-lat coordinates
         * 线性插值
         * @param lon
         * @param lat
         */
        Field.prototype.valueAt = function (lon, lat) {
            if (!this.contains(lon, lat))
                { return null; }
            var indexes = this.getDecimalIndexes(lon, lat);
            var ii = Math.floor(indexes[0]);
            var jj = Math.floor(indexes[1]);
            var ci = this.clampColumnIndex(ii);
            var cj = this.clampRowIndex(jj);
            return this.valueAtIndexes(ci, cj);
        };
        /**
         * Get interpolated grid value lon-lat coordinates
         * 双线性插值
         * @param lon
         * @param lat
         */
        Field.prototype.interpolatedValueAt = function (lon, lat) {
            if (!this.contains(lon, lat))
                { return null; }
            var _a = this.getDecimalIndexes(lon, lat), i = _a[0], j = _a[1];
            return this.interpolatePoint(i, j);
        };
        Field.prototype.hasValueAt = function (lon, lat) {
            var value = this.valueAt(lon, lat);
            return value !== null;
        };
        /**
         * 基于向量的双线性插值
         * @param i
         * @param j
         */
        Field.prototype.interpolatePoint = function (i, j) {
            //         1      2           After converting λ and φ to fractional grid indexes i and j, we find the
            //        fi  i   ci          four points 'G' that enclose point (i, j). These points are at the four
            //         | =1.4 |           corners specified by the floor and ceiling of i and j. For example, given
            //      ---G--|---G--- fj 8   i = 1.4 and j = 8.3, the four surrounding grid points are (1, 8), (2, 8),
            //    j ___|_ .   |           (1, 9) and (2, 9).
            //  =8.3   |      |
            //      ---G------G--- cj 9   Note that for wrapped grids, the first column is duplicated as the last
            //         |      |           column, so the index ci can be used without taking a modulo.
            var indexes = this.getFourSurroundingIndexes(i, j);
            var fi = indexes[0], ci = indexes[1], fj = indexes[2], cj = indexes[3];
            var values = this.getFourSurroundingValues(fi, ci, fj, cj);
            if (values) {
                var g00 = values[0], g10 = values[1], g01 = values[2], g11 = values[3];
                // @ts-ignore
                return this.bilinearInterpolateVector(i - fi, j - fj, g00, g10, g01, g11);
            }
            return null;
        };
        /**
         * Check the column index is inside the field,
         * adjusting to min or max when needed
         * @private
         * @param   {Number} ii - index
         * @returns {Number} i - inside the allowed indexes
         */
        Field.prototype.clampColumnIndex = function (ii) {
            var i = ii;
            if (ii < 0) {
                i = 0;
            }
            var maxCol = this.cols - 1;
            if (ii > maxCol) {
                i = maxCol;
            }
            return i;
        };
        /**
         * Check the row index is inside the field,
         * adjusting to min or max when needed
         * @private
         * @param   {Number} jj index
         * @returns {Number} j - inside the allowed indexes
         */
        Field.prototype.clampRowIndex = function (jj) {
            var j = jj;
            if (jj < 0) {
                j = 0;
            }
            var maxRow = this.rows - 1;
            if (jj > maxRow) {
                j = maxRow;
            }
            return j;
        };
        /**
         * from: https://github.com/IHCantabria/Leaflet.CanvasLayer.Field/blob/master/src/Field.js#L252
         * 计算索引位置周围的数据
         * @private
         * @param   {Number} i - decimal index
         * @param   {Number} j - decimal index
         * @returns {Array} [fi, ci, fj, cj]
         */
        Field.prototype.getFourSurroundingIndexes = function (i, j) {
            var fi = Math.floor(i); // 左
            var ci = fi + 1; // 右
            // duplicate colum to simplify interpolation logic (wrapped value)
            if (this.isContinuous && ci >= this.cols) {
                ci = 0;
            }
            ci = this.clampColumnIndex(ci);
            var fj = this.clampRowIndex(Math.floor(j)); // 上 纬度方向索引（取整）
            var cj = this.clampRowIndex(fj + 1); // 下
            return [fi, ci, fj, cj];
        };
        /**
         * from https://github.com/IHCantabria/Leaflet.CanvasLayer.Field/blob/master/src/Field.js#L277
         * Get four surrounding values or null if not available,
         * from 4 integer indexes
         * @private
         * @param   {Number} fi
         * @param   {Number} ci
         * @param   {Number} fj
         * @param   {Number} cj
         * @returns {Array}
         */
        Field.prototype.getFourSurroundingValues = function (fi, ci, fj, cj) {
            var row;
            if ((row = this.grid[fj])) {
                var g00 = row[fi]; // << left
                var g10 = row[ci]; // right >>
                if (this.isValid(g00) &&
                    this.isValid(g10) &&
                    (row = this.grid[cj])) {
                    // lower row vv
                    var g01 = row[fi]; // << left
                    var g11 = row[ci]; // right >>
                    if (this.isValid(g01) && this.isValid(g11)) {
                        return [g00, g10, g01, g11]; // 4 values found!
                    }
                }
            }
            return null;
        };
        /**
         * Value for grid indexes
         * @param   {Number} i - column index (integer)
         * @param   {Number} j - row index (integer)
         * @returns {Vector|Number}
         */
        Field.prototype.valueAtIndexes = function (i, j) {
            return this.grid[j][i]; // <-- j,i !!
        };
        /**
         * Lon-Lat for grid indexes
         * @param   {Number} i - column index (integer)
         * @param   {Number} j - row index (integer)
         * @returns {Number[]} [lon, lat]
         */
        Field.prototype.lonLatAtIndexes = function (i, j) {
            var lon = this.longitudeAtX(i);
            var lat = this.latitudeAtY(j);
            return [lon, lat];
        };
        /**
         * Longitude for grid-index
         * @param   {Number} i - column index (integer)
         * @returns {Number} longitude at the center of the cell
         */
        Field.prototype.longitudeAtX = function (i) {
            var halfXPixel = this.deltaX / 2.0;
            var lon = this.xmin + halfXPixel + i * this.deltaX;
            if (this.wrappedX) {
                lon = lon > 180 ? lon - 360 : lon;
            }
            return lon;
        };
        /**
         * Latitude for grid-index
         * @param   {Number} j - row index (integer)
         * @returns {Number} latitude at the center of the cell
         */
        Field.prototype.latitudeAtY = function (j) {
            var halfYPixel = this.deltaY / 2.0;
            return this.ymax - halfYPixel - j * this.deltaY;
        };
        /**
         * 生成粒子位置
         * @param o
         * @param width
         * @param height
         * @param unproject
         */
        Field.prototype.randomize = function (o, width, height, unproject) {
            if (o === void 0) { o = {}; }
            var i = (Math.random() * (width || this.cols)) | 0;
            var j = (Math.random() * (height || this.rows)) | 0;
            var coords = unproject([i, j]);
            if (coords !== null) {
                o.x = coords[0];
                o.y = coords[1];
            }
            else {
                o.x = this.longitudeAtX(i);
                o.y = this.latitudeAtY(j);
            }
            return o;
        };
        /**
         * check is custom field
         */
        Field.prototype.checkFields = function () {
            return this.isFields;
        };
        Field.prototype.startBatchInterpolate = function (width, height, unproject) { };
        return Field;
    }());

    var defaultOptions = {
        globalAlpha: 0.9,
        lineWidth: 1,
        colorScale: '#fff',
        velocityScale: 1 / 25,
        // particleAge: 90, // 粒子在重新生成之前绘制的最大帧数
        maxAge: 90,
        // particleMultiplier: 1 / 300, // TODO: PATHS = Math.round(width * height * particleMultiplier);
        paths: 800,
        frameRate: 20,
        useCoordsDraw: true,
        gpet: true
    };
    function indexFor(m, min, max, colorScale) {
        return Math.max(0, Math.min((colorScale.length - 1), Math.round((m - min) / (max - min) * (colorScale.length - 1))));
    }
    var BaseLayer = /** @class */ (function () {
        function BaseLayer(ctx, options, field) {
            this.particles = [];
            this.generated = false;
            this.ctx = ctx;
            if (!this.ctx) {
                throw new Error('ctx error');
            }
            this.animate = this.animate.bind(this);
            this.setOptions(options);
            if (field) {
                this.updateData(field);
            }
        }
        BaseLayer.prototype.setOptions = function (options) {
            this.options = Object.assign({}, defaultOptions, options);
            var _a = this.ctx.canvas, width = _a.width, height = _a.height;
            if (('particleAge' in options) && !('maxAge' in options) && isNumber(this.options.particleAge)) {
                // @ts-ignore
                this.options.maxAge = this.options.particleAge;
            }
            if (('particleMultiplier' in options) && !('paths' in options) && isNumber(this.options.particleMultiplier)) {
                // @ts-ignore
                this.options.paths = Math.round(width * height * this.options.particleMultiplier);
            }
            this.prerender();
        };
        BaseLayer.prototype.getOptions = function () {
            return this.options;
        };
        BaseLayer.prototype.updateData = function (field) {
            this.field = field;
            if (!this.generated)
                { return; }
            this.particles = this.prepareParticlePaths();
        };
        BaseLayer.prototype.moveParticles = function () {
            var _a = this.ctx.canvas, width = _a.width, height = _a.height;
            var particles = this.particles;
            // 清空组
            var maxAge = this.options.maxAge;
            var optVelocityScale = isFunction(this.options.velocityScale)
                // @ts-ignore
                ? this.options.velocityScale()
                : this.options.velocityScale;
            var velocityScale = optVelocityScale;
            var i = 0;
            var len = particles.length;
            for (; i < len; i++) {
                var particle = particles[i];
                if (particle.age > maxAge) {
                    particle.age = 0;
                    // restart, on a random x,y
                    this.field.randomize(particle, width, height, this.unproject);
                }
                var x = particle.x;
                var y = particle.y;
                var vector = this.field.interpolatedValueAt(x, y);
                if (vector === null) {
                    particle.age = maxAge;
                }
                else {
                    var xt = x + vector.u * velocityScale;
                    var yt = y + vector.v * velocityScale;
                    if (this.field.hasValueAt(xt, yt)) {
                        // Path from (x,y) to (xt,yt) is visible, so add this particle to the appropriate draw bucket.
                        particle.xt = xt;
                        particle.yt = yt;
                        particle.m = vector.m;
                    }
                    else {
                        // Particle isn't visible, but it still moves through the field.
                        particle.x = xt;
                        particle.y = yt;
                        particle.age = maxAge;
                    }
                }
                particle.age++;
            }
        };
        BaseLayer.prototype.fadeIn = function () {
            var prev = this.ctx.globalCompositeOperation; // lighter
            this.ctx.globalCompositeOperation = 'destination-in';
            this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.ctx.globalCompositeOperation = prev;
        };
        BaseLayer.prototype.drawParticles = function () {
            var _a;
            var particles = this.particles;
            this.fadeIn();
            this.ctx.globalAlpha = this.options.globalAlpha;
            this.ctx.fillStyle = "rgba(0, 0, 0, " + this.options.globalAlpha + ")";
            this.ctx.lineWidth = (isNumber(this.options.lineWidth) ? this.options.lineWidth : 1);
            this.ctx.strokeStyle = (isString(this.options.colorScale) ? this.options.colorScale : '#fff');
            var i = 0;
            var len = particles.length;
            if (this.field && len > 0) {
                var min = void 0;
                var max = void 0;
                // 如果配置了风速范围
                if (isValide(this.options.minVelocity) && isValide(this.options.maxVelocity)) {
                    min = this.options.minVelocity;
                    max = this.options.maxVelocity;
                }
                else { // 未配置风速范围取格点数据中的最大风速和最小风速
                    _a = this.field.range, min = _a[0], max = _a[1];
                }
                for (; i < len; i++) {
                    this[this.options.useCoordsDraw ? 'drawCoordsParticle' : 'drawPixelParticle'](particles[i], min, max);
                }
            }
        };
        /**
         * 用于绘制像素粒子
         * @param particle
         * @param min
         * @param max
         */
        BaseLayer.prototype.drawPixelParticle = function (particle, min, max) {
            // TODO 需要判断粒子是否超出视野
            // this.ctx.strokeStyle = color;
            var pointPrev = [particle.x, particle.y];
            // when xt isn't exit
            var pointNext = [particle.xt, particle.yt];
            if (pointNext && pointPrev && isValide(pointNext[0]) &&
                isValide(pointNext[1]) && isValide(pointPrev[0]) &&
                isValide(pointPrev[1])
                && particle.age <= this.options.maxAge) {
                this.ctx.beginPath();
                this.ctx.moveTo(pointPrev[0], pointPrev[1]);
                this.ctx.lineTo(pointNext[0], pointNext[1]);
                if (isFunction(this.options.colorScale)) {
                    // @ts-ignore
                    this.ctx.strokeStyle = this.options.colorScale(particle.m);
                }
                else if (Array.isArray(this.options.colorScale)) {
                    var colorIdx = indexFor(particle.m, min, max, this.options.colorScale);
                    this.ctx.strokeStyle = this.options.colorScale[colorIdx];
                }
                if (isFunction(this.options.lineWidth)) {
                    // @ts-ignore
                    this.ctx.lineWidth = this.options.lineWidth(particle.m);
                }
                particle.x = particle.xt;
                particle.y = particle.yt;
                this.ctx.stroke();
            }
        };
        /**
         * 用于绘制坐标粒子
         * @param particle
         * @param min
         * @param max
         */
        BaseLayer.prototype.drawCoordsParticle = function (particle, min, max) {
            // TODO 需要判断粒子是否超出视野
            // this.ctx.strokeStyle = color;
            var source = [particle.x, particle.y];
            // when xt isn't exit
            var target = [particle.xt, particle.yt];
            if (target && source && isValide(target[0]) &&
                isValide(target[1]) && isValide(source[0]) &&
                isValide(source[1]) &&
                this.intersectsCoordinate(target)
                && particle.age <= this.options.maxAge) {
                var pointPrev = this.project(source);
                var pointNext = this.project(target);
                if (pointPrev && pointNext) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(pointPrev[0], pointPrev[1]);
                    this.ctx.lineTo(pointNext[0], pointNext[1]);
                    particle.x = particle.xt;
                    particle.y = particle.yt;
                    if (isFunction(this.options.colorScale)) {
                        // @ts-ignore
                        this.ctx.strokeStyle = this.options.colorScale(particle.m);
                    }
                    else if (Array.isArray(this.options.colorScale)) {
                        var colorIdx = indexFor(particle.m, min, max, this.options.colorScale);
                        this.ctx.strokeStyle = this.options.colorScale[colorIdx];
                    }
                    if (isFunction(this.options.lineWidth)) {
                        // @ts-ignore
                        this.ctx.lineWidth = this.options.lineWidth(particle.m);
                    }
                    this.ctx.stroke();
                }
            }
        };
        BaseLayer.prototype.prepareParticlePaths = function () {
            var _a = this.ctx.canvas, width = _a.width, height = _a.height;
            var particleCount = typeof this.options.paths === 'function' ? this.options.paths(this) : this.options.paths;
            var particles = [];
            if (!this.field)
                { return []; }
            if ('startBatchInterpolate' in this.field) {
                this.field.startBatchInterpolate(width, height, this.unproject);
            }
            var i = 0;
            for (; i < particleCount; i++) {
                particles.push(this.field.randomize({
                    age: this.randomize()
                }, width, height, this.unproject));
            }
            return particles;
        };
        BaseLayer.prototype.randomize = function () {
            return Math.floor(Math.random() * this.options.maxAge); // 例如最大生成90帧插值粒子路径
        };
        // @ts-ignore
        BaseLayer.prototype.project = function () {
            var arguments$1 = arguments;

            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments$1[_i];
            }
            throw new Error('project must be overriden');
        };
        // @ts-ignore
        BaseLayer.prototype.unproject = function () {
            var arguments$1 = arguments;

            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments$1[_i];
            }
            throw new Error('unproject must be overriden');
        };
        BaseLayer.prototype.intersectsCoordinate = function (coordinates) {
            throw new Error('must be overriden');
        };
        BaseLayer.prototype.clearCanvas = function () {
            this.stop();
            this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
            this.forceStop = false;
        };
        BaseLayer.prototype.start = function () {
            this.starting = true;
            this.forceStop = false;
            this._then = Date.now();
            this.animate();
        };
        BaseLayer.prototype.stop = function () {
            cancelAnimationFrame(this.animationLoop);
            this.starting = false;
            this.forceStop = true;
        };
        BaseLayer.prototype.animate = function () {
            if (this.animationLoop)
                { cancelAnimationFrame(this.animationLoop); }
            this.animationLoop = requestAnimationFrame(this.animate);
            var now = Date.now();
            var delta = now - this._then;
            if (delta > this.options.frameRate) {
                this._then = now - (delta % this.options.frameRate);
                this.render();
            }
        };
        /**
         * 渲染前处理
         */
        BaseLayer.prototype.prerender = function () {
            this.generated = false;
            if (!this.field)
                { return; }
            this.particles = this.prepareParticlePaths();
            this.generated = true;
            if (!this.starting && !this.forceStop) {
                this.starting = true;
                this._then = Date.now();
                this.animate();
            }
        };
        /**
         * 开始渲染
         */
        BaseLayer.prototype.render = function () {
            this.moveParticles();
            this.drawParticles();
            this.postrender();
        };
        /**
         * each frame render end
         */
        BaseLayer.prototype.postrender = function () { };
        BaseLayer.Field = Field;
        return BaseLayer;
    }());

    class CesiumWind {
      constructor(data, options = {}) {
        this.canvas = null;
        this.wind = null;
        this.field = null;
        this.viewer = null;
        this.options = assign({}, options);
        this.pickWindOptions();

        const canvas = document.createElement('canvas');
        canvas.style.cssText =
          'position:absolute; left:0; top:0;user-select:none;pointer-events: none;';
        canvas.className = 'cesium-wind-j';
        this.canvas = canvas;

        if (data) {
          this.setData(data);
        }
      }

      addTo(viewer) {
        this.viewer = viewer;
        this.appendCanvas();
        this.render(this.canvas);
      }

      remove() {
        if (!this.viewer) {
          return;
        }
        if (this.wind) {
          this.wind.stop();
        }
        if (this.canvas) {
          removeDomNode(this.canvas);
        }
        delete this.canvas;
      }

      removeLayer() {
        this.remove();
      }

      setData(data) {
        if (data && data.checkFields && data.checkFields()) {
          this.field = data;
        } else if (isArray(data)) {
          this.field = formatData(data);
        } else {
          console.error('Illegal data');
        }

        if (this.viewer && this.canvas && this.field) {
          this.wind.updateData(this.field);
          this.appendCanvas();
          this.render(this.canvas);
        }

        return this;
      }

      getData() {
        return this.field;
      }

      getWindOptions() {
        return this.options.windOptions || {};
      }

      pickWindOptions() {
        Object.keys(defaultOptions).forEach((key) => {
          if (key in this.options) {
            if (this.options.windOptions === undefined) {
              this.options.windOptions = {};
            }
            this.options.windOptions[key] = this.options[key];
          }
        });
      }

      getContext() {
        if (this.canvas === null) {
          return;
        }
        return this.canvas.getContext('2d');
      }

      appendCanvas() {
        if (!this.viewer || !this.canvas) {
          return;
        }
        if (document.querySelector('.cesium-wind-j')) {
          return;
        }
        this.adjustSize();
        const cesiumWidget = this.viewer.canvas.parentNode;
        cesiumWidget.appendChild(this.canvas);
      }

      adjustSize() {
        const viewer = this.viewer;
        const canvas = this.canvas;
        const {width, height} = viewer.canvas;
        const devicePixelRatio = 1;
        canvas.width = width * devicePixelRatio;
        canvas.height = height * devicePixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
      }

      render(canvas) {
        if (!this.getData() || !this.viewer) {
          return this;
        }
        const opt = this.getWindOptions();
        if (canvas && !this.wind) {
          const data = this.getData();

          const ctx = this.getContext();

          if (ctx) {
            this.wind = new BaseLayer(ctx, opt, data);

            this.wind.project = this.project.bind(this);
            this.wind.unproject = this.unproject.bind(this);
            this.wind.intersectsCoordinate = this.intersectsCoordinate.bind(this);
            this.wind.postrender = () => {
            };
          }
        }

        if (this.wind) {
          this.wind.prerender();
          this.wind.render();
        }

        return this;
      }

      project(coordinate) {
        const position = Cesium.Cartesian3.fromDegrees(
          coordinate[0],
          coordinate[1],
        );
        const scene = this.viewer.scene;
        const sceneCoor = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
          scene,
          position,
        );
        return [sceneCoor.x, sceneCoor.y];
      }

      unproject(pixel) {
        const viewer = this.viewer;
        const pick = new Cesium.Cartesian2(pixel[0], pixel[1]);
        const cartesian = viewer.scene.globe.pick(
          viewer.camera.getPickRay(pick),
          viewer.scene,
        );

        if (!cartesian) {
          return null;
        }

        const ellipsoid = viewer.scene.globe.ellipsoid;
        const cartographic = ellipsoid.cartesianToCartographic(cartesian);
        const lat = Cesium.Math.toDegrees(cartographic.latitude);
        const lng = Cesium.Math.toDegrees(cartographic.longitude);
        return [lng, lat];
      }

      intersectsCoordinate(coordinate) {
        const ellipsoid = Cesium.Ellipsoid.WGS84;
        const camera = this.viewer.camera;
        const occluder = new Cesium.EllipsoidalOccluder(ellipsoid, camera.position);
        const point = Cesium.Cartesian3.fromDegrees(coordinate[0], coordinate[1]);
        return occluder.isPointVisible(point);
      }
    }

    const WindLayer = CesiumWind;

    exports.Field = Field;
    exports.WindLayer = WindLayer;
    exports.default = CesiumWind;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
