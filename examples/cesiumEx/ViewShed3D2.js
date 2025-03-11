
class ViewShed3D2 {
    enabled = true;

    size = 2048;

    softShadows = true;

    constructor(options) {
        // TODO: viewer改成_viewer viewPosition改成_viewPosition direction改成_direction
        // TODO: pitch改成_pitch horizontalViewAngle改成_horizontalViewAngle verticalViewAngle改成_verticalViewAngle
        // TODO: visibleAreaColor改成_visibleAreaColor invisibleAreaColor改成_invisibleAreaColor visualRange改成_visualRange
        this.__v_skip = 1
        this.viewer = options.viewer;
        this.viewPosition = options.viewPosition;
        this.direction = options.direction % 360;
        this.pitch = options.pitch || 0;
        this.horizontalViewAngle = options.horizontalViewAngle || 90;
        this.verticalViewAngle = options.verticalViewAngle || 90;
        this.visibleAreaColor = options.visibleAreaColor || Cesium.Color.GREEN;
        this.invisibleAreaColor = options.invisibleAreaColor || Cesium.Color.RED;
        this.visualRange = options.visualRange || 100;
        this.updateViewShed();
    }
    // TODO: createLightCamera改成_createLightCamera 
    createLightCamera() {
        this.lightCamera = new Cesium.Camera(this.viewer.scene);
        this.lightCamera.position = this.viewPosition;
    }

