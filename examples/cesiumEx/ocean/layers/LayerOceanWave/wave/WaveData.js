export const waveData = {
  TRANSPARENT_BLACK: [0, 0, 0, 0],
  HOLE_VECTOR: [NaN, NaN, null],
  NULL_WIND_VECTOR: [NaN, NaN, null],

  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  MAX_TASK_TIME: 10,
  RTOD: 57.29578049044297,

  T: 2 * Math.PI,
  H: 0.000036, // 0.0000360°lat_p ~: 4m
  OVERLAY_ALPHA: Math.floor(1 * 255),
  MIN_SLEEP_TIME: 2,

  //每帧调用
  INTENSITY_SCALE_STEP: 10,
  maxIntensity: 180,
  PARTICLE_MULTIPLIER: 1 / 300,
  INTERPOLATEDIV: 2,
  // velocityScale_o: 0.000016666666666666667 * 0.03,
  velocityScale_o: 0.0003,

  // MAX_PARTICLE_AGE: 20,
  // fadeFillStyle: "rgba(0, 0, 0, 0.95)",
  // PARTICLE_LINEWIDTH: 1,
  // WindScale: 1.0 * 60,

  // WindScale: 1.0 * 15,
  // speedValue: 1.0,
  // MAX_PARTICLE_AGE: 200,
  // fadeFillStyle: 'rgba(0, 0, 0, 0.85)',
  // PARTICLE_LINEWIDTH: 7,
  WindScale: 0.8 * 15,
  speedValue: 0.4,
  MAX_PARTICLE_AGE: 200,
  fadeFillStyle: 'rgba(211, 211, 211, 0.87)',
  PARTICLE_LINEWIDTH: 5,

  fadeToWhite: colorInterpolator(sinebowColor(1.0, 0), [255, 255, 255]),
  floorMod: function (a, n) {
    var f = a - n * Math.floor(a / n)
    // HACK: when a is extremely close to an n transition, f can be equal to n. This is bad because f must be
    //       within range [0, n). Check for this corner case. Example: a:=-1e-16, n:=10. What is the proper fix?
    return f === n ? 0 : f
  },

  isValue: function (x) {
    return x !== null && x !== undefined
  },

  bilinearInterpolateVector: function (x, y, g00, g10, g01, g11) {
    var rx = 1 - x
    var ry = 1 - y
    var a = rx * ry,
      b = x * ry,
      c = rx * y,
      d = x * y
    var u = g00[0] * a + g10[0] * b + g01[0] * c + g11[0] * d
    var v = g00[1] * a + g10[1] * b + g01[1] * c + g11[1] * d
    return [u, v, Math.sqrt(u * u + v * v)]
  },

  buildGrid: function (builder) {
    var header = builder.header
    var lng1 = header.lo1,
      lat1 = header.la1 // the grid's origin (e.g., 0.0E, 90.0N)
    var dx1 = header.dx,
      dy1 = header.dy // distance between grid points (e.g., 2.5 deg lon, 2.5 deg lat)
    var ni = header.nx,
      nj = header.ny // number of grid points W-E and N-S (e.g., 144 x 73)
    // var date = new Date(header.refTime);
    // date.setHours(date.getHours() + header.forecastTime);

    // Scan mode 0 assumed. Longitude increases from lng1, and latitude decreases from lat1.
    // http://www.nco.ncep.noaa.gov/pmb/docs/grib2/grib2_table3-4.shtml
    var grid = [],
      p = 0
    var isContinuous = Math.floor(ni * dx1) >= 360
    for (var j = 0; j < nj; j++) {
      var row = []
      for (var i = 0; i < ni; i++, p++) {
        row[i] = builder.data(p)
      }
      if (isContinuous) {
        // For wrapped grids, duplicate first column as last column to simplify interpolation logic
        row.push(row[0])
      }
      grid[j] = row
    }

    this.interpolate = function (lng_p, lat_p) {
      var i = waveData.floorMod(lng_p - lng1, 360) / dx1 // calculate longitude index in wrapped range [0, 360)
      var j = (lat1 - lat_p) / dy1 // calculate latitude index in direction +90 to -90

      //         1      2           After converting lng_p and lat_p to fractional grid indexes i and j, we find the
      //        fi  i   ci          four points "G" that enclose point (i, j). These points are at the four
      //         | =1.4 |           corners specified by the floor and ceiling of i and j. For example, given
      //      ---G--|---G--- fj 8   i = 1.4 and j = 8.3, the four surrounding grid points are (1, 8), (2, 8),
      //    j ___|_ .   |           (1, 9) and (2, 9).
      //  =8.3   |      |
      //      ---G------G--- cj 9   Note that for wrapped grids, the first column is duplicated as the last
      //         |      |           column, so the index ci can be used without taking a modulo.

      var fi = Math.floor(i),
        ci = fi + 1
      var fj = Math.floor(j),
        cj = fj + 1

      var row
      if ((row = grid[fj])) {
        var g00 = row[fi]
        var g10 = row[ci]
        if (
          waveData.isValue(g00) &&
          waveData.isValue(g10) &&
          (row = grid[cj])
        ) {
          var g01 = row[fi]
          var g11 = row[ci]
          if (waveData.isValue(g01) && waveData.isValue(g11)) {
            // All four points found, so interpolate the value.
            return builder.interpolate(i - fi, j - fj, g00, g10, g01, g11)
          }
        }
      }
      // console.log("cannot interpolate: " + lng_p + "," + lat_p + ": " + fi + " " + ci + " " + fj + " " + cj);
      return null
    }
  },

  multiplyComponents: function (v1, v2) {
    return { x: v1.x * v2.x, y: v1.y * v2.y, z: v1.z * v2.z }
  },

  magnitudeSquared: function (v) {
    return v.x * v.x + v.y * v.y + v.z * v.z
  },

  dot: function (v1, v2) {
    return v1.x * v2.x + v1.y * v2.y + v1.z * v2.z
  },

  multiplyByScalar: function (v, s) {
    return { x: v.x * s, y: v.y * s, z: v.z * s }
  },

  magnitude: function (v) {
    return Math.sqrt(this.magnitudeSquared(v))
  },

  normalize: function (cartesian) {
    var result = {}
    var magnitude = this.magnitude(cartesian)
    result.x = cartesian.x / magnitude
    result.y = cartesian.y / magnitude
    result.z = cartesian.z / magnitude
    if (isNaN(result.x) || isNaN(result.y) || isNaN(result.z)) {
      throw new DeveloperError('normalized result is not a number')
    }
    return result
  },

  subtract: function (left, right) {
    var result = {}
    result.x = left.x - right.x
    result.y = left.y - right.y
    result.z = left.z - right.z
    return result
  },

  add: function (left, right) {
    var result = {}
    result.x = left.x + right.x
    result.y = left.y + right.y
    result.z = left.z + right.z
    return result
  },

  divideByScalar: function (cartesian, scalar) {
    var result = {}
    result.x = cartesian.x / scalar
    result.y = cartesian.y / scalar
    result.z = cartesian.z / scalar
    return result
  },

  sign: function (value) {
    value = +value // coerce to number
    if (value === 0 || value !== value) {
      return value
    }
    return value > 0 ? 1 : -1
  },

  toRadians: function (degrees) {
    return (degrees * Math.PI) / 180.0
  },

  rayEllipsoid: function (ray) {
    var inverseRadii = {
      x: 1.567855942887398e-7,
      y: 1.567855942887398e-7,
      z: 1.573130351105623e-7
    }
    var q = this.multiplyComponents(inverseRadii, ray.origin)
    var w = this.multiplyComponents(inverseRadii, ray.direction)

    var q2 = this.magnitudeSquared(q)
    var qw = this.dot(q, w)

    var difference, w2, product, discriminant, temp

    if (q2 > 1.0) {
      // Outside ellipsoid.
      if (qw >= 0.0) {
        // Looking outward or tangent (0 intersections).
        return undefined
      }

      // qw < 0.0.
      var qw2 = qw * qw
      difference = q2 - 1.0 // Positively valued.
      w2 = this.magnitudeSquared(w)
      product = w2 * difference

      if (qw2 < product) {
        // Imaginary roots (0 intersections).
        return undefined
      } else if (qw2 > product) {
        // Distinct roots (2 intersections).
        discriminant = qw * qw - product
        temp = -qw + Math.sqrt(discriminant) // Avoid cancellation.
        var root0 = temp / w2
        var root1 = difference / temp
        if (root0 < root1) {
          return { start: root0, stop: root1 }
        }

        return { start: root1, stop: root0 }
      }
      // qw2 == product.  Repeated roots (2 intersections).
      var root = Math.sqrt(difference / w2)
      return { start: root, stop: root }
    } else if (q2 < 1.0) {
      // Inside ellipsoid (2 intersections).
      difference = q2 - 1.0 // Negatively valued.
      w2 = this.magnitudeSquared(w)
      product = w2 * difference // Negatively valued.

      discriminant = qw * qw - product
      temp = -qw + Math.sqrt(discriminant) // Positively valued.
      return { start: 0.0, stop: temp / w2 }
    }
    // q2 == 1.0. On ellipsoid.
    if (qw < 0.0) {
      // Looking inward.
      w2 = this.magnitudeSquared(w)
      return { start: 0.0, stop: -qw / w2 }
    }

    // qw >= 0.0.  Looking outward or tangent.
    return undefined
  },

  getPickRay: function (
    width,
    height,
    fovy,
    aspectRatio,
    near,
    position,
    directionWC,
    rightWC,
    upWC,
    windowPosition
  ) {
    var tanPhi = Math.tan(fovy * 0.5)
    var tanTheta = aspectRatio * tanPhi

    var x = (2.0 / width) * windowPosition.x - 1.0
    var y = (2.0 / height) * (height - windowPosition.y) - 1.0

    var nearCenter = this.multiplyByScalar(directionWC, near)
    nearCenter = this.add(position, nearCenter)
    var xDir = this.multiplyByScalar(rightWC, x * near * tanTheta)
    var yDir = this.multiplyByScalar(upWC, y * near * tanPhi)
    var direction = this.add(nearCenter, xDir)
    direction = this.add(direction, yDir)
    direction = this.subtract(direction, position)
    direction = this.normalize(direction)

    var result = {}
    result.origin = position
    result.direction = direction
    return result
  },

  pickEllipsoid: function (params, windowPosition) {
    var ray = this.getPickRay(
      params.clientWidth,
      params.clientHeight,
      params.fovy,
      params.aspectRatio,
      params.near,
      params.positionWC,
      params.directionWC,
      params.rightWC,
      params.upWC,
      windowPosition
    )
    var intersection = this.rayEllipsoid(ray)
    if (!intersection) {
      return null
    }
    var t = intersection.start > 0.0 ? intersection.start : intersection.stop
    var result = this.multiplyByScalar(ray.direction, t)
    return this.add(ray.origin, result)
  },

  scaleToGeodeticSurface: function (cartesian) {
    var positionX = cartesian.x
    var positionY = cartesian.y
    var positionZ = cartesian.z

    var oneOverRadiiX = 1.567855942887398e-7
    var oneOverRadiiY = 1.567855942887398e-7
    var oneOverRadiiZ = 1.573130351105623e-7

    var x2 = positionX * positionX * oneOverRadiiX * oneOverRadiiX
    var y2 = positionY * positionY * oneOverRadiiY * oneOverRadiiY
    var z2 = positionZ * positionZ * oneOverRadiiZ * oneOverRadiiZ

    // Compute the squared ellipsoid norm.
    var squaredNorm = x2 + y2 + z2
    var ratio = Math.sqrt(1.0 / squaredNorm)

    // As an initial approximation, assume that the radial intersection is the projection point.
    var intersection = this.multiplyByScalar(cartesian, ratio)

    // If the position is near the center, the iteration will not converge.
    var centerToleranceSquared = 0.1
    if (squaredNorm < centerToleranceSquared) {
      return !isFinite(ratio) ? undefined : intersection
    }

    var oneOverRadiiSquaredX = 2.458172257647332e-14
    var oneOverRadiiSquaredY = 2.458172257647332e-14
    var oneOverRadiiSquaredZ = 2.4747391015697002e-14

    // Use the gradient at the intersection point in place of the true unit normal.
    // The difference in magnitude will be absorbed in the multiplier.
    var gradient = {}
    gradient.x = intersection.x * oneOverRadiiSquaredX * 2.0
    gradient.y = intersection.y * oneOverRadiiSquaredY * 2.0
    gradient.z = intersection.z * oneOverRadiiSquaredZ * 2.0

    // Compute the initial guess at the normal vector multiplier, lambda.
    var lambda =
      ((1.0 - ratio) * this.magnitude(cartesian)) /
      (0.5 * this.magnitude(gradient))
    var correction = 0.0

    var func
    var denominator
    var xMultiplier
    var yMultiplier
    var zMultiplier
    var xMultiplier2
    var yMultiplier2
    var zMultiplier2
    var xMultiplier3
    var yMultiplier3
    var zMultiplier3

    do {
      lambda -= correction

      xMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredX)
      yMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredY)
      zMultiplier = 1.0 / (1.0 + lambda * oneOverRadiiSquaredZ)

      xMultiplier2 = xMultiplier * xMultiplier
      yMultiplier2 = yMultiplier * yMultiplier
      zMultiplier2 = zMultiplier * zMultiplier

      xMultiplier3 = xMultiplier2 * xMultiplier
      yMultiplier3 = yMultiplier2 * yMultiplier
      zMultiplier3 = zMultiplier2 * zMultiplier

      func = x2 * xMultiplier2 + y2 * yMultiplier2 + z2 * zMultiplier2 - 1.0

      // "denominator" here refers to the use of this expression in the velocity and acceleration
      // computations in the sections to follow.
      denominator =
        x2 * xMultiplier3 * oneOverRadiiSquaredX +
        y2 * yMultiplier3 * oneOverRadiiSquaredY +
        z2 * zMultiplier3 * oneOverRadiiSquaredZ

      var derivative = -2.0 * denominator

      correction = func / derivative
    } while (Math.abs(func) > 0.000000000001)

    var result = {}
    result.x = positionX * xMultiplier
    result.y = positionY * yMultiplier
    result.z = positionZ * zMultiplier
    return result
  },

  geodeticSurfaceNormal: function (v) {
    var oneOverRadiiSquared = {
      x: 2.458172257647332e-14,
      y: 2.458172257647332e-14,
      z: 2.4747391015697002e-14
    }
    var result = this.multiplyComponents(v, oneOverRadiiSquared)
    return this.normalize(result)
  },

  cartesianToCartographic: function (cartesian) {
    var p = this.scaleToGeodeticSurface(cartesian)
    if (p == null) {
      return undefined
    }

    var n = this.geodeticSurfaceNormal(p)
    var h = this.subtract(cartesian, p)

    var longitude = Math.atan2(n.y, n.x)
    var latitude = Math.asin(n.z)
    var height = this.sign(this.dot(h, cartesian)) * this.magnitude(h)

    var result = {}
    result.longitude = longitude
    result.latitude = latitude
    result.height = height
    return result
  },

  //屏幕坐标转经纬度,返回值为角度
  ScreenToLonlat: function (params, pos) {
    var resultRay = this.pickEllipsoid(params, pos)
    if (resultRay == undefined) {
      return null
    } else {
      var cartographic = this.cartesianToCartographic(resultRay)
      cartographic.longitude *= waveData.RTOD
      cartographic.latitude *= waveData.RTOD
      return cartographic
    }
  },
  createField: function (columns, bounds, mask) {
    /**
     * @returns {Array} wind vector [u, v, magnitude] at the point (x, y), or [NaN, NaN, null] if wind
     *          is undefined at that point.
     */
    function field(x, y) {
      var column = columns[Math.round(x)]
      return (column && column[Math.round(y)]) || waveData.NULL_WIND_VECTOR
    }

    /**
     * @returns {boolean} true if the field is valid at the point (x, y)
     */
    field.isDefined = function (x, y) {
      return field(x, y)[2] !== null
    }

    /**
     * @returns {boolean} true if the point (x, y) lies inside the outer boundary of the vector field, even if
     *          the vector field has a hole (is undefined) at that point, such as at an island in a field of
     *          ocean currents.
     */
    field.isInsideBoundary = function (x, y) {
      return field(x, y) !== waveData.NULL_WIND_VECTOR
    }

    // Frees the massive "columns" array for GC. Without this, the array is leaked (in Chrome) each time a new
    // field is interpolated because the field closure's context is leaked, for reasons that defy explanation.
    field.release = function () {
      columns = []
    }

    field.randomize = function (o) {
      // UNDONE: this method is terrible
      var x, y
      var safetyNet = 0
      do {
        x = Math.round(waveData.random(bounds.x, bounds.xMax))
        y = Math.round(waveData.random(bounds.y, bounds.yMax))
      } while (!field.isDefined(x, y) && safetyNet++ < 30)
      o.x = x
      o.y = y
      return o
    }

    return field
  },

  /**
   * Interpolates a sinebow color where 0 <= i <= j, then fades to white where j < i <= 1.
   *
   * @param i number in the range [0, 1]
   * @param a alpha value in range [0, 255]
   * @returns {Array} [r, g, b, a]
   */
  extendedSinebowColor: function (i, a) {
    return i <= waveData.BOUNDARY
      ? sinebowColor((i / waveData.BOUNDARY) * 2, a)
      : waveData.fadeToWhite(
          (i - waveData.BOUNDARY) / (1 - waveData.BOUNDARY),
          a
        )
  },

  geodeticSurfaceNormalCartographic: function (cartographic) {
    var longitude = cartographic.longitude
    var latitude = cartographic.latitude
    var cosLatitude = Math.cos(latitude)

    var x = cosLatitude * Math.cos(longitude)
    var y = cosLatitude * Math.sin(longitude)
    var z = Math.sin(latitude)

    var result = {}
    result.x = x
    result.y = y
    result.z = z
    return this.normalize(result)
  },

  cartographicToCartesian: function (cartographic) {
    var radiiSquared = {
      x: 40680631590769,
      y: 40680631590769,
      z: 40408299984661.445
    }
    var n = this.geodeticSurfaceNormalCartographic(cartographic)
    var k = this.multiplyComponents(radiiSquared, n)
    var gamma = Math.sqrt(this.dot(n, k))
    k = this.divideByScalar(k, gamma)
    n = this.multiplyByScalar(n, cartographic.height)
    return this.add(k, n)
  },

  multiplyByVector: function (matrix, cartesian) {
    var vX = cartesian.x
    var vY = cartesian.y
    var vZ = cartesian.z
    var vW = cartesian.w

    var x = matrix[0] * vX + matrix[4] * vY + matrix[8] * vZ + matrix[12] * vW
    var y = matrix[1] * vX + matrix[5] * vY + matrix[9] * vZ + matrix[13] * vW
    var z = matrix[2] * vX + matrix[6] * vY + matrix[10] * vZ + matrix[14] * vW
    var w = matrix[3] * vX + matrix[7] * vY + matrix[11] * vZ + matrix[15] * vW

    var result = {}
    result.x = x
    result.y = y
    result.z = z
    result.w = w
    return result
  },

  multiplyByPoint: function (matrix, cartesian) {
    var vX = cartesian.x
    var vY = cartesian.y
    var vZ = cartesian.z

    var x = matrix[0] * vX + matrix[4] * vY + matrix[8] * vZ + matrix[12]
    var y = matrix[1] * vX + matrix[5] * vY + matrix[9] * vZ + matrix[13]
    var z = matrix[2] * vX + matrix[6] * vY + matrix[10] * vZ + matrix[14]

    var result = {}
    result.x = x
    result.y = y
    result.z = z
    return result
  },

  computeViewportTransformation: function (
    viewport,
    nearDepthRange,
    farDepthRange
  ) {
    var x = viewport.x
    var y = viewport.y
    var width = viewport.width
    var height = viewport.height

    var halfWidth = width * 0.5
    var halfHeight = height * 0.5
    var halfDepth = (farDepthRange - nearDepthRange) * 0.5

    var column0Row0 = halfWidth
    var column1Row1 = halfHeight
    var column2Row2 = halfDepth
    var column3Row0 = x + halfWidth
    var column3Row1 = y + halfHeight
    var column3Row2 = nearDepthRange + halfDepth
    var column3Row3 = 1.0

    var result = {}
    result[0] = column0Row0
    result[1] = 0.0
    result[2] = 0.0
    result[3] = 0.0
    result[4] = 0.0
    result[5] = column1Row1
    result[6] = 0.0
    result[7] = 0.0
    result[8] = 0.0
    result[9] = 0.0
    result[10] = column2Row2
    result[11] = 0.0
    result[12] = column3Row0
    result[13] = column3Row1
    result[14] = column3Row2
    result[15] = column3Row3
    return result
  },

  worldToClip: function (position, eyeOffset, viewMatrix, projectionMatrix) {
    var positionEC = this.multiplyByVector(viewMatrix, {
      x: position.x,
      y: position.y,
      z: position.z,
      w: 1
    })

    var zEyeOffset = this.multiplyComponents(
      eyeOffset,
      this.normalize(positionEC)
    )
    positionEC.x += eyeOffset.x + zEyeOffset.x
    positionEC.y += eyeOffset.y + zEyeOffset.y
    positionEC.z += zEyeOffset.z

    return this.multiplyByVector(projectionMatrix, positionEC)
  },

  clipToGLWindowCoordinates: function (viewport, position) {
    // Perspective divide to transform from clip coordinates to normalized device coordinates
    var positionNDC = this.divideByScalar(position, position.w)

    // Viewport transform to transform from clip coordinates to window coordinates
    var viewportTransform = this.computeViewportTransformation(
      viewport,
      0.0,
      1.0
    )
    var positionWC = this.multiplyByPoint(viewportTransform, positionNDC)

    return { x: positionWC.x, y: positionWC.y }
  },

  wgs84ToWindowCoordinates: function (
    x,
    y,
    width,
    height,
    viewMatrix,
    projectionMatrix,
    position,
    eyeOffset
  ) {
    var viewport = {}
    viewport.x = x
    viewport.y = y
    viewport.width = width
    viewport.height = height

    // View-projection matrix to transform from world coordinates to clip coordinates
    var positionCC = this.worldToClip(
      position,
      eyeOffset,
      viewMatrix,
      projectionMatrix
    )
    if (positionCC.z < 0) {
      return undefined
    }

    var result = this.clipToGLWindowCoordinates(viewport, positionCC)
    result.y = height - result.y
    return result
  },

  //屏幕坐标转经纬度,返回值为角度
  LonlatToScreen: function (params, pos) {
    var position = {
      longitude: this.toRadians(pos[0]),
      latitude: this.toRadians(pos[1]),
      height: 0.0
    }
    var cartesianPosition = this.cartographicToCartesian(position)
    var posEnd = this.wgs84ToWindowCoordinates(
      0,
      0,
      params.clientWidth,
      params.clientHeight,
      params.viewMatrix,
      params.projectionMatrix,
      cartesianPosition,
      {
        x: 0,
        y: 0,
        z: 0
      }
    )
    return posEnd
  },

  distortion: function (params, lng_p, lat_p, x, y) {
    var hlng = lng_p < 0 ? waveData.H : -waveData.H
    var hlat_p = lat_p < 0 ? waveData.H : -waveData.H
    var plng = waveData.LonlatToScreen(params, [lng_p + hlng, lat_p])
    var plat_p = waveData.LonlatToScreen(params, [lng_p, lat_p + hlat_p])

    // Meridian scale factor (see Snyder, equation 4-3), where R = 1. This handles issue where length of 1° lng_p
    // changes depending on lat_p. Without this, there is a pinching effect at the poles.
    var k = Math.cos((lat_p / 360) * waveData.T)

    return [
      (plng.x - x) / hlng / k,
      (plng.y - y) / hlng / k,
      (plat_p.x - x) / hlat_p,
      (plat_p.y - y) / hlat_p
    ]
  },

  distort: function (params, lng_p, lat_p, x, y, scale, wind) {
    var u = wind[0] * scale
    var v = wind[1] * scale
    var d = waveData.distortion(params, lng_p, lat_p, x, y)

    // Scale windData.distortion vectors by u and v, then add.
    wind[0] = d[0] * u + d[2] * v
    wind[1] = d[1] * u + d[3] * v
    return wind
  },

  asColorStyle: function (r, g, b, a) {
    return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + a + ')'
  },

  windIntensityColorScale: function (step, maxWind) {
    var result = []
    for (var j = 85; j <= 255; j += step) {
      result.push(waveData.asColorStyle(255, 255, 255, 255.0))
    }
    result.indexFor = function (m) {
      // map wind speed to a style
      return Math.floor((Math.min(m, maxWind) / maxWind) * (result.length - 1))
    }
    return result
  },

  random: function (min, max) {
    if (max == null) {
      max = min
      min = 0
    }
    return min + Math.floor(Math.random() * (max - min + 1))
  },

  CreateMask: function (width, height, offscreen) {
    var canvas = null
    if (offscreen) {
      canvas = new OffscreenCanvas(width, height)
    } else {
      canvas = document.createElement('canvas')
      ;(canvas.width = width), (canvas.height = height)
    }
    var context = canvas.getContext('2d')
    context.fillStyle = 'rgba(255, 0, 0, 0)'
    context.fill()

    var imageData = context.getImageData(0, 0, width, height)
    var data = imageData.data // layout: [r, g, b, a, r, g, b, a, ...]

    return {
      imageData: imageData,
      set: function (x, y, rgba) {
        var i = (y * width + x) * 4
        data[i] = rgba[0]
        data[i + 1] = rgba[1]
        data[i + 2] = rgba[2]
        data[i + 3] = rgba[3]
        return this
      }
    }
  },

  reCreate: function (params, builder, offscreen) {
    //这个纹理重复每次生成，也可以生成一次
    var bounds = params.bounds
    var mask = this.CreateMask(bounds.width, bounds.height, offscreen)
    var velocityScale = waveData.velocityScale_o

    var columns = []
    var point = {}
    let ySize = 0

    function interpolateColumn(params, x) {
      var column = []
      ySize = 0
      for (var y = bounds.y; y <= bounds.yMax; y += waveData.INTERPOLATEDIV) {
        ySize++
        point.x = x
        point.y = y

        var coord = waveData.ScreenToLonlat(params, point)
        var color = waveData.TRANSPARENT_BLACK
        var wind = null
        if (coord) {
          var lng_p = coord.longitude,
            lat_p = coord.latitude
          if (isFinite(lng_p)) {
            if (builder) {
              wind = builder.interpolate(lng_p, lat_p)
              var scalar = null
              if (wind) {
                wind = waveData.distort(
                  params,
                  lng_p,
                  lat_p,
                  x,
                  y,
                  velocityScale,
                  wind
                )
                scalar = wind[2]
              }
              if (waveData.isValue(scalar)) {
                color = waveData.extendedSinebowColor(
                  Math.min(scalar, 100) / 100,
                  waveData.OVERLAY_ALPHA
                )
              }
            } else {
              return
            }
          }
        }
        column[y + 1] = column[y] = wind || waveData.HOLE_VECTOR
        mask
          .set(x, y, color)
          .set(x + 1, y, color)
          .set(x, y + 1, color)
          .set(x + 1, y + 1, color)
      }
      columns[x + 1] = columns[x] = column
    }

    var x = bounds.x
    while (x < bounds.xMax) {
      interpolateColumn(params, x)
      x += waveData.INTERPOLATEDIV
    }

    return { columns: columns, mask: mask }
  }
}

