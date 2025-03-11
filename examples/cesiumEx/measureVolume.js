 /**
 * @class DEUGlobe.Analysis.measureVolume
 * @category  分析
 * @classdesc 方量分析直接调用new DEUGlobe.Analysis.measureVolume()即可，左键画线，右键停止
 * @param {Object} viewer -  Cesium.viewer。
 * @param {Object} options - 参数。
 * @param {Boolean} options.terrainLevel -  terrainLevel。 查询当前地形级别(默认 13)
 */
 class MeasureVolume{
    constructor(viewer,options){
        var _this = this;
        this.viewer = viewer;
        this.optS = options ||{};
        this.handler = null;
        this.polygon = null;
        this.wall = null;  
        this.initHeight = 0;
        this.minHeight = 0;
        this.maxHeight =0;
        this.volumn = 0;
        this.label = null;
        this.cartesian = null;
        this.poly = null;
        this.area = null;
        this.cellsize = null;
        this.centroid = null;
        this.planeHeight = 0;
        this.positions = [];
        this.Cartesian2Array = [];
        this.floatingPointLis = [];
        viewer.scene.globe.depthTestAgainstTerrain = true;
        this.data = [];
        this.PolygonPrimitive = (function () {
            function _(positions) {
                this.options = { 
                    name: '多边形',
                    polygon: {
                        show: true,
                        perPositionHeight: true,
                        material: Cesium.Color.CHARTREUSE.withAlpha(0.5),
                    }
                };
                this.hierarchy = positions;
                this._init();
            }
            _.prototype._init = function () {
                var _self = this;
                var _update = function () {
                    return new Cesium.PolygonHierarchy(_self.hierarchy);
                };
                //实时更新polygon.positions
                this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
                _this.polygon =  _this.viewer.entities.add(this.options);
            };
            return _;
        })();

        var tooltip = document.createElement('div');
        tooltip.setAttribute('class','roamWidget_tooltip')
        var tooltipArrow = document.createElement('div');
        tooltipArrow.setAttribute('class','roamWidget_tooltip_arrow')
        tooltip.appendChild(tooltipArrow);
        var tooltipInner = document.createElement('div');
        tooltipInner.setAttribute('class','roamWidget_tooltip_inner')
        tooltip.appendChild(tooltipInner);
        tooltipInner.innerHTML = "单击 开始绘制";
        this.tooltip = tooltip;
        this.tooltipInner = tooltipInner;
    }
    /**
     * @classdesc 方量分析
    * @param {function} callback -  绘制完成回调
     */
    initMeasureVolume(callback){
        var _this = this;
        _this.positions = []
        _this.Cartesian2Array = []
        _this.handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene._imageryLayerCollection);
        _this.tooltip.style.left = "-100000px";
        _this.tooltip.style.top = "-100000px";
        document.getElementsByTagName('body')[0].appendChild(_this.tooltip);
        _this.viewer.scene.canvas.style.cursor='crosshair';
        _this.handler.setInputAction(function (movement) {
            var ray = _this.viewer.camera.getPickRay(movement.endPosition);
            _this.cartesian = _this.viewer.scene.globe.pick(ray,_this.viewer.scene);
            if (_this.positions.length >= 2) {
                if (!Cesium.defined(_this.poly)) {
                    _this.poly = new _this.PolygonPrimitive(_this.positions);
                } else {
                    if(_this.cartesian != null){
                            _this.positions.pop();
                            _this.cartesian.y += (1 + Math.random());
                            _this.positions.push(_this.cartesian);
                      }
                }
            };
            
            _this.tooltip.style.left = movement.endPosition.x + 20 + "px";
            _this.tooltip.style.top = movement.endPosition.y - 10 + "px";
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    
        _this.handler.setInputAction(function (movement) {
            var ray = _this.viewer.camera.getPickRay(movement.position);
            _this.cartesian = _this.viewer.scene.globe.pick(ray,_this.viewer.scene);
            if (_this.positions.length == 0) {
                _this.positions.push(_this.cartesian.clone());
            }
            // console.log(_this.positions)
            _this.positions.push(_this.cartesian);
            _this.tooltipInner.innerHTML = "单击增加点，右键结束";
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    
        _this.handler.setInputAction(function (movement) {
            _this.viewer.entities.remove(_this.polygon);
            document.getElementsByTagName('body')[0].removeChild(_this.tooltip);
            _this.viewer.scene.canvas.style.cursor=''
            _this.handler.destroy();//关闭事件句柄
            _this.positions.pop();//最后一个点无效
            var ellipsoid = _this.viewer.scene.globe.ellipsoid;
            _this.positions.forEach(element => {
                var cartographic=ellipsoid.cartesianToCartographic(element);
                var lat=Cesium.Math.toDegrees(cartographic.latitude);
                var lng=Cesium.Math.toDegrees(cartographic.longitude);
                _this.Cartesian2Array.push([lng,lat])
            });
            _this.Cartesian2Array.push(_this.Cartesian2Array[0]);
            
            let polygon = turf.polygon([ _this.Cartesian2Array]); 
            _this.cellsize = Math.sqrt(turf.area(polygon) / 10000);
            
            let enveloped = turf.envelope(polygon);
            _this.area = turf.area(polygon);
            _this.centroid = turf.centroid(polygon);

            let bbox = turf.bbox(enveloped);
            let grid = turf.pointGrid(bbox, _this.cellsize, { units: 'meters' });
            let ptsWithin = turf.pointsWithinPolygon(grid, polygon);
            let lonlats = [];
            let features = ptsWithin.features;
            for (let i = 0; i < features.length; i++) {
                lonlats.push({
                    lon: features[i].geometry.coordinates[0],
                    lat: features[i].geometry.coordinates[1]
                })
            }
            TerrainToolCopy.LonlatPointsTerrainData( _this.viewer.terrainProvider, lonlats, _this.optS.terrainLevel, (positions) => {
                _this.getVolumn(positions);
                callback({
                    planeHeight:_this.minHeight,
                    wallMinHeight:_this.minHeight,
                    wallMaxHeight:_this.maxHeight
                })
            })
            
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
     };
    initMeasure(positions) { 
        var _this = this;
        _this.positions = []
        _this.Cartesian2Array = []
        _this.tooltip.style.left = "-100000px";
        _this.tooltip.style.top = "-100000px";
            var ellipsoid = _this.viewer.scene.globe.ellipsoid;
        
        _this.positions = positions
        _this.positions.forEach(element => {
            var cartographic=ellipsoid.cartesianToCartographic(element);
            var lat=Cesium.Math.toDegrees(cartographic.latitude);
            var lng=Cesium.Math.toDegrees(cartographic.longitude);
            _this.Cartesian2Array.push([lng,lat])
        });
        _this.Cartesian2Array.push(_this.Cartesian2Array[0]);
            _this.minHeight = 3000;
            _this.initHeight = 4000;
            _this.maxHeight = 5000;
            let polygon = turf.polygon([ _this.Cartesian2Array]); 
            _this.cellsize = Math.sqrt(turf.area(polygon) / 10000);
            
            let enveloped = turf.envelope(polygon);
            _this.area = turf.area(polygon);
            _this.centroid = turf.centroid(polygon);

            let bbox = turf.bbox(enveloped);
            let grid = turf.pointGrid(bbox, _this.cellsize, { units: 'meters' });
            let ptsWithin = turf.pointsWithinPolygon(grid, polygon);
            let lonlats = [];
            let features = ptsWithin.features;
            for (let i = 0; i < features.length; i++) {
                lonlats.push({
                    lon: features[i].geometry.coordinates[0],
                    lat: features[i].geometry.coordinates[1]
                })
            }
            TerrainToolCopy.LonlatPointsTerrainData( _this.viewer.terrainProvider, lonlats, _this.optS.terrainLevel, (positions) => {
                _this.getVolumn(positions,true);
                callback({
                    planeHeight:_this.minHeight,
                    wallMinHeight:_this.minHeight,
                    wallMaxHeight:_this.maxHeight
                })
            })
            
    };
    getVolumn(data,flag) {
        var _this = this;
        _this.data = data;
        let positions = [];
        var ellipsoid=_this.viewer.scene.globe.ellipsoid;
        _this.positions.forEach(element => {
            var cartographic=ellipsoid.cartesianToCartographic(element);
            let haiba = _this.viewer.scene.globe.getHeight(cartographic);
            positions.push(haiba)
            _this.floatingPoint = _this.viewer.entities.add({
                position: element,
                label: {
                    text: "海拔:" +  haiba.toFixed(2) + "米",
                    font: '19px sans-serif',
                    fillColor: Cesium.Color.GOLD,
                    style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                    outlineWidth: 2,
                    verticalOrigin: Cesium.VerticalOrigin.BOTTOM, 
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    pixelOffset: new Cesium.Cartesian2(0.0, -20)
                }
            });
            _this.floatingPointLis.push(_this.floatingPoint);
        });
        if (!flag) {
            _this.minHeight = findMinHeight(positions);
            _this.initHeight = _this.planeHeight = _this.minHeight;
            _this.maxHeight = findMaxHeight(positions);
        }
        _this.volumn = 0;
        let a1 = 0,a2 = 0;
        for (let i = 0; i < data.length; i++) {
            _this.volumn += (data[i]['height'] - _this.minHeight) * _this.cellsize * _this.cellsize;
        }
        let Cartesian3Array = [];
        let minimumHeights = [];
        let maximumHeights = [];
        _this.Cartesian2Array.forEach(element => {
            console.log(element)
            element.forEach((element1,index) => {
                Cartesian3Array.push(element1);
                if(index==1){
                    Cartesian3Array.push(0);
                }
            })
            minimumHeights.push(_this.minHeight); 
            maximumHeights.push(_this.maxHeight);
        });
        _this.wall = _this.viewer.entities.add({
            wall: {
                positions: Cesium.Cartesian3.fromDegreesArrayHeights(Cartesian3Array),
                minimumHeights:minimumHeights,
                maximumHeights:maximumHeights,
                outline:true,
                outlineColor: Cesium.Color.WHITE.withAlpha(0.7),
                material: Cesium.Color.CYAN.withAlpha(0.7),
            },
        });
        _this.polygon = _this.viewer.entities.add({
            polygon: {
                show: true,
                hierarchy:new Cesium.PolygonHierarchy(Cesium.Cartesian3.fromDegreesArrayHeights(Cartesian3Array)),
                height:_this.minHeight,
                material: Cesium.Color.CHARTREUSE.withAlpha(0.5),
            }
        });
        let volumn = 0;
        let area = 0;
        if( _this.volumn/10000 > 0.01){
            volumn =  ( _this.volumn/10000).toFixed(2) +'万立方米';
        }else{
            volumn =   _this.volumn.toFixed(2) +'立方米';
        }
        if( _this.area/10000 > 0.01){
            area =  ( _this.area/10000).toFixed(2) +'万平方米';
        }else{
            area =   _this.area.toFixed(2) +'平方米';
        }
        _this.label = _this.viewer.entities.add({
            name: "飞机",
            position: Cesium.Cartesian3.fromDegrees(_this.centroid.geometry.coordinates[0], _this.centroid.geometry.coordinates[1], _this.maxHeight),
            label: {
                text:"挖方体积：" +  volumn +'\n'+ "横切面积：" + area,
                font: '18px sans-serif',
                showBackground: true,
                fillColor: Cesium.Color.WHITE,
                style: Cesium.LabelStyle.FILL_AND_OUTLINE,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                pixelOffset: new Cesium.Cartesian2(0.0, -80)
            }
        });
    }
    /**
     * @classdesc 设置参数
     * @param {Object} options - 参数。
    * @param {function} callback -  绘制完成回调
     */
    setParameters(opt,callback){
        this.planeHeight = opt.planeHeight == undefined ? this.planeHeight : opt.planeHeight;
        this.minHeight = opt.wallMinHeight == undefined ? this.minHeight : opt.wallMinHeight;
        this.maxHeight = opt.wallMaxHeight == undefined ? this.maxHeight : opt.wallMaxHeight;
        if(this.planeHeight < this.minHeight){
            this.minHeight = this.planeHeight;
        }
        
        if(this.planeHeight > this.maxHeight){
            this.maxHeight =  this.planeHeight;
        }
        if (Cesium.defined(this.polygon)){
            this.polygon.polygon.height.setValue(this.planeHeight);
        }
        if (Cesium.defined(this.wall)){
            let minimumHeights = [];
            for (let index = 0; index < this.wall.wall.minimumHeights.getValue().length; index++) {
                minimumHeights.push(this.minHeight)
            }
            this.wall.wall.minimumHeights.setValue(minimumHeights);
            let maximumHeights = [];
            for (let index = 0; index < this.wall.wall.maximumHeights.getValue().length; index++) {
                maximumHeights.push(this.maxHeight)
            }
            this.wall.wall.maximumHeights.setValue(maximumHeights);
        }
        this.calculateBulk();
        callback({
            planeHeight:this.planeHeight,
            wallMinHeight:this.minHeight,
            wallMaxHeight:this.maxHeight
        });
    }
    //计算体积
    calculateBulk(){
       //基准面下的体积
       let planeBulk = this.area * (this.planeHeight - this.minHeight);
       //挖方体积
       let volumn = 0;
       this.volumn = 0;
       for (let i = 0; i < this.data.length; i++) {
            this.volumn += (this.data[i]['height'] - this.minHeight) * this.cellsize * this.cellsize;
            if(this.data[i]['height'] > this.planeHeight){
                volumn += (this.data[i]['height'] - this.planeHeight) * this.cellsize * this.cellsize;
            }
        }
        let fillInBulk = 0;
        if(this.initHeight <= this.planeHeight){
            //填方体积 
            fillInBulk = planeBulk - (this.volumn - volumn);
        }

        if(fillInBulk > 0){
             if( fillInBulk/10000 > 0.01){
               fillInBulk =  ( fillInBulk/10000).toFixed(2) +'万立方米';
            }else{
               fillInBulk =   fillInBulk.toFixed(2) +'立方米';
            }
             fillInBulk = "填方体积："+ fillInBulk+'\n';
        }else{
            fillInBulk ='';
        }
        if(volumn >0){
            if( volumn/10000 > 0.01){
                volumn =  ( volumn/10000).toFixed(2) +'万立方米';
            }else{
                volumn =   volumn.toFixed(2) +'立方米';
            }
             volumn = "挖方体积："+ volumn +'\n';
        }else{
            volumn ='';
        }
        let area = this.area
        if( area/10000 > 0.01){
             area =  ( area/10000).toFixed(2) +'万平方米';
        }else{
             area =   area.toFixed(2) +'平方米';
        }
        this.label.label.text.setValue(fillInBulk+volumn+"横切面积："+area)
    }
    //清除
    clear(){
        if(this.floatingPointLis.length>0){
            this.floatingPointLis.forEach(element => {
                this.viewer.entities.remove(element);
            });
        }
        if(Cesium.defined(this.wall)){
            this.viewer.entities.remove(this.wall);
        }
        if(Cesium.defined(this.polygon)){
            this.viewer.entities.remove(this.polygon);
        }
        if(Cesium.defined(this.label)){
            this.viewer.entities.remove(this.label);
        }
    }
}

function findMinHeight(e) {
    e = e.sort((a, b) => a - b);
    // let minHeight = 0;
    // let minPoint = null;
    // for (let i = 0; i < e.length; i++) {
    //     let height = e[i];
    //     if (height < minHeight) {
    //         minHeight = height;
    //     }
    // }
    return e[0];
}
function findMaxHeight(e) {
    e = e.sort((a, b) => b - a);
    return e[0];
}
//获取高程
var TerrainToolCopy = (
    function () {
    
        function _() {

        }

        //传入lonlat数组 角度制的lon lat
        _.LonlatPointsTerrainData = function (terrainProvider,lonlats, terrainLevel = 13, callback) {
            var pointArrInput = [];
            for (var i = 0; i < lonlats.length; i++) {
                pointArrInput.push(Cesium.Cartographic.fromDegrees(lonlats[i].lon, lonlats[i].lat));
            }
            // var promise = Cesium.sampleTerrain(terrainProvider, terrainLevel, pointArrInput);//pointArrInput
            // Cesium.when(promise, function (updatedPositions) {
            //     callback(updatedPositions);
            // });
            var p1 = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, pointArrInput)
            Promise.all([p1]).then((samples) => { 
                callback(samples[0]);
            })

        };

        //传入Cartographic类型数组 弧度制经纬度
        _.CartographicPointsTerrainData = function (terrainProvider,Cartographics, callback) {
            if (Cartographics.length && Cartographics.length > 0) { } else { return; }
            // var promise = Cesium.sampleTerrain(terrainProvider, terrainLevel, Cartographics);//pointArrInput
            // Cesium.when(promise, function (updatedPositions) {
            //     callback(updatedPositions);
            // });
            var p1 = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, Cartographics)
            Promise.all([p1]).then((samples) => { 
                callback(samples[0]);
            })

        };
        return _;
    }
)();