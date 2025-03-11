var kopts = {
  propname: "value", //值字段
  krigingModel: 'exponential', //model还可选'gaussian','spherical'
  krigingSigma2: 0,
  krigingAlpha: 100,
  alpha: 0.3,
  // width: 0.0005,
  colors: ["#006837", "#1a9850", "#66bd63", "#a6d96a", "#d9ef8b", "#ffffbf", "#fee08b",
    "#fdae61", "#f46d43", "#d73027", "#a50026"
  ],
}
//绘制kriging插值图
var drawKriging = function (geo, polygons, options = {}) {
  kopts = Object.assign(kopts, options);
  if (kopts.colors && kopts.colorsNum) {
    kopts.colors = getColor(kopts.colors, kopts.colorsNum);
  } else {
    kopts.colors = getColor(["#00A600", "#E6DD09", "#F2F2F2"], 100);
  }
  var values = [],
    lngs = [],
    lats = [];
  geo.features.forEach(feature => {
    values.push(feature.properties[kopts.propname]);
    lngs.push(feature.geometry.coordinates[0]);
    lats.push(feature.geometry.coordinates[1]);
  });

  if (values.length > 3) {
    //获取面的矩形
    var extent = {
      xMin: 100000000,
      yMin: 100000000,
      xMax: -100000000,
      yMax: -100000000
    };
    for (var i = 0; i < polygons.length; i++) {
      for (var j = 0; j < polygons[i].length; j++) {
        extent.xMin = Math.min(extent.xMin, polygons[i][j][0]);
        extent.xMax = Math.max(extent.xMax, polygons[i][j][0]);
        extent.yMin = Math.min(extent.yMin, polygons[i][j][1]);
        extent.yMax = Math.max(extent.yMax, polygons[i][j][1]);
      }
    }
    if (!kopts.width) {
      kopts.width = Math.round(Math.min((extent.xMax - extent.xMin), (extent.yMax - extent.yMin)) *
        10000) / 10000 / 500;
    }
    var canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = 5000;
    canvas.height = parseInt(5000 / (extent.xMax - extent.xMin) * (extent.yMax - extent.yMin));

    //对数据集进行训练
    let variogram = kriging.train(values, lngs, lats, kopts.krigingModel, kopts.krigingSigma2, kopts
      .krigingAlpha);
    //使用variogram对象使polygons描述的地理位置内的格网元素具备不一样的预测值,最后一个参数，是插值格点精度大小
    var grid = kriging.grid(polygons, variogram, kopts.width); //  kriging.grid(polygons, variogram, width);
    //将得到的格网grid渲染至canvas上
    kriging.plot(canvas, grid, [extent.xMin, extent.xMax], [extent.yMin, extent.yMax], kopts.colors);
    // kriging.plot(canvas, grid, xlim, ylim, colors);

    var _r = drawHeatmapRect(canvas, extent);
    return _r;
  }
}
//绘制图形到图上 
function drawHeatmapRect(canvas, extent) {
  var image = convertCanvasToImage(canvas);
  var _Rectangle = viewer.scene.primitives.add(new Cesium.GroundPrimitive({
    geometryInstances: new Cesium.GeometryInstance({
      geometry: new Cesium.RectangleGeometry({
        rectangle: Cesium.Rectangle.fromDegrees(extent.xMin, extent.yMin,
          extent.xMax, extent.yMax),
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT
      })
    }),
    appearance: new Cesium.EllipsoidSurfaceAppearance({
      aboveGround: false
    }),
    show: true
  }));
  _Rectangle.appearance.material = new Cesium.Material({
    fabric: {
      type: 'Image',
      uniforms: {
        color: {
          alpha: kopts.alpha
        },
        image: image.src
      }
    }
  });
  return _Rectangle;
}

function convertCanvasToImage(canvas) {
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image;
}
//获取颜色
function getColor(colors, num) {
  var rainbow = new Rainbow();
  rainbow.setSpectrum(...colors)
  rainbow.setNumberRange(0, num)
  var colorarr = [];
  for (var i = 0; i < num; i++) {
    colorarr.push("#" + rainbow.colourAt(i))
  }
  return colorarr;
}
