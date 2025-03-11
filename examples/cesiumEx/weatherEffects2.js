/***
 * @class DEUGlobe.Scene.sceneEffects.weatherEffects
 * @category  场景
 * @classdesc 场景特效-天气特效
 * @param {Object} viewer -  Cesium.viewer。
 * @param {Object} options - 参数。
 * @param {String} options.name - 天气特效名称。
 * @param {String} options.type - 天气特效类型. (snow：雪 ， rain：雨，fog：雾)。
*/
 class weatherEffects{
    constructor(viewer,options){
      this.viewer = viewer;
      var opt = options || {};
      this.name = opt.name;
      this.type = opt.type;
      let stage = this.getStage(), 
      fs = null;
      if(stage == null){
          switch(this.type){
            case "snow":
              fs = this.fs_snow();
            break;
            case "rain":
              fs = this.fs_rain();
            break;
            case "fog":
                fs = this.fs_fog();
            break;
          }
      }
      stage = new Cesium.PostProcessStage({
            name : this.name,
            fragmentShader:fs,
            uniforms : {
              color: Cesium.Color.fromAlpha(Cesium.Color.BLACK, parseFloat(1)),
            }
      });
      viewer.scene.postProcessStages.add(stage);
    }
    removePostProcessStage(){
     let stage =  this.getStage();
      if(stage){
        this.viewer.scene.postProcessStages.remove(stage);
      }
    }
    getStage(){
      let stage = null,
          stages =  this.viewer.scene.postProcessStages;
      for(let i = 0;i<stages._stages.length;i++){
        let tmp = stages.get(i);
        if(tmp != undefined && tmp.name == this.name){
          stage = tmp;
          break;
        }
      }
      return stage;
    }
    fs_snow(){
      return  `
    #version 300 es
    precision highp float;

    uniform sampler2D colorTexture;
    in vec2 v_textureCoordinates;
    out vec4 fragColor;

    float snow(vec2 uv, float scale) {
      float time = float(czm_frameNumber) / 60.0;
      float w = smoothstep(1.0, 0.0, -uv.y * (scale / 10.0));
      if (w < 0.1) return 0.0;
      uv += time / scale;
      uv.y += time * 2.0 / scale;
      uv.x += sin(uv.y + time * 0.5) / scale;
      uv *= scale;
      vec2 s = floor(uv), f = fract(uv), p;
      float k = 3.0, d;
      p = 0.5 + 0.35 * sin(11.0 * fract(sin((s + p + scale) * mat2(7, 3, 6, 5)) * 5.0)) - f;
      d = length(p);
      k = min(d, k);
      k = smoothstep(0.0, k, sin(f.x + f.y) * 0.01);
      return k * w;
    }

    void main() {
      vec2 resolution = czm_viewport.zw;
      vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
      vec3 finalColor = vec3(0.0);
      float c = 0.0;
      c += snow(uv, 30.0) * 0.0;
      c += snow(uv, 20.0) * 0.0;
      c += snow(uv, 15.0) * 0.0;
      c += snow(uv, 10.0);
      c += snow(uv, 8.0);
      c += snow(uv, 6.0);
      c += snow(uv, 5.0);
      finalColor = vec3(c);

      // 调整亮度
      finalColor = finalColor * 1.2; // 提升亮度，可以根据需要调整这个值

      fragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(finalColor, 1.0), 0.2);
    }
  `;
    }
    fs_rain(){
      return   `
      #version 300 es
  
      precision highp float;
  
      uniform sampler2D colorTexture;
      in vec2 v_textureCoordinates;
      out vec4 fragColor;
  
      float hash(float x){
          return fract(sin(x * 133.3) * 13.13);
      }
  
      void main() {
          float time = czm_frameNumber / 60.0;
          vec2 resolution = czm_viewport.zw;
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
          vec3 c = vec3(0.6, 0.7, 0.8);
          float a = -0.4;
          float si = sin(a), co = cos(a);
          uv *= mat2(co, -si, si, co);
          uv *= length(uv + vec2(0.0, 4.9)) * 0.3 + 1.0;
          float v = 1.0 - sin(hash(floor(uv.x * 100.0)) * 2.0);
          float b = clamp(abs(sin(20.0 * time * v + uv.y * (5.0 / (2.0 + v)))) - 0.95, 0.0, 1.0) * 20.0;
          c *= v * b;
  
          fragColor = mix(texture(colorTexture, v_textureCoordinates), vec4(c, 1.0), 0.5);
      }
  `
    }
    fs_fog(){
      return 'uniform sampler2D colorTexture;\n'
          +'  uniform sampler2D depthTexture;\n' 
          +'  in vec2 v_textureCoordinates;\n'
          +'  out vec4 fragColor;\n'
          +'  void main(void)\n'
          +'  {\n'
          +'      vec4 origcolor=texture(colorTexture, v_textureCoordinates);\n'
          +'      vec4 fogcolor=vec4(0.8,0.8,0.8,0.5);\n'
          +'      float depth = czm_readDepth(depthTexture, v_textureCoordinates);\n'
          +'      vec4 depthcolor=texture(depthTexture, v_textureCoordinates);\n'
          +'      float f=(depthcolor.r-0.22)/0.2;\n'
          +'      if(f<0.0) f=0.0;\n'
          +'      else if(f>1.0) f=1.0;\n'
          +'      fragColor = mix(origcolor,fogcolor,0.8);\n'
          +'   }';
    }
}