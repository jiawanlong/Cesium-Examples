/**
 * 可视域分析。
 *
 * @author Helsing
 * @date 2020/08/28
 * @alias viewshed
 * @class
 * @param {Cesium.Viewer} viewer Cesium三维视窗。
 * @param {Object} options 选项。
 * @param {Cesium.Cartesian3} options.viewPosition 观测点位置。
 * @param {Cesium.Cartesian3} options.viewPositionEnd 最远观测点位置（如果设置了观测距离，这个属性可以不设置）。
 * @param {Number} options.viewDistance 观测距离（单位`米`，默认值100）。
 * @param {Number} options.viewHeading 航向角（单位`度`，默认值0）。
 * @param {Number} options.viewPitch 俯仰角（单位`度`，默认值0）。
 * @param {Number} options.horizontalViewAngle 可视域水平夹角（单位`度`，默认值90）。
 * @param {Number} options.verticalViewAngle 可视域垂直夹角（单位`度`，默认值60）。
 * @param {Cesium.Color} options.visibleAreaColor 可视区域颜色（默认值`绿色`）。
 * @param {Cesium.Color} options.invisibleAreaColor 不可视区域颜色（默认值`红色`）。
 * @param {Boolean} options.enabled 阴影贴图是否可用。
 * @param {Boolean} options.softShadows 是否启用柔和阴影。
 * @param {Boolean} options.size 每个阴影贴图的大小。
 */

class viewshed extends analyser {
    constructor(viewer, options) {
        super(viewer);
        this.viewer = viewer;
        this.viewPosition = options.viewPosition;
        this.viewPositionEnd = options.viewPositionEnd;
        this.viewDistance = this.viewPositionEnd ? Cesium.Cartesian3.distance(this.viewPosition, this.viewPositionEnd) : (options.viewDistance || 100.0);
        this.viewHeading = this.viewPositionEnd ? getHeading(this.viewPosition, this.viewPositionEnd) : (options.viewHeading || 0.0);
        this.viewPitch = this.viewPositionEnd ? getPitch(this.viewPosition, this.viewPositionEnd) : (options.viewPitch || 0.0);
        this.horizontalViewAngle = options.horizontalViewAngle || 90.0;
        this.verticalViewAngle = options.verticalViewAngle || 60.0;
        this.visibleAreaColor = options.visibleAreaColor || Cesium.Color.GREEN;
        this.invisibleAreaColor = options.invisibleAreaColor || Cesium.Color.RED;
        this.enabled = (typeof options.enabled === "boolean") ? options.enabled : true;
        this.softShadows = (typeof options.softShadows === "boolean") ? options.softShadows : true;
        this.size = options.size || 2048;

        this.options = options;
        this.id = Cesium.createGuid();
        this._resultTip = this.viewer.entities.add({
            id: this.id,
            label: {
                fillColor: Cesium.Color.YELLOW,
                showBackground: true,
                font: '14px monospace',
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                pixelOffset: new Cesium.Cartesian2(0, -10)
            }
        });
        this.posArray = [];
        this._markers = [];
        this.state = this.BEYONANALYSER_STATE.PREPARE;

        this.action();
    }

