var latlng = {};
/**
 * 获取鼠标当前的屏幕坐标位置的三维Cesium坐标
 * @param {Cesium.Scene} scene 
 * @param {Cesium.Cartesian2} position 二维屏幕坐标位置
 * @param {Cesium.Entity} noPickEntity 排除的对象（主要用于绘制中，排除对自己本身的拾取）
 */
latlng.getCurrentMousePosition = function (scene, position, noPickEntity) {
    var cartesian;

    //在模型上提取坐标  
    var pickedObject = scene.pick(position);
    if (scene.pickPositionSupported && Cesium.defined(pickedObject)) { //pickPositionSupported :判断是否支持深度拾取,不支持时无法进行鼠标交互绘制
        var entity = pickedObject.id;
        if (noPickEntity == null || (noPickEntity && entity !== noPickEntity)) {
            var cartesian = scene.pickPosition(position);
            if (Cesium.defined(cartesian)) {
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var height = cartographic.height; //模型高度
                if (height >= 0) return cartesian;

                //不是entity时，支持3dtiles地下
                if (!Cesium.defined(pickedObject.id) && height >= -500)
                    return cartesian;
            }
        }
    }

    //测试scene.pickPosition和globe.pick的适用场景 https://zhuanlan.zhihu.com/p/44767866
    //1. globe.pick的结果相对稳定准确，不论地形深度检测开启与否，不论加载的是默认地形还是别的地形数据；
    //2. scene.pickPosition只有在开启地形深度检测，且不使用默认地形时是准确的。
    //注意点： 1. globe.pick只能求交地形； 2. scene.pickPosition不仅可以求交地形，还可以求交除地形以外其他所有写深度的物体。

    //提取鼠标点的地理坐标 
    if (scene.mode === Cesium.SceneMode.SCENE3D) {
        //三维模式下
        var pickRay = scene.camera.getPickRay(position);
        cartesian = scene.globe.pick(pickRay, scene);
    } else {
        //二维模式下
        cartesian = scene.camera.pickEllipsoid(position, scene.globe.ellipsoid);
    }
    return cartesian;
}

/**
 * 提取地球中心点坐标
 * @param {Cesium.Viewer} viewer 
 * */
latlng.getCenter = function (viewer) {
    var scene = viewer.scene;
    var target = pickCenterPoint(scene);
    var bestTarget = target;
    if (!bestTarget) {
        var globe = scene.globe;
        var carto = scene.camera.positionCartographic.clone();
        var height = globe.getHeight(carto);
        carto.height = height || 0;
        bestTarget = Cesium.Ellipsoid.WGS84.cartographicToCartesian(carto);
    }

    var result = latlng.formatPositon(bestTarget);

    // 获取地球中心点世界位置  与  摄像机的世界位置  之间的距离
    var distance = Cesium.Cartesian3.distance(bestTarget, viewer.scene.camera.positionWC);
    result.cameraZ = distance;

    return result;
}

function pickCenterPoint(scene) {
    var canvas = scene.canvas;
    var center = new Cesium.Cartesian2(
        canvas.clientWidth / 2,
        canvas.clientHeight / 2);

    var ray = scene.camera.getPickRay(center);
    var target = scene.globe.pick(ray, scene);
    return target || scene.camera.pickEllipsoid(center);
}

/**
 * 提取地球视域边界
 * @param {Cesium.Viewer} viewer 
 * */
