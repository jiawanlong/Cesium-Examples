var videos = [];
var video_dom;
var getCurrentMousePosition = function (scene, position, noPickEntity) {
    var cartesian;
    var pickedObject = scene.pick(position);
    if (scene.pickPositionSupported && Cesium.defined(pickedObject)) {
        var entity = pickedObject.id;
        if (noPickEntity == null || (noPickEntity && entity !== noPickEntity)) {
            var cartesian = scene.pickPosition(position);
            if (Cesium.defined(cartesian)) {
                var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
                var height = cartographic.height;
                if (height >= 0) return cartesian;

                if (!Cesium.defined(pickedObject.id) && height >= -500)
                    return cartesian;
            }
        }
    }

    if (scene.mode === Cesium.SceneMode.SCENE3D) {
        var pickRay = scene.camera.getPickRay(position);
        cartesian = scene.globe.pick(pickRay, scene);
    } else {
        cartesian = scene.camera.pickEllipsoid(position, scene.globe.ellipsoid);
    }
    return cartesian;
}

class video {
    constructor(viewer, config) {
        this.viewer = viewer;
        this.config = config;

    }

    creat() {
        var viewer = this.viewer;
        var config = this.config;
        var videoElement = config.videoElement;
        var positions = config.positions;
        var clampToGround = config.clampToGround;
        if (clampToGround) {
            viewer.entities.add({
                nam: "video",
                polygon: {
                    hierarchy: Cesium.Cartesian3.fromDegreesArray(positions),
                    material: videoElement
                }
            });
        } else {
            viewer.entities.add({
                nam: "video",
                polygon: {
                    hierarchy: {
                        positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions)
                    },
                    material: videoElement,
                    perPositionHeight: true,
                    outline: true
                }
            });
        }
    }

    clearAll() {
        var dd = viewer.entities._entities._array;
        for (let index = 0; index < dd.length; index++) {
            if (dd[index]._nam = "video") {
                viewer.entities.remove(dd[index])
                index--;
            }
        }
        videos.forEach((v) => {
            v.destroy();
        })
    }

    change(object) {
        var _this = this;
        for (const key in object) {
            const element = object[key];
            _this.lightCamera.frustum[key] = element;
            _this.clear()
            _this.drawFrustumOutline();
        }
    }

    drawVideo() {
        let _self = this;
        var options = this.config;
        this.handler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);

        this.horizontalViewAngle = options.horizontalViewAngle || 60.0;
        this.verticalViewAngle = options.verticalViewAngle || 40.0;
        video_dom = document.getElementById(options.video);

        this.options = options;
        this.posArray = [];
        this.state = "PREPARE";
        if (options.viewPosition && options.viewPositionEnd) {
            _self.viewPosition = options.viewPosition;
            _self.viewPositionEnd = options.viewPositionEnd;
            _self.viewDistance = Cesium.Cartesian3.distance(_self.viewPosition, _self.viewPositionEnd);
            _self.viewHeading = getHeading(_self.viewPosition, _self.viewPositionEnd);
            _self.viewPitch = getPitch(_self.viewPosition, _self.viewPositionEnd);
            _self.createLightCamera();
        } else {
            this.action();
        }
    }

    action() {
        let _self = this;
        _self.handler.setInputAction(function (movement) {
            var cartesian = getCurrentMousePosition(_self.viewer.scene, movement.position);
            if (!cartesian) {
                return;
            }

            if (_self.posArray.length == 0) {
                _self.posArray.push(cartesian);
                _self.state = "OPERATING";
            } else if (_self.posArray.length == 1) {
                _self.viewPosition = _self.posArray[0];
                _self.viewPositionEnd = cartesian;
                _self.viewDistance = Cesium.Cartesian3.distance(_self.viewPosition, _self.viewPositionEnd);
                _self.viewHeading = getHeading(_self.viewPosition, _self.viewPositionEnd);
                _self.viewPitch = getPitch(_self.viewPosition, _self.viewPositionEnd);

                _self.state = "END";
                _self.handler.destroy();
                _self.handler = null;
                _self.createLightCamera();
            }
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    }

    //创建相机
    createLightCamera() {
        this.lightCamera = new Cesium.Camera(this.viewer.scene);
        this.lightCamera.position = this.viewPosition;

        this.lightCamera.frustum.near = this.viewDistance * 0.0001;
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
        this.drawFrustumOutline();
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

        var newObj = _.cloneDeep(this.lightCamera.frustum);
        newObj.near = newObj.far - 0.01;

        var videoGeometryInstance1 = new Cesium.GeometryInstance({
            geometry: new Cesium.FrustumGeometry({
                frustum: newObj,
                origin: this.viewPosition,
                orientation: orientation
            })
        });

        var p1s = new Cesium.Primitive({
            geometryInstances: [videoGeometryInstance1],
            appearance: createAppearance()
        })
        this.viewer.scene.primitives.add(
            p1s
        );

        var videoGeometryInstance2 = new Cesium.GeometryInstance({
            geometry: new Cesium.FrustumOutlineGeometry({
                frustum: this.lightCamera.frustum,
                origin: this.viewPosition,
                orientation: orientation
            }),
            attributes: {
                color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.BLUE)
            }
        });

        var p2s = new Cesium.Primitive({
            geometryInstances: [videoGeometryInstance2],
            appearance: new Cesium.PerInstanceColorAppearance(
                {
                    flat: true,
                    // translucent : false
                }
            )
        })
        this.viewer.scene.primitives.add(
            p2s
        );
        this.FrustumGeometry = p1s;
        this.FrustumOutlineGeometry = p2s;
        videos.push(p1s)
        videos.push(p2s)
    }

    clear() {
        this.FrustumGeometry.destroy()
        this.FrustumOutlineGeometry.destroy()
    }
}


function createAppearance() {
    let source = `czm_material czm_getMaterial(czm_materialInput materialInput)
      {
           czm_material material = czm_getDefaultMaterial(materialInput);
           vec2 st = materialInput.st;
           vec4 colorImage = texture2D(image, vec2(st.s, st.t));
           vec4 maskImage = texture2D(tmask, vec2(st.s, st.t));
           material.alpha = colorImage.a * color.a*maskImage.r;
           material.diffuse = colorImage.rgb*color.rgb;
           return material;
       }`;
    let material = new Cesium.Material({
        fabric: {
            type: "custome_1",
            uniforms: {
                color: new Cesium.Color(1.0, 1.0, 1.0, 1.0),
                image: "data:image/png;base64,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",
                tmask: "data:image/jpg;base64,/9j/4AAQSkZJRgABAgEASABIAAD/7QAsUGhvdG9zaG9wIDMuMAA4QklNA+0AAAAAABAASAAAAAEAAQBIAAAAAQAB/+Ekcmh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8APD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDUgNzkuMTYzNDk5LCAyMDE4LzA4LzEzLTE2OjQwOjIyICAgICAgICAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgICAgICAgICAgeG1sbnM6eG1wR0ltZz0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL2cvaW1nLyIKICAgICAgICAgICAgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iCiAgICAgICAgICAgIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIgogICAgICAgICAgICB4bWxuczpzdEV2dD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlRXZlbnQjIgogICAgICAgICAgICB4bWxuczppbGx1c3RyYXRvcj0iaHR0cDovL25zLmFkb2JlLmNvbS9pbGx1c3RyYXRvci8xLjAvIgogICAgICAgICAgICB4bWxuczpwZGY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGRmLzEuMy8iPgogICAgICAgICA8ZGM6Zm9ybWF0PmltYWdlL2pwZWc8L2RjOmZvcm1hdD4KICAgICAgICAgPGRjOnRpdGxlPgogICAgICAgICAgICA8cmRmOkFsdD4KICAgICAgICAgICAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij7miZPljbA8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6QWx0PgogICAgICAgICA8L2RjOnRpdGxlPgogICAgICAgICA8eG1wOk1ldGFkYXRhRGF0ZT4yMDE5LTEyLTE4VDE3OjA4OjU5KzA4OjAwPC94bXA6TWV0YWRhdGFEYXRlPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAxOS0xMi0xOFQwOTowODo1OVo8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8eG1wOkNyZWF0ZURhdGU+MjAxOS0xMi0xOFQxNzowODo1OSswODowMDwveG1wOkNyZWF0ZURhdGU+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+QWRvYmUgSWxsdXN0cmF0b3IgQ0MgMjMuMSAoTWFjaW50b3NoKTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOlRodW1ibmFpbHM+CiAgICAgICAgICAgIDxyZGY6QWx0PgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHhtcEdJbWc6d2lkdGg+MjU2PC94bXBHSW1nOndpZHRoPgogICAgICAgICAgICAgICAgICA8eG1wR0ltZzpoZWlnaHQ+NzY8L3htcEdJbWc6aGVpZ2h0PgogICAgICAgICAgICAgICAgICA8eG1wR0ltZzpmb3JtYXQ+SlBFRzwveG1wR0ltZzpmb3JtYXQ+CiAgICAgICAgICAgICAgICAgIDx4bXBHSW1nOmltYWdlPi85ai80QUFRU2taSlJnQUJBZ0VBU0FCSUFBRC83UUFzVUdodmRHOXphRzl3SURNdU1BQTRRa2xOQSswQUFBQUFBQkFBU0FBQUFBRUEmI3hBO0FRQklBQUFBQVFBQi8rNEFEa0ZrYjJKbEFHVEFBQUFBQWYvYkFJUUFCZ1FFQkFVRUJnVUZCZ2tHQlFZSkN3Z0dCZ2dMREFvS0N3b0smI3hBO0RCQU1EQXdNREF3UURBNFBFQThPREJNVEZCUVRFeHdiR3hzY0h4OGZIeDhmSHg4Zkh3RUhCd2NOREEwWUVCQVlHaFVSRlJvZkh4OGYmI3hBO0h4OGZIeDhmSHg4Zkh4OGZIeDhmSHg4Zkh4OGZIeDhmSHg4Zkh4OGZIeDhmSHg4Zkh4OGZIeDhmSHg4Zi84QUFFUWdBVEFFQUF3RVImI3hBO0FBSVJBUU1SQWYvRUFhSUFBQUFIQVFFQkFRRUFBQUFBQUFBQUFBUUZBd0lHQVFBSENBa0tDd0VBQWdJREFRRUJBUUVBQUFBQUFBQUEmI3hBO0FRQUNBd1FGQmdjSUNRb0xFQUFDQVFNREFnUUNCZ2NEQkFJR0FuTUJBZ01SQkFBRklSSXhRVkVHRTJFaWNZRVVNcEdoQnhXeFFpUEImI3hBO1V0SGhNeFppOENSeWd2RWxRelJUa3FLeVkzUENOVVFuazZPek5oZFVaSFREMHVJSUpvTUpDaGdaaEpSRlJxUzBWdE5WS0JyeTQvUEUmI3hBOzFPVDBaWFdGbGFXMXhkWGw5V1oyaHBhbXRzYlc1dlkzUjFkbmQ0ZVhwN2ZIMStmM09FaFlhSGlJbUtpNHlOam8rQ2s1U1ZscGVZbVomI3hBO3FibkoyZW41S2pwS1dtcDZpcHFxdXNyYTZ2b1JBQUlDQVFJREJRVUVCUVlFQ0FNRGJRRUFBaEVEQkNFU01VRUZVUk5oSWdaeGdaRXkmI3hBO29iSHdGTUhSNFNOQ0ZWSmljdkV6SkRSRGdoYVNVeVdpWTdMQ0IzUFNOZUpFZ3hkVWt3Z0pDaGdaSmpaRkdpZGtkRlUzOHFPend5Z3AmI3hBOzArUHpoSlNrdE1UVTVQUmxkWVdWcGJYRjFlWDFSbFptZG9hV3ByYkcxdWIyUjFkbmQ0ZVhwN2ZIMStmM09FaFlhSGlJbUtpNHlOam8mI3hBOytEbEpXV2w1aVptcHVjblo2ZmtxT2twYWFucUttcXE2eXRycSt2L2FBQXdEQVFBQ0VRTVJBRDhBRmZsWCtYbWkrYU5Qalc1aVZad3QmI3hBO2ZVcDFvTytSRElsNkYvMEx4NWY4VSs3K3pEU0xkLzBMeDVmOFUrNyt6R2x0My9RdkhsL3hUN3Y3TWFXM2Y5QzhlWC9GUHUvc3hwYmQmI3hBOy93QkM4ZVgvQUJUN3Y3TWFXM2Y5QzhlWC9GUHUvc3hwYmQvMEx4NWY4VSs3K3pHbHQzL1F2SGwveFQ3djdNYVczZjhBUXZIbC93QVUmI3hBOys3K3pHbHQzL1F2SGwveFQ3djdNYVcwdTE3OGovTHVrNmJMZXNxU2NCc29IZW1OSnRPZitjZFk0NC9LbXN4eHFGUmRabUNxTmdCOVYmI3hBO3RzUWd2VmNLSFlxN0ZYWXE3RlhZcThRLzV5Ny9BUEpiYWIvMjJZUCtvVzV3RmxGODNlUi95eTg0ZWVQcnYrSExSTHI5SCtsOWE1eXgmI3hBO3hjZlg1OEtlb3kxcjZUZE1ESWxsWC9RczM1d2Y5V3FIL3BMdHYrYThhUmJ2K2hadnpnLzZ0VVAvQUVsMjMvTmVOTGJ2K2hadnpnLzYmI3hBO3RVUC9BRWwyMy9OZU5MYnYraFp2emcvNnRVUC9BRWwyMy9OZU5MYnYraFp2emcvNnRVUC9BRWwyMy9OZU5MYnYraFp2emcvNnRVUC8mI3hBO0FFbDIzL05lTkxiditoWnZ6Zy82dFVQL0FFbDIzL05lTkxiditoWnZ6Zy82dFVQL0FFbDIzL05lTkxiditoWnZ6Zy82dFVQL0FFbDImI3hBOzMvTmVOTGJ2K2hadnpnLzZ0VVAvQUVsMjMvTmVOTGJ6YlZ0TXZOSzFTODB1OVFSM3RoUEphM0tBaGdzc0xsSEFZVkJveW5jWXBmVmYmI3hBOy9PTzMrODhmK29mMVlReEwzVEN4ZGlyc1ZkaXJzVmRpcnNWZGlyc1ZkaXJIUHpBLzVScTQvd0EreHhVTVAvNXg1LzVSZlcvKzJ6Ti8mI3hBOzFEVzJBSkwxUENoMkt1eFYyS3V4VjJLdkVQOEFuTHYvQU1sdHB2OEEyMllQK29XNXdGbEZqWC9PR3Y4QTAxLy9BRzd2K3hyRUxKOUsmI3hBO1lXTHNWZGlyc1ZkaXJzVmRpcnNWZGlyc1ZmbjMrWnYvQUpNbnpaLzIyZFEvNmlwTWkyQjlJZjhBT08zKzg4ZitvZjFZUXhMM1RDeGQmI3hBO2lyc1ZkaXJzVmRpcnNWZGlyc1ZkaXJIUHpBLzVScTQvejdIRlF3Ly9BSng1L3dDVVgxdi9BTGJNMy9VTmJZQWt2VThLSFlxN0ZYWXEmI3hBOzdGWFlxOFEvNXk3L0FQSmJhYi8yMllQK29XNXdGbEZqWC9PR3YvVFgvd0RidS83R3NRc24wcGhZdXhWMkt1eFYyS3V4VjJLdXhWMksmI3hBO3V4VitmZjVtL3dEa3lmTm4vYloxRC9xS2t5TFlIMGgvemp0L3ZQSC9BS2gvVmhERXZkTUxGMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3MmI3hBO2MvTUQvbEdyai9Qc2NWREQvd0RuSG4vbEY5Yi9BTzJ6Ti8xRFcyQUpMMVBDaDJLdXhWMkt1eFYyS3ZFUCtjdS8vSmJhYi8yMllQOEEmI3hBO3FGdWNCWlJZMS96aHIvMDEvd0QyN3Y4QXNheEN5ZlNtRmk3RlhZcTdGWFlxN0ZYWXE3RlhZcTdGWDU5L21iLzVNbnpaL3dCdG5VUCsmI3hBO29xVEl0Z2ZTSC9PTzMrODhmK29mMVlReEwzVEN4ZGlyc1ZkaXJzVmRpcnNWZGlyc1ZkaXJIUHpBL3dDVWF1UDgreHhVTVA4QStjZWYmI3hBOytVWDF2L3RzemY4QVVOYllBa3ZVOEtIWXE3RlhZcTdGWFlxOFEvNXk3LzhBSmJhYi93QnRtRC9xRnVjQlpSWTEvd0E0YS84QVRYLzkmI3hBO3U3L3NheEN5ZlNtRmk3RlhZcTdGWFlxN0ZYWXE3RlhZcTdGWDU5L21iLzVNbnpaLzIyZFEvd0NvcVRJdGdmU0gvT08zKzg4ZitvZjEmI3hBO1lReEwzVEN4ZGlyc1ZkaXJzVmRpcnNWZGlyc1ZkaXJIUHpBLzVScTQvd0EreHhVTVAvNXg1LzVSZlcvKzJ6Ti8xRFcyQUpMMVBDaDImI3hBO0t1eFYyS3V4VjJLdkVQOEFuTHYvQU1sdHB2OEEyMllQK29XNXdGbEZqWC9PR3Y4QTAxLy9BRzd2K3hyRUxKOUtZV0xzVmRpcnNWZGkmI3hBO3JzVmRpcnNWZGlyc1ZmbjMrWnYvQUpNbnpaLzIyZFEvNmlwTWkyQjlJZjhBT08zKzg4ZitvZjFZUXhMM1RDeGRpcnNWZGlyc1ZkaXImI3hBO3NWZGlyc1ZkaXJIUHpBLzVScTQvejdIRlF3Ly9BSng1L3dDVVgxdi9BTGJNMy9VTmJZQWt2VThLSFlxN0ZYWXE3RlhZcThRLzV5Ny8mI3hBO0FQSmJhYi8yMllQK29XNXdGbEZqWC9PR3YvVFgvd0RidS83R3NRc24wcGhZdXhWMkt1eFYyS3V4VjJLdXhWMkt1eFYrZmY1bS93RGsmI3hBO3lmTm4vYloxRC9xS2t5TFlIMGgvemp0L3ZQSC9BS2gvVmhERXZkTUxGMkt1eFYyS3V4VjJLdXhWMkt1eFYyS3NjL01EL2xHcmovUHMmI3hBO2NWREQvd0RuSG4vbEY5Yi9BTzJ6Ti8xRFcyQUpMMVBDaDJLdXhWMkt1eFYyS3ZFUCtjdS8vSmJhYi8yMllQOEFxRnVjQlpSWTEvemgmI3hBO3IvMDEvd0QyN3Y4QXNheEN5ZlNtRmk3RlhZcTdGWFlxN0ZYWXE3RlhZcTdGWDU5L21iLzVNbnpaL3dCdG5VUCtvcVRJdGdmUjMvT1AmI3hBO0xvbHNqT3dWUWhxU2FEcGhERXZjZnJWci92NVArQ0g5Y0xGMzFxMS8zOG4vQUFRL3JpcnZyVnIvQUwrVC9naC9YRlhmV3JYL0FIOG4mI3hBOy9CRCt1S3UrdFd2Ky9rLzRJZjF4VjMxcTEvMzhuL0JEK3VLdSt0V3YrL2svNElmMXhWMzFxMS8zOG4vQkQrdUt1K3RXdisvay93Q0MmI3hBO0g5Y1ZkOWF0ZjkvSi93QUVQNjRxeDd6N05DL2x1NENTS3g2MFVnOWo0WXBZbC96anoveWkrdC85dG1iL0FLaHJiQUZMMVBDaDJLdXgmI3hBO1YyS3V4VjJLdkVQK2N1Ly9BQ1cybS84QWJaZy82aGJuQVdVWG52OEF6aTM1NDhwK1YvOEFFMytJTlRoMDc2NTlSK3Jlc1NPZnBmV08mI3hBO2RLQS9aNXI5K0FMSVBlZitWMy9sUC8xTTFuOTdmODA0YlJUditWMy9BSlQvQVBVeldmM3Qvd0EwNDJ0Ty93Q1YzL2xQL3dCVE5aL2UmI3hBOzMvTk9OclR2K1YzL0FKVC9BUFV6V2YzdC93QTA0MnRPL3dDVjMvbFAvd0JUTlovZTMvTk9OclR2K1YzL0FKVC9BUFV6V2YzdC93QTAmI3hBOzQydE8vd0NWMy9sUC93QlROWi9lMy9OT05yVHYrVjMvQUpUL0FQVXpXZjN0L3dBMDQydE8vd0NWMy9sUC93QlROWi9lMy9OT05yVHYmI3hBOytWMy9BSlQvQVBVeldmM3Qvd0EwNDJ0UGl6ei9BSDFwZitlL01kL1p5aWV6dTlVdlo3YVpmc3ZISmNPNk1QWmxOY0RNUFN2SzMrT2YmI3hBOzBURitodVAxYWcreld2MDB4UW5IL0lWdmYvaHNVTy81Q3Q3L0FQRFlxNy9rSzN2L0FNTmlydjhBa0szdi93QU5pcnYrUXJlLy9EWXEmI3hBOzcva0szdjhBOE5pcnYrUXJlLzhBdzJLdS93Q1FyZS8vQUEyS3UvNUN0Ny84TmlyditRcmUvd0R3MktyWlArVnBjRzlUN0ZQaTVjcVUmI3hBOzk4VmVxLzhBT09YcmY0UjFqMStQcS9waWJueDZWK3EyM1N1RUlMMWJDaDJLdXhWMkt1eFYyS3ZFUCtjdS93RHlXMm0vOXRtRC9xRnUmI3hBO2NCWlJmSXVCazdGWFlxN0ZYWXE3RlhZcTdGWFlxN0ZYWXE3RlgvL1o8L3htcEdJbWc6aW1hZ2U+CiAgICAgICAgICAgICAgIDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpBbHQ+CiAgICAgICAgIDwveG1wOlRodW1ibmFpbHM+CiAgICAgICAgIDx4bXBNTTpJbnN0YW5jZUlEPnhtcC5paWQ6YzAzYzk1NmEtMmM5ZC00MzI0LWFmMWYtNWFhNjNhMWM4MDA5PC94bXBNTTpJbnN0YW5jZUlEPgogICAgICAgICA8eG1wTU06RG9jdW1lbnRJRD54bXAuZGlkOmMwM2M5NTZhLTJjOWQtNDMyNC1hZjFmLTVhYTYzYTFjODAwOTwveG1wTU06RG9jdW1lbnRJRD4KICAgICAgICAgPHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD51dWlkOjVEMjA4OTI0OTNCRkRCMTE5MTRBODU5MEQzMTUwOEM4PC94bXBNTTpPcmlnaW5hbERvY3VtZW50SUQ+CiAgICAgICAgIDx4bXBNTTpSZW5kaXRpb25DbGFzcz5wcm9vZjpwZGY8L3htcE1NOlJlbmRpdGlvbkNsYXNzPgogICAgICAgICA8eG1wTU06RGVyaXZlZEZyb20gcmRmOnBhcnNlVHlwZT0iUmVzb3VyY2UiPgogICAgICAgICAgICA8c3RSZWY6aW5zdGFuY2VJRD51dWlkOmFjOTVjMjFhLTM2MGEtNGVjZi1iNTBkLTE4ZGVhZmQ4NTYzNjwvc3RSZWY6aW5zdGFuY2VJRD4KICAgICAgICAgICAgPHN0UmVmOmRvY3VtZW50SUQ+eG1wLmRpZDozYzUyMWIzYy04ZTE3LTY0NDItYjVjYi0wMDAxYzVhYjNlMWI8L3N0UmVmOmRvY3VtZW50SUQ+CiAgICAgICAgICAgIDxzdFJlZjpvcmlnaW5hbERvY3VtZW50SUQ+dXVpZDo1RDIwODkyNDkzQkZEQjExOTE0QTg1OTBEMzE1MDhDODwvc3RSZWY6b3JpZ2luYWxEb2N1bWVudElEPgogICAgICAgICAgICA8c3RSZWY6cmVuZGl0aW9uQ2xhc3M+cHJvb2Y6cGRmPC9zdFJlZjpyZW5kaXRpb25DbGFzcz4KICAgICAgICAgPC94bXBNTTpEZXJpdmVkRnJvbT4KICAgICAgICAgPHhtcE1NOkhpc3Rvcnk+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmFjdGlvbj5zYXZlZDwvc3RFdnQ6YWN0aW9uPgogICAgICAgICAgICAgICAgICA8c3RFdnQ6aW5zdGFuY2VJRD54bXAuaWlkOmMwM2M5NTZhLTJjOWQtNDMyNC1hZjFmLTVhYTYzYTFjODAwOTwvc3RFdnQ6aW5zdGFuY2VJRD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OndoZW4+MjAxOS0xMi0xOFQxNzowODo1OSswODowMDwvc3RFdnQ6d2hlbj4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OnNvZnR3YXJlQWdlbnQ+QWRvYmUgSWxsdXN0cmF0b3IgQ0MgMjMuMSAoTWFjaW50b3NoKTwvc3RFdnQ6c29mdHdhcmVBZ2VudD4KICAgICAgICAgICAgICAgICAgPHN0RXZ0OmNoYW5nZWQ+Lzwvc3RFdnQ6Y2hhbmdlZD4KICAgICAgICAgICAgICAgPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC94bXBNTTpIaXN0b3J5PgogICAgICAgICA8aWxsdXN0cmF0b3I6U3RhcnR1cFByb2ZpbGU+UHJpbnQ8L2lsbHVzdHJhdG9yOlN0YXJ0dXBQcm9maWxlPgogICAgICAgICA8cGRmOlByb2R1Y2VyPkFkb2JlIFBERiBsaWJyYXJ5IDEwLjAxPC9wZGY6UHJvZHVjZXI+CiAgICAgIDwvcmRmOkRlc2NyaXB0aW9uPgogICA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIAogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgCiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAKICAgICAgICAgICAgICAgICAgICAgICAgICAgCjw/eHBhY2tldCBlbmQ9InciPz7/4gxYSUNDX1BST0ZJTEUAAQEAAAxITGlubwIQAABtbnRyUkdCIFhZWiAHzgACAAkABgAxAABhY3NwTVNGVAAAAABJRUMgc1JHQgAAAAAAAAAAAAAAAAAA9tYAAQAAAADTLUhQICAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABFjcHJ0AAABUAAAADNkZXNjAAABhAAAAGx3dHB0AAAB8AAAABRia3B0AAACBAAAABRyWFlaAAACGAAAABRnWFlaAAACLAAAABRiWFlaAAACQAAAABRkbW5kAAACVAAAAHBkbWRkAAACxAAAAIh2dWVkAAADTAAAAIZ2aWV3AAAD1AAAACRsdW1pAAAD+AAAABRtZWFzAAAEDAAAACR0ZWNoAAAEMAAAAAxyVFJDAAAEPAAACAxnVFJDAAAEPAAACAxiVFJDAAAEPAAACAx0ZXh0AAAAAENvcHlyaWdodCAoYykgMTk5OCBIZXdsZXR0LVBhY2thcmQgQ29tcGFueQAAZGVzYwAAAAAAAAASc1JHQiBJRUM2MTk2Ni0yLjEAAAAAAAAAAAAAABJzUkdCIElFQzYxOTY2LTIuMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA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",
            },
            source: source
        }
    });
    material.uniforms.image = video_dom;
    let appearance = new Cesium.EllipsoidSurfaceAppearance({
        material: material,
        flat: true,
        renderState: {
            cull: {
                enabled: false,
            },
            depthTest: {
                enabled: false
            }
        }
    });
    return appearance;
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

