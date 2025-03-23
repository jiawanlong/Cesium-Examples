/**
 */
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMzU2ZTQyYy1iOTU5LTQ5MDQtOGNkNC0yYzcxMTI1ZDJiZGQiLCJpZCI6NzY1OTcsImlhdCI6MTYzOTU2MDcwOH0.kbWigipGD6l2OPBGpnkkN6dzp8NuNjoHNNM1NF4gaIo';
let viewer;
let imagerLayer;
let building;
let model0;
let model1;
let model2;
let model3;
let waterPrimitive;
/**
 * 自定义材质线 github:cesium-materialLine
 * @param {*} options 
 * @returns 
 */
function CustomMaterialLine(options) {
    let Color = Cesium.Color,
        defaultValue = Cesium.defaultValue,
        defined = Cesium.defined,
        defineProperties = Object.defineProperties,
        Event = Cesium.Event,
        createPropertyDescriptor = Cesium.createPropertyDescriptor,
        Property = Cesium.Property,
        Material = Cesium.Material,
        defaultColor = Color.WHITE,
        currentTime = window.performance.now(),
        MaterialType = options.MaterialType || 'wallType' + parseInt(Math.random() * 1000);
    function PolylineCustomMaterialProperty(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);
        this._definitionChanged = new Event();
        this._color = undefined;
        this._colorSubscription = undefined;
        this.color = options.color || Cesium.Color.BLUE;
        this.duration = options.duration || 1000;
        this._time = currentTime;
    }
    defineProperties(PolylineCustomMaterialProperty.prototype, {
        isvarant: {
            get: function () {
                return false;
            }
        },
        definitionChanged: {
            get: function () {
                return this._definitionChanged;
            }
        },
        color: createPropertyDescriptor('color')
    });
    PolylineCustomMaterialProperty.prototype.getType = function (time) {
        return MaterialType;
    };
    PolylineCustomMaterialProperty.prototype.getValue = function (time, result) {
        if (!defined(result)) {
            result = {};
        }
        result.color = Property.getValueOrClonedDefault(this._color, time, defaultColor, result.color);
        result.image = options.image;
        result.time = ((window.performance.now() - this._time) % this.duration) / this.duration;
        return result;
    };
    PolylineCustomMaterialProperty.prototype.equals = function (other) {
        return this === other ||
            (other instanceof PolylineCustomMaterialProperty &&
                Property.equals(this._color, other._color));
    };
    Material._materialCache.addMaterial(MaterialType, {
        fabric: {
            type: MaterialType,
            uniforms: {
                color: options.color || new Cesium.Color(1.0, 0.0, 0.0, 0.5),
                image: options.image,
                time: 0
            },
            source: `czm_material czm_getMaterial(czm_materialInput materialInput)
                {
                    czm_material material = czm_getDefaultMaterial(materialInput);
                    vec2 st = materialInput.st;
                    if(texture(image, vec2(0.0, 0.0)).a == 1.0){
                        discard;
                    }else{
                        material.alpha = texture(image, vec2(1.0 - fract(time - st.s), st.t)).a * color.a;
                    }
                    material.diffuse = max(color.rgb * material.alpha * 3.0, color.rgb);
                    return material;
                }
                `,
        },
        translucent: function (material) {
            return true;
        }
    })
    return new PolylineCustomMaterialProperty(options);
}

/**
 * 初始化viewer
 */