latlng.getExtent = function (viewer) {
    // 范围对象
    var extent = {
        xmin: 70,
        xmax: 140,
        ymin: 0,
        ymax: 55
    }; //默认值：中国区域

    // 得到当前三维场景
    var scene = viewer.scene;

    // 得到当前三维场景的椭球体
    var ellipsoid = scene.globe.ellipsoid;
    var canvas = scene.canvas;

    // canvas左上角
    var car3_lt = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(0, 0), ellipsoid);
    if (car3_lt) { // 在椭球体上
        var carto_lt = ellipsoid.cartesianToCartographic(car3_lt);
        extent.xmin = Cesium.Math.toDegrees(carto_lt.longitude);
        extent.ymax = Cesium.Math.toDegrees(carto_lt.latitude);
    } else { // 不在椭球体上 
        var xMax = canvas.width / 2;
        var yMax = canvas.height / 2;

        var car3_lt2;
        // 这里每次10像素递加，一是10像素相差不大，二是为了提高程序运行效率
        for (var yIdx = 0; yIdx <= yMax; yIdx += 10) {
            var xIdx = yIdx <= xMax ? yIdx : xMax;
            car3_lt2 = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(xIdx, yIdx), ellipsoid);
            if (car3_lt2) break;
        }
        if (car3_lt2) {
            var carto_lt = ellipsoid.cartesianToCartographic(car3_lt2);
            extent.xmin = Cesium.Math.toDegrees(carto_lt.longitude);
            extent.ymax = Cesium.Math.toDegrees(carto_lt.latitude);
        }
    }

    // canvas右下角
    var car3_rb = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(canvas.width, canvas.height), ellipsoid);
    if (car3_rb) { // 在椭球体上
        var carto_rb = ellipsoid.cartesianToCartographic(car3_rb);
        extent.xmax = Cesium.Math.toDegrees(carto_rb.longitude);
        extent.ymin = Cesium.Math.toDegrees(carto_rb.latitude);
    } else { // 不在椭球体上
        var xMax = canvas.width / 2;
        var yMax = canvas.height / 2;

        var car3_rb2;
        // 这里每次10像素递减，一是10像素相差不大，二是为了提高程序运行效率
        for (var yIdx = canvas.height; yIdx >= yMax; yIdx -= 10) {
            var xIdx = yIdx >= xMax ? yIdx : xMax;
            car3_rb2 = viewer.camera.pickEllipsoid(new Cesium.Cartesian2(xIdx, yIdx), ellipsoid);
            if (car3_rb2) break;
        }
        if (car3_rb2) {
            var carto_rb = ellipsoid.cartesianToCartographic(car3_rb2);
            extent.xmax = Cesium.Math.toDegrees(carto_rb.longitude);
            extent.ymin = Cesium.Math.toDegrees(carto_rb.latitude);
        }
    }

    //交换
    if (extent.xmax < extent.xmin) {
        var temp = extent.xmax;
        extent.xmax = extent.xmin;
        extent.xmin = temp;
    }
    if (extent.ymax < extent.ymin) {
        var temp = extent.ymax;
        extent.ymax = extent.ymin;
        extent.ymin = temp;
    }


    return extent;
}
/**
 * 提取视域边界
 * @param {Cesium.Viewer} viewer 
 * 
 * */
latlng.getViewBounds = function (viewer) {
    var rectangle = viewer.camera.computeViewRectangle();
    // 弧度转为经纬度，west为左（西）侧边界的经度，以下类推
    var west = rectangle.west / Math.PI * 180;
    var north = rectangle.north / Math.PI * 180;
    var east = rectangle.east / Math.PI * 180;
    var south = rectangle.south / Math.PI * 180;
    // 鉴于高德、leaflet获取的边界都是southwest和northeast字段来表示，本例保持一致性
    var bounds = {
        southwest: {
            lng: west,
            lat: south
        },
        northeast: {
            lng: east,
            lat: north
        }
    }
    return bounds;
}

/**
 * 提取相机视角范围参数
 * @param {Cesium.Viewer} viewer 
 * 
 * */
