class AbsLayerObj {
  constructor(config = {}) {
    this._config = config
    this._visible = false
    this._onload = false
    this._islive = true
    this._id = config.id ? config.id : `${new Date().getTime()}`
  }

  get id() {
    return this._id
  }

  set id(val) {
    this._id = val
  }

  get config() {
    return this._config
  }

  set config(_config) {
    this._config = _config
  }

  get visible() {
    return this._visible
  }

  set visible(bool) {
    if (this._visible == bool) return
    if (bool) {
      this.draw({})
    } else {
      this.remove(false)
    }
    this._visible = bool
  }

  get islive() {
    return _islive
  }

  load() {
    throw new Error('子类必须重写父类的draw方法')
  }

  addToMap(map, option = {}) {
    this.add(map, option)
  }

  add(map, option) {
    this.map = this.map ? this.map : map
    if (!this._islive) return console.log('图层已被移除，无法继续加载')
    this.draw(option)
    this._visible = true
    this._onload = true
    // this.emit('add')
  }

  draw() {
    throw new Error('子类必须重写父类的draw方法')
  }

  remove(bool = true) {
    if (!this._islive) return console.log('图层已被移除')
    // if (this.dataModule && this.dataModule.cancel) this.dataModule.cancel()
    if (this.map) this.clean()
    this._visible = false
    this._onload = false
    if (bool) {
      this._islive = false
    }
    // this.emit('remove')
  }

  clean() {
    throw new Error('子类必须重写父类的clean方法')
  }

  location() {
    throw new Error('子类必须重写父类的location方法')
  }

  // on(key, func) {
  //   this._events.on(key, func)
  // }

  // un(key, func) {
  //   this._events.un(key, func)
  // }

  // emit() {
  //   this._events.emit(arguments[0], arguments[1])
  // }
}

export default AbsLayerObj