const initViewer = () => {
    viewer = new Cesium.Viewer('map', {
        infoBox: false,
        shouldAnimate: false,
        vrButton: false,
        geocoder: false,
        homeButton: false,
        sceneModePicker: false,
        baseLayerPicker: false,
        navigationHelpButton: false,
        animation: false,
        timeline: true,
        fullscreenButton: false,
        terrainProvider: Cesium.createWorldTerrain({
            requestWaterMask: true,
            requestVertexNormals: true,
        }),
        contextOptions: {
            requestWebgl1: false,
            allowTextureFilterAnisotropic: true,
            webgl: {
                alpha: false,
                depth: true,
                stencil: false,
                antialias: true,
                powerPreference: 'high-performance',
                premultipliedAlpha: true,
                preserveDrawingBuffer: false,
                failIfMajorPerformanceCaveat: false
            },
        },
    });

    viewer._cesiumWidget._creditContainer.style.display = "none";
    viewer.resolutionScale = 1.2;
    viewer.scene.msaaSamples = 4;
    viewer.postProcessStages.fxaa.enabled = true;
    viewer.scene.globe.depthTestAgainstTerrain = true;
    viewer.scene.debugShowFramesPerSecond = true;
    viewer.scene.globe.shadows = Cesium.ShadowMode.ENABLED;

    viewer.shadows = true;
    viewer.shadowMap.size = 2048;
    viewer.shadowMap.softShadows = false;
    viewer.shadowMap.maximumDistance = 4000;

    viewer.scene.globe.enableLighting = true
    viewer.scene.fog.minimumBrightness = 0.5;
    viewer.scene.fog.density = 2.0e-4 * 1.2;
    viewer.scene.globe.atmosphereLightIntensity = 20;
    viewer.scene.globe.atmosphereBrightnessShift = -0.01;

    imagerLayer = viewer.imageryLayers.get(0);

    viewer.scene.postProcessStages.bloom.enabled = false;
    viewer.scene.postProcessStages.bloom.uniforms.contrast = 119;
    viewer.scene.postProcessStages.bloom.uniforms.brightness = -0.4;
    viewer.scene.postProcessStages.bloom.uniforms.glowOnly = false;
    viewer.scene.postProcessStages.bloom.uniforms.delta = 0.9;
    viewer.scene.postProcessStages.bloom.uniforms.sigma = 3.78;
    viewer.scene.postProcessStages.bloom.uniforms.stepSize = 5;
    viewer.scene.postProcessStages.bloom.uniforms.isSelected = false;


    viewer.scene.postProcessStages.ambientOcclusion.enabled = false;
    viewer.scene.postProcessStages.ambientOcclusion.uniforms.intensity = 1.5;
    viewer.scene.postProcessStages.ambientOcclusion.uniforms.bias = 0.4;
    viewer.scene.postProcessStages.ambientOcclusion.uniforms.lengthCap = 0.45;
    viewer.scene.postProcessStages.ambientOcclusion.uniforms.stepSize = 1.8;
    viewer.scene.postProcessStages.ambientOcclusion.uniforms.blurStepSize = 1.0;

    // viewer.scene.screenSpaceCameraController.minimumZoomDistance = 0;
    // viewer.scene.screenSpaceCameraController.maximumZoomDistance = 30000;
}


/**
 * 初始化场景
 */
