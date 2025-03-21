/**
 * @class
 * @description 3dtiles模型压平
 */
class Flat {
    /**
     * 
     * @param {Cesium.Cesium3DTileset} tileset 三维模型
     * @param {Object} opt 
     * @param {Number} opt.flatHeight 压平高度 
     */
    constructor(tileset, opt) {
        if (!tileset) return;
        this.tileset = tileset;
        this.opt = opt || {};
        this.flatHeight = this.opt.flatHeight || 0;
 
        this.center = tileset.boundingSphere.center.clone();
 
 
        this.matrix = Cesium.Transforms.eastNorthUpToFixedFrame(this.center.clone());
        this.localMatrix = Cesium.Matrix4.inverse(this.matrix, new Cesium.Matrix4());
 
        // 多面的坐标数组
        this.regionList = [];
        // 多个面坐标转为局部模型坐标
        this.localPositionsArr = [];
    }
 
    /**
     * 添加压平面
     * @param {Object} attr 参数
     * @param {Cesium.Cartesian3[]} attr.positions 压平面坐标
     * @param {Number} attr.height 压平深度，当前不支持单独设置
     * @param {Number} attr.id 唯一标识
     */
    addRegion(attr) {
        let { positions, height, id } = attr || {};
        // this.flatHeight = height;
        if (!id) id = (new Date()).getTime() + "" + Number(Math.random() * 1000).toFixed(0);
        this.regionList.push(attr);
        for (let i = 0; i < this.regionList.length; i++) {
            let item = this.regionList[i];
            const positions = item.positions;
            let localCoor = this.cartesiansToLocal(positions);
            this.localPositionsArr.push(localCoor);
        }
 
        const funstr = this.getIsinPolygonFun(this.localPositionsArr);
        let str = ``;
        for (let i = 0; i < this.localPositionsArr.length; i++) {
            const coors = this.localPositionsArr[i];
            const n = coors.length;
            let instr = ``;
            coors.forEach((coordinate, index) => {
                instr += `points_${n}[${index}] = vec2(${coordinate[0]}, ${coordinate[1]});\n`;
            })
            str += `
                ${instr}
                if(isPointInPolygon_${n}(position2D)){
                    vec4 tileset_local_position_transformed = vec4(tileset_local_position.x, tileset_local_position.y, ground_z, 1.0);
                    vec4 model_local_position_transformed = czm_inverseModel * u_tileset_localToWorldMatrix * tileset_local_position_transformed;
                    vsOutput.positionMC.xy = model_local_position_transformed.xy;
                    vsOutput.positionMC.z = model_local_position_transformed.z+ modelMC.z*0.002;
                    return;
                }`;
 
        }
 
        this.updateShader(funstr, str);
    }
 
    /**
     * 根据id删除压平的面
     * @param {String} id 唯一标识
     */
    removeRegionById(id) {
        if (!id) return;
 
        this.regionList = this.regionList.filter((attr) => {
            return attr.id != id;
        })
 
        this.localPositionsArr = [];
        for (let i = 0; i < this.regionList.length; i++) {
            let item = this.regionList[i];
            const positions = item.positions;
            let localCoor = this.cartesiansToLocal(positions);
            this.localPositionsArr.push(localCoor);
        }
 
        const funstr = this.getIsinPolygonFun(this.localPositionsArr);
        let str = ``;
        for (let i = 0; i < this.localPositionsArr.length; i++) {
            const coors = this.localPositionsArr[i];
            const n = coors.length;
            let instr = ``;
            coors.forEach((coordinate, index) => {
                instr += `points_${n}[${index}] = vec2(${coordinate[0]}, ${coordinate[1]});\n`;
            })
            str += `
                ${instr}
                if(isPointInPolygon_${n}(position2D)){
                    vec4 tileset_local_position_transformed = vec4(tileset_local_position.x, tileset_local_position.y, ground_z, 1.0);
                    vec4 model_local_position_transformed = czm_inverseModel * u_tileset_localToWorldMatrix * tileset_local_position_transformed;
                    vsOutput.positionMC.xy = model_local_position_transformed.xy;
                    vsOutput.positionMC.z = model_local_position_transformed.z+ modelMC.z*0.002;
                    return;
                }`;
 
        }
        this.updateShader(funstr, str);
    }
 
    /**
     * 销毁
     */
    destroy() {
        this.tileset.customShader = undefined;
    }
 
    /**
     * 根据数组长度，构建 判断点是否在面内 的压平函数
     */
    getIsinPolygonFun(polygons) {
        let pmap = polygons.map((polygon) => polygon.length);
        let uniqueArray = this.getUniqueArray(pmap);
        let str = ``;
        uniqueArray.forEach(length => {
            str += `
                vec2 points_${length}[${length}];
                bool isPointInPolygon_${length}(vec2 point){
                int nCross = 0; // 交点数
                const int n = ${length}; 
                for(int i = 0; i < n; i++){
                    vec2 p1 = points_${length}[i];
                    vec2 p2 = points_${length}[int(mod(float(i+1),float(n)))];
                    if(p1[1] == p2[1]){
                        continue;
                    }
                    if(point[1] < min(p1[1], p2[1])){
                        continue;
                    }
                    if(point[1] >= max(p1[1], p2[1])){
                        continue;
                    }
                    float x = p1[0] + ((point[1] - p1[1]) * (p2[0] - p1[0])) / (p2[1] - p1[1]);
                    if(x > point[0]){
                     nCross++;
                    }
                }
                return int(mod(float(nCross), float(2))) == 1;
                }
            `
        })
        return str
    }
 
    updateShader(vtx1, vtx2) {
        let flatCustomShader = new Cesium.CustomShader({
            uniforms: {
                u_tileset_localToWorldMatrix: {
                    type: Cesium.UniformType.MAT4,
                    value: this.matrix,
                },
                u_tileset_worldToLocalMatrix: {
                    type: Cesium.UniformType.MAT4,
                    value: this.localMatrix,
                },
                u_flatHeight: {
                    type: Cesium.UniformType.FLOAT,
                    value: this.flatHeight,
                },
            },
            vertexShaderText: `
            // 所有isPointInPolygon函数
            ${vtx1}
            void vertexMain(VertexInput vsInput, inout czm_modelVertexOutput vsOutput){
                vec3 modelMC = vsInput.attributes.positionMC;
                vec4 model_local_position = vec4(modelMC.x, modelMC.y, modelMC.z, 1.0);
                vec4 tileset_local_position = u_tileset_worldToLocalMatrix * czm_model * model_local_position;
                vec2 position2D = vec2(tileset_local_position.x,tileset_local_position.y);
                float ground_z = 0.0 + u_flatHeight;
                // 多个多边形区域
                ${vtx2}
            }`,
        });
        this.tileset.customShader = flatCustomShader;
    }
 
    // 数组去重，不能处理嵌套的数组
    getUniqueArray = (arr) => {
        return arr.filter(function (item, index, arr) {
            //当前元素，在原始数组中的第一个索引==当前索引值，否则返回当前元素
            return arr.indexOf(item, 0) === index;
        });
    }
 
 
    // 世界坐标转数组局部坐标
    cartesiansToLocal(positions) {
        let arr = [];
        for (let i = 0; i < positions.length; i++) {
            let position = positions[i];
            let localp = Cesium.Matrix4.multiplyByPoint(
                this.localMatrix,
                position.clone(),
                new Cesium.Cartesian3()
            )
            arr.push([localp.x, localp.y]);
        }
        return arr;
    }
 
 
}
 