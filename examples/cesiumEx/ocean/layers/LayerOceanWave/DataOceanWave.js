// 海浪流线图数据获取
import { UtilsHttpQuery as async } from '@/utils/Utils'
// import {
//   UtilsHttpQuery as async,
//   UtilsDateUnmake
// } from '../../../../utils/Utils'

class DataOceanWave {
  constructor(config = {}) {
    this._access_token = config.access_token ? config.access_token : ''
    this._params = {}
    this._promise = {}
    this._status = 'idle' // idle pendding
  }

  get access_token() {
    return this._access_token
  }

  set access_token(val) {
    if (!val || typeof val != 'string') return
    this._access_token = val
  }

  async request(options = {}) {
    this._params = this.buildParams(options)
    this._promise = async({
      method: 'GET',
      url: this._params.url
    })
    try {
      this._status = 'pendding'
      let res = await Promise.all([this._promise])
      this._status = 'idle'
      let result = res[0]
      if (result.data.code != 200) return []
      if (!result.data.data) result.data.data = {}
      let data = result.data.data
      let uvData = this.buildResult(data)
      return uvData
    } catch (error) {
      return []
    }
  }

  // async request(options = {}) {
  //   this._params = this.buildParams(options)
  //   this._promise = async({
  //     method: 'POST',
  //     url: this._params.url,
  //     data: this._params.query
  //   })
  //   try {
  //     this._status = 'pendding'
  //     let res = await Promise.all([this._promise])
  //     this._status = 'idle'
  //     let result = res[0]
  //     if (result.data.code != 200) return []
  //     if (!result.data.data) result.data.data = {}
  //     let data = result.data.data
  //     let uvData = this.buildResult(data)
  //     return uvData
  //   } catch (error) {
  //     return []
  //   }
  // }

  cancel() {
    if (this._status == 'pendding') {
      this._promise.cancel()
      this._status = 'idle'
      this._promise = null
    }
  }

  buildParams(options = {}) {
    if (!options.query) options.query = {}
    let _def = {
      url: `http://69.230.250.151:7027/VIS-Ocean/ocean/v1/getDynamicStreamline`,
      query: {
        date: '202110251800',
        element: 'wave',
        level: '9999',
        modelType: 'ec'
        // elat: "90",
        // elng: "180",
        // slat: "-90",
        // slng: "-180"
      }
    }
    return {
      url: options.url || _def.url,
      query: {
        ..._def.query,
        ...options.query
      }
    }
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
      dx: data.dx,
      dy: data.dy
    }

    let uData = xdatas
    let vData = ydatas
    return [header, uData, vData]
  }
}

export default DataOceanWave
