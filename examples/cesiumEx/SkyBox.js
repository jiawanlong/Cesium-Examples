/**
 * @class DEUGlobe.Scene.SkyBox
 * @category  场景
 * @classdesc 天空盒
 * @param {Object} viewer - Cesium.Viewer。
 */

 class SkyBox {
    constructor(viewer){
      this.viewer=viewer;
      this.sources = {};
    }
    /**
   * @class DEUGlobe.Scene.SkyBox.customSkyBox
   * @classdesc 天空盒
   * @param {Object} sources  - 天空盒来源 (必选)。
   */
    customSkyBox(sources){
      this.viewer.scene.skyBox= new Cesium.SkyBox({
        sources:sources
      })
    }
     /**
   * @class DEUGlobe.Scene.SkyBox.SkyBoxOnGround
   * @classdesc 近地天空盒
    * @param {Object} options - 参数。
   * @param {Object} sources  - 天空盒来源 (必选)。
    * @param {boolean} options.height  - 离地高度（只有在近地天空盒有效 默认值：225705）。
   */
    SkyBoxOnGround(options){
      var _this = this;
      var height = !options.height?'225705':options.height;
      var defaultSkyBox = _this.viewer.scene.skyBox;
      var currentSkyBox = new SkyBoxOnGround({sources:options.sources});
        //注册一个在事件引发时执行的回调函数
        _this.viewer.scene.postRender.addEventListener(()=>{
          var e = _this.viewer.camera.position;
          //判断当前视高
          if(Cesium.Cartographic.fromCartesian(e).height<height){
            // 显示自定义的天空盒
            _this.viewer.scene.skyBox = currentSkyBox;
            _this.viewer.scene.skyAtmosphere.show=false;
          }else{
            //默认天空盒
            _this.viewer.scene.skyBox = defaultSkyBox;
            _this.viewer.scene.skyAtmosphere.show=true;
          }
      })
    }
  }