latlng.getCameraView = function (viewer) {
    var camera = viewer.camera;
    var position = camera.positionCartographic;

    var bookmark = {};
    bookmark.y = Number(Cesium.Math.toDegrees(position.latitude).toFixed(6));
    bookmark.x = Number(Cesium.Math.toDegrees(position.longitude).toFixed(6));
    bookmark.z = Number(position.height.toFixed(1));
    bookmark.heading = Number(Cesium.Math.toDegrees(camera.heading || -90).toFixed(1));
    bookmark.pitch = Number(Cesium.Math.toDegrees(camera.pitch || 0).toFixed(1));
    bookmark.roll = Number(Cesium.Math.toDegrees(camera.roll || 0).toFixed(1));

    return bookmark;
}


/**
 * 格式化坐标点为可显示的可理解格式（如：经度x:123.345345、纬度y:31.324324、高度z:123.1）。
 * @param {Cesium.Cartesian3} position 
 * */
latlng.formatPositon = function (position) {
    var carto = Cesium.Cartographic.fromCartesian(position);
    var result = {};
    result.y = Number(Cesium.Math.toDegrees(carto.latitude).toFixed(6));
    result.x = Number(Cesium.Math.toDegrees(carto.longitude).toFixed(6));
    result.z = Number(carto.height.toFixed(1));
    return result;
};

//笛卡尔转经纬度/弧度
latlng.Cartesian3To = function (cartesian3, viewer) {
    if (cartesian3) {
        if (viewer) {
            var ellipsoid = viewer.scene.globe.ellipsoid;
            var cartographic;
            //转弧度
            cartographic = ellipsoid.cartesianToCartographic(cartesian3);
        } else {
            cartographic = Cesium.Cartographic.fromCartesian(cartesian3);
        }
        //转经纬度
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        var height = cartographic.height;
        return {
            cartesian3: cartesian3,
            cartographic: cartographic,
            latlng: {
                lat: lat,
                lng: lng,
                height: height
            }
        };
    }
}
//绕点 环绕飞行
latlng.windingPoint = {
    isStart: false,
    viewer: null,
    start: function (viewer, point) {
        if (!point)
            point = getCenter(viewer);

        this.viewer = viewer;
        this.position = Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z);

        this.distance = point.distance || Cesium.Cartesian3.distance(this.position, viewer.camera.positionWC); // 给定相机距离点多少距离飞行 
        this.angle = 360 / (point.time || 60); //time：给定飞行一周所需时间(单位 秒)

        this.time = viewer.clock.currentTime.clone();
        this.heading = viewer.camera.heading; // 相机的当前heading
        this.pitch = viewer.camera.pitch;

        this.viewer.clock.onTick.addEventListener(this.clock_onTickHandler, this);
        this.isStart = true;
    },
    clock_onTickHandler: function (e) {
        var delTime = Cesium.JulianDate.secondsDifference(this.viewer.clock.currentTime, this.time); // 当前已经过去的时间，单位 秒
        var heading = Cesium.Math.toRadians(delTime * this.angle) + this.heading;

        this.viewer.scene.camera.setView({
            destination: this.position, // 点的坐标
            orientation: {
                heading: heading,
                pitch: this.pitch,
            }
        });
        this.viewer.scene.camera.moveBackward(this.distance);
    },
    stop: function () {
        if (!this.isStart) return;

        if (this.viewer)
            this.viewer.clock.onTick.removeEventListener(this.clock_onTickHandler, this);
        this.isStart = false;
    }
};

//固定点 向四周旋转
latlng.aroundPoint = {
    isStart: false,
    viewer: null,
    start: function (viewer, point) {
        if (!point)
            point = getCenter(viewer);

        this.viewer = viewer;
        this.position = Cesium.Cartesian3.fromDegrees(point.x, point.y, point.z);

        this.angle = 360 / (point.time || 60); //time：给定飞行一周所需时间(单位 秒)

        this.time = viewer.clock.currentTime.clone();
        this.heading = viewer.camera.heading; // 相机的当前heading
        this.pitch = viewer.camera.pitch;

        this.viewer.clock.onTick.addEventListener(this.clock_onTickHandler, this);
        this.isStart = true;
    },
    clock_onTickHandler: function (e) {
        // 当前已经过去的时间，单位s
        var delTime = Cesium.JulianDate.secondsDifference(this.viewer.clock.currentTime, this.time);
        var heading = Cesium.Math.toRadians(delTime * this.angle) + this.heading;
        viewer.scene.camera.setView({
            orientation: {
                heading: heading,
                pitch: this.pitch,
            }
        });
    },
    stop: function () {
        if (!this.isStart) return;

        if (this.viewer)
            this.viewer.clock.onTick.removeEventListener(this.clock_onTickHandler, this);
        this.isStart = false;
    }
};