const initScene = () => {
    const initTiles = () => {
        building = viewer.scene.primitives.add(
            Cesium.createOsmBuildings({
                customShader: new Cesium.CustomShader({
                    uniforms: {
                        u_envTexture: {
                            value: new Cesium.TextureUniform({
                                url: "./Static/images/sky.jpg"
                            }),
                            type: Cesium.UniformType.SAMPLER_2D
                        },
                        u_envTexture2: {
                            value: new Cesium.TextureUniform({
                                url: "./Static/images/pic.jpg"
                            }),
                            type: Cesium.UniformType.SAMPLER_2D
                        },
                        u_isDark: {
                            value: false,
                            type: Cesium.UniformType.BOOL
                        }
                    },
                    mode: Cesium.CustomShaderMode.REPLACE_MATERIAL,
                    lightingModel: Cesium.LightingModel.UNLIT,
                    fragmentShaderText: `
                            void fragmentMain(FragmentInput fsInput,inout czm_modelMaterial material) {
                                vec3 positionMC = fsInput.attributes.positionMC;
                                vec3 positionEC = fsInput.attributes.positionEC;
                                vec3 normalEC = fsInput.attributes.normalEC;
                                vec3 posToCamera = normalize(-positionEC); 
                                vec3 coord = normalize(vec3(czm_inverseViewRotation * reflect(posToCamera, normalEC)));
                                float ambientCoefficient = 0.3;
                                float diffuseCoefficient = max(0.0, dot(normalEC, czm_sunDirectionEC) * 1.0);
                                if(u_isDark){

                                    // dark
                                    vec4 darkRefColor = texture(u_envTexture2, vec2(coord.x, (coord.z - coord.y) / 2.0));
                                    material.diffuse = mix(mix(vec3(0.3), vec3(0.1,0.2,0.4),clamp(positionMC.z / 200., 0.0, 1.0)) , darkRefColor.rgb ,0.3);
                                    material.diffuse *= 0.2;
                                    // 注意shader中写浮点数是 一定要带小数点 否则会报错 比如0需要写成0.0 1要写成1.0
                                    float _baseHeight = 0.0; // 物体的基础高度，需要修改成一个合适的建筑基础高度
                                    float _heightRange = 20.0; // 高亮的范围(_baseHeight ~ _baseHeight + _heightRange)
                                    float _glowRange = 300.0; // 光环的移动范围(高度)
                                    // 建筑基础色
                                    float czm_height = positionMC.z - _baseHeight;
                                    float czm_a11 = fract(czm_frameNumber / 120.0) * 3.14159265 * 2.0;
                                    float czm_a12 = czm_height / _heightRange + sin(czm_a11) * 0.1;
        
                                    float times = czm_frameNumber / 60.0;
                                    material.diffuse *= vec3(czm_a12);// 渐变
                                    // 动态光环
                                    float time = fract(czm_frameNumber / 360.0);
                                    time = abs(time - 0.5) * 2.0;
                                    float czm_h = clamp(czm_height / _glowRange, 0.0, 1.0);
                                    float czm_diff = step(0.005, abs(czm_h - time));
                                    material.diffuse += material.diffuse * (1.0 - czm_diff);
                                } else {

                                    // day
                                    vec4 dayRefColor = texture(u_envTexture, vec2(coord.x, (coord.z - coord.y) / 3.0));
                                    material.diffuse = mix(mix(vec3(0.000), vec3(0.5),clamp(positionMC.z / 300., 0.0, 1.0)) , dayRefColor.rgb ,0.3);
                                    material.diffuse *= min(diffuseCoefficient + ambientCoefficient, 1.0);
                                }
                                material.alpha = 1.0;
                            }
                             `
                })
            })
        );
        model0 = viewer.scene.primitives.add(
            new Cesium.Model.fromGltf({
                url: "./Static/data/shanghai_tower/scene.gltf",
                imageBasedLighting: imageBasedLighting,
                customShader: new Cesium.CustomShader({
                    uniforms: {
                        u_texture: {
                            value: new Cesium.TextureUniform({
                                url: "./Static/images/color.png"
                            }),
                            type: Cesium.UniformType.SAMPLER_2D
                        },
                        u_isDark: {
                            value: true,
                            type: Cesium.UniformType.BOOL
                        }
                    },
                    lightingModel: Cesium.LightingModel.PBR,
                    fragmentShaderText: `
                            void fragmentMain(FragmentInput fsInput,inout czm_modelMaterial material) {
                                if(u_isDark){
                                    vec2 texCoord = fsInput.attributes.texCoord_0 * 0.3;
                                    float times = czm_frameNumber / 120.0;
                                    vec4 textureColor = texture(u_texture,vec2(fract(texCoord.s),float(texCoord.t) - times));
                                    material.diffuse += textureColor.rgb * 0.8;
                                }
                            }
                             `
                }),
                modelMatrix: generateModelMatrix(
                    [121.49805570610201, 31.23266477688614, 400],
                    [0, 0, 45],
                    [3, 3, 2.5]),
            })
        );

        model1 = viewer.scene.primitives.add(
            Cesium.Model.fromGltf({
                url: "./Static/data/building_-_beveled_corners_-_shiny/scene.gltf",
                imageBasedLighting: imageBasedLighting,
                customShader: new Cesium.CustomShader({
                    uniforms: {
                        u_texture: {
                            value: new Cesium.TextureUniform({
                                url: "./Static/images/pic.jpg"
                            }),
                            type: Cesium.UniformType.SAMPLER_2D
                        },
                        u_isDark: {
                            value: true,
                            type: Cesium.UniformType.BOOL
                        }
                    },
                    lightingModel: Cesium.LightingModel.PBR,
                    fragmentShaderText: `
                            void fragmentMain(FragmentInput fsInput,inout czm_modelMaterial material) {
                                if(u_isDark){
                                    vec2 texCoord = fsInput.attributes.texCoord_0 * 0.3;
                                    float times = czm_frameNumber / 120.0;
                                    vec4 textureColor = texture(u_texture,vec2(fract(texCoord.s),float(texCoord.t) - times));
                                    material.diffuse += textureColor.rgb * 1.5;
                                }
                            }
                             `
                }),
                modelMatrix: generateModelMatrix(
                    [121.50306517515779, 31.236594411927722, 0],
                    [0, 0, 0],
                    [3, 3, 4.4]),
            })
        );

        model2 = viewer.scene.primitives.add(
            Cesium.Model.fromGltf({
                url: "./Static/data/building_-_octagonal_-_shiny/scene.gltf",
                imageBasedLighting: imageBasedLighting,
                customShader: new Cesium.CustomShader({
                    uniforms: {
                        u_texture: {
                            value: new Cesium.TextureUniform({
                                url: "./Static/images/color2.png"
                            }),
                            type: Cesium.UniformType.SAMPLER_2D
                        },
                        u_isDark: {
                            value: true,
                            type: Cesium.UniformType.BOOL
                        }
                    },
                    lightingModel: Cesium.LightingModel.PBR,
                    fragmentShaderText: `
                            void fragmentMain(FragmentInput fsInput,inout czm_modelMaterial material) {
                                if(u_isDark){
                                    vec2 texCoord = fsInput.attributes.texCoord_0 * 0.5;
                                    float times = czm_frameNumber / 120.0;
                                    vec4 textureColor = texture(u_texture,vec2(float(texCoord.s) - times),fract(texCoord.t));
                                    material.diffuse += textureColor.rgb * 1.5;
                                }
                            }
                             `
                }),
                modelMatrix: generateModelMatrix(
                    [121.50140479453857, 31.237266571858395, 0],
                    [0, 0, 0],
                    [2.5, 2.5, 3.0]),
            })
        );

        model3 = viewer.scene.primitives.add(
            Cesium.Model.fromGltf({
                url: "./Static/data/oriental_pearl_shanghai. (1)/scene.gltf",
                imageBasedLighting: imageBasedLighting,
                customShader: new Cesium.CustomShader({
                    uniforms: {
                        u_texture: {
                            value: new Cesium.TextureUniform({
                                url: "./Static/images/color.png"
                            }),
                            type: Cesium.UniformType.SAMPLER_2D
                        },
                        u_isDark: {
                            value: true,
                            type: Cesium.UniformType.BOOL
                        }
                    },
                    lightingModel: Cesium.LightingModel.PBR,
                    fragmentShaderText: `
                            void fragmentMain(FragmentInput fsInput,inout czm_modelMaterial material) {
                                if(u_isDark){
                                    vec2 texCoord = fsInput.attributes.texCoord_0 * 0.5;
                                    float times = czm_frameNumber / 30.0;
                                    vec4 textureColor = texture(u_texture,vec2(fract(texCoord.s),float(texCoord.t) - times));
                                    material.diffuse += textureColor.rgb * 0.8;
                                }  
                            }
                             `
                }),
                modelMatrix: generateModelMatrix(
                    [121.49697607088487, 31.241891679352257, 10],
                    [0, 0, 0],
                    [0.15, 0.15, 0.126])
            })
        );

    }

    const initWater = async () => {
        const waterPlane = [];
        const waterData = await Cesium.Resource.fetchJson({ url: "./Static/data/water.json" });
        waterData.features.map(feature => {
            feature.geometry.coordinates[0].map(coordinate => {
                waterPlane.push(Cesium.Cartesian3.fromDegrees(...coordinate));
            })
        })
        const polygon = new Cesium.PolygonGeometry({
            polygonHierarchy: new Cesium.PolygonHierarchy(waterPlane),
        });
        const instance = new Cesium.GeometryInstance({
            geometry: polygon
        });
        waterPrimitive = new Cesium.GroundPrimitive({
            geometryInstances: instance,
            appearance: new Cesium.MaterialAppearance({
                material: new Cesium.Material({
                    fabric: {
                        type: Cesium.Material.WaterType,
                        uniforms: {
                            baseWaterColor: Cesium.Color.fromCssColorString("#62809b"),
                            blendColor: new Cesium.Color(0, 1, 0.699, 1),
                            // specularMap: Material.DefaultImageId,
                            normalMap: "https://cesium.com/downloads/cesiumjs/releases/1.103/Build/Cesium/Assets/Textures/waterNormals.jpg",
                            frequency: 1000,
                            animationSpeed: 0.01,
                            amplitude: 2,
                            specularIntensity: 1,
                            fadeFactor: 3
                        }
                    }
                }),
                translucent: false,
            }),
            asynchronous: false
        })
        viewer.scene.primitives.add(waterPrimitive);


        // 创建材质线
        let getCustomMaterialLine = (image, color) => {
            return new CustomMaterialLine({
                image: image,
                color: color,
                duration: 1000
            })
        }
        const createRoad = (url) => {
            let promise = Cesium.GeoJsonDataSource.load(url);
            promise.then((dataSource) => {
                viewer.dataSources.add(dataSource)
                let entities = dataSource.entities.values;
                for (let o = 0; o < entities.length; o++) {
                    entities[o].polyline.width = 3;
                    entities[o].polyline.clampToGround = true;
                    entities[o].polyline.material =
                        getCustomMaterialLine("./Static/images/line.png", Cesium.Color.fromRandom())
                }
            })
        }

        createRoad("./Static/data/road.json")
        createRoad("./Static/data/road2.json")
    }



    initTiles();

    initWater();
}

