/*
 * @FilePath: LayerOceanCurrent.js
 * @Author: chenqian
 * @Date: 2022-08-22 16:08:21
 * @LastEditors: cheniqan
 * @LastEditTime: 2022-11-21 18:09:22
 * @Descripttion:
 */
// 海流流线图
import Base from './../AbsLayerObj.js'
// import DataModule from './DataOceanCurrent'
// import * as Cesium from "cesium";
import RenderDynamicCurrent from './current/RenderDynamicCurrent.js'

class LayerOceanCurrent extends Base {
  constructor(config) {
    super(config)
    this.belong = 'cesium'
    // this.dataModule = new DataModule()
  }

  get currentIdx() {
    return currentIdx
  }

  load(data) {
    data = this.buildResult( data )
    this.data = data
    // this.data = await this.dataModule.request(options)
    // this.emit('data', this.data)
    return this
  }

  draw(option) {
    this.data = option.data || this.data
    if (!this.data) return
    if (!this.data.length) return
    this.render = new RenderDynamicCurrent(this.map, Cesium)
    this.render.id = 'RenderDynamicCurrent_' + this.id
    this.render.parseData(this.data)
    this.render.Render()
  }

  clean() {
    if (this.render) this.render.remove()
    this.render = null
    // this.dataModule.cancel()
  }
  update(options) {
    if (this.render) this.render.updateO(options)
  }

  buildResult(data) {
    let field = []
    let w = data.gridWidth
    let h = data.gridHeight
    let i = 0
    for (let x = 0; x < w; x++) {
      field[x] = []
      for (let y = 0; y < h; y++) {
        let vx = Number(data.field[i++])
        let vy = Number(data.field[i++])
        let v = { x: vx, y: vy }
        field[x][y] = v
      }
    }
    let ydatas = [],
      xdatas = []
    for (let y = data.gridHeight - 1; y >= 0; y--) {
      for (let x = 0; x < data.gridWidth; x++) {
        xdatas.push(field[x][y].x)
        ydatas.push(field[x][y].y)
      }
    }
    let header = {
      nx: data.gridWidth,
      ny: data.gridHeight,
      basicAngle: 0,
      subDivisions: 0,
      lo1: data.x0,
      la1: data.y0,
      lo2: data.x1,
      la2: data.y1,
      dx: data.dx || 0.8,
      dy: data.dy || 0.8
    }

    let uData = xdatas
    let vData = ydatas
    return [header, uData, vData]
  }
}

export default LayerOceanCurrent
