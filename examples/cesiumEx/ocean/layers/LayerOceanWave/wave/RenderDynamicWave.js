import { waveData } from './WaveData'

function RenderDynamicWave(viewer, Cesium) {
  this.particles = []
  this.particleCount = []
  this._field = undefined
  this._scale = 0.4 //1.0 //生成粒子的缩放因子
  this._imageMask = undefined
  this._particleNum = undefined
  this._mapCenter = undefined
  this._mapScale = undefined
  this._windowWidth = undefined
  this._windowheight = undefined
  this._bounds = {
    x: 0,
    y: 0,
    xMax: 0,
    yMax: 0,
    width: 0,
    height: 0
  }

  this._viewer = viewer
  this._cancel = false
  this._centerPnt = new Cesium.Cartographic()

  this.densityScale = 1 //1  //密度比例系数
  this.velocityScale = 1 //1 //速度比例系数
  this.builder = null
}
RenderDynamicWave.prototype.setData = (renderObject, data) => {
  var bounds = data.params.bounds
  var columns = data.columns
  var maskImageData = data.pixels
  var mask = maskImageData
  const that = renderObject
  that._imageMask = mask
  that._field = waveData.createField(columns, bounds, false)

  //lxl发现粒子在原位置时没生成，移到此位置
  that.particleCount = Math.round(
    data.params.clientHeight *
      data.params.clientWidth *
      waveData.PARTICLE_MULTIPLIER *
      that._scale
  )

  if (that._field != null) {
    for (var i = 0; i < that.particleCount; i++) {
      that.particles.push(
        that._field.randomize({
          age: waveData.random(0, waveData.MAX_PARTICLE_AGE)
        })
      )
    }
  }

  var canvas, canvasOverLay
  if (document.getElementById('fullScreen')) {
    canvas = document.getElementById('fullScreen')
    canvasOverLay = document.getElementById('image-canvas')
  } else {
    canvasOverLay = document.createElement('CANVAS')
    document.body.appendChild(canvasOverLay)
    canvasOverLay.id = 'image-canvas'
    canvasOverLay.width = bounds.width
    canvasOverLay.height = bounds.height
    canvasOverLay.style.position = 'absolute'
    canvasOverLay.style.top = 0
    canvasOverLay.style.left = 0
    canvasOverLay.style.zIndex = 100
    canvasOverLay.style.pointerEvents = 'none'

    canvas = document.createElement('CANVAS')
    document.body.appendChild(canvas)
    canvas.id = 'fullScreen'
    canvas.style.position = 'absolute'
    canvas.style.top = 0
    canvas.style.left = 0
    canvas.style.zIndex = 100
    canvas.style.pointerEvents = 'none'
    canvas.width = bounds.width
    canvas.height = bounds.height
  }
  var g = canvas.getContext('2d')
  g.clearRect(0, 0, canvas.width, canvas.height)

  that._lineCanvas = canvas
  that._lineCanvas.style.display = 'block'
  that._g = g
  that._g.lineWidth = that.lineWidth || 7
  that._g.fillStyle = waveData.fadeFillStyle

  var gOverlay = canvasOverLay.getContext('2d')
  gOverlay.clearRect(0, 0, canvasOverLay.width, canvasOverLay.height)

  that._imageCanvas = canvasOverLay
  that._imageCanvas.style.display = 'block'
  that._imageG = gOverlay
}
RenderDynamicWave.prototype.dealData = (renderObject, params) => {
  if (!renderObject.builder) {
    let uvData = params.uvData
    let [header, uData, vData] = uvData
    renderObject.builder = new waveData.buildGrid({
      header,
      data: function (i) {
        return [uData[i], vData[i]]
      },
      interpolate: waveData.bilinearInterpolateVector
    })
  }
  if (params.velocityScale_o) waveData.velocityScale_o = params.velocityScale_o
  let result = waveData.reCreate(params, renderObject.builder, true)

  let data = {
    params,
    columns: result.columns,
    pixels: result.mask.imageData
  }
  return data
}
RenderDynamicWave.prototype.parseData = function (uvData) {
  this.uvData = uvData
}

RenderDynamicWave.prototype.reCreate = function (renderObject) {
  var scene = this._viewer.scene
  var canvas = scene.canvas
  var camera = scene.camera

  var width = renderObject._viewer.scene.canvas.clientWidth
  var height = renderObject._viewer.scene.canvas.clientHeight
  renderObject._windowWidth = width
  renderObject._windowheight = height
  renderObject._bounds.xMax = width
  renderObject._bounds.yMax = height
  renderObject._bounds.width = width
  renderObject._bounds.height = height
  if (renderObject._field != null) {
    renderObject._field.release()
  }

  var params = {}
  params.clientWidth = canvas.clientWidth
  params.clientHeight = canvas.clientHeight
  params.viewMatrix = camera.viewMatrix
  params.projectionMatrix = camera.frustum.projectionMatrix
  params.fovy = camera.frustum.fovy
  params.aspectRatio = camera.frustum.aspectRatio
  params.near = camera.frustum.near
  params.positionWC = camera.positionWC
  params.directionWC = camera.directionWC
  params.rightWC = camera.rightWC
  params.upWC = camera.upWC
  params.center = renderObject._centerPnt
  params.bounds = renderObject._bounds
  params.uvData = this.uvData
  params.velocityScale_o = renderObject.velocityScale_o

  const data = renderObject.dealData(renderObject, params)
  renderObject.setData(renderObject, data)
}
RenderDynamicWave.prototype.getCurrentExtent = function () {
  let _self = this
  //获取当前三维地图范围
  var Rectangle = _self._viewer.camera.computeViewRectangle()
  //地理坐标（弧度）转经纬度坐标
  var extent = [
    (Rectangle.west / Math.PI) * 180,
    (Rectangle.south / Math.PI) * 180,
    (Rectangle.east / Math.PI) * 180,
    (Rectangle.north / Math.PI) * 180
  ]
  return extent
}
RenderDynamicWave.prototype.deg2rad = function (deg) {
  return (deg / 180) * Math.PI
}

// 速度和强度
RenderDynamicWave.prototype.getVelocityScaleByHeight = function (height) {
  let extent = this.getCurrentExtent()
  let mapBounds = {
    south: this.deg2rad(extent[1]),
    north: this.deg2rad(extent[3]),
    east: this.deg2rad(extent[2]),
    west: this.deg2rad(extent[0])
  }
  let mapArea =
    (mapBounds.south - mapBounds.north) * (mapBounds.west - mapBounds.east)
  let scale = 0.00015 * this.velocityScale
  if (height < 60000) scale = 0.00002 * this.velocityScale
  let velocityScale_o =
    scale *
    (Math.pow(window.devicePixelRatio, 1 / 3) || 1) *
    Math.pow(mapArea, 0.2)
  return velocityScale_o
}

// 密度
RenderDynamicWave.prototype.getScaleByHeight = function (height) {
  // console.log('当前相机高度', height)
  // waveData.MAX_PARTICLE_AGE = 100;
  if (height < 630000) this.densityScale = 0.4
  let _scale = 1 * this.densityScale
  if (height > 14125162) {
    _scale = 1 * this.densityScale
  } else if (height > 14125162 * 0.8) {
    _scale = 0.7 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.8, 2)) {
    _scale = 0.5 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 3)) {
    _scale = 0.4 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 4)) {
    _scale = 0.18 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 5)) {
    _scale = 0.14 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 6)) {
    _scale = 0.13 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 7)) {
    _scale = 0.08 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 8)) {
    _scale = 0.06 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 9)) {
    _scale = 0.04 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 10)) {
    _scale = 0.03 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 11)) {
    _scale = 0.02 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 12)) {
    _scale = 0.01 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 13)) {
    _scale = 0.005 * this.densityScale
  } else if (height > 14125162 * Math.pow(0.5, 14)) {
    _scale = 0.001 * this.densityScale
  } else {
    _scale = 0.0001 * this.densityScale
  }
  return _scale
}
RenderDynamicWave.prototype.Render = function () {
  var _this = this
  var scene = this._viewer.scene
  var renderObject = this
  renderObject.start = true
  renderObject.velocityScale_o = _this.getVelocityScaleByHeight(
    scene.camera.positionCartographic.height
  )
  renderObject._isRender = true
  this.reCreate(renderObject)
  _this._scale = _this.getScaleByHeight(
    scene.camera.positionCartographic.height
  )
  // var particleCount = Math.round(renderObject._windowheight * waveData.PARTICLE_MULTIPLIER);
  // var particles = [];
  // if(renderObject._field != null)
  // {
  // 	for (var i = 0; i < particleCount; i++) {
  // 	particles.push(renderObject._field.randomize({age:waveData.random(0, waveData.MAX_PARTICLE_AGE)}));
  //    }
  // }
  scene.camera.moveEnd.addEventListener(function () {
    if (!renderObject.start) return
    //获取当前相机高度
    renderObject.start1 = true
    //获取当前相机高度
    var newCenter = scene.camera.positionCartographic
    if (newCenter != renderObject._centerPnt) {
      renderObject.velocityScale_o = renderObject.getVelocityScaleByHeight(
        newCenter.height
      )
      renderObject.reCreate(renderObject)
      renderObject._isRender = true
      _this._scale = renderObject.getScaleByHeight(newCenter.height)
      _this.particles = []

      _this.particleCount = Math.round(
        renderObject._windowheight * waveData.PARTICLE_MULTIPLIER * _this._scale
      )
      _this.particleCount = Math.round(
        renderObject._windowheight *
          waveData.PARTICLE_MULTIPLIER *
          renderObject._windowWidth *
          _this._scale
      )
      if (renderObject._field != null) {
        for (var i = 0; i < _this.particleCount; i++) {
          if (!renderObject.start1) {
            i = _this.particleCount - 1

            return
          }
          _this.particles.push(
            renderObject._field.randomize({
              age: waveData.random(0, waveData.MAX_PARTICLE_AGE)
            })
          )
        }
      }
    }
  })

  scene.camera.moveStart.addEventListener(function () {
    //获取当前相机高度
    var newCenter = scene.camera.positionCartographic

    if (newCenter != renderObject._centerPnt) {
      if (renderObject._field != null) {
        renderObject._field.release()
      }
      renderObject.start1 = false
      renderObject._isRender = false
      if (renderObject._imageG) {
        renderObject._imageG.clearRect(
          0,
          0,
          renderObject._windowWidth,
          renderObject._windowheight
        )
        renderObject._g.clearRect(
          0,
          0,
          renderObject._windowWidth,
          renderObject._windowheight
        )
      }
    }
  })

  // waveData.maxIntensity is the velocity at which particle color intensity is maximum
  var colorStyles = waveData.windIntensityColorScale(
    waveData.INTENSITY_SCALE_STEP,
    waveData.maxIntensity
  )
  var buckets = colorStyles.map(function () {
    return []
  })

  function evolve() {
    buckets.forEach(function (bucket) {
      bucket.length = 0
    })
    _this.particles.forEach(function (particle) {
      if (particle.age > waveData.MAX_PARTICLE_AGE) {
        renderObject._field.randomize(particle).age = 0
      }
      var x = particle.x
      var y = particle.y
      var v = renderObject._field(x, y) // vector at current position
      var m = v[2]
      if (m === null) {
        particle.age = waveData.MAX_PARTICLE_AGE // particle has escaped the grid, never to return...
      } else {
        var xt = x + v[0] * waveData.WindScale
        var yt = y + v[1] * waveData.WindScale
        if (renderObject._field.isDefined(xt, yt)) {
          // Path from (x,y) to (xt,yt) is visible, so add this particle to the appropriate draw bucket.
          particle.xt = xt
          particle.yt = yt
          buckets[colorStyles.indexFor(m)].push(particle)
        } else {
          // Particle isn't visible, but it still moves through the field.
          particle.x = xt
          particle.y = yt
        }
      }
      particle.age += 1
    })
  }

  function draw() {
    if (!renderObject.start) return

    var g = renderObject._g
    if (g == null || renderObject._imageMask == null) {
      return
    }
    var bounds = renderObject._bounds

    var prev = g.globalCompositeOperation
    g.globalCompositeOperation = 'destination-in'
    g.fillRect(bounds.x, bounds.y, bounds.width, bounds.height)
    //g.putImageData(renderObject._imageMask.imageData,0,0)
    g.globalCompositeOperation = prev

    // Draw new particle trails.
    buckets.forEach(function (bucket, i) {
      if (bucket.length > 0) {
        g.beginPath()
        g.strokeStyle = colorStyles[i]
        bucket.forEach(function (particle) {
          g.moveTo(particle.x, particle.y)
          g.lineTo(particle.xt, particle.yt)
          particle.x = particle.xt
          particle.y = particle.yt
        })
        g.stroke()
      }
    })
  }

  ;(function frame() {
    evolve()
    draw()

    if (renderObject._isRender && renderObject._imageMask) {
      //renderObject._imageG.putImageData(renderObject._imageMask,0,0);
    }
    if (renderObject.start) {
      setTimeout(frame, 1 / 0.8)
    }
  })()
}

RenderDynamicWave.prototype.remove = function () {
  var renderObject = this
  if (
    renderObject._lineCanvas != undefined &&
    renderObject._lineCanvas.style != null
  ) {
    renderObject._lineCanvas.style.display = 'none'
  }
  if (
    renderObject._imageCanvas != undefined &&
    renderObject._imageCanvas.style != null
  ) {
    renderObject._imageCanvas.style.display = 'none'
  }
  renderObject.start = false
  this.particles = []
}

RenderDynamicWave.prototype.clone = function () {}
RenderDynamicWave.prototype.update = function () {
  var RTOD = 180.0 / 3.1415926
  var canvas = document.getElementById('animation')
  var g = canvas.getContext('2d')
  // g.fillStyle = 'rgba(0, 0, 0, 0.97)'
  // g.lineWidth = 20
  g.fillStyle = 'rgba(211, 211, 211, 0.27)'
  g.lineWidth = 4

  function draw() {
    // Fade existing particle trails.
    var prev = 'source-over'
    g.globalCompositeOperation = 'destination-in'
    g.fillRect(0, 0, 800, 600)
    g.globalCompositeOperation = prev
    g.beginPath()
    g.strokeStyle = 0x111111
    for (var i = 0; i < 100; i++) {
      var x = Math.floor(Math.random() * 800)
      var y = Math.floor(Math.random() * 600)

      g.moveTo(x, y)
      g.lineTo(x + 5, y + 5)
    }
    g.stroke()
  }

  ;(function frame() {
    try {
      draw()
      setTimeout(frame, 40)
    } catch (e) {}
  })()
}
RenderDynamicWave.prototype.updateO = function (options) {
  const renderObject = this
  var scene = renderObject._viewer.scene
  renderObject.lineWidth = options.lineWidth || renderObject.lineWidth
  renderObject.densityScale = options.densityScale || renderObject.densityScale
  renderObject.velocityScale =
    options.velocityScale / 10 || renderObject.velocityScale

  if (renderObject._field != null) {
    renderObject._field.release()
  }
  renderObject.start1 = false
  renderObject._isRender = false
  if (renderObject._imageG) {
    renderObject._imageG.clearRect(
      0,
      0,
      renderObject._windowWidth,
      renderObject._windowheight
    )
    renderObject._g.clearRect(
      0,
      0,
      renderObject._windowWidth,
      renderObject._windowheight
    )
  }
  if (!renderObject.start) return
  //获取当前相机高度
  renderObject.start1 = true
  renderObject._isRender = true
  var newCenter = scene.camera.positionCartographic
  renderObject.velocityScale_o = renderObject.getVelocityScaleByHeight(
    newCenter.height
  )
  renderObject._scale = renderObject.getScaleByHeight(newCenter.height)
  renderObject.reCreate(renderObject)
  renderObject.particles = []

  renderObject.particleCount = Math.round(
    renderObject._windowheight *
      waveData.PARTICLE_MULTIPLIER *
      renderObject._scale
  )
  renderObject.particleCount = Math.round(
    renderObject._windowheight *
      waveData.PARTICLE_MULTIPLIER *
      renderObject._windowWidth *
      renderObject._scale
  )
  if (renderObject._field != null) {
    for (var i = 0; i < renderObject.particleCount; i++) {
      if (!renderObject.start1) {
        i = renderObject.particleCount - 1

        return
      }
      renderObject.particles.push(
        renderObject._field.randomize({
          age: waveData.random(0, waveData.MAX_PARTICLE_AGE)
        })
      )
    }
  }
}
export default RenderDynamicWave