/**
 * 初始化场景事件
 */
const initEvent = () => {

    let _sn = 0;
    const updateScene = () => {
        const sd = Cesium.Cartesian3.normalize(viewer.scene.sun._boundingVolume.center, new Cesium.Cartesian3);
        const vd = Cesium.Cartesian3.normalize(viewer.camera.position, new Cesium.Cartesian3);
        const sn = parseFloat(Cesium.Cartesian3.dot(vd, sd).toFixed(3))
        if (sn === _sn) return false;
        viewer.postProcessStages.bloom.enabled = false;
        viewer.scene.postProcessStages.ambientOcclusion.enabled = true;
        building.customShader.uniforms.u_isDark.value = false;
        model0.customShader.uniforms.u_isDark.value = false;
        model1.customShader.uniforms.u_isDark.value = false;
        model2.customShader.uniforms.u_isDark.value = false;
        model3.customShader.uniforms.u_isDark.value = false;
        const value = Cesium.Math.clamp(sn, 0, 1);
        if (imagerLayer)
            imagerLayer.brightness = value + 0.3;
        if (waterPrimitive)
            waterPrimitive.appearance.material.uniforms.baseWaterColor =
                Cesium.Color.multiplyByScalar(Cesium.Color.fromCssColorString("#62809b"), value + 0.3, new Cesium.Color);
        if (sn < 0) {
            viewer.postProcessStages.bloom.enabled = true;
            viewer.scene.postProcessStages.ambientOcclusion.enabled = false;
            building.customShader.uniforms.u_isDark.value = true;
            model0.customShader.uniforms.u_isDark.value = true;
            model1.customShader.uniforms.u_isDark.value = true;
            model2.customShader.uniforms.u_isDark.value = true;
            model3.customShader.uniforms.u_isDark.value = true;
        }
        if (sn < -0.1 && waterPrimitive) {
            let scale = parseFloat(Cesium.Math.clamp((sn - (-0.8)) / (-0.1 - (-0.8)), 1.0, 1.5));
            waterPrimitive.appearance.material.uniforms.baseWaterColor =
                Cesium.Color.multiplyByScalar(Cesium.Color.fromCssColorString("#62809b"), scale, new Cesium.Color);
        }
        _sn = sn;
    }
    viewer.scene.postRender.addEventListener(() => updateScene());
    const onGlobeEvent = viewer.scene.globe.tileLoadProgressEvent.addEventListener((tileNum) => {
        if (tileNum > 2) {
            closeLoading(),
                showUI(),
                onGlobeEvent();
        }
    })

  
    viewer.camera.setView({
        destination: { x: -2850554.9246458095, y: 4656672.153306185, z: 3287574.727124352 },
        orientation: {
            heading: Cesium.Math.toRadians(48.72529042457395),
            pitch: Cesium.Math.toRadians(-10.899276751527792),
            roll: Cesium.Math.toRadians(0.0014027234956804583)
        }
    });

    viewer.clock.currentTime = Cesium.JulianDate.fromIso8601("2023-01-01T06:00:00Z");
}

