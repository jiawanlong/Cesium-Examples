/*
 * @class {MeasureTool} 测量工具
 * @param {viewer} viewer 三维视图
 * @param {target} string 测量工具放置的div的id
 * @param {classname} string 样式名
 * @param {terrainProvider} terrain 地形
 * @param {show} bool 是否显示界面
 * */

class MeasureTool {
    constructor(option) {
        this.viewer = option.viewer;
        this.terrainProvider = option.terrainProvider;
        this.options = option;
        var me = this;
        if (option.show !== false) {
            if (option.target) {
                this.dom = document.getElementById(option.target);
                this.dom.classList.add("measureTool");
                if (option.classname) {
                    this.dom.classList.add(option.classname);
                }
            } else {
                var div = document.createElement('div');
                div.className = "measureTool measureTool_" + (option.classname ? " " + option.classname : "");
                document.body.appendChild(div);
                this.dom = div;
            }

            //空间测量距离
            var btnDistance = document.createElement('div');
            btnDistance.className = "measureItem";
            btnDistance.innerHTML = '空间距离';
            btnDistance.onclick = function () {
                this.classList.add('selItembox1');
                me.btnclick('空间距离');
            };
            this.dom.appendChild(btnDistance);

            //地表测量距离
            var btnGroundDistance = document.createElement('div');
            btnGroundDistance.className = "measureItem";
            btnGroundDistance.innerHTML = '地表距离';
            btnGroundDistance.onclick = function () {
                this.classList.add('selItembox1');
                me.btnclick('地表距离');
            };
            this.dom.appendChild(btnGroundDistance);

            //地表测量面积
            var btnArea = document.createElement('div');
            btnArea.className = "measureItem";
            btnArea.innerHTML = '地表面积';
            btnArea.onclick = function () {
                this.classList.add('selItembox1');
                me.btnclick('地表面积');
            };
            this.dom.appendChild(btnArea);

            //高度差
            var btnAltitude = document.createElement('div');
            btnAltitude.className = "measureItem";
            btnAltitude.innerHTML = '高度差';
            btnAltitude.onclick = function () {
                this.classList.add('selItembox1');
                me.btnclick('高度差');
            };
            this.dom.appendChild(btnAltitude);

            //三角测量
            var btnTriangle = document.createElement('div');
            btnTriangle.className = "measureItem";
            btnTriangle.innerHTML = '三角测量';
            btnTriangle.onclick = function () {
                this.classList.add('selItembox1');
                me.btnclick('三角测量');
            };
            this.dom.appendChild(btnTriangle);

            //方位角
            var btnAngle = document.createElement('div');
            btnAngle.className = "measureItem";
            btnAngle.innerHTML = '方位角';
            btnAngle.onclick = function () {
                this.classList.add('selItembox1');
                me.btnclick('方位角');
            };
            this.dom.appendChild(btnAngle);

            //清除结果
            var btnClear = document.createElement('div');
            btnClear.className = "measureItem";
            btnClear.innerHTML = '清除结果';
            btnClear.onclick = function () {
                me.btnclick('清除结果');
            };
            this.dom.appendChild(btnClear);
            //
            // //事件
            document.onclick = function (e) {
                var len = document.querySelectorAll('.selItembox1').length;
                if (e.target.className !== "" && e.target.className.indexOf("selItembox1") >= 0 && len == 1) {
                    return
                }
                if (len > 0) {
                    if (len > 1) {
                      var all = document.querySelectorAll(".selItembox1");
                      for (var a = 0; a < all.length; a++) {
                        if (all[a] !== e.target) {
                          all[a].classList.remove('selItembox1');
                        }
                      }
                    } else {
                      document.querySelector('.selItembox1').classList.remove('selItembox1');
                    }
                }
            };
        }
        this.bMeasuring = false;
        me.viewer._container.style.cursor = "";
        this.measureIds = [];
        return {
            name: "测量",
            measureLineSpace: function () {
                me.btnclick("空间距离");
            },
            groundMeasureLineSpace: function () {
                me.btnclick("地表距离");
            },
            measureAreaSpace: function () {
                me.btnclick("地表面积");
            },
            altitude: function () {
                me.btnclick("高度差");
            },
            Triangle: function () {
                me.btnclick("三角测量");
            },
            measureAngle: function () {
                me.btnclick("方位角");
            },
            Clear: function () {
                me.btnclick("清除结果")
            },
            finishMeasure: function () {
                me._finishMeasure();
            }
        };
    }

    //点击事件
    btnclick(type) {
        var me = this;

        if (type != "清除结果") {
            if (me.bMeasuring)
                if (me.handler && !me.handler.isDestroyed())
                    me.handler = me.handler && me.handler.destroy();
            // return;
        }
        switch (type) {
            case "空间距离":
                me.bMeasuring = true;
                me.viewer._container.style.cursor = "crosshair";
                me._measureLineSpace();
                break;
            case "地表距离":
                me.bMeasuring = true;
                me.viewer._container.style.cursor = "crosshair";
                me._groundMeasureLineSpace();
                break;
            case "地表面积":
             
                me.bMeasuring = true;
                me.viewer._container.style.cursor = "crosshair";
                me._measureAreaSpace();

                break;
            case "高度差":
              
                me.bMeasuring = true;
                me.viewer._container.style.cursor = "crosshair";
                me._altitude();
                break;
            case "三角测量":
                
                me.bMeasuring = true;
                me.viewer._container.style.cursor = "crosshair";
                me._Triangle();
                break;
            case "方位角":
               
                me.bMeasuring = true;
                me.viewer._container.style.cursor = "crosshair";
                me._measureAngle();
                break;
            case "清除结果":
                //删除事先记录的id
                for (var jj = 0; jj < me.measureIds.length; jj++) {
                    me.viewer.entities.removeById(me.measureIds[jj]);
                }
                me.measureIds.length = 0;
                if (me.handler && !me.handler.isDestroyed())
                    me.handler = me.handler && me.handler.destroy();
                break;
        }
    }



