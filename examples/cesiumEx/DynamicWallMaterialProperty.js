function map_common_addDatasouce(datasouceName) {
    let datasouce = viewer.dataSources._dataSources.find(t => {
      return t && t.name == datasouceName;
    });
    if (!datasouce) {
      datasouce = new Cesium.CustomDataSource(datasouceName);
      viewer.dataSources.add(datasouce);
    }
    return datasouce;
  }
  /*
      动态墙材质
      color 颜色
      duration 持续时间 毫秒
      trailImage 贴图地址
  */
  function DynamicWallMaterialProperty(options) {
    this._definitionChanged = new Cesium.Event();
    this._color = undefined;
    this._colorSubscription = undefined;
    this.color = options.color || Color.BLUE;
    this.duration = options.duration || 1000;
    this.trailImage = options.trailImage;
    this._time = (new Date()).getTime();
  }

  /**
   * 带方向的墙体
   * @param {*} options.get:true/false
   * @param {*} options.count:数量 
   * @param {*} options.freely:vertical/standard
   * @param {*} options.direction:+/-
   */
  function _getDirectionWallShader(options) {
    if (options && options.get) {
      var materail = "czm_material czm_getMaterial(czm_materialInput materialInput)\n\
    {\n\
        czm_material material = czm_getDefaultMaterial(materialInput);\n\
        vec2 st = materialInput.st;";
      if (options.freely == "vertical") { //（由下到上）
        materail += "vec4 colorImage = texture(image, vec2(fract(st.s), fract(float(" + options.count + ")*st.t" + options.direction + " time)));\n\ ";
      } else { //（逆时针）
        materail += "vec4 colorImage = texture(image, vec2(fract(float(" + options.count + ")*st.s " + options.direction + " time), fract(st.t)));\n\ ";
      }
      //泛光
      materail += "vec4 fragColor;\n\
        fragColor.rgb = (colorImage.rgb+color.rgb) / 1.0;\n\
        fragColor = czm_gammaCorrect(fragColor);\n\
        material.diffuse = colorImage.rgb;\n\
        material.alpha = colorImage.a;\n\
        material.emission = fragColor.rgb;\n\
        return material;\n\
    }";
      return materail
    }
  }

  Object.defineProperties(DynamicWallMaterialProperty.prototype, {
    isConstant: {
      get: function () {
        return false;
      }
    },
    definitionChanged: {
      get: function () {
        return this._definitionChanged;
      }
    },
    color: Cesium.createPropertyDescriptor('color')
  });

  var MaterialType = 'wallType' + parseInt(Math.random() * 1000);
  DynamicWallMaterialProperty.prototype.getType = function (time) {
    return MaterialType;
  };

  DynamicWallMaterialProperty.prototype.getValue = function (time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    result.color = Cesium.Property.getValueOrClonedDefault(this._color, time, Cesium.Color.WHITE, result.color);
    result.image = this.trailImage;
    if (this.duration) {
      result.time = (((new Date()).getTime() - this._time) % this.duration) / this.duration;
    }
    viewer.scene.requestRender();
    return result;
  };

  DynamicWallMaterialProperty.prototype.equals = function (other) {
    return this === other ||
      (other instanceof DynamicWallMaterialProperty
        && Cesium.Property.equals(this._color, other._color))
  };

  Cesium.Material._materialCache.addMaterial(MaterialType, {
    fabric: {
      type: MaterialType,
      uniforms: {
        color: new Cesium.Color(1.0, 0.0, 0.0, 0.1),
        image: Cesium.Material.DefaultImageId,
        time: -20
      },
      source: _getDirectionWallShader({
        get: true,
        count: 2.0,
        freely: 'vertical',
        direction: '-'
      })
    },
    translucent: function (material) {
      return true;
    }
  });
  Cesium.DynamicWallMaterialProperty = DynamicWallMaterialProperty;