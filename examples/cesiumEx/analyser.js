class analyser {
    constructor(viewer) {
        //初始化分析工具
        this._viewer = viewer;

        this.BEYONANALYSER_STATE = {
            PREPARE: 0,
            OPERATING: 1,
            END: 2
        };

        //初始化
        this.init();
    }

    init() {
        //handler
        this.handler = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
    }

    /**
     * 提示框
     * @param {*} bShow 
     * @param {*} position 
     * @param {*} message 
     */
    showTip(label, bShow, position, message, effectOptions) {
        label.show = bShow;
        if (bShow) {
            if (position)
                label.position = position;
            if (message)
                label.label.text = message;
            if (effectOptions) {
                for (let key in effectOptions) {
                    if (label.key) {
                        label.key = effectOptions[key];
                    }
                }
            }
        }
    }

    /**
     * 获取相交对象
     * @param {*} startPos 
     * @param {*} endPos 
     * @param {*} excludeArr 
     * @param {*} bDrillPick 
     */
    getIntersectObj(startPos,endPos,excludeArr=[],bDrillPick=false){
        var viewer=this._viewer;
        var direction = Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(endPos, startPos, new Cesium.Cartesian3()), new Cesium.Cartesian3());
        var ray = new Cesium.Ray(startPos, direction); //无限延长的射线
    
        var results = [];
    
        if (bDrillPick) {
            results = viewer.scene.drillPickFromRay(ray, 10, excludeArr);
        } else //只pick首个物体
        {
            var result = viewer.scene.pickFromRay(ray, excludeArr);
            if (Cesium.defined(result)) {
                results = [result];
            }
        }
        return results;
    }
}
