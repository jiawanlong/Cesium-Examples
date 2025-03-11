
class excavateTerrain {
    constructor(viewer, config) {
        this.viewer = viewer;
        this.config = config;
        this.analysis();
    }

    analysis() {

        var viewer = this.viewer;
        var config = this.config;
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var arr = config.positions;
        var nArr = [];
        var nArr2 = [];

        arr.forEach((element) => {
            var catographic = Cesium.Cartographic.fromCartesian(element);
            var height = Number(catographic.height.toFixed(2));
            var cartographic = ellipsoid.cartesianToCartographic({
                x: element.x,
                y: element.y,
                z: element.z,
            });
            var lat = Cesium.Math.toDegrees(cartographic.latitude);
            var lng = Cesium.Math.toDegrees(cartographic.longitude);
            nArr.push({
                x: lng,
                y: lat,
                z: height,
            });
            nArr2.push({
                x: lng,
                y: lat,
                z: height,
            });
        });

        var cartographic = ellipsoid.cartesianToCartographic({
            x: arr[0].x,
            y: arr[0].y,
            z: arr[0].z,
        });
        var catographic1 = Cesium.Cartographic.fromCartesian(arr[0]);
        var height1 = Number(catographic1.height.toFixed(2));
        var lat = Cesium.Math.toDegrees(cartographic.latitude);
        var lng = Cesium.Math.toDegrees(cartographic.longitude);
        nArr2.push({
            x: lng,
            y: lat,
            z: height1,
        });
        this.excavate(nArr, nArr2)
        try {
            drawControl.deleteAll();
          } catch (error) {
            
        }
    }

