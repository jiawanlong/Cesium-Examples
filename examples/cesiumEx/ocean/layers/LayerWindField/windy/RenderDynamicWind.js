import { windData } from './WindData.js'

function RenderDynamicWind(viewer, Cesium) {
  this.particles = []
  this.particleCount = []
  this._height = undefined
  this._field = undefined
  this._scale = 1.0 //生成粒子的缩放因子
  this._imageMask = undefined
  this._particleNum = undefined
  this._mapCenter = undefined
  this._mapScale = undefined
  this._windowWidth = undefined
  this._windowHeight = undefined
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
  this._timerOut = null
  this.animationLoop

  this.densityScale = window.densityScale || 0.8 //密度比例系数
  this.velocityScale = window.velocityScale || 0.6 //速度比例系数
  this.builder = null
}
RenderDynamicWind.prototype.parseData = function (data) {
  this.uvData = data
}

RenderDynamicWind.prototype.Render = function () {
  var scene = this._viewer.scene
  var renderObject = this
  renderObject.start = true
  renderObject._height = scene.camera.positionCartographic.height
  renderObject.velocityScale_o = renderObject.getVelocityScaleByHeight(
    renderObject._height
  )
  renderObject._isRender = true
  renderObject._scale = renderObject.getScaleByHeight(renderObject._height)
  renderObject.reCreate(renderObject)
  scene.camera.moveEnd.addEventListener(function () {
    renderObject._scale = renderObject.getScaleByHeight(renderObject._height)
    if (!renderObject.start) return
    //获取当前相机高度
    renderObject.start1 = true
    //获取当前相机高度
    renderObject._height = scene.camera.positionCartographic.height
    var newCenter = scene.camera.positionCartographic
    if (newCenter != renderObject._centerPnt) {
      // 添加延迟计算，尝试提升移动地球的流畅度
      if (renderObject._timerOut) {
        clearTimeout(renderObject._timerOut)
        renderObject._timerOut = null
      }

      renderObject._timerOut = setTimeout(() => {
        renderObject.velocityScale_o = renderObject.getVelocityScaleByHeight(
          renderObject._height
        )
        renderObject.reCreate(renderObject)
        if (renderObject._height > 14125162)
        renderObject._isRender = true
        renderObject._scale = renderObject.getScaleByHeight(newCenter.height)
        renderObject.particles = []
        renderObject.particleCount = Math.round(
          renderObject._windowHeight *
            windData.PARTICLE_MULTIPLIER *
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
                age: windData.random(0, windData.MAX_PARTICLE_AGE)
              })
            )
          }
        }
      }, 10)
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
          renderObject._windowHeight
        )
        renderObject._g.clearRect(
          0,
          0,
          renderObject._windowWidth,
          renderObject._windowHeight
        )
      }
    }
  })
  var colorStyles = windData.windIntensityColorScale(
    windData.INTENSITY_SCALE_STEP,
    windData.maxIntensity
  )
  var buckets = colorStyles.map(function () {
    return []
  })
  function evolve() {
    buckets.forEach(function (bucket) {
      bucket.length = 0
    })
    renderObject.particles.forEach(function (particle) {
      if (particle.age > windData.MAX_PARTICLE_AGE) {
        renderObject._field.randomize(particle).age = 0
      }
      var x = particle.x
      var y = particle.y
      var v = renderObject._field(x, y) // vector at current position
      var m = v[2]
      if (m === null) {
        particle.age = windData.MAX_PARTICLE_AGE // particle has escaped the grid, never to return...
      } else {
        var xt = x + v[0] * windData.WindScale
        var yt = y + v[1] * windData.WindScale
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

    g.lineWidth = renderObject.lineWidth || 1

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

    if (renderObject.start) {
      renderObject.animationLoop = requestAnimationFrame(frame)
    }
  })()
}
RenderDynamicWind.prototype.zoom = function (renderObject) {
  var width = renderObject._viewer.scene.canvas.clientWidth
  var height = renderObject._viewer.scene.canvas.clientHeight
  renderObject._windowWidth = width
  renderObject._windowHeight = height
  renderObject._bounds.xMax = width
  renderObject._bounds.yMax = height
  renderObject._bounds.width = width
  renderObject._bounds.height = height
  if (renderObject._field != null) {
    renderObject._field.release()
  }
}
RenderDynamicWind.prototype.reCreate = function (renderObject) {
  this.zoom(renderObject)
  var scene = this._viewer.scene
  var canvas = scene.canvas
  var camera = scene.camera
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
RenderDynamicWind.prototype.dealData = (renderObject, params) => {
  const that = renderObject
  if (!that.builder) {
    let uvData = params.uvData
    let [header, uData, vData] = uvData
    that.builder = new windData.buildGrid({
      header,
      data: function (i) {
        return [uData[i], vData[i]]
      },
      interpolate: windData.bilinearInterpolateVector
    })
  }
  if (params.velocityScale_o) windData.velocityScale_o = params.velocityScale_o
  let result = windData.reCreate(params, that.builder, true)
  let data = {
    params,
    columns: result.columns,
    pixels: result.mask.imageData
  }
  return data
}
RenderDynamicWind.prototype.setData = (renderObject, e) => {
  const that = renderObject
  var bounds = e.params.bounds
  var columns = e.columns
  var maskImageData = e.pixels
  var mask = maskImageData
  that._imageMask = mask
  that._field = windData.createField(columns, bounds, false)

  //lxl发现粒子在原位置时没生成，移到此位置

  that.particleCount = Math.round(
    e.params.clientHeight *
      e.params.clientWidth *
      windData.PARTICLE_MULTIPLIER *
      that._scale
  )

  if (that._field != null) {
    for (var i = 0; i < that.particleCount; i++) {
      that.particles.push(
        that._field.randomize({
          age: windData.random(0, windData.MAX_PARTICLE_AGE)
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
    // document.body.appendChild(canvasOverLay);
    that._viewer.container.appendChild(canvasOverLay)
    canvasOverLay.id = 'image-canvas'
    canvasOverLay.width = bounds.width
    canvasOverLay.height = bounds.height
    canvasOverLay.style.position = 'absolute'
    canvasOverLay.style.top = 0
    canvasOverLay.style.left = 0
    canvasOverLay.style.zIndex = 100
    canvasOverLay.style.pointerEvents = 'none'

    canvas = document.createElement('CANVAS')
    // document.body.appendChild(canvas);
    that._viewer.container.appendChild(canvas)
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
  that._g.lineWidth = that.lineWidth || 1
  that._g.fillStyle = windData.fadeFillStyle

  var gOverlay = canvasOverLay.getContext('2d')
  gOverlay.clearRect(0, 0, canvasOverLay.width, canvasOverLay.height)

  that._imageCanvas = canvasOverLay
  that._imageCanvas.style.display = 'block'
  that._imageG = gOverlay
}

//根据分辨率、视野面积、高度获取例子流动速度
RenderDynamicWind.prototype.getVelocityScaleByHeight = function (height) {
  let extent = this.getCurrentExtent()
  let mapBounds = {
    south: this.deg2rad(extent[1]),
    north: this.deg2rad(extent[3]),
    east: this.deg2rad(extent[2]),
    west: this.deg2rad(extent[0])
  }
  let mapArea =
    (mapBounds.south - mapBounds.north) * (mapBounds.west - mapBounds.east)

  let scale = 0.0008 * this.velocityScale
  if (height < 650000) scale = 0.00018 * this.velocityScale
  let velocityScale_o =
    scale *
    (Math.pow(window.devicePixelRatio, 1 / 3) || 1) *
    Math.pow(mapArea, 0.2)

  return velocityScale_o
}
RenderDynamicWind.prototype.computeDistance = function (
  newCenter,
  oldCenter,
  statues
) {
  let w_newCenter
  let w_oldCenter
  let distance = 0
  if (statues) {
    w_newCenter = Cesium.Cartesian3.fromDegrees(
      newCenter.longitude,
      newCenter.latitude,
      0
    )
    w_oldCenter = Cesium.Cartesian3.fromDegrees(
      oldCenter.longitude,
      oldCenter.latitude,
      0
    )
    distance = Cesium.Cartesian3.distance(w_newCenter, w_oldCenter)
  } else {
    distance = Math.abs(Number(newCenter.height) - Number(oldCenter.height))
  }
  return distance
}
// 通过高度获取比例
RenderDynamicWind.prototype.getScaleByHeight = function (height) {
  const baseMaxHeight = 14125162
  if (height < 550000) this.densityScale = 0.25
  let _scale
  if (height > baseMaxHeight) {
    _scale = 0.25 * this.densityScale
  } else if (height > baseMaxHeight * 0.8) {
    _scale = 0.25 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.8, 2)) {
    _scale = 0.225 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.5, 3)) {
    _scale = 0.2 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.5, 4)) {
    _scale = 0.09 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.5, 5)) {
    _scale = 0.07 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.5, 6)) {
    _scale = 0.065 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.5, 7)) {
    _scale = 0.04 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.5, 8)) {
    _scale = 0.03 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.5, 9)) {
    _scale = 0.02 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.5, 10)) {
    _scale = 0.015 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.5, 11)) {
    _scale = 0.01 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.5, 12)) {
    _scale = 0.005 * this.densityScale
  } else if (height > baseMaxHeight * Math.pow(0.5, 13)) {
    _scale = 0.0025 * this.densityScale
  } else {
    _scale = 0.00005 * this.densityScale
  }
  return _scale
}

