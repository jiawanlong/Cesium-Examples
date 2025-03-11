import { windData } from './WindData.js'

let builder = null

onmessage = (e) => {
  let params = e.data.params
  if (!builder) {
    let uvData = params.uvData
    let [header, uData, vData] = uvData
    builder = new windData.buildGrid({
      header,
      data: function (i) {
        return [uData[i], vData[i]]
      },
      interpolate: windData.bilinearInterpolateVector
    })
  }
  let time1 = new Date().getTime()
  if (params.velocityScale_o) windData.velocityScale_o = params.velocityScale_o
  let result = windData.reCreate(params, builder, true)
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
