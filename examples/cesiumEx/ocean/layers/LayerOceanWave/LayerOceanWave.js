// 海浪流线图
import Base from '../AbsLayerObj'
import DataModule from './DataOceanWave'
// import * as Cesium from 'cesium'
import RenderDynamicWave from './wave/RenderDynamicWave'

class LayerOceanWave extends Base {
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
    // this.render = new RenderDynamicWave(this.map, Cesium)
    this.render = new RenderDynamicWave(this.map, window.MEarthX)
    this.render.id = 'RenderDynamicWave_' + this.id
    this.render.parseData(this.data)
    this.render.Render()
  }

  clean() {
    if (this.render) this.render.remove()
    this.render = null
    this.dataModule.cancel()
  }

  update(options) {
    if (this.render) this.render.updateO(options)
  }
}

export default LayerOceanWave