latlng.getFrustumGroundIntersectionPoints = function (viewer) {
    const scene = viewer.scene;
    const camera = viewer.camera;
    const ellipsoid = scene.globe.ellipsoid;
    const canvas = scene.canvas;

    // 定义屏幕四个角的坐标
    const corners = [
        new Cesium.Cartesian2(0, 0),                 // 左下角
        new Cesium.Cartesian2(canvas.width, 0),      // 右下角
        new Cesium.Cartesian2(0, canvas.height),     // 左上角
        new Cesium.Cartesian2(canvas.width, canvas.height) // 右上角
    ];

    const intersectionPoints = [];

    // 遍历四个角点
    for (let i = 0; i < corners.length; i++) {
        // 获取从相机位置通过屏幕角点的射线
        const ray = camera.getPickRay(corners[i]);
        if (!ray) continue;

        // 求射线与地球表面的交点
        const intersection = scene.globe.pick(ray, scene);
        if (intersection) {
            var cartographic_s = ellipsoid.cartesianToCartographic(intersection);
            var lat_10 = Cesium.Math.toDegrees(cartographic_s.latitude);
            var lng_10 = Cesium.Math.toDegrees(cartographic_s.longitude);

            intersectionPoints.push(
                {
                    x: lng_10,
                    y: lat_10
                }
            );
        } else {
            // 如果没有直接交点（如看向天空），尝试计算与椭球体的交点
        }
    }

    if (intersectionPoints.length >= 2) {

        var position = camera.positionCartographic;

        var bookmark = {};
        bookmark.y = Number(Cesium.Math.toDegrees(position.latitude).toFixed(6));
        bookmark.x = Number(Cesium.Math.toDegrees(position.longitude).toFixed(6));
        bookmark.z = Number(position.height.toFixed(1));
        bookmark.heading = Number(Cesium.Math.toDegrees(camera.heading || -90).toFixed(1));
        bookmark.pitch = Number(Cesium.Math.toDegrees(camera.pitch || 0).toFixed(1));
        bookmark.roll = Number(Cesium.Math.toDegrees(camera.roll || 0).toFixed(1));

        // 左下
        var lat_0 = intersectionPoints[0].y;
        var lng_0 = intersectionPoints[0].x;

        // 右下
        var lat_1 = intersectionPoints[1].y;
        var lng_1 = intersectionPoints[1].x;

        // 发射距离
        var from = turf.point([lng_0, lat_0]);
        var to = turf.point([lng_1, lat_1]);
        var options = { units: 'kilometers' };
        var distance = turf.distance(from, to, options);

        // 左上
        var point_0 = turf.point([lng_0, lat_0]);
        distance = distance * 3;
        len = distance / 3 * 1000 / 10;
        var bearing = bookmark.heading - 30;
        var options = { units: 'kilometers' };

        var destination = turf.destination(point_0, distance, bearing, options);
        let des_0 = destination.geometry.coordinates

        // 右上
        var point_1 = turf.point([lng_1, lat_1]);
        var bearing = bookmark.heading + 30;
        var destination = turf.destination(point_1, distance, bearing, options);
        let des_1 = destination.geometry.coordinates

        intersectionPoints.push(
            {
                x: des_0[0],
                y: des_0[1]
            }
        );

        intersectionPoints.push(
            {
                x: des_1[0],
                y: des_1[1]
            }
        );
    }
    return intersectionPoints;
};