RenderDynamicWind.prototype.getCurrentExtent = function () {
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

RenderDynamicWind.prototype.deg2rad = function (deg) {
  return (deg / 180) * Math.PI
}

RenderDynamicWind.prototype.remove = function () {
  if (this.animationLoop) {
    cancelAnimationFrame(this.animationLoop)
    this.animationLoop = null
  }

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
  if (this._timerOut) {
    clearTimeout(this._timerOut)
    this._timerOut = null
  }
  if (document.getElementById('image-canvas'))
    document.getElementById('image-canvas').remove()
  if (document.getElementById('fullScreen'))
    document.getElementById('fullScreen').remove()

  this.particles = []
}

RenderDynamicWind.prototype.clone = function () {}
RenderDynamicWind.prototype.update = function () {
  var RTOD = 180.0 / 3.1415926
  var canvas = document.getElementById('animation')
  var g = canvas.getContext('2d')
  g.fillStyle = 'rgba(0, 0, 0, 0.97)'
  g.lineWidth = 20

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
      setTimeout(frame, 400)
    } catch (e) {}
  })()
}
RenderDynamicWind.prototype.updateO = function (options) {
  const renderObject = this
  var scene = renderObject._viewer.scene
  renderObject.lineWidth = options.lineWidth || renderObject.lineWidth
  renderObject.densityScale = options.densityScale || renderObject.densityScale
  renderObject.velocityScale =
    options.velocityScale || renderObject.velocityScale
  //同比执行一次movestart 和moveend

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
      renderObject._windowHeight
    )
    renderObject._g.clearRect(
      0,
      0,
      renderObject._windowWidth,
      renderObject._windowHeight
    )
  }

  if (!renderObject.start) return
  //获取当前相机高度
  renderObject.start1 = true
  //获取当前相机高度
  renderObject._height = scene.camera.positionCartographic.height
  renderObject._scale = renderObject.getScaleByHeight(renderObject._height)
  renderObject.velocityScale_o = renderObject.getVelocityScaleByHeight(
    renderObject._height
  )
  renderObject.reCreate(renderObject)
  renderObject._isRender = true
  renderObject.particles = []
  renderObject.particleCount = Math.round(
    renderObject._windowHeight *
      windData.PARTICLE_MULTIPLIER *
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
          age: windData.random(0, windData.MAX_PARTICLE_AGE)
        })
      )
    }
  }
}

export default RenderDynamicWind