    _finishMeasure() {
        var me = this;
        me.btnclick("清除结果")
        me.bMeasuring = false;
        me.viewer._container.style.cursor = "";
        document.getElementsByClassName("measureTool")[0].parentNode.removeChild(document.getElementsByClassName("measureTool")[0]);
    }



    //空间距离测量
    _measureLineSpace() {
        var me = this;
        var viewer = this.viewer;
        me.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        var positions = [];
        var poly = null;
        var distance = 0;
        var cartesian = null;
        var floatingPoint;
        //监听移动事件
        me.handler.setInputAction(function (movement) {
            //移动结束位置
            cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (!Cesium.defined(cartesian)) {
                var ray = viewer.camera.getPickRay(movement.endPosition);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }
            //判断点是否在画布上
            if (Cesium.defined(cartesian)) {
                if (positions.length >= 2) {
                    if (!Cesium.defined(poly)) {
                        //画线
                        poly = new PolyLinePrimitive(positions);
                    } else {
                        positions.pop();
                        // cartesian.y += (1 + Math.random());
                        positions.push(cartesian);
                    }
                }
            }

        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        //监听单击事件
        me.handler.setInputAction(function (movement) {
            cartesian = viewer.scene.pickPosition(movement.position);
            if (!Cesium.defined(cartesian)) {
                var ray = viewer.camera.getPickRay(movement.position);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }

            if (Cesium.defined(cartesian)) {
                if (positions.length == 0) {
                    positions.push(cartesian.clone());
                }
                positions.push(cartesian);
                var distance_add = parseFloat(getSpaceDistance(positions));
                distance += distance_add;
                //在三维场景中添加Label
                var textDisance = ((distance > 1000) ? (distance / 1000).toFixed(3) + '千米' : distance.toFixed(2) + '米') + "\n(+" + (distance_add > 1000 ? (distance_add / 1000).toFixed(3) + '千米' : distance_add + '米') + ")"
                // var textDisance = distance + "米";
                // if (distance > 1000) {
                //     textDisance = (parseFloat(distance) / 1000).toFixed(3) + "千米";
                // }
                floatingPoint = viewer.entities.add({
                    name: '空间直线距离',
                    position: positions[positions.length - 1],
                    point: {
                        pixelSize: 5,
                        color: Cesium.Color.RED,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2,
                        heightReference: Cesium.HeightReference.NONE
                    },
                    label: {
                        text: textDisance,
                        font: '18px sans-serif',
                        fillColor: Cesium.Color.CHARTREUSE,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth: 2,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        pixelOffset: new Cesium.Cartesian2(20, -20),
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        heightReference: Cesium.HeightReference.NONE
                    }
                });
                me.measureIds.push(floatingPoint.id);
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //监听双击事件
        me.handler.setInputAction(function (movement) {
            me.handler.destroy(); //关闭事件句柄
            positions.pop(); //最后一个点无效
            me.bMeasuring = false;
            viewer._container.style.cursor = "";
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        //绘线效果1
        var PolyLinePrimitive = (function () {
            function _(positions) {
                this.options = {
                    name: '直线',
                    polyline: {
                        show: true,
                        positions: [],
                        arcType: Cesium.ArcType.NONE,
                        // material: new Cesium.PolylineOutlineMaterialProperty({
                        //     color: Cesium.Color.CHARTREUSE
                        // }),
                        material: Cesium.Color.CHARTREUSE,
                        // depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
                        //     color: Cesium.Color.RED
                        // }),
                        width: 2
                    }
                };
                this.positions = positions;
                this._init();
            }
            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return _self.positions;
                };
                //实时更新polyline.positions
                this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                var et = viewer.entities.add(this.options);
                me.measureIds.push(et.id);
            };

            return _;
        })();

        //空间两点距离计算函数
        function getSpaceDistance(positions) {
            var distance_ = 0;
            if (positions.length > 2) {
                var point1cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 3]);
                var point2cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 2]);
                /**根据经纬度计算出距离**/
                var geodesic = new Cesium.EllipsoidGeodesic();
                geodesic.setEndPoints(point1cartographic, point2cartographic);
                var s = geodesic.surfaceDistance;
                //console.log(Math.sqrt(Math.pow(distance_, 2) + Math.pow(endheight, 2)));
                //返回两点之间的距离
                s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
                distance_ = distance_ + s;
            }
            return distance_.toFixed(2);
        }

    }

    //贴地测量距离函数
    _groundMeasureLineSpace() {
        var me = this;
        var viewer = this.viewer;
        var terrainProvider = this.terrainProvider;
        viewer.scene.globe.depthTestAgainstTerrain = true;

        me.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
        var positions = [];
        var poly = null;
        // var tooltip = document.getElementById("toolTip");
        var distance = 0;
        var cartesian = null;
        var floatingPoint;
        // tooltip.style.display = "block";

        me.handler.setInputAction(function (movement) {
            // tooltip.style.left = movement.endPosition.x + 3 + "px";
            // tooltip.style.top = movement.endPosition.y - 25 + "px";
            // tooltip.innerHTML = '<p>单击开始，右击结束</p>';
            cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (!Cesium.defined(cartesian)) {
                let ray = viewer.camera.getPickRay(movement.endPosition);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }
            let p = Cesium.Cartographic.fromCartesian(cartesian);
            p.height = viewer.scene.sampleHeight(p);
            cartesian = viewer.scene.globe.ellipsoid.cartographicToCartesian(p);
            //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
            if (positions.length >= 2) {
                if (!Cesium.defined(poly)) {
                    poly = new PolyLinePrimitive(positions);
                } else {
                    positions.pop();
                    // cartesian.y += (1 + Math.random());
                    positions.push(cartesian);
                }
                // console.log("distance: " + distance);
                // tooltip.innerHTML='<p>'+distance+'米</p>';
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        me.handler.setInputAction(function (movement) {
            // tooltip.style.display = "none";
            // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
            cartesian = viewer.scene.pickPosition(movement.position);
            if (!Cesium.defined(cartesian)) {
                let ray = viewer.camera.getPickRay(movement.position);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }
            let p = Cesium.Cartographic.fromCartesian(cartesian);
            p.height = viewer.scene.sampleHeight(p);
            cartesian = viewer.scene.globe.ellipsoid.cartographicToCartesian(p);
            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            positions.push(cartesian);
            getSpaceDistance(positions);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        me.handler.setInputAction(function (movement) {
            me.handler.destroy(); //关闭事件句柄
            positions.pop(); //最后一个点无效
            // viewer.entities.remove(floatingPoint);
            // tooltip.style.display = "none";
            me.bMeasuring = false;
            viewer._container.style.cursor = "";
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        var PolyLinePrimitive = (function () {
            function _(positions) {
                this.options = {
                    name: '直线',
                    polyline: {
                        show: true,
                        positions: [],
                        material: Cesium.Color.GOLD,
                        width: 2,
                        clampToGround: true
                    }
                };
                this.positions = positions;
                this._init();
            }

            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return _self.positions;
                };
                //实时更新polyline.positions
                this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
                var et = viewer.entities.add(this.options);
                me.measureIds.push(et.id);
            };

            return _;
        })();

        //空间两点距离计算函数
        function getSpaceDistance(positions) {
            var distance_ = 0;
            if (positions.length > 2) {
                var positions_ = [];
                var sp = Cesium.Cartographic.fromCartesian(positions[positions.length - 3]);
                var ep = Cesium.Cartographic.fromCartesian(positions[positions.length - 2]);
                var geodesic = new Cesium.EllipsoidGeodesic();
                geodesic.setEndPoints(sp, ep);
                var s = geodesic.surfaceDistance;
                positions_.push(sp);
                var num = parseInt((s / 100).toFixed(0));
                num = num > 200 ? 200 : num;
                num = num < 20 ? 20 : num;
                for (var i = 1; i < num; i++) {
                    var res = geodesic.interpolateUsingSurfaceDistance(s / num * i, new Cesium.Cartographic());
                    res.height = viewer.scene.sampleHeight(res);
                    positions_.push(res);
                }
                positions_.push(ep);
                // var promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions_);
                // Cesium.when(promise, function (updatedPositions) {
                for (var ii = 0; ii < positions_.length - 1; ii++) {
                    geodesic.setEndPoints(positions_[ii], positions_[ii + 1]);
                    var d = geodesic.surfaceDistance;
                    distance_ = Math.sqrt(Math.pow(d, 2) + Math.pow(positions_[ii + 1].height - positions_[ii]
                        .height,
                        2)) + distance_;
                }
                //在三维场景中添加Label
                var distance_add = parseFloat(distance_.toFixed(2));
                distance += distance_add;
                var textDisance = ((distance > 1000) ? (distance / 1000).toFixed(3) + '千米' : distance.toFixed(2) + '米') + "\n(+" + (distance_add > 1000 ? (distance_add / 1000).toFixed(3) + '千米' : distance_add + '米') + ")"

                // var textDisance = distance + "米";
                // if (distance > 1000) {
                //     textDisance = (distance / 1000).toFixed(3) + "千米";
                // }
                floatingPoint = viewer.entities.add({
                    name: '空间直线距离',
                    position: positions[positions.length - 1],
                    point: {
                        pixelSize: 5,
                        color: Cesium.Color.RED,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2,
                        // disableDepthTestDistance: Number.POSITIVE_INFINITY
                    },
                    label: {
                        text: textDisance,
                        font: '18px sans-serif',
                        fillColor: Cesium.Color.GOLD,
                        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                        outlineWidth: 2,
                        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                        disableDepthTestDistance: Number.POSITIVE_INFINITY,
                        pixelOffset: new Cesium.Cartesian2(20, -20),
                        // disableDepthTestDistance: Number.POSITIVE_INFINITY
                    }
                });
                me.measureIds.push(floatingPoint.id);
                // });
            }
        }
        //空间两点距离计算函数
        function getSpaceDistance_(positions) {
            var distance_ = 0;
            if (positions.length > 2) {
                var positions_ = [];
                var sp = Cesium.Cartographic.fromCartesian(positions[positions.length - 3]);
                var ep = Cesium.Cartographic.fromCartesian(positions[positions.length - 2]);
                var geodesic = new Cesium.EllipsoidGeodesic();
                geodesic.setEndPoints(sp, ep);
                var s = geodesic.surfaceDistance;
                positions_.push(sp);
                var num = parseInt((s / 100).toFixed(0));
                num = num > 200 ? 200 : num;
                num = num < 20 ? 20 : num;
                for (var i = 1; i < num; i++) {
                    var res = geodesic.interpolateUsingSurfaceDistance(s / num * i, new Cesium.Cartographic());
                    positions_.push(res);
                }
                positions_.push(ep);
                var promise = Cesium.sampleTerrainMostDetailed(terrainProvider, positions_);
                Cesium.when(promise, function (updatedPositions) {
                    for (var ii = 0; ii < positions_.length - 1; ii++) {
                        geodesic.setEndPoints(positions_[ii], positions_[ii + 1]);
                        var d = geodesic.surfaceDistance;
                        distance_ = Math.sqrt(Math.pow(d, 2) + Math.pow(positions_[ii + 1].height - positions_[ii]
                            .height,
                            2)) + distance_;
                    }
                    distance = parseFloat(distance_.toFixed(2));
                    //在三维场景中添加Label
                    var textDisance = distance + "米";
                    if (distance > 1000) {
                        textDisance = (distance / 1000).toFixed(3) + "千米";
                    }
                    floatingPoint = viewer.entities.add({
                        name: '空间直线距离',
                        position: positions[positions.length - 1],
                        point: {
                            pixelSize: 5,
                            color: Cesium.Color.RED,
                            outlineColor: Cesium.Color.WHITE,
                            outlineWidth: 2,
                        },
                        label: {
                            text: textDisance,
                            font: '18px sans-serif',
                            fillColor: Cesium.Color.GOLD,
                            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                            outlineWidth: 2,
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            pixelOffset: new Cesium.Cartesian2(20, -20),
                        }
                    });
                    me.measureIds.push(floatingPoint.id);
                });
            }
        }
    }
    //内部测量面积函数
    _measureAreaSpace() {
        var me = this;
        var viewer = this.viewer;
        // 鼠标事件
        me.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene._imageryLayerCollection);
        var positions = [];
        var tempPoints = [];
        var polygon = null;
        // var tooltip = document.getElementById("toolTip");
        var cartesian = null;
        var floatingPoint; //浮动点
        // tooltip.style.display = "block";

        me.handler.setInputAction(function (movement) {
            // tooltip.style.left = movement.endPosition.x + 3 + "px";
            // tooltip.style.top = movement.endPosition.y - 25 + "px";
            // tooltip.innerHTML ='<p>单击开始，右击结束</p>';
            cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (!Cesium.defined(cartesian)) {
                let ray = viewer.camera.getPickRay(movement.endPosition);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }
            //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
            if (positions.length >= 2) {
                if (!Cesium.defined(polygon)) {
                    polygon = new PolygonPrimitive(positions);
                } else {
                    positions.pop();
                    // cartesian.y += (1 + Math.random());
                    positions.push(cartesian);
                }
                // tooltip.innerHTML='<p>'+distance+'米</p>';
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        me.handler.setInputAction(function (movement) {
            // tooltip.style.display = "none";
            cartesian = viewer.scene.pickPosition(movement.position);
            if (!Cesium.defined(cartesian)) {
                let ray = viewer.camera.getPickRay(movement.position);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }
            // cartesian = viewer.scene.camera.pickEllipsoid(movement.position, viewer.scene.globe.ellipsoid);
            if (positions.length == 0) {
                positions.push(cartesian.clone());
            }
            //positions.pop();
            positions.push(cartesian);
            //在三维场景中添加点
            var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
            var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
            var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
            var heightString = cartographic.height;
            tempPoints.push({
                lon: longitudeString,
                lat: latitudeString,
                hei: heightString
            });
            floatingPoint = viewer.entities.add({
                name: '多边形面积',
                position: positions[positions.length - 1],
                point: {
                    pixelSize: 3,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
            me.measureIds.push(floatingPoint.id);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        me.handler.setInputAction(function (movement) {
            me.handler.destroy();
            positions.pop();
            //tempPoints.pop();
            // viewer.entities.remove(floatingPoint);
            // tooltip.style.display = "none";
            //在三维场景中添加点
            // var cartographic = Cesium.Cartographic.fromCartesian(positions[positions.length - 1]);
            // var longitudeString = Cesium.Math.toDegrees(cartographic.longitude);
            // var latitudeString = Cesium.Math.toDegrees(cartographic.latitude);
            // var heightString = cartographic.height;
            // tempPoints.push({ lon: longitudeString, lat: latitudeString ,hei:heightString});
            var a = getArea(tempPoints);
            if (a < 0.001) {
                a = (a * 1000000).toFixed(4) + "平方米";
            } else {
                a = a.toFixed(4) + "平方公里";
            }
            var textArea = a;
            var et = viewer.entities.add({
                name: '多边形面积',
                position: positions[positions.length - 1],
                // point : {
                //  pixelSize : 5,
                //  color : Cesium.Color.RED,
                //  outlineColor : Cesium.Color.WHITE,
                //  outlineWidth : 2,
                //  heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
                // },
                label: {
                    text: textArea,
                    font: '18px sans-serif',
                    fillColor: Cesium.Color.CYAN,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                    pixelOffset: new Cesium.Cartesian2(20, -40),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
            me.measureIds.push(et.id);
            me.bMeasuring = false;
            viewer._container.style.cursor = "";
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        var radiansPerDegree = Math.PI / 180.0; //角度转化为弧度(rad)
        var degreesPerRadian = 180.0 / Math.PI; //弧度转化为角度

        //计算多边形面积
        function getArea(points) {

            var res = 0;
            //拆分三角曲面

            for (var i = 0; i < points.length - 2; i++) {
                var j = (i + 1) % points.length;
                var k = (i + 2) % points.length;
                var totalAngle = Angle(points[i], points[j], points[k]);


                var dis_temp1 = distance(positions[i], positions[j]);
                var dis_temp2 = distance(positions[j], positions[k]);
                res += dis_temp1 * dis_temp2 * Math.abs(Math.sin(totalAngle));
            }
            return (res / 1000000.0);
        }

        /*角度*/
        function Angle(p1, p2, p3) {
            var bearing21 = Bearing(p2, p1);
            var bearing23 = Bearing(p2, p3);
            var angle = bearing21 - bearing23;
            if (angle < 0) {
                angle += 360;
            }
            return angle;
        }
        /*方向*/
        function Bearing(from, to) {
            var lat1 = from.lat * radiansPerDegree;
            var lon1 = from.lon * radiansPerDegree;
            var lat2 = to.lat * radiansPerDegree;
            var lon2 = to.lon * radiansPerDegree;
            var angle = -Math.atan2(Math.sin(lon1 - lon2) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math
                .sin(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2));
            if (angle < 0) {
                angle += Math.PI * 2.0;
            }
            angle = angle * degreesPerRadian; //角度
            return angle;
        }

        var PolygonPrimitive = (function () {
            function _(positions) {
                this.options = {
                    name: '多边形',
                    polygon: {
                        hierarchy: [],
                        // perPositionHeight : true,
                        material: Cesium.Color.DARKTURQUOISE.withAlpha(0.4),
                        outlineColor: Cesium.Color.CYAN.withAlpha(0.8),
                        // heightReference:20000
                    }
                };

                this.hierarchy = {
                    positions
                };
                this._init();
            }

            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return _self.hierarchy;
                };
                //实时更新polygon.hierarchy
                this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
                var et = viewer.entities.add(this.options);
                me.measureIds.push(et.id);
            };

            return _;
        })();

        function distance(point1, point2) {
            var point1cartographic = Cesium.Cartographic.fromCartesian(point1);
            var point2cartographic = Cesium.Cartographic.fromCartesian(point2);
            /**根据经纬度计算出距离**/
            var geodesic = new Cesium.EllipsoidGeodesic();
            geodesic.setEndPoints(point1cartographic, point2cartographic);
            var s = geodesic.surfaceDistance;
            //console.log(Math.sqrt(Math.pow(distance, 2) + Math.pow(endheight, 2)));
            //返回两点之间的距离
            s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));
            return s;
        }
    }

    //高度差
    _altitude() {
        var me = this;
        var viewer = this.viewer;
        var trianArr = [];
        var distanceLineNum = 0;
        var Line1, Line2;
        var H;
        var floatingPoint; //浮动点
        me.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        me.handler.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (!Cesium.defined(cartesian)) {
                var ray = viewer.camera.getPickRay(movement.endPosition);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }
            //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
            if (distanceLineNum === 1) {
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var lon = Cesium.Math.toDegrees(cartographic.longitude);
                var lat = Cesium.Math.toDegrees(cartographic.latitude);
                var MouseHeight = cartographic.height;
                trianArr.length = 3;
                trianArr.push(lon, lat, MouseHeight);
                draw_Triangle();
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        me.handler.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.position);
            if (!Cesium.defined(cartesian)) {
                var ray = viewer.camera.getPickRay(movement.position);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }

            // var cartesian = viewer.scene.pickPosition(movement.position);
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var lon = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var MouseHeight = cartographic.height;

            floatingPoint = viewer.entities.add({
                name: '多边形面积',
                position: cartesian,
                point: {
                    pixelSize: 3,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
            me.measureIds.push(floatingPoint.id);

            distanceLineNum++;
            if (distanceLineNum === 1) {
                trianArr.push(lon, lat, MouseHeight);

            } else {
                trianArr.length = 3;
                trianArr.push(lon, lat, MouseHeight);
                me.handler.destroy();
                me.bMeasuring = false;
                viewer._container.style.cursor = "";
                draw_Triangle();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        me.handler.setInputAction(function (movement) {
            me.handler.destroy();
            me.bMeasuring = false;
            viewer._container.style.cursor = "";
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        function draw_Triangle() {
            if (Cesium.defined(Line1)) {
                //更新三角线
                Line1.polyline.positions = trianArr[5] > trianArr[2] ? new Cesium.Cartesian3.fromDegreesArrayHeights([
                    trianArr[0],
                    trianArr[1], trianArr[5], trianArr[0], trianArr[1], trianArr[2]
                ]) : new Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[3], trianArr[4], trianArr[2], trianArr[
                    3], trianArr[4], trianArr[5]]);
                Line2.polyline.positions = trianArr[5] > trianArr[2] ? new Cesium.Cartesian3.fromDegreesArrayHeights([
                    trianArr[0],
                    trianArr[1], trianArr[5], trianArr[3], trianArr[4],
                    trianArr[5]
                ]) : new Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[3], trianArr[4], trianArr[2], trianArr[
                    0], trianArr[1], trianArr[2]]);

                //高度
                var height = Math.abs(trianArr[2] - trianArr[5]).toFixed(2);
                H.position = trianArr[5] > trianArr[2] ? Cesium.Cartesian3.fromDegrees(trianArr[0], trianArr[1], (
                    trianArr[2] + trianArr[5]) / 2) : Cesium.Cartesian3.fromDegrees(trianArr[3], trianArr[4], (
                    trianArr[2] + trianArr[5]) / 2);
                H.label.text = '高度差:' + height + '米';
                return;
            }
            Line1 = viewer.entities.add({
                name: 'triangleLine',
                polyline: {
                    positions: trianArr[5] > trianArr[2] ? new Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[0],
                        trianArr[1], trianArr[5], trianArr[0], trianArr[1], trianArr[2]
                    ]) : new Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[3], trianArr[4], trianArr[2], trianArr[
                        3], trianArr[4], trianArr[5]]),
                    arcType: Cesium.ArcType.NONE,
                    width: 2,
                    material: new Cesium.PolylineOutlineMaterialProperty({
                        color: Cesium.Color.CHARTREUSE
                    }),
                    depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
                        color: Cesium.Color.RED
                    })
                }
            });
            me.measureIds.push(Line1.id);
            Line2 = viewer.entities.add({
                name: 'triangleLine',
                polyline: {
                    positions: trianArr[5] > trianArr[2] ? new Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[0],
                        trianArr[1], trianArr[5], trianArr[3], trianArr[4],
                        trianArr[5]
                    ]) : new Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[3], trianArr[4], trianArr[2], trianArr[
                        0], trianArr[1], trianArr[2]]),
                    arcType: Cesium.ArcType.NONE,
                    width: 2,

                    // material: new Cesium.PolylineOutlineMaterialProperty({
                    material: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.CHARTREUSE,
                        // dashLength: 5,
                        // dashPattern: 10,
                        // gapColor:Cesium.Color.YELLOW
                    }),
                    // depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
                    depthFailMaterial: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.RED
                    })
                }
            });
            me.measureIds.push(Line2.id);

            // 空间
            var lineDistance = Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(trianArr[0], trianArr[1]),
                Cesium.Cartesian3.fromDegrees(trianArr[3], trianArr[4])).toFixed(2);
            //高度
            var height = Math.abs(trianArr[2] - trianArr[5]).toFixed(2);
            H = viewer.entities.add({
                name: 'lineZ',
                position: trianArr[5] > trianArr[2] ? Cesium.Cartesian3.fromDegrees(trianArr[0], trianArr[1], (
                    trianArr[2] + trianArr[5]) / 2) : Cesium.Cartesian3.fromDegrees(trianArr[3], trianArr[4], (
                    trianArr[2] + trianArr[5]) / 2),
                label: {
                    text: '高度差:' + height + '米',
                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
                    font: '45px 楷体',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 3,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    scale: 0.5,
                    pixelOffset: new Cesium.Cartesian2(0, -10),
                    backgroundColor: new Cesium.Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
                    backgroundPadding: new Cesium.Cartesian2(10, 10),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                }
            });
            me.measureIds.push(H.id);
        }
    }

    //三角测量
    _Triangle() {
        var me = this;
        var viewer = this.viewer;
        var trianArr = [];
        var distanceLineNum = 0;
        var XLine;
        var X, Y, H;
        var floatingPoint; //浮动点
        me.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        me.handler.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (!Cesium.defined(cartesian)) {
                var ray = viewer.camera.getPickRay(movement.endPosition);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }
            //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
            if (distanceLineNum === 1) {
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var lon = Cesium.Math.toDegrees(cartographic.longitude);
                var lat = Cesium.Math.toDegrees(cartographic.latitude);
                var MouseHeight = cartographic.height;
                trianArr.length = 3;
                trianArr.push(lon, lat, MouseHeight);
                draw_Triangle();
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        me.handler.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.position);
            if (!Cesium.defined(cartesian)) {
                var ray = viewer.camera.getPickRay(movement.position);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }

            // var cartesian = viewer.scene.pickPosition(movement.position);
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            var lon = Cesium.Math.toDegrees(cartographic.longitude);
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var MouseHeight = cartographic.height;

            floatingPoint = viewer.entities.add({
                name: '多边形面积',
                position: cartesian,
                point: {
                    pixelSize: 3,
                    color: Cesium.Color.RED,
                    outlineColor: Cesium.Color.WHITE,
                    outlineWidth: 2,
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                }
            });
            me.measureIds.push(floatingPoint.id);

            distanceLineNum++;
            if (distanceLineNum === 1) {
                trianArr.push(lon, lat, MouseHeight);

            } else {
                trianArr.length = 3;
                trianArr.push(lon, lat, MouseHeight);
                me.handler.destroy();
                me.bMeasuring = false;
                viewer._container.style.cursor = "";
                draw_Triangle();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        me.handler.setInputAction(function (movement) {
            me.handler.destroy();
            me.bMeasuring = false;
            viewer._container.style.cursor = "";
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        function draw_Triangle() {
            if (Cesium.defined(XLine)) {
                //更新三角线
                XLine.polyline.positions = trianArr[5] > trianArr[2] ? new Cesium.Cartesian3.fromDegreesArrayHeights([
                    trianArr[0],
                    trianArr[1], trianArr[2], trianArr[0], trianArr[1], trianArr[5], trianArr[3], trianArr[4],
                    trianArr[5], trianArr[0], trianArr[1], trianArr[2]
                ]) : new Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[0], trianArr[1], trianArr[2],
                    trianArr[3], trianArr[4], trianArr[5], trianArr[3], trianArr[4], trianArr[2], trianArr[0],
                    trianArr[1], trianArr[2]
                ]);

                // 空间
                var lineDistance = Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(trianArr[0], trianArr[1]),
                    Cesium.Cartesian3.fromDegrees(trianArr[3], trianArr[4])).toFixed(2);
                //高度
                var height = Math.abs(trianArr[2] - trianArr[5]).toFixed(2);
                //直线距离
                var strLine = (Math.sqrt(Math.pow(lineDistance, 2) + Math.pow(height, 2))).toFixed(2);

                X.position = Cesium.Cartesian3.fromDegrees((trianArr[0] + trianArr[3]) / 2, (trianArr[1] + trianArr[
                    4]) / 2, Math.max(trianArr[2], trianArr[5]));
                H.position = trianArr[5] > trianArr[2] ? Cesium.Cartesian3.fromDegrees(trianArr[0], trianArr[1], (
                    trianArr[2] + trianArr[5]) / 2) : Cesium.Cartesian3.fromDegrees(trianArr[3], trianArr[4], (
                    trianArr[2] + trianArr[5]) / 2);
                Y.position = Cesium.Cartesian3.fromDegrees((trianArr[0] + trianArr[3]) / 2, (trianArr[1] + trianArr[
                    4]) / 2, (trianArr[2] + trianArr[5]) / 2);
                X.label.text = '水平距离:' + lineDistance + '米';
                H.label.text = '高度差:' + height + '米';
                Y.label.text = '空间距离:' + strLine + '米';
                return;
            }
            XLine = viewer.entities.add({
                name: 'triangleLine',
                polyline: {
                    positions: trianArr[5] > trianArr[2] ? new Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[0],
                        trianArr[1], trianArr[2], trianArr[0], trianArr[1], trianArr[5], trianArr[3], trianArr[4],
                        trianArr[5], trianArr[0], trianArr[1], trianArr[2]
                    ]) : new Cesium.Cartesian3.fromDegreesArrayHeights([trianArr[0], trianArr[1], trianArr[2],
                        trianArr[3], trianArr[4], trianArr[5], trianArr[3], trianArr[4], trianArr[2], trianArr[0],
                        trianArr[1], trianArr[2]
                    ]),
                    arcType: Cesium.ArcType.NONE,
                    width: 2,
                    material: new Cesium.PolylineOutlineMaterialProperty({
                        color: Cesium.Color.YELLOW
                    }),
                    depthFailMaterial: new Cesium.PolylineOutlineMaterialProperty({
                        color: Cesium.Color.RED
                    })
                }
            });
            me.measureIds.push(XLine.id);

            // 空间
            var lineDistance = Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(trianArr[0], trianArr[1]),
                Cesium.Cartesian3.fromDegrees(trianArr[3], trianArr[4])).toFixed(2);
            //高度
            var height = Math.abs(trianArr[2] - trianArr[5]).toFixed(2);
            //直线距离
            var strLine = (Math.sqrt(Math.pow(lineDistance, 2) + Math.pow(height, 2))).toFixed(2);
            X = viewer.entities.add({
                name: 'lineX',
                position: Cesium.Cartesian3.fromDegrees((trianArr[0] + trianArr[3]) / 2, (trianArr[1] + trianArr[
                    4]) / 2, Math.max(trianArr[2], trianArr[5])),
                label: {
                    text: '水平距离:' + lineDistance + '米',
                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
                    font: '45px 楷体',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 3,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    scale: 0.5,
                    pixelOffset: new Cesium.Cartesian2(0, -10),
                    backgroundColor: new Cesium.Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
                    backgroundPadding: new Cesium.Cartesian2(10, 10),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                }
            });
            me.measureIds.push(X.id);
            H = viewer.entities.add({
                name: 'lineZ',
                position: trianArr[5] > trianArr[2] ? Cesium.Cartesian3.fromDegrees(trianArr[0], trianArr[1], (
                    trianArr[2] + trianArr[5]) / 2) : Cesium.Cartesian3.fromDegrees(trianArr[3], trianArr[4], (
                    trianArr[2] + trianArr[5]) / 2),
                label: {
                    text: '高度差:' + height + '米',
                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
                    font: '45px 楷体',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 3,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    scale: 0.5,
                    pixelOffset: new Cesium.Cartesian2(0, -10),
                    backgroundColor: new Cesium.Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
                    backgroundPadding: new Cesium.Cartesian2(10, 10),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                }
            });
            me.measureIds.push(H.id);
            Y = viewer.entities.add({
                name: 'lineY',
                position: Cesium.Cartesian3.fromDegrees((trianArr[0] + trianArr[3]) / 2, (trianArr[1] + trianArr[
                    4]) / 2, (trianArr[2] + trianArr[5]) / 2),
                label: {
                    text: '空间距离:' + strLine + '米',
                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
                    font: '45px 楷体',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 3,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    scale: 0.5,
                    pixelOffset: new Cesium.Cartesian2(0, -10),
                    backgroundColor: new Cesium.Color.fromCssColorString("rgba(0, 0, 0, 0.7)"),
                    backgroundPadding: new Cesium.Cartesian2(10, 10),
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM
                }
            });
            me.measureIds.push(Y.id);
        }
    }

    //方位角
    _measureAngle() {
        var me = this;
        var viewer = this.viewer;
        var pArr = [];
        var distanceLineNum = 0;
        var Line1;
        var Line2;
        var angleT;
        var floatingPoint; //浮动点
        me.handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
        me.handler.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.endPosition);
            if (!Cesium.defined(cartesian)) {
                var ray = viewer.camera.getPickRay(movement.endPosition);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }
            //cartesian = viewer.scene.camera.pickEllipsoid(movement.endPosition, viewer.scene.globe.ellipsoid);
            if (distanceLineNum === 1) {
                pArr.length = 1;
                pArr.push(cartesian);
                draw_Angle();
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        me.handler.setInputAction(function (movement) {
            var cartesian = viewer.scene.pickPosition(movement.position);
            if (!Cesium.defined(cartesian)) {
                var ray = viewer.camera.getPickRay(movement.position);
                cartesian = viewer.scene.globe.pick(ray, viewer.scene);
            }
            // var cartesian = viewer.scene.pickPosition(movement.position);

            distanceLineNum++;
            if (distanceLineNum === 1) {
                pArr.push(cartesian);
                floatingPoint = viewer.entities.add({
                    name: '方位角',
                    position: cartesian,
                    point: {
                        pixelSize: 3,
                        color: Cesium.Color.RED,
                        outlineColor: Cesium.Color.WHITE,
                        outlineWidth: 2,
                        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
                    }
                });
                me.measureIds.push(floatingPoint.id);
            } else {
                pArr.length = 1;
                pArr.push(cartesian);
                me.handler.destroy();
                me.bMeasuring = false;
                viewer._container.style.cursor = "";
                draw_Angle();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        me.handler.setInputAction(function (movement) {
            me.handler.destroy();
            me.bMeasuring = false;
            viewer._container.style.cursor = "";
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        function draw_Angle() {
            // 空间
            var cartographic1 = Cesium.Cartographic.fromCartesian(pArr[0]);
            var lon1 = Cesium.Math.toDegrees(cartographic1.longitude);
            var lat1 = Cesium.Math.toDegrees(cartographic1.latitude);
            var cartographic2 = Cesium.Cartographic.fromCartesian(pArr[1]);
            var lon2 = Cesium.Math.toDegrees(cartographic2.longitude);
            var lat2 = Cesium.Math.toDegrees(cartographic2.latitude);
            var lineDistance = Cesium.Cartesian3.distance(Cesium.Cartesian3.fromDegrees(lon1, lat1),
                Cesium.Cartesian3.fromDegrees(lon2, lat2));
            var localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(lon1, lat1));
            var NorthPoint = Cesium.Cartographic.fromCartesian(Cesium.Matrix4.multiplyByPoint(localToWorld_Matrix, Cesium
                .Cartesian3.fromElements(0,
                    lineDistance,
                    0), new Cesium.Cartesian3()));
            var npLon = Cesium.Math.toDegrees(NorthPoint.longitude);
            var npLat = Cesium.Math.toDegrees(NorthPoint.latitude);
            // var angle = Cesium.Cartesian3.angleBetween(Cesium.Cartesian3.fromDegrees(lon1, lat1),
            //     Cesium.Cartesian3.fromDegrees(lon2, lat2));
            var angle = courseAngle(lon1, lat1, lon2, lat2);
            var textDisance = lineDistance.toFixed(2) + "米";
            if (lineDistance > 1000) {
                textDisance = (lineDistance / 1000).toFixed(3) + "千米";
            }
            if (Cesium.defined(Line1)) {
                //更新线
                Line1.polyline.positions = new Cesium.Cartesian3.fromDegreesArray([lon1, lat1, npLon, npLat]);
                Line2.polyline.positions = new Cesium.Cartesian3.fromDegreesArray([lon1, lat1, lon2, lat2]);
                angleT.label.text = '角度:' + angle + '°\n距离:' + textDisance;
                angleT.position = pArr[1];
                return;
            }
            //北方线
            Line1 = viewer.entities.add({
                name: 'Angle1',
                polyline: {
                    positions: new Cesium.Cartesian3.fromDegreesArray([lon1, lat1, npLon, npLat]),
                    width: 3,
                    material: new Cesium.PolylineDashMaterialProperty({
                        color: Cesium.Color.RED
                    }),
                    clampToGround: true
                }
            });
            me.measureIds.push(Line1.id);
            //线
            Line2 = viewer.entities.add({
                name: 'Angle2',
                polyline: {
                    positions: new Cesium.Cartesian3.fromDegreesArray([lon1, lat1, lon2, lat2]),
                    width: 10,
                    material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW),
                    clampToGround: true
                }
            });
            me.measureIds.push(Line2.id);

            //文字
            angleT = viewer.entities.add({
                name: 'AngleT',
                position: pArr[1],
                label: {
                    text: '角度:' + angle + '°\n距离:' + textDisance,
                    translucencyByDistance: new Cesium.NearFarScalar(1.5e2, 2.0, 1.5e5, 0),
                    font: '45px 楷体',
                    fillColor: Cesium.Color.WHITE,
                    outlineColor: Cesium.Color.BLACK,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 4,
                    scale: 0.5,
                    pixelOffset: new Cesium.Cartesian2(0, -40),
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                    backgroundColor: new Cesium.Color.fromCssColorString("rgba(0, 0, 0, 1)"),
                    backgroundPadding: new Cesium.Cartesian2(10, 10),
                    verticalOrigin: Cesium.VerticalOrigin.BASELINE
                }
            });
            me.measureIds.push(angleT.id);
        }

        function courseAngle(lng_a, lat_a, lng_b, lat_b) {
            /////////////方法
            var dRotateAngle = Math.atan2(Math.abs(lng_a - lng_b), Math.abs(lat_a - lat_b));
            if (lng_b >= lng_a) {
                if (lat_b >= lat_a) {} else {
                    dRotateAngle = Math.PI - dRotateAngle;
                }
            } else {
                if (lat_b >= lat_a) {
                    dRotateAngle = 2 * Math.PI - dRotateAngle;
                } else {
                    dRotateAngle = Math.PI + dRotateAngle;
                }
            }
            dRotateAngle = dRotateAngle * 180 / Math.PI;
            return parseInt(dRotateAngle * 100) / 100;

            /////方法
            // //以a点为原点建立局部坐标系（东方向为x轴,北方向为y轴,垂直于地面为z轴），得到一个局部坐标到世界坐标转换的变换矩阵
            // var localToWorld_Matrix = Cesium.Transforms.eastNorthUpToFixedFrame(new Cesium.Cartesian3.fromDegrees(lng_a, lat_a));
            // //求世界坐标到局部坐标的变换矩阵
            // var worldToLocal_Matrix = Cesium.Matrix4.inverse(localToWorld_Matrix, new Cesium.Matrix4());
            // //a点在局部坐标的位置，其实就是局部坐标原点
            // var localPosition_A = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, new Cesium.Cartesian3.fromDegrees(lng_a, lat_a), new Cesium.Cartesian3());
            // //B点在以A点为原点的局部的坐标位置
            // var localPosition_B = Cesium.Matrix4.multiplyByPoint(worldToLocal_Matrix, new Cesium.Cartesian3.fromDegrees(lng_b, lat_b), new Cesium.Cartesian3());
            // //弧度
            // var angle = Math.atan2((localPosition_B.y - localPosition_A.y), (localPosition_B.x - localPosition_A.x))
            // //角度
            // var theta = angle * (180 / Math.PI);
            // if (theta < 0) {
            //     theta = theta + 360;
            // }
            // return theta.toFixed(2);
        }
    }
}