    excavate(arr, nArr2) {
        var viewer = this.viewer;
        var config = this.config;
        var _this = this;
        var ellipsoid = viewer.scene.globe.ellipsoid;
        var nar = [];
        var hhh = [];
        var flag = _this.isClockWise(arr);
        if (flag === true) {
            arr.reverse();
            nArr2.reverse();
        }
        arr.forEach((element) => {
            nar.push(element.x);
            nar.push(element.y);
            hhh.push(element.z);
        });
        var points = [];
        arr.forEach((element) => {
            points.push(Cesium.Cartesian3.fromDegrees(element.x, element.y));
        });
        var pointsLength = points.length;
        var clippingPlanes = [];

        for (var i = 0; i < pointsLength; ++i) {
            var nextIndex = (i + 1) % pointsLength;
            var midpoint = Cesium.Cartesian3.add(
                points[i],
                points[nextIndex],
                new Cesium.Cartesian3()
            );
            midpoint = Cesium.Cartesian3.multiplyByScalar(midpoint, 0.5, midpoint);

            var up = Cesium.Cartesian3.normalize(midpoint, new Cesium.Cartesian3());
            var right = Cesium.Cartesian3.subtract(
                points[nextIndex],
                midpoint,
                new Cesium.Cartesian3()
            );
            right = Cesium.Cartesian3.normalize(right, right);

            var normal = Cesium.Cartesian3.cross(
                right,
                up,
                new Cesium.Cartesian3()
            );
            normal = Cesium.Cartesian3.normalize(normal, normal);

            var originCenteredPlane = new Cesium.Plane(normal, 0.0);
            var distance = Cesium.Plane.getPointDistance(
                originCenteredPlane,
                midpoint
            );
            clippingPlanes.push(new Cesium.ClippingPlane(normal, distance));
        }
        viewer.scene.globe.clippingPlanes = new Cesium.ClippingPlaneCollection({
            planes: clippingPlanes,
            edgeWidth: 1.0,
            edgeColor: Cesium.Color.OLIVE,
        });
        try {
            viewer.entities.removeById("entityDM");
            viewer.entities.removeById("entityDMBJ");
        } catch (error) { }

        var min;
        for (var i = 0; i < hhh.length; i++) {
            for (var j = i; j < hhh.length; j++) {
                if (hhh[i] > hhh[j]) {
                    min = hhh[j];
                    hhh[j] = hhh[i];
                    hhh[i] = min;
                }
            }
        }
        viewer.entities.add({
            id: "entityDM",
            polygon: {
                hierarchy: Cesium.Cartesian3.fromDegreesArray(nar),
                material: new Cesium.ImageMaterialProperty({
                    image: config.bottom,
                    color: new Cesium.Color.fromCssColorString("#cbc6c2"),
                    repeat: new Cesium.Cartesian2(30, 30),
                }),
                height: hhh[0] - config.height,
            },
        });

        var maximumHeightsARR = [];
        var minimumHeights = [];
        var terrainSamplePositions = [];
        var length = 2048;
        var nar22 = [];

        nArr2.forEach((element, index) => {
            if (index < nArr2.length - 1) {
                var startLon = Cesium.Math.toRadians(element.x);
                var endLon = Cesium.Math.toRadians(nArr2[index + 1].x);
                var starty = Cesium.Math.toRadians(element.y);
                var endy = Cesium.Math.toRadians(nArr2[index + 1].y);

                for (var i = 0; i < length; ++i) {
                    var x = Cesium.Math.lerp(element.x, nArr2[index + 1].x, i / (length - 1));
                    var y = Cesium.Math.lerp(element.y, nArr2[index + 1].y, i / (length - 1));

                    var lon = Cesium.Math.lerp(startLon, endLon, i / (length - 1));
                    var lat = Cesium.Math.lerp(starty, endy, i / (length - 1));
                    var position = new Cesium.Cartographic(lon, lat);
                    terrainSamplePositions.push(position);
                    nar22.push(x)
                    nar22.push(y)
                }
            } else {
                var startLon = Cesium.Math.toRadians(element.x);
                var endLon = Cesium.Math.toRadians(nArr2[0].x);
                var starty = Cesium.Math.toRadians(element.y);
                var endy = Cesium.Math.toRadians(nArr2[0].y);

                for (var i = 0; i < length; ++i) {
                    var x = Cesium.Math.lerp(element.x, nArr2[0].x, i / (length - 1));
                    var y = Cesium.Math.lerp(element.y, nArr2[0].y, i / (length - 1));

                    var lon = Cesium.Math.lerp(startLon, endLon, i / (length - 1));
                    var lat = Cesium.Math.lerp(starty, endy, i / (length - 1));
                    var position = new Cesium.Cartographic(lon, lat);
                    terrainSamplePositions.push(position);
                    nar22.push(x)
                    nar22.push(y)
                }
            }
        });
        if ( viewer.terrainProvider._layers ) {
            // Cesium.when(Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, terrainSamplePositions), function (samples) {
                // for (let index = 0; index < samples.length; index++) {
                //     maximumHeightsARR.push(samples[index].height);
                //     minimumHeights.push(hhh[0] - config.height);
                // }
                // viewer.entities.add({
                //     id: "entityDMBJ",
                //     wall: {
                //         positions: Cesium.Cartesian3.fromDegreesArray(nar22),
                //         maximumHeights: maximumHeightsARR,
                //         minimumHeights: minimumHeights,
                //         material: new Cesium.ImageMaterialProperty({
                //             image: config.side,
                //             repeat: new Cesium.Cartesian2(30, 30),
                //         }),
                //     },
                // });
            //     config.drawControl.deleteAll();
            // })
            var p1 = Cesium.sampleTerrainMostDetailed(viewer.terrainProvider, terrainSamplePositions)
            Promise.all([p1]).then((samples) => {
                console.log(samples[0])
                samples = samples[0]
                for (let index = 0; index < samples.length; index++) {
                    maximumHeightsARR.push(samples[index].height);
                    minimumHeights.push(hhh[0] - config.height);
                }
                viewer.entities.add({
                    id: "entityDMBJ",
                    wall: {
                        positions: Cesium.Cartesian3.fromDegreesArray(nar22),
                        maximumHeights: maximumHeightsARR,
                        minimumHeights: minimumHeights,
                        material: new Cesium.ImageMaterialProperty({
                            image: config.side,
                            repeat: new Cesium.Cartesian2(30, 30),
                        }),
                    },
                });
            })

        } else {
            for (let index = 0; index < terrainSamplePositions.length; index++) {
                maximumHeightsARR.push( 0 );
                minimumHeights.push(hhh[0] - config.height);
            }
            viewer.entities.add({
                id: "entityDMBJ",
                wall: {
                    positions: Cesium.Cartesian3.fromDegreesArray(nar22),
                    maximumHeights: maximumHeightsARR,
                    minimumHeights: minimumHeights,
                    material: new Cesium.ImageMaterialProperty({
                        image: config.side,
                        repeat: new Cesium.Cartesian2(30, 30),
                    }),
                },
            });
            // config.drawControl.deleteAll();
        }
       
    }

    isClockWise(latLngArr) {
        if (latLngArr.length < 3) {
            return null
        }
        if (latLngArr[0] === latLngArr[latLngArr.length - 1]) {
            latLngArr = latLngArr.slice(0, latLngArr.length - 1)
        }
        let latMin = {
            i: -1,
            val: 100000000
        }
        for (let i = 0; i < latLngArr.length; i++) {
            let y = latLngArr[i].y
            if (y < latMin.val) {
                latMin.val = y
                latMin.i = i
            }
        }
        let i1 = (latMin.i + latLngArr.length - 1) % latLngArr.length
        let i2 = latMin.i
        let i3 = (latMin.i + 1) % latLngArr.length

        let v2_1 = {
            y: latLngArr[i2].y - latLngArr[i1].y,
            x: latLngArr[i2].x - latLngArr[i1].x
        }
        let v3_2 = {
            y: latLngArr[i3].y - latLngArr[i2].y,
            x: latLngArr[i3].x - latLngArr[i2].x
        }
        let result = v3_2.x * v2_1.y - v2_1.x * v3_2.y
        // result>0 3-2在2-1的顺时针方向 result<0 3-2在2-1的逆时针方向 result==0 3-2和2-1共线，可能同向也可能反向
        return result === 0 ? (latLngArr[i3].x < latLngArr[i1].x) : (result > 0)
    }
}
