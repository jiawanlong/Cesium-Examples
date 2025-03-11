/**
   * @class DEUGlobe.Scene.Roaming
   * @category  场景
   * @classdesc 漫游
   * @param {Object} viewer -  Cesium.viewer。
   * @param {Object} options -  参数。
   * @param {Boolean} options.time  -  漫游时间 。
   * @param {Boolean} options.multiplier  -  飞行速度 默认1。
   */
   class Roaming{
    constructor(viewer,options){
      this.viewer = viewer;
      this.pause = true;
      options = options || {};
      this.Lines = [];
      this.entity = undefined;
      this.start = undefined;
      this.stop = undefined;
      this.time = !options.time?360:options.time;
      this.multiplier = !options.multiplier?1:options.multiplier;
      this.isPattern = true;
      this.data={};
      this.ifClockLoop=false;
    }
    /**
   *
   *
   * @param {*} Lines 点集合
   * @param {*} time 漫游时间
   * @param {*} start 开始时间节点
   * @returns
   * @memberof Roaming
   */
    _ComputeRoamingLineProperty (Lines, time) {
      let property = new Cesium.SampledPositionProperty();
      let lineLength = Lines.length;
      let tempTime = time;
      let start = Cesium.JulianDate.now();
      this.start = start;
      let stop = Cesium.JulianDate.addSeconds(start, time, new Cesium.JulianDate());
      this.stop = stop;
      this.viewer.clock.startTime = start.clone();
      this.viewer.clock.stopTime = stop.clone();
      this.viewer.clock.currentTime = start.clone();
      if(this.ifClockLoop){
        this.viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      }else{
        this.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED; // 行为方式
        this.viewer.clock.clockStep = Cesium.ClockStep.SYSTEM_CLOCK; // 时钟设置为当前系统时间; 忽略所有其他设置。
      }
      this.viewer.clock.shouldAnimate = true;
      this.viewer.clock.multiplier =  this.multiplier;
      for (let i = 0; i < lineLength; i++) {
          var time = Cesium.JulianDate.addSeconds(start, i *  tempTime / lineLength, new Cesium.JulianDate());
          if(i== lineLength-1){
            time = stop;
          }
          let position = Lines[i];
          if(this.ifTileset) {
            position = this.viewer.scene.clampToHeight(position);
          }
          property.addSample(time, position);
      };
      return property
    }
     /**
     * @class DEUGlobe.Scene.Roaming.cameraRoaming
     * @classdesc 相机漫游
     * @param {Array} Lines -  点集合 (必填)。
    */
    cameraRoaming(Lines){
      this.Lines = Lines;
      var property = this._ComputeRoamingLineProperty(this.Lines, this.time);
      this._InitRoaming(property, this.start, this.stop);
    }
    /**
     * @param {*} position computeRoamingLineProperty计算的属性
     * @param {*} start 开始时间节点
     * @param {*} stop 结束时间节点
     * @memberof Roaming
    */
    _InitRoaming (position, start, stop) {
      this.entity = this.viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([
          new Cesium.TimeInterval({
            start: start,
            stop: stop
          })
        ]),
        // 位置
        position: position,
        orientation: new Cesium.VelocityOrientationProperty(position)
      });
      this.entity.position.setInterpolationOptions({// 点插值
        interpolationDegree: 100,
        interpolationAlgorithm: Cesium.HermitePolynomialApproximation
      });
      this.viewer.trackedEntity = this.entity;
      var camera =  this.viewer.camera;
      var _this = this;
      var Exection = function () {
        if (_this.entity) {
            var center = _this.entity.position.getValue(_this.viewer.clock.currentTime);
            if (center) camera.lookAt(center, {
              heading:Cesium.Math.toRadians(117.7),
              pitch:Cesium.Math.toRadians(0),
              range:100
            });
            if(_this.viewer.clock.shouldAnimate){
              if(center) _this._realTimeData(center)
            }
        }else{
          _this.viewer.scene.preUpdate.removeEventListener(Exection);
        }
      }
      _this.viewer.scene.preUpdate.addEventListener(Exection);
    }
    /**
     * @class DEUGlobe.Scene.Roaming.modelRoaming
     * @classdesc 模型漫游
     * @param {Object} options -  参数。
     * @param {Array}  options.Lines -  点集合 (必填)。
     * @param {Object} options.model - 模型  Cesium.ModelGraphics.ConstructorOptions。
     * @param {Boolean} options.ifAffixedTo  - 是否贴地漫游 (默认 false)
     * @param {Boolean} options.ifClockLoop  - 是否循环漫游 (默认 false)
     * @param {Boolean} options.interpolation  - 是否弧形差值 (默认 false)
     * @param {Boolean} options.model.minimumPixelSize - 模型最小刻度 (默认 64)
     * @param {Object} options.path - 漫游轨迹 Cesium.PathGraphics.ConstructorOptions。
     * @param {Boolean} options.path.show - 漫游轨迹可见性 (默认 false)
     * @param {Object} options.polyline - 绘制折线 Cesium.PolylineGraphics.ConstructorOptions.
     * @param {Boolean} options.polyline.show  - 绘制折线可见性 (默认 false)
     * @param {Object} options.label  - 标注  Cesium.LabelGraphics.ConstructorOptions
     * @param {Boolean} options.label.show  -标注可见性 (默认 false)
     * @param {Object} options.cylinder - 绘制圆柱体 Cesium.CylinderGraphics.ConstructorOptions
     * @param {Boolean} options.cylinder.show  - 绘制折线可见性 (默认 false)
     * @param {Boolean} options.cylinder.topRadius  -用于指定圆柱体顶部的半径 (默认 0)
     * @param {Boolean} options.cylinder.bottomRadius  - 用于指定圆柱体底部的半径。 (默认 200)
     * @param {Boolean} options.cylinder.material  - 指定用于填充圆柱体的材料 (默认 Cesium.Color.RED)
     * @param {Boolean} options.cylinder.heightReference  - 指定距实体位置的高度是相对于什么的高度。 (默认 Cesium.HeightReference.CLAMP_TO_GROUND)
     * @param {Object} options.polyline.material  - 绘制折线颜色 (默认 Cesium.Color.RED)
     * @param {Boolean} options.ifTileset  - 是否贴模型漫游 (默认 false)
    */
    modelRoaming(options){
      this.modelData = {};
      this.Lines = options.Lines;
      var model = {
          minimumPixelSize: 64,
      };
      var path ={
          show: false
      }
      var polyline ={
        show:false,
        material:Cesium.Color.RED,
      }
      var cylinder = {
          show:false,
          topRadius: 0.0,
          bottomRadius: 100.0,
          material: Cesium.Color.RED.withAlpha(0.3),
          heightReference:Cesium.HeightReference.CLAMP_TO_GROUND
      }
      var label ={
        show:false
      }
      this.ifAffixedTo=options.ifAffixedTo?options.ifAffixedTo:false;
      this.ifClockLoop=options.ifClockLoop?options.ifClockLoop:false;
      this.interpolation=options.interpolation?options.interpolation:false;
      this.showLabel=options.showLabel?options.showLabel:false;
      this.ifTileset=options.ifTileset?options.ifTileset:false;
      this.modelData.model = Object.assign(model, options.model);
      this.modelData.path = Object.assign(path, options.path);
      this.modelData.label = Object.assign(label, options.label);
      this.modelData.polyline = Object.assign(polyline, options.polyline);
      this.modelData.cylinder = Object.assign(cylinder, options.cylinder);
      this.modelData.polyline.positions = new Cesium.CallbackProperty(function(){},false);
      this.modelData.cylinder.length = new Cesium.CallbackProperty(function(){},false);
      var property = this._ComputeRoamingLineProperty(this.Lines, this.time);
      this._modelInitRoaming(property, this.start, this.stop, options.model,options.path);
    }
    /**
     * 模型漫游
    */
    _modelInitRoaming (position, start, stop) {
      var _this = this;
      this.entity = this.viewer.entities.add({
        availability: new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
            start: start,
            stop: stop
          })]),
          // 位置
          position: position,
          // 计算朝向
          orientation: new Cesium.VelocityOrientationProperty(position),
          // 加载模型
          model:this.modelData.model,
          //添加标题
          label: this.modelData.label,
          path: this.modelData.path,
      });
      if(!_this.ifAffixedTo && _this.interpolation){
          this.entity.position.setInterpolationOptions({// 点插值
              interpolationDegree: 5,
              interpolationAlgorithm: Cesium.LagrangePolynomialApproximation,
          });
      }
      _this.polyline = _this.viewer.entities.add({
        polyline: _this.modelData.polyline,
      });
      _this.cylinder = _this.viewer.entities.add({
        position: position,
        orientation: new Cesium.VelocityOrientationProperty(position),
        cylinder:this.modelData.cylinder
      });
      var positions = [];
      var Exection = function () {
          if (_this.entity) {
              if(_this.viewer.clock.shouldAnimate){
                var center = _this.entity.position.getValue(_this.viewer.clock.currentTime);
                if(_this.modelData.polyline.show){
                  positions.push(center);
                  _this.modelData.polyline.positions._callback = function(){
                    return positions;
                  }
              }
               if(_this.ifAffixedTo){
                  var geoPt1 = _this.viewer.scene.globe.ellipsoid.cartesianToCartographic(center);
                  let terrainProvider = !_this.viewer.terrainProvider.availability?Cesium.createWorldTerrain():_this.viewer.terrainProvider;
                  Cesium.sampleTerrainMostDetailed(terrainProvider,[Cesium.Cartographic.fromDegrees(geoPt1.longitude / Math.PI * 180, geoPt1.latitude  / Math.PI * 180)]).then(function(updatedPositions) {
                      _this.entity.position.addSample(_this.viewer.clock.currentTime, Cesium.Cartesian3.fromRadians(
                          updatedPositions[0].longitude,
                          updatedPositions[0].latitude,
                          updatedPositions[0].height
                      ));
                  });
               }
                if(_this.ifTileset) {
                  _this.entity.position.addSample(_this.viewer.clock.currentTime, _this.viewer.scene.clampToHeight(center, [_this.entity]));
                }
                if(_this.modelData.cylinder.show){
                    _this.modelData.cylinder.length._callback = function(){
                      let length = _this.viewer.scene.globe.ellipsoid.cartesianToCartographic(center)
                      return length.height;
                    }
                }
                if(center)_this._realTimeData(center)
              }
        }else{
          _this.viewer.scene.preUpdate.removeEventListener(Exection);
        }
      }
      _this.viewer.scene.preUpdate.addEventListener(Exection);
      _this.changingView(2);
    }
    /**
     *漫游的暂停和继续
    *
    * @param {*} state bool类型 false为暂停，ture为继续
    * @memberof Roaming
    */
    PauseOrContinue (state) {
      this.viewer.clock.shouldAnimate = state;
    }
    /**
     *改变飞行的速度
    *
    * @param {} value  整数类型
    * @memberof Roaming
    */
    ChangeRoamingSpeed (value) {
      this.viewer.clock.multiplier = value;
    }
    /**
     *
     *取消漫游
    * @memberof Roaming
    */
    EndRoaming () {
      if (this.entity !== undefined) {
        this.viewer.entities.remove(this.entity);
        this.viewer.entities.remove(this.polyline);
        this.viewer.entities.remove(this.cylinder);
        this.entity = undefined;
        this.polyline = undefined;
        this.cylinder = undefined;
        this.PauseOrContinue (false);

      }
    }
    /**
     *
     *获取飞行数据
    * @memberof Roaming
    * @param {RequestCallback} callback - 回调函数 (单位米)。
    */
    getData(callback){
      var _this = this;
      Object.defineProperty(this.data,'shouldAnimate',{
          set: function(value) {
              return callback(_this.data)
          }
      })
    }
    /**
     *切换视角
    * @memberof Roaming、
    * @param {Boolean} value   1视角跟踪 2上方视角 3侧方视角 4自定义视角
    * @param {Object} options 参数 自定义视角 模式时才有效
    * @param {Object} options.heading 可选 航向角（弧度）默认 0
    * @param {Object} options.pitch 可选俯仰角（弧度） 默认 0。
    * @param {Object} options.range 可选距中心的距离，以米为单位 默认 0。
    */
    changingView(value,options){
      var options = options || {};
      this.viewer.trackedEntity = undefined;
      if(value == 1){
        this.viewer.trackedEntity = this.entity;
      }else if(value == 2){
        this.viewer.zoomTo(
          this.viewer.entities,
          new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-90))
        );
      }else if(value == 3){
        this.viewer.zoomTo(
          this.viewer.entities,
          new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(-90),
            Cesium.Math.toRadians(-15),
            8000
          )
        );
      }else if(value == 4){
        this.viewer.zoomTo(
          this.viewer.entities,
          new Cesium.HeadingPitchRange(
            Cesium.Math.toRadians(!options.heading?0:options.heading),
            Cesium.Math.toRadians(!options.pitch?0:options.pitch),
            !options.range?0:options.range
          )
        );
      }
    }
    //实时数据
    _realTimeData(center){
      var _this = this;
      _this.data.shouldAnimate = _this.viewer.clock.shouldAnimate;
      _this.data.totalLength = _this._disTance(_this.Lines);//总长度
      _this.data.totalTime =  _this._formateSeconds(_this.time); //总时长
      var delTime = Cesium.JulianDate.secondsDifference(_this.viewer.clock.currentTime,_this.viewer.clock.startTime);//已经漫游的时间
      _this.data.delTime = _this._formateSeconds(delTime);
      _this.data.roamingLength =( _this.data.totalLength/_this.time*delTime).toFixed(3);//已经漫游长度
      var geoPt1 = _this.viewer.scene.globe.ellipsoid.cartesianToCartographic(center);
      _this.data.longitude = (geoPt1.longitude / Math.PI * 180).toFixed(6);//经度
      _this.data.latitude  = (geoPt1.latitude  / Math.PI * 180).toFixed(6);//纬度
      // _this.data.roamingElevation = (geoPt1.height).toFixed(2)==-0.00?0:(geoPt1.height).toFixed(2);//漫游高程
      // _this.data.liftoffHeight = (_this.data.roamingElevation-_this.data.terrainHeight).toFixed(2);//离地距离
      let terrainProvider = !_this.viewer.terrainProvider.availability?Cesium.createWorldTerrain():_this.viewer.terrainProvider;
      Cesium.sampleTerrainMostDetailed(terrainProvider,[Cesium.Cartographic.fromDegrees(geoPt1.longitude / Math.PI * 180, geoPt1.latitude  / Math.PI * 180)]).then(function(updatedPositions) {
        _this.data.roamingElevation = (updatedPositions[0].height+geoPt1.height).toFixed(2);//漫游高程
        _this.data.terrainHeight = (updatedPositions[0].height).toFixed(2);//地面高程
        _this.data.liftoffHeight = (_this.data.roamingElevation-_this.data.terrainHeight).toFixed(2);//离地距离
      });
      _this.data.progress = (_this.data.roamingLength/_this.data.totalLength*100).toFixed(0)+'%';//进度
    }
    /**
     *计算距离
    */
    _disTance(positions){
      var distance = 0;
      for (var i = 0; i < positions.length - 1; i++) { 
        var point1cartographic = Cesium.Cartographic.fromCartesian(positions[i]);
        var point2cartographic = Cesium.Cartographic.fromCartesian(positions[i+1]);
        /**根据经纬度计算出距离**/
        var geodesic = new Cesium.EllipsoidGeodesic();
        geodesic.setEndPoints(point1cartographic, point2cartographic);
        var s = geodesic.surfaceDistance;
        //返回两点之间的距离
        s = Math.sqrt(Math.pow(s, 2) + Math.pow(point2cartographic.height - point1cartographic.height, 2));	
        // s=Math.abs(point2cartographic.height - point1cartographic.height);	
        distance = distance + s;
      }
      return distance.toFixed(3);
    }
    //将秒转化为时分秒
    _formateSeconds(endTime){
      let secondTime = parseInt(endTime)//将传入的秒的值转化为Number
      let min = 0// 初始化分
      let h =0// 初始化小时
      let result=''
      if(secondTime>=60){//如果秒数大于60，将秒数转换成整数
        min=parseInt(secondTime/60)//获取分钟，除以60取整数，得到整数分钟
        secondTime=parseInt(secondTime%60)//获取秒数，秒数取佘，得到整数秒数
        if(min>=60){//如果分钟大于60，将分钟转换成小时
          h=parseInt(min/60)//获取小时，获取分钟除以60，得到整数小时
          min=parseInt(min%60) //获取小时后取佘的分，获取分钟除以60取佘的分
        }
      }
      h = h.toString()==0?'':h.toString()+'小时';
      min = min.toString() ==0?'':min.toString()+'分钟';
      secondTime = secondTime.toString()==0?'':secondTime.toString()+'秒';
      result=`${h+min+secondTime}`
      return result==''?'0秒':result
    }
}