const initGUI = () => { }
const L00 = new Cesium.Cartesian3(
    1.234709620475769,
    1.221461296081543,
    1.273156881332397
);
const L1_1 = new Cesium.Cartesian3(
    1.135921120643616,
    1.171217799186707,
    1.287644743919373
);
const L10 = new Cesium.Cartesian3(
    1.245193719863892,
    1.245591878890991,
    1.282818794250488
);
const L11 = new Cesium.Cartesian3(
    -1.106930732727051,
    -1.112522482872009,
    -1.153198838233948
);
const L2_2 = new Cesium.Cartesian3(
    -1.086226940155029,
    -1.079731941223145,
    -1.101912498474121
);
const L2_1 = new Cesium.Cartesian3(
    1.189834713935852,
    1.185906887054443,
    1.214385271072388
);
const L20 = new Cesium.Cartesian3(
    0.01778045296669,
    0.02013735473156,
    0.025313569232821
);
const L21 = new Cesium.Cartesian3(
    -1.086826920509338,
    -1.084611177444458,
    -1.111204028129578
);
const L22 = new Cesium.Cartesian3(
    -0.05241484940052,
    -0.048303380608559,
    -0.041960217058659
);
const coefficients = [L00, L1_1, L10, L11, L2_2, L2_1, L20, L21, L22];
let imageBasedLighting = new Cesium.ImageBasedLighting({
    specularEnvironmentMaps: './Static/images/kiara_6_afternoon_2k_ibl.ktx2',
    sphericalHarmonicCoefficients: coefficients
})