    // 以自定义相机为点光源，声明自定义shadowmap
    // 注意:虽然cesium并不建议修改shadowMap，但是必须将当前场景里的shadowMap替换为自定义的shadowMap，才能得到正确的参数。
    // TODO: createShadowMap改成_createShadowMap 
    createShadowMap() {
        this.shadowMap = new Cesium.ShadowMap({
            context: (this.viewer.scene).context,
            lightCamera: this.lightCamera,
            enabled: this.enabled,
            isPointLight: true,
            pointLightRadius: this.visualRange,
            cascadesEnabled: false,
            size: this.size,
            softShadows: this.softShadows,
            normalOffset: false,
            fromLightSource: false,
        });
        this.viewer.scene.shadowMap = this.shadowMap;
        this.viewer.scene.globe.shadows = Cesium.ShadowMode.ENABLED;
        this.viewer.scene.globe.depthTestAgainstTerrain = true;
    }
    // TODO: updateViewShed改成_updateViewShed 
    updateViewShed() {
        this.clear();
        this.createLightCamera();
        this.setCameraParams();
        this.createShadowMap();
        this.drawSketch()
        this.createPostStage();
        if (this.horizontalViewAngle < 180) {
            this.drawViewCentrum();
        }
    }
    // TODO: drawSketch改成_drawSketch 
    drawSketch() {
        if (this.sketch) {
            this.viewer.entities.remove(this.sketch)
        }
        this.sketch = this.viewer.entities.add({
            name: 'sketch',
            position: this.viewPosition,
            orientation: Cesium.Transforms.headingPitchRollQuaternion(
                this.viewPosition,
                Cesium.HeadingPitchRoll.fromDegrees(this.direction - 90, this.pitch, 0.0)
            ),
            ellipsoid: {
                radii: new Cesium.Cartesian3(
                    this.visualRange,
                    this.visualRange,
                    this.visualRange
                ),
                // innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
                minimumClock: Cesium.Math.toRadians(-this.horizontalViewAngle / 2),
                maximumClock: Cesium.Math.toRadians(this.horizontalViewAngle / 2),
                minimumCone: Cesium.Math.toRadians(-this.verticalViewAngle / 2 + 90),
                maximumCone: Cesium.Math.toRadians(this.verticalViewAngle / 2 + 90),
                fill: false,
                outline: true,
                subdivisions: 256,
                stackPartitions: 64,
                slicePartitions: 64,
                outlineColor: Cesium.Color.YELLOWGREEN
            }
        });
    }
    // 视锥体
    // TODO: drawViewCentrum改成_drawViewCentrum 
    drawViewCentrum() {
        const scratchRight = new Cesium.Cartesian3();
        const scratchRotation = new Cesium.Matrix3();
        const scratchOrientation = new Cesium.Quaternion();
        const direction = this.lightCamera.directionWC;
        const up = this.lightCamera.upWC;
        let right = this.lightCamera.rightWC;
        right = Cesium.Cartesian3.negate(right, scratchRight);

        const rotation = scratchRotation;
        Cesium.Matrix3.setColumn(rotation, 0, right, rotation);
        Cesium.Matrix3.setColumn(rotation, 1, up, rotation);
        Cesium.Matrix3.setColumn(rotation, 2, direction, rotation);

        const orientation = Cesium.Quaternion.fromRotationMatrix(
            rotation,
            scratchOrientation,
        );
        const instanceOutline = new Cesium.GeometryInstance({
            geometry: new Cesium.FrustumOutlineGeometry({
                frustum: this.lightCamera.frustum,
                origin: this.viewPosition,
                orientation,
            }),
            id: `pri${this.viewer.scene.primitives.length + 1}`,
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    new Cesium.Color(0.0, 1.0, 0.0, 1.0),
                ),
                show: new Cesium.ShowGeometryInstanceAttribute(true),
            },
        });
        this.newPrimitive = this.viewer.scene.primitives.add(
            new Cesium.Primitive({
                geometryInstances: instanceOutline,
                appearance: new Cesium.PerInstanceColorAppearance({
                    flat: true,
                }),
            }),
        );
    }

    // 在观察点自定义相机，设置相机的可视椎体范围，方向
    // TODO: setCameraParams改成_setCameraParams 
    setCameraParams() {
        this.lightCamera.frustum.near = 0.001 * this.visualRange;
        this.lightCamera.frustum.far = this.visualRange;
        this.lightCamera.frustum.fov = Cesium.Math.toRadians(Math.max(this.horizontalViewAngle, this.verticalViewAngle));
        this.lightCamera.frustum.aspectRatio = this.horizontalViewAngle / this.verticalViewAngle;
        this.lightCamera.setView({
            destination: this.viewPosition,
            orientation: {
                heading: Cesium.Math.toRadians(this.direction || 0),
                pitch: Cesium.Math.toRadians(this.pitch || 0),
                roll: 0,
            },
        });
    }

    clear() {
        // 椭球体
        if (this.pyramid) {
            this.viewer.entities.removeById(this.pyramid.id);
            this.pyramid = null;
        }

        if (this.cameraPrimitive) {
            this.cameraPrimitive.destroy();
            this.cameraPrimitive = null;
        }
        // 煊染结果
        if (this.postStage) {
            this.viewer.scene.postProcessStages.remove(this.postStage);
            this.postStage = null;
        }

        // 视锥体
        if (this.newPrimitive) {
            this.viewer.scene.primitives.remove(this.newPrimitive);
            this.newPrimitive = null;
        }
        if (this.sketch) {
            this.viewer.entities.remove(this.sketch)
        }
    }

    // TODO: setDirection改成_setDirection 
    setDirection(direction) {
        this.direction = direction % 360;
        this.updateViewShed();
    }

    // TODO: setPitch改成_setPitch 
    setPitch(pitch) {
        this.pitch = pitch;
        this.updateViewShed();
    }
    // TODO: setDirectionDistancePitch改成_setDirectionDistancePitch 
    setDirectionDistancePitch(direction, distance, pitch) {
        this.direction = direction % 360;
        this.visualRange = distance;
        this.pitch = pitch || 0;
        this.updateViewShed();
    }
    // TODO: setVisualRange改成_setVisualRange 
    setVisualRange(visualRange) {
        this.visualRange = visualRange;
        this.updateViewShed();
    }

    // TODO: setHorizontalViewAngle改成_setHorizontalViewAngle 
    setHorizontalViewAngle(hva) {
        this.horizontalViewAngle = hva;
        this.updateViewShed();
    }

    // TODO: setVerticalViewAngle改成_setVerticalViewAngle 
    setVerticalViewAngle(vva) {
        this.verticalViewAngle = vva;
        this.updateViewShed();
    }

    // 根据shadowMap中的数据，实现自定义shader
    /*
       shader中的内容主要是从cesium源码中获取的，这只是简单实现了可视区域和不可视区域不同着色；
       如果要解决锯齿等问题，需要设置softShadows 、normalOffset 等，相应的glsl代码可以在源码Source\Scene\ShadowMapShader.js寻找；
       如果要实现可视区域、不可视区域颜色自由改变，只需要将v_color与inv_color两个变量改为外部传入就可以了。
     */
    // TODO: createPostStage改成_createPostStage 
    createPostStage() {
        const fs = `
    #define USE_CUBE_MAP_SHADOW true
    uniform sampler2D colorTexture;
    // 深度纹理
    uniform sampler2D depthTexture;
    // 纹理坐标
    in vec2 v_textureCoordinates;

    uniform mat4 camera_projection_matrix;

    uniform mat4 camera_view_matrix;
    // 观测距离
    uniform float far;
    //阴影
    uniform samplerCube shadowMap_textureCube;

    uniform mat4 shadowMap_matrix;
    uniform vec4 shadowMap_lightPositionEC;
    uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
    uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;

    struct zx_shadowParameters
    {
        vec3 texCoords;
        float depthBias;
        float depth;
        float nDotL;
        vec2 texelStepSize;
        float normalShadingSmooth;
        float darkness;
    };

    vec3 uvwadd(vec3 uvw,vec2 tar)
    {
        vec2 temp=uvw.xy;
        float w=uvw.z;
        temp+=tar;
        return vec3(temp.x,temp.y,w);
    }
    float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)
    {
        float depthBias = shadowParameters.depthBias;
        float depth = shadowParameters.depth;
        float nDotL = shadowParameters.nDotL;
        float normalShadingSmooth = shadowParameters.normalShadingSmooth;
        float darkness = shadowParameters.darkness;
        vec3 uvw = shadowParameters.texCoords;

        depth -= depthBias;
        vec2 texelStepSize = shadowParameters.texelStepSize;
        float radius = 1.0;
        float dx0 = -texelStepSize.x * radius;
        float dy0 = -texelStepSize.y * radius;
        float dx1 = texelStepSize.x * radius;
        float dy1 = texelStepSize.y * radius;
        float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
        if(visibility==1.0)
          return 1.0;
        visibility=czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx0, dy0)), depth) +
        czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(0.0, dy0)), depth) +
        czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx1, dy0)), depth) +
        czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx0, 0.0)), depth) +
        czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx1, 0.0)), depth) +
        czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(0.0, dy1)), depth) +
        czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx0, dy1)), depth) +
        czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx1, dy1)), depth) ;
        if(visibility>=3.0)
          return 1.0;
        // float visibility =
        // (
        // czm_shadowDepthCompare(shadowMap, uvw, depth)
        // +czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx0, dy0)), depth) +
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx0, dy0)),vec2(dx0, 0.0)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx0, dy0)),vec2(dx0, dy0)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(0.0, dy0)), depth) +
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(0.0, dy0)),vec2(dx0,dy0)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(0.0, dy0)),vec2(0.0, dy0)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx1, dy0)), depth) +
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx1, dy0)),vec2(dx1,dy0)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx1, dy0)),vec2(0.0, dy0)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx0, 0.0)), depth) +
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx0, 0.0)),vec2(dx0,0.0)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx0, 0.0)),vec2(dx0, dy0)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx1, 0.0)), depth) +
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx1, 0.0)),vec2(dx1, 0.0)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx1, 0.0)),vec2(dx1, dy1)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(0.0, dy1)), depth) +
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(0.0, dy1)),vec2(0.0, dy1)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(0.0, dy1)),vec2(dx1, dy1)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx0, dy1)), depth) +
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx0, dy1)),vec2(dx0, dy1)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx0, dy1)),vec2(0.0, dy1)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvw,vec2(dx1, dy1)), depth) +
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx1, dy1)),vec2(dx1, dy1)), depth)+
        // czm_shadowDepthCompare(shadowMap, uvwadd(uvwadd(uvw,vec2(dx1, dy1)),vec2(dx1, 0.0)), depth)
        // ) * (1.0 /25.0)
        // ;
        return 0.0;
        // float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
        // return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
    }

    vec4 getPositionEC(){
      return czm_windowToEyeCoordinates(gl_FragCoord);
    }

    vec3 getNormalEC(){
      return vec3(1.);
    }

    vec4 toEye(in vec2 uv,in float depth){
      vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));
      vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);
      posInCamera=posInCamera/posInCamera.w;
      return posInCamera;
    }

    vec3 pointProjectOnPlane(in vec3 planeNormal,in vec3 planeOrigin,in vec3 point){
      vec3 v01=point-planeOrigin;
      float d=dot(planeNormal,v01);
      return(point-planeNormal*d);
    }

    float getDepth(in vec4 depth){
      float z_window=czm_unpackDepth(depth);
      z_window=czm_reverseLogDepth(z_window);
      float n_range=czm_depthRange.near;
      float f_range=czm_depthRange.far;
      return(2.*z_window-n_range-f_range)/(f_range-n_range);
    }

    float shadow( in vec4 positionEC ){
      vec3 normalEC=getNormalEC();
      zx_shadowParameters shadowParameters;
      shadowParameters.texelStepSize=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.xy;
      shadowParameters.depthBias=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.z;
      shadowParameters.normalShadingSmooth=shadowMap_texelSizeDepthBiasAndNormalShadingSmooth.w;
      shadowParameters.darkness=shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness.w;
      vec3 directionEC=positionEC.xyz-shadowMap_lightPositionEC.xyz;
      float distance=length(directionEC);
      directionEC=normalize(directionEC);
      float radius=shadowMap_lightPositionEC.w;
      if(distance>radius)
      {
        return 2.0;
      }
      vec3 directionWC=czm_inverseViewRotation*directionEC;

      shadowParameters.depth=distance/radius-0.0003;
      shadowParameters.nDotL=clamp(dot(normalEC,-directionEC),0.,1.);

      shadowParameters.texCoords=directionWC;
      float visibility=czm_shadowVisibility(shadowMap_textureCube,shadowParameters);
      return visibility;
    }

    bool visible(in vec4 result)
    {
      result.x/=result.w;
      result.y/=result.w;
      result.z/=result.w;
      return result.x>=-1.&&result.x<=1.&&result.y>=-1.&&result.y<=1.&&result.z>=-1.&&result.z<=1.;
    }
    out vec4 fragColor;
    void main(){
      // 得到釉色 = 结构二维(彩色纹理,纹理坐标)
      fragColor=texture(colorTexture,v_textureCoordinates);
      // 深度 = (釉色 = 结构二维(深度纹理,纹理坐标))
      float depth=getDepth(texture(depthTexture,v_textureCoordinates));
      // 视角 = (纹理坐标,深度)
      vec4 viewPos=toEye(v_textureCoordinates,depth);
      //世界坐标
      vec4 wordPos=czm_inverseView*viewPos;
      // 虚拟相机中坐标
      vec4 vcPos=camera_view_matrix*wordPos;
      float near=.001*far;
      float dis=length(vcPos.xyz);
      if(dis>near&&dis<far){
        //透视投影
        vec4 posInEye=camera_projection_matrix*vcPos;
        // 可视区颜色
        vec4 v_color=vec4(0.,1.,0.,.5);
        vec4 inv_color=vec4(1.,0.,0.,.5);
        if(visible(posInEye)){
          float vis=shadow(viewPos);
          if(vis>=0.3){
            fragColor=mix(fragColor,vec4(0.,1.,0.0,.5),.5);
            // if(vis==(4.0/9.0))
            // {
            //     fragColor=vec4(0.,1.,1,.5);
            // }else if(vis==(5.0/9.0))
            // {
            //     fragColor=vec4(1.,1.,0.0,.5);
            // }else
            // {
            //     fragColor=mix(fragColor,v_color,.5);
            // }
          } else {
            fragColor=mix(fragColor,vec4(1.,0.,0.0,.5),.5);
          }
        }
      }
    }`;
        const postStage = new Cesium.PostProcessStage({
            fragmentShader: fs,
            uniforms: {
                camera_projection_matrix: this.lightCamera.frustum.projectionMatrix,
                camera_view_matrix: this.lightCamera.viewMatrix,
                far: () => this.visualRange,
                shadowMap_textureCube: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'));
                    return Reflect.get(this.shadowMap, '_shadowMapTexture');
                },
                shadowMap_matrix: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'));
                    return Reflect.get(this.shadowMap, '_shadowMapMatrix');
                },
                shadowMap_lightPositionEC: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'));
                    return Reflect.get(this.shadowMap, '_lightPositionEC');
                },
                shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'));
                    const bias = this.shadowMap._pointBias;
                    return Cesium.Cartesian4.fromElements(
                        bias.normalOffsetScale,
                        this.shadowMap._distance,
                        this.shadowMap.maximumDistance,
                        0.0,
                        new Cesium.Cartesian4(),
                    );
                },
                shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, '_frameState'));
                    const bias = this.shadowMap._pointBias;
                    const scratchTexelStepSize = new Cesium.Cartesian2();
                    const texelStepSize = scratchTexelStepSize;
                    texelStepSize.x = 1.0 / this.shadowMap._textureSize.x;
                    texelStepSize.y = 1.0 / this.shadowMap._textureSize.y;

                    return Cesium.Cartesian4.fromElements(
                        texelStepSize.x,
                        texelStepSize.y,
                        bias.depthBias,
                        bias.normalShadingSmooth,
                        new Cesium.Cartesian4(),
                    );
                },
            },
        });
        this.postStage = this.viewer.scene.postProcessStages.add(postStage);
    }
}
