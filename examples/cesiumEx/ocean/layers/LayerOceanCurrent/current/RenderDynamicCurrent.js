import { currentData } from './CurrentData.js'

function RenderDynamicCurrent(viewer, Cesium) {
  this.particles = []
  this.particleCount = []
  this._field = undefined
  this._scale = 1// 1.0 //生成粒子的缩放因子
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

  this.densityScale = 1// 1 //密度比例系数
  this.velocityScale = 1 //1 //速度比例系数
  this.builder = null
}
RenderDynamicCurrent.prototype.parseData = function (data) {
  this.uvData = data
}
RenderDynamicCurrent.prototype.setData = (renderObject, data) => {
  var bounds = data.params.bounds
  var columns = data.columns
  var maskImageData = data.pixels
  var mask = maskImageData
  const that = renderObject
  that._imageMask = mask
  that._field = currentData.createField(columns, bounds, false)

  //lxl发现粒子在原位置时没生成，移到此位置
  that.particleCount = Math.round(
    data.params.clientHeight *
      data.params.clientWidth *
      currentData.PARTICLE_MULTIPLIER *
      that._scale
  )

  if (that._field != null) {
    for (var i = 0; i < that.particleCount; i++) {
      that.particles.push(
        that._field.randomize({
          age: currentData.random(0, currentData.MAX_PARTICLE_AGE)
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
    canvas.style.right = 0
    canvas.style.bottom = 0
    canvas.style.width = '100%'
    canvas.style.height = '100%'
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
  that._g.fillStyle = currentData.fadeFillStyle

  var gOverlay = canvasOverLay.getContext('2d')
  gOverlay.clearRect(0, 0, canvasOverLay.width, canvasOverLay.height)

  that._imageCanvas = canvasOverLay
  that._imageCanvas.style.display = 'none'
  that._imageG = gOverlay
}
RenderDynamicCurrent.prototype.dealData = (renderObject, params) => {
  if (!renderObject.builder) {
    let uvData = params.uvData
    let [header, uData, vData] = uvData
    renderObject.builder = new currentData.buildGrid({
      header,
      data: function (i) {
        return [uData[i], vData[i]]
      },
      interpolate: currentData.bilinearInterpolateVector
    })
  }
  if (params.velocityScale_o)
    currentData.velocityScale_o = params.velocityScale_o
  let result = currentData.reCreate(params, renderObject.builder, true)

  let data = {
    params,
    columns: result.columns,
    pixels: result.mask.imageData
  }
  return data
}

RenderDynamicCurrent.prototype.reCreate = function (renderObject) {
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
RenderDynamicCurrent.prototype.getVelocityScaleByHeight = function (height) {
  let extent = this.getCurrentExtent()
  let mapBounds = {
    south: this.deg2rad(extent[1]),
    north: this.deg2rad(extent[3]),
    east: this.deg2rad(extent[2]),
    west: this.deg2rad(extent[0])
  }
  let mapArea =
    (mapBounds.south - mapBounds.north) * (mapBounds.west - mapBounds.east)
  let scale = 0.0001 * this.velocityScale
  if (height < 630000) scale = 0.00005 * this.velocityScale
  let velocityScale_o =
    scale *
    (Math.pow(window.devicePixelRatio, 1 / 3) || 1) *
    Math.pow(mapArea, 0.2)
  return velocityScale_o
}
RenderDynamicCurrent.prototype.getScaleByHeight = function (height) {
  // console.log('当前相机高度', height)
  if (height <= 7798950) {
    return this.densityScale * 0.5
  } else {
    return this.densityScale * 0.9
  }
}
RenderDynamicCurrent.prototype.getCurrentExtent = function () {
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
RenderDynamicCurrent.prototype.deg2rad = function (deg) {
  return (deg / 180) * Math.PI
}
RenderDynamicCurrent.prototype.Render = function () {
  var scene = this._viewer.scene
  var renderObject = this
  renderObject.start = true
  renderObject.velocityScale_o = renderObject.getVelocityScaleByHeight(
    scene.camera.positionCartographic.height
  )
  renderObject._isRender = true
  this.reCreate(renderObject)
  renderObject._scale = renderObject.getScaleByHeight(
    scene.camera.positionCartographic.height
  )

  scene.camera.moveEnd.addEventListener(function () {
    //获取当前相机高度
    renderObject.start1 = true
    //获取当前相机高度
    var newCenter = scene.camera.positionCartographic
    // if (newCenter.height < 1263951.9408551503) {
    //   for (let i = window.aalayers.length - 1; i >= 0; i--) {
    //     let layers = window.aalayers[i]
    //     if (layers._opt.name === '海流场信息') {
    //       if (layers.visible === true) {
    //         layers.visible = false
    //       }
    //     }
    //   }
    // } else {
    //   for (let i = window.aalayers.length - 1; i >= 0; i--) {
    //     let layers = window.aalayers[i]
    //     if (layers._opt.name === '海流场信息') {
    //       if (layers.visible === false) {
    //         layers.visible = true
    //       }
    //     }
    //   }
    // }
    if (!renderObject.start) return

    if (newCenter != renderObject._centerPnt) {
      renderObject.velocityScale_o = renderObject.getVelocityScaleByHeight(
        scene.camera.positionCartographic.height
      )
      renderObject.reCreate(renderObject)
      renderObject._isRender = true
      renderObject._scale = renderObject.getScaleByHeight(newCenter.height)
      renderObject.particles = []
      renderObject.particleCount = Math.round(
        renderObject._windowheight *
          currentData.PARTICLE_MULTIPLIER *
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
              age: currentData.random(0, currentData.MAX_PARTICLE_AGE)
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
  // currentData.maxIntensity is the velocity at which particle color intensity is maximum
  var colorStyles = currentData.windIntensityColorScale(
    currentData.INTENSITY_SCALE_STEP,
    currentData.maxIntensity
  )
  var buckets = colorStyles.map(function () {
    return []
  })

  function evolve() {
    buckets.forEach(function (bucket) {
      bucket.length = 0
    })
    renderObject.particles.forEach(function (particle) {
      if (particle.age > currentData.MAX_PARTICLE_AGE) {
        renderObject._field.randomize(particle).age = 0
      }
      var x = particle.x
      var y = particle.y
      var v = renderObject._field(x, y) // vector at current position
      var m = v[2]
      if (m === null) {
        particle.age = currentData.MAX_PARTICLE_AGE // particle has escaped the grid, never to return...
      } else {
        var xt = x + v[0] * currentData.WindScale
        var yt = y + v[1] * currentData.WindScale
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
      setTimeout(frame, 10 / 0.8)
    }
  })()
}

RenderDynamicCurrent.prototype.remove = function () {
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
  if (document.getElementById('image-canvas'))
    document.getElementById('image-canvas').remove()
  if (document.getElementById('fullScreen'))
    document.getElementById('fullScreen').remove()

  this.particles = []
}

RenderDynamicCurrent.prototype.clone = function () {}
RenderDynamicCurrent.prototype.update = function () {
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
      setTimeout(frame, 40)
    } catch (e) {}
  })()
}
RenderDynamicCurrent.prototype.updateO = function (options) {
  const renderObject = this
  var scene = renderObject._viewer.scene
  renderObject.lineWidth = options.lineWidth || renderObject.lineWidth
  renderObject.densityScale = options.densityScale || renderObject.densityScale
  renderObject.velocityScale =
    options.velocityScale || renderObject.velocityScale
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
  renderObject._height = scene.camera.positionCartographic.height
  renderObject._scale = renderObject.getScaleByHeight(renderObject._height)
  renderObject.velocityScale_o = renderObject.getVelocityScaleByHeight(
    renderObject._height
  )
  renderObject.reCreate(renderObject)
  renderObject.particles = []
  renderObject.particleCount = Math.round(
    renderObject._windowheight *
      currentData.PARTICLE_MULTIPLIER *
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
          age: currentData.random(0, currentData.MAX_PARTICLE_AGE)
        })
      )
    }
  }
}
export default RenderDynamicCurrent