/**
 * 生成矩阵
 * @param {*} position 
 * @param {*} rotation 
 * @param {*} scale 
 * @returns 
 */
const generateModelMatrix = (position = [0, 0, 0], rotation = [0, 0, 0], scale = [1, 1, 1]) => {
    const rotationX = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromRotationX(Cesium.Math.toRadians(rotation[0])));

    const rotationY = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromRotationY(Cesium.Math.toRadians(rotation[1])));

    const rotationZ = Cesium.Matrix4.fromRotationTranslation(
        Cesium.Matrix3.fromRotationZ(Cesium.Math.toRadians(rotation[2])));
    if (!(position instanceof Cesium.Cartesian3)) {
        position = Cesium.Cartesian3.fromDegrees(...position)
    }
    const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    Cesium.Matrix4.multiply(enuMatrix, rotationX, enuMatrix);
    Cesium.Matrix4.multiply(enuMatrix, rotationY, enuMatrix);
    Cesium.Matrix4.multiply(enuMatrix, rotationZ, enuMatrix);
    const scaleMatrix = Cesium.Matrix4.fromScale(new Cesium.Cartesian3(...scale));
    const modelMatrix = Cesium.Matrix4.multiply(enuMatrix, scaleMatrix, new Cesium.Matrix4());

    return modelMatrix;
}

const main = () => {
    initViewer();
    initScene();
    initEvent();
    initGUI();
};


new window.WOW().init();
function showUI() {
    $("body").append(`
    <div id="uiContainer">
        <div id="topUI" class="wow bounceInDown" data-wow-duration="1.2s"></div>
        <div id="leftUI" class="wow bounceInLeft" data-wow-duration="1.2s"></div>
        <div id="roghtUI" class="wow bounceInRight" data-wow-duration="1.2s"></div>
    </div>`);
}
function closeLoading() {
    $("#loadingIndicator").hide();
    $("#loadingIndicator2").hide();
}

function showLoading() {
    $("#loadingIndicator").show();
    $("#loadingIndicator2").show();
}

window.onload = main;