    action() {
        let _self = this;
        var ellipsoid = this.viewer.scene.globe.ellipsoid;
        _self.handler.setInputAction(function (movement) {
            var cartesian = latlng.getCurrentMousePosition(_self.viewer.scene, movement.position);

            if (_self._markers.length == 0) {
				var temp1 = Cesium.Cartographic.fromCartesian( cartesian );
				var h1 ;
				if (_self.options.qdOffset) {
					h1 = temp1.height + _self.options.qdOffset
				}else{
					h1 = temp1.height + 1;
				}
				var cartographictemp = Cesium.Cartographic.fromDegrees( temp1.longitude / Math.PI * 180, temp1.latitude / Math.PI * 180, h1);
				cartesian = ellipsoid.cartographicToCartesian(cartographictemp);
			} else if (_self._markers.length == 1) {
				var temp1 = Cesium.Cartographic.fromCartesian( cartesian );
				var h1 ;
				if (_self.options.zdOffset) {
					h1 = temp1.height + _self.options.qdOffset
				}else{
					h1 = temp1.height + 1;
				}
				var cartographictemp = Cesium.Cartographic.fromDegrees( temp1.longitude / Math.PI * 180, temp1.latitude / Math.PI * 180, h1);
				cartesian = ellipsoid.cartographicToCartesian(cartographictemp);
			}


            if (!cartesian) {
                return;
            }

            _self.posArray.push(cartesian);
            if (_self._markers.length == 0) {
                var startSphere = _self.viewer.entities.add({
                    position: cartesian,
                    ellipsoid: {
                        radii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
                        material: Cesium.Color.BLUE
                    },
                    label: {
                        text: "视线起点",
                        fillColor: Cesium.Color.YELLOW,
                        pixelOffset: {
                            x: 0,
                            y: -20
                        },
                        scale: 0.5
                    }
                });
                _self._markers.push(startSphere);
                _self.state = _self.BEYONANALYSER_STATE.OPERATING;
            } else if (_self._markers.length == 1) {
                var redSphere = _self.viewer.entities.add({
                    position: cartesian,
                    ellipsoid: {
                        radii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
                        material: Cesium.Color.RED
                    },
                    label: {
                        text: "视线终点",
                        fillColor: Cesium.Color.YELLOW,
                        pixelOffset: {
                            x: 0,
                            y: -20
                        },
                        scale: 0.5
                    }
                });
                _self._markers.push(redSphere);

                _self.viewPosition = _self.posArray[0];
                _self.viewPositionEnd = cartesian;
                _self.viewDistance = _self.viewPositionEnd ? Cesium.Cartesian3.distance(_self.viewPosition, _self.viewPositionEnd) : (_self.options.viewDistance || 100.0);
                _self.viewHeading = _self.viewPositionEnd ? getHeading(_self.viewPosition, _self.viewPositionEnd) : (_self.options.viewHeading || 0.0);
                _self.viewPitch = _self.viewPositionEnd ? getPitch(_self.viewPosition, _self.viewPositionEnd) : (_self.options.viewPitch || 0.0);

                _self.state = _self.BEYONANALYSER_STATE.END;
                _self.handler.destroy();
                _self.handler = null;

                _self.remove();
                _self.update();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
        //移动
        var info;
        _self.handler.setInputAction(function (movement) {
            var cartesian = _self.viewer.scene.pickPosition(movement.endPosition);
            if (_self.state === _self.BEYONANALYSER_STATE.PREPARE) {
                info = '点击设定起点';
                _self.showTip(_self._resultTip, true, cartesian, info);
            } else if (_self.state === _self.BEYONANALYSER_STATE.OPERATING) {
                info = '点击设定终点';
                _self.showTip(_self._resultTip, true, cartesian, info);
            }
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
    }

    remove() {
        if (this._markers.length == 0) {
            return false;
        }

        for (let index = 0; index < this._markers.length; index++) {
            var element = this._markers[index];
            this.viewer.entities.remove(element);
        }
        this._markers.length = 0;

        this.viewer.entities.remove(this._resultTip);
        this._resultTip = undefined;
    }

    add() {
        this.createLightCamera();
        this.createShadowMap();
        this.createPostStage();
        this.drawFrustumOutline();
        this.drawSketch();
    }

    update() {
        this.clear();
        this.add();
    }

    clear() {
        if (this.sketch) {
            this.viewer.entities.removeById(this.sketch.id);
            this.sketch = null;
        }
        if (this.frustumOutline) {
            this.frustumOutline.destroy();
            this.frustumOutline = null;
        }
        if (this.postStage) {
            this.viewer.scene.postProcessStages.remove(this.postStage);
            this.postStage = null;
        }
    }

    //创建相机
    createLightCamera() {
        this.lightCamera = new Cesium.Camera(this.viewer.scene);
        this.lightCamera.position = this.viewPosition;
        // if (this.viewPositionEnd) {
        //     let direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(this.viewPositionEnd, this.viewPosition, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        //     this.lightCamera.direction = direction; // direction是相机面向的方向
        // }
        this.lightCamera.frustum.near = this.viewDistance * 0.001;
        this.lightCamera.frustum.far = this.viewDistance;
        const hr = Cesium.Math.toRadians(this.horizontalViewAngle);
        const vr = Cesium.Math.toRadians(this.verticalViewAngle);
        const aspectRatio =
            (this.viewDistance * Math.tan(hr / 2) * 2) /
            (this.viewDistance * Math.tan(vr / 2) * 2);
        this.lightCamera.frustum.aspectRatio = aspectRatio;
        if (hr > vr) {
            this.lightCamera.frustum.fov = hr;
        } else {
            this.lightCamera.frustum.fov = vr;
        }
        this.lightCamera.setView({
            destination: this.viewPosition,
            orientation: {
                heading: Cesium.Math.toRadians(this.viewHeading || 0),
                pitch: Cesium.Math.toRadians(this.viewPitch || 0),
                roll: 0
            }
        });
    }

    //创建阴影贴图
    createShadowMap() {
        this.shadowMap = new Cesium.ShadowMap({
            context: (this.viewer.scene).context,
            lightCamera: this.lightCamera,
            enabled: this.enabled,
            isPointLight: true,
            pointLightRadius: this.viewDistance,
            cascadesEnabled: false,
            size: this.size,
            softShadows: this.softShadows,
            normalOffset: false,
            fromLightSource: false,
        });
        this.viewer.scene.shadowMap = this.shadowMap;
        // 启用地形阴影
        this.viewer.scene.globe.shadows = Cesium.ShadowMode.ENABLED;
    }

    //创建PostStage
    createPostStage() {
        const fs = `
        #define USE_CUBE_MAP_SHADOW true
        uniform sampler2D colorTexture;
        uniform sampler2D depthTexture;
        varying vec2 v_textureCoordinates;
        uniform mat4 camera_projection_matrix;
        uniform mat4 camera_view_matrix;
        uniform samplerCube shadowMap_textureCube;
        uniform mat4 shadowMap_matrix;
        uniform vec4 shadowMap_lightPositionEC;
        uniform vec4 shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness;
        uniform vec4 shadowMap_texelSizeDepthBiasAndNormalShadingSmooth;
        uniform float helsing_viewDistance; 
        uniform vec4 helsing_visibleAreaColor;
        uniform vec4 helsing_invisibleAreaColor;
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
        float czm_shadowVisibility(samplerCube shadowMap, zx_shadowParameters shadowParameters)
        {
            float depthBias = shadowParameters.depthBias;
            float depth = shadowParameters.depth;
            float nDotL = shadowParameters.nDotL;
            float normalShadingSmooth = shadowParameters.normalShadingSmooth;
            float darkness = shadowParameters.darkness;
            vec3 uvw = shadowParameters.texCoords;
            depth -= depthBias;
            float visibility = czm_shadowDepthCompare(shadowMap, uvw, depth);
            return czm_private_shadowVisibility(visibility, nDotL, normalShadingSmooth, darkness);
        }
        vec4 getPositionEC(){
            return czm_windowToEyeCoordinates(gl_FragCoord);
        }
        vec3 getNormalEC(){
            return vec3(1.);
        }
        vec4 toEye( vec2 uv, float depth){
            vec2 xy=vec2((uv.x*2.-1.),(uv.y*2.-1.));
            vec4 posInCamera=czm_inverseProjection*vec4(xy,depth,1.);
            posInCamera=posInCamera/posInCamera.w;
            return posInCamera;
        }
        vec3 pointProjectOnPlane( vec3 planeNormal, vec3 planeOrigin, vec3 point){
            vec3 v01=point-planeOrigin;
            float d=dot(planeNormal,v01);
            return(point-planeNormal*d);
        }
        float getDepth( vec4 depth){
            float z_window=czm_unpackDepth(depth);
            z_window=czm_reverseLogDepth(z_window);
            float n_range=czm_depthRange.near;
            float f_range=czm_depthRange.far;
            return(2.*z_window-n_range-f_range)/(f_range-n_range);
        }
        float shadow( vec4 positionEC){
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
        bool visible( vec4 result)
        {
            result.x/=result.w;
            result.y/=result.w;
            result.z/=result.w;
            return result.x>=-1.&&result.x<=1.
            &&result.y>=-1.&&result.y<=1.
            &&result.z>=-1.&&result.z<=1.;
        }
        void main(){
            // 釉色 = 结构二维(颜色纹理, 纹理坐标)
            gl_FragColor = texture2D(colorTexture, v_textureCoordinates);
            // 深度 = 获取深度(结构二维(深度纹理, 纹理坐标))
            float depth = getDepth(texture2D(depthTexture, v_textureCoordinates));
            // 视角 = (纹理坐标, 深度)
            vec4 viewPos = toEye(v_textureCoordinates, depth);
            // 世界坐标
            vec4 wordPos = czm_inverseView * viewPos;
            // 虚拟相机中坐标
            vec4 vcPos = camera_view_matrix * wordPos;
            float near = .001 * helsing_viewDistance;
            float dis = length(vcPos.xyz);
            if(dis > near && dis < helsing_viewDistance){
                // 透视投影
                vec4 posInEye = camera_projection_matrix * vcPos;
                // 可视区颜色
                // vec4 helsing_visibleAreaColor=vec4(0.,1.,0.,.5);
                // vec4 helsing_invisibleAreaColor=vec4(1.,0.,0.,.5);
                if(visible(posInEye)){
                    float vis = shadow(viewPos);
                    if(vis > 0.3){
                        gl_FragColor = mix(gl_FragColor,helsing_visibleAreaColor,.5);
                    } else{
                        gl_FragColor = mix(gl_FragColor,helsing_invisibleAreaColor,.5);
                    }
                }
            }
        }`;
        const postStage = new Cesium.PostProcessStage({
            fragmentShader: fs,
            uniforms: {
                shadowMap_textureCube: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                    return Reflect.get(this.shadowMap, "_shadowMapTexture");
                },
                shadowMap_matrix: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                    return Reflect.get(this.shadowMap, "_shadowMapMatrix");
                },
                shadowMap_lightPositionEC: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                    return Reflect.get(this.shadowMap, "_lightPositionEC");
                },
                shadowMap_normalOffsetScaleDistanceMaxDistanceAndDarkness: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
                    const bias = this.shadowMap._pointBias;
                    return Cesium.Cartesian4.fromElements(
                        bias.normalOffsetScale,
                        this.shadowMap._distance,
                        this.shadowMap.maximumDistance,
                        0.0,
                        new Cesium.Cartesian4()
                    );
                },
                shadowMap_texelSizeDepthBiasAndNormalShadingSmooth: () => {
                    this.shadowMap.update(Reflect.get(this.viewer.scene, "_frameState"));
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
                        new Cesium.Cartesian4()
                    );
                },
                camera_projection_matrix: this.lightCamera.frustum.projectionMatrix,
                camera_view_matrix: this.lightCamera.viewMatrix,
                helsing_viewDistance: () => {
                    return this.viewDistance;
                },
                helsing_visibleAreaColor: this.visibleAreaColor,
                helsing_invisibleAreaColor: this.invisibleAreaColor,
            }
        });
        this.postStage = this.viewer.scene.postProcessStages.add(postStage);
    }

    //创建视锥线
    drawFrustumOutline() {
        const scratchRight = new Cesium.Cartesian3();
        const scratchRotation = new Cesium.Matrix3();
        const scratchOrientation = new Cesium.Quaternion();
        const position = this.lightCamera.positionWC;
        const direction = this.lightCamera.directionWC;
        const up = this.lightCamera.upWC;
        let right = this.lightCamera.rightWC;
        right = Cesium.Cartesian3.negate(right, scratchRight);
        let rotation = scratchRotation;
        Cesium.Matrix3.setColumn(rotation, 0, right, rotation);
        Cesium.Matrix3.setColumn(rotation, 1, up, rotation);
        Cesium.Matrix3.setColumn(rotation, 2, direction, rotation);
        let orientation = Cesium.Quaternion.fromRotationMatrix(rotation, scratchOrientation);

        let instance = new Cesium.GeometryInstance({
            geometry: new Cesium.FrustumOutlineGeometry({
                frustum: this.lightCamera.frustum,
                origin: this.viewPosition,
                orientation: orientation
            }),
            id: Math.random().toString(36).substr(2),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(
                    Cesium.Color.YELLOWGREEN //new Cesium.Color(0.0, 1.0, 0.0, 1.0)
                ),
                show: new Cesium.ShowGeometryInstanceAttribute(true)
            }
        });

        this.frustumOutline = this.viewer.scene.primitives.add(
            new Cesium.Primitive({
                geometryInstances: [instance],
                appearance: new Cesium.PerInstanceColorAppearance({
                    flat: true,
                    translucent: false
                })
            })
        );
    }

    //创建视网
    drawSketch() {
        this.sketch = this.viewer.entities.add({
            name: 'sketch',
            position: this.viewPosition,
            orientation: Cesium.Transforms.headingPitchRollQuaternion(
                this.viewPosition,
                Cesium.HeadingPitchRoll.fromDegrees(this.viewHeading - this.horizontalViewAngle, this.viewPitch, 0.0)
            ),
            ellipsoid: {
                radii: new Cesium.Cartesian3(
                    this.viewDistance,
                    this.viewDistance,
                    this.viewDistance
                ),
                // innerRadii: new Cesium.Cartesian3(2.0, 2.0, 2.0),
                minimumClock: Cesium.Math.toRadians(-this.horizontalViewAngle / 2),
                maximumClock: Cesium.Math.toRadians(this.horizontalViewAngle / 2),
                minimumCone: Cesium.Math.toRadians(this.verticalViewAngle + 7.75),
                maximumCone: Cesium.Math.toRadians(180 - this.verticalViewAngle - 7.75),
                fill: false,
                outline: true,
                subdivisions: 256,
                stackPartitions: 64,
                slicePartitions: 64,
                outlineColor: Cesium.Color.YELLOWGREEN
            }
        });
    }
}

//获取偏航角
function getHeading(fromPosition, toPosition) {
    let finalPosition = new Cesium.Cartesian3();
    let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
    Cesium.Matrix4.inverse(matrix4, matrix4);
    Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
    Cesium.Cartesian3.normalize(finalPosition, finalPosition);
    return Cesium.Math.toDegrees(Math.atan2(finalPosition.x, finalPosition.y));
}

//获取俯仰角
function getPitch(fromPosition, toPosition) {
    let finalPosition = new Cesium.Cartesian3();
    let matrix4 = Cesium.Transforms.eastNorthUpToFixedFrame(fromPosition);
    Cesium.Matrix4.inverse(matrix4, matrix4);
    Cesium.Matrix4.multiplyByPoint(matrix4, toPosition, finalPosition);
    Cesium.Cartesian3.normalize(finalPosition, finalPosition);
    return Cesium.Math.toDegrees(Math.asin(finalPosition.z));
}
