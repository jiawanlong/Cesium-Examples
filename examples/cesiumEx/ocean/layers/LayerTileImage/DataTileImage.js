// Url瓦片图层数据获取

class DataTileImage {
  constructor(config = {}) {
    this._access_token = config.access_token ? config.access_token : ''
    this._params = {}
  }

  get access_token() {
    return this._access_token
  }

  set access_token(val) {
    if (!val || typeof val != 'string') return
    this._access_token = val
  }

  async request(options = {}) {
    return new Promise((resolve) => {
      resolve(options)
    })
  }
}

export default DataTileImage
