/*
 * @FilePath: LayerWindField.js
 * @Author: chenqian
 * @Date: 2022-10-26 16:31:58
 * @LastEditors: cheniqan
 * @LastEditTime: 2022-10-27 10:36:33
 * @Descripttion:
 */
// 气象流线图
import Base from '../AbsLayerObj'
import DataModule from './DataWindField'
// import * as Cesium from "cesium";
import RenderDynamicWind from './windy/RenderDynamicWind'

class LayerWindField extends Base {
  constructor(config) {
    super(config)
    this.belong = 'cesium'
    this.dataModule = new DataModule()
  }

  get currentIdx() {
    return currentIdx
  }

  async load(options = {}) {
    this.data = await this.dataModule.request(options)
    this.emit('data', this.data)
    return this
  }

  draw(option) {
    this.data = option.data || this.data
    if (!this.data) return
    if (!this.data.length) return
    this.render = new RenderDynamicWind(this.map, window.MEarthX)
    this.render.id = 'RenderDynamicWind_' + this.id
    this.render.parseData(this.data)
    this.render.Render()
  }

  clean() {
    if (this.render) this.render.remove()
    this.render = null
    // this.data = null;
    this.dataModule.cancel()
  }

  update(options) {
    if (this.render) this.render.updateO(options)
  }
}

export default LayerWindField
