//淹没分析
//targetHeight 目标高度   adapCoordi 范围坐标[109.2039, 35.6042, 109.2774 ,35.6025,109.2766,35.5738]   waterHeight  当前水高度 speed速度 color颜色 
//changetype up/down 上升/下降  speedCallback 变化回调
class SubmergenceAnalysis {
    constructor(option) {
        //viewer, targetHeight, startHeight, waterHeight, adapCoordi, speed, color, changetype,callback
        this.viewer = option.viewer;
        this.targetHeight = option.targetHeight ? option.targetHeight : 10;
        this.startHeight = option.startHeight ? option.startHeight : 0;
        this.waterHeight = option.waterHeight ? option.waterHeight : this.startHeight;
        this.adapCoordi = option.adapCoordi ? option.adapCoordi : [0, 0, 0, 0, 0, 0];
        this.speed = option.speed ? option.speed : 1;
        this.color = option.color ? option.color : new Cesium.Color.fromBytes(64, 157, 253, 100);
        this.changetype = option.changetype ? option.changetype : 'up';
        this.speedCallback = option.speedCallback ? option.speedCallback : function (h) {}
        this.endCallback = option.endCallback ? option.endCallback : function () {}
        this.polygonEntity = null;
        this.timer = null;
        if (this.viewer) {
            this.createEntity();
            this.updatePoly(this.adapCoordi);
        }
    }
    //创建淹没实体
    createEntity() {
        if (this.polygonEntity && this.polygonEntity.length > 0) {
            for (let entity of this.polygonEntity) {
                this.viewer.entities.remove(entity)
            }
        }
        this.polygonEntity = [];
        let nEntity = this.viewer.entities.add({
            polygon: {
                hierarchy: {},
                material: this.color,
                // perPositionHeight: true
            }
        })
        nEntity.polygon.extrudedHeight = new Cesium.CallbackProperty(() => this.waterHeight, false)
        this.polygonEntity.push(nEntity);
    }
    //更新polygon
    updatePoly(adapCoordi) {
        this.adapCoordi = this.coordsTransformation(adapCoordi);
        if (this.polygonEntity && this.polygonEntity.length > 0) {
            this.polygonEntity[0].polygon.hierarchy = new Cesium.PolygonHierarchy(
                this.adapCoordi // Cesium.Cartesian3.fromDegreesArray(this.adapCoordi)
            );
        }
    }
    //坐标转换
    coordsTransformation(coords) {
        var c = [];
        if (typeof coords[0] == "number" && typeof coords[1] == "number") {
            if (coords[0] < 180 && coords[0] > -180 && coords[1] < 90 && coords[1] > -90) {
                c = Cesium.Cartesian3.fromDegreesArray(this.adapCoordi)
            } else {
                c = Cesium.Cartesian3.fromArray(this.adapCoordi)
            }
        } else {
            for (var i = 0; i < coords.length; i++) {
                var point = coords[i];
                var p = null;
                if (point.lng) {
                    p = Cesium.Cartesian3.fromDegrees(point.lng, point.lat);
                } else if (point.x) {
                    if (point.x < 180 && point.x > -180 && point.y < 90 && point.y > -90) {
                        p = Cesium.Cartesian3.fromDegrees(point.lng, point.lat);
                    } else {
                        p = point;
                    }
                }
                c.push(p);
            }
        }
        return c;
    }

    //开始
    start() {
        this.timer = window.setInterval(() => {
            var sp = this.speed / 50;
            if (this.changetype == "up") {
                this.waterHeight = util.floatObj.add(this.waterHeight, sp);
                if (this.waterHeight > this.targetHeight) {
                    this.waterHeight = this.targetHeight; //给个最大值
                    window.clearInterval(this.timer);
                    this.endCallback();
                }
            } else {
                this.waterHeight -= sp;
                if (this.waterHeight < this.targetHeight) {
                    this.waterHeight = this.targetHeight; //给个最大值
                    window.clearInterval(this.timer);
                    this.endCallback();
                }
            }
            this.speedCallback(this.waterHeight);
        }, 20)
    }
    //关闭
    clear() {
        let viewer = this.viewer
        if (this.timer) {
            window.clearInterval(this.timer)
            this.timer = null
        }
        this.waterHeight = this.startHeight;
        for (let entity of this.polygonEntity) {
            viewer.entities.remove(entity)
        }
        this.polygonEntity = null;
    }
}