/**
 * Produces a color style in a rainbow-like trefoil color space. Not quite HSV, but produces a nice
 * spectrum. See http://krazydad.com/tutorials/makecolors.php.
 *
 * @param hue the hue rotation in the range [0, 1]
 * @param a the alpha value in the range [0, 255]
 * @returns {Array} [r, g, b, a]
 */
function sinebowColor(hue, a) {
  // Map hue [0, 1] to radians [0, 5/6T]. Don't allow a full rotation because that keeps hue == 0 and
  // hue == 1 from mapping to the same color.
  var rad = (hue * 2 * Math.PI * 5) / 6
  rad *= 0.75 // increase frequency to 2/3 cycle per rad

  var s = Math.sin(rad)
  var c = Math.cos(rad)
  var r = Math.floor(Math.max(0, -c) * 255)
  var g = Math.floor(Math.max(s, 0) * 255)
  var b = Math.floor(Math.max(c, 0, -s) * 255)
  return [r, g, b, a]
}

function colorInterpolator(start, end) {
  var r = start[0],
    g = start[1],
    b = start[2]
  var r2 = end[0] - r,
    g2 = end[1] - g,
    b2 = end[2] - b
  return function (i, a) {
    return [
      Math.floor(r + i * r2),
      Math.floor(g + i * g2),
      Math.floor(b + i * b2),
      a
    ]
  }
}
