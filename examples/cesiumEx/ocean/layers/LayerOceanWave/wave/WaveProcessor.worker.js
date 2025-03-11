import { waveData } from './WaveData.js'

let builder = null

onmessage = (e) => {
  let params = e.data.params
  if (!builder) {
    let uvData = params.uvData
    let [header, uData, vData] = uvData
    builder = new waveData.buildGrid({
      header,
      data: function (i) {
        return [uData[i], vData[i]]
      },
      interpolate: waveData.bilinearInterpolateVector
    })
  }
  let time1 = new Date().getTime()
  if (params.velocityScale_o) waveData.velocityScale_o = params.velocityScale_o
  let result = waveData.reCreate(params, builder, true)
  let time2 = new Date().getTime()
  let time = time2 - time1
  let data = {
    params,
    columns: result.columns,
    pixels: result.mask.imageData,
    time: time
  }
  postMessage(data)
}

// var builder = null;

// function parseData(params) {
//   axios({
//     method: "POST",
//     url: params.url,
//     // contentType:'application/json',
//     data: {
//       date: params.date,
//       modelType: params.modelType,
//       element: params.element,
//       level: params.level
//     }
//   }).then(file => {
//     if (file != null) {
//       let data = file.data.data;
//       var field = [];
//       var w = data.gridWidth;
//       var h = data.gridHeight;
//       var n = 2 * w * h;
//       var i = 0;
//       var total = 0;
//       var weight = 0;
//       for (var x = 0; x < w; x++) {
//         field[x] = [];
//         for (var y = 0; y < h; y++) {
//           var vx = Number(data.field[i++]);
//           var vy = Number(data.field[i++]);
//           var v = { x: vx, y: vy };
//           // Uncomment to test a constant field:
//           // v = new Vector(10, 0);
//           var ux = x / (w - 1);
//           var uy = y / (h - 1);
//           var lon = data.x0 * (1 - ux) + data.x1 * ux;
//           var lat = data.y0 * (1 - uy) + data.y1 * uy;

//           field[x][y] = v;
//         }
//       }
//       var udatas = [], vdatas = [], ydatas = [], xdatas = [];
//       var _length = field.length;
//       for (var y = data.gridHeight - 1; y >= 0; y--) {
//         for (var x = 0; x < data.gridWidth; x++) {
//           xdatas.push(field[x][y].x);
//           ydatas.push(field[x][y].y);
//         }
//       }
//       var header = {
//         "nx": data.gridWidth,
//         "ny": data.gridHeight,
//         "basicAngle": 0,
//         "subDivisions": 0,
//         "lo1": data.x0,
//         "la1": data.y0,
//         "lo2": data.x1,
//         "la2": data.y1,
//         // "dx": Number(360/(data.gridWidth-1)).toFixed(0),
//         // "dy": Number(180/(data.gridHeight-1)).toFixed(0)
//         // "dx": Math.round(360 * 10 / (data.gridWidth - 1)) / 10,
//         // "dy": Math.round(180 * 10 / (data.gridHeight - 1)) / 10
//         "dx": 1.0,
//         "dy": 1.0
//       };

//       /*	var uData = file[0].data;
//         var vData = file[1].data;*/
//       var uData = xdatas;
//       var vData = ydatas;

//       var build = {};
//       //lxl注释
//       build.header = header;
//       build.data = function(i) {
//         return [uData[i], vData[i]];
//       };
//       build.interpolate = waveData.bilinearInterpolateVector;
//       builder = new waveData.buildGrid(build);
//     }
//   });
// }

// onmessage = (e) => {
//   if (builder == null) {
//     parseData(e.data.params.url);
//   }
//   //lxl20200828增加
//   if (builder != null) {
//     var time1 = new Date().getTime();
//     var result = waveData.reCreate(e.data.params, builder, true);
//     var time2 = new Date().getTime();
//     var time = time2 - time1;

//     var data = { params: e.data.params, columns: result.columns, pixels: result.mask.imageData, time: time };
//     postMessage(data);
//   }
// };
