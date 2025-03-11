import * as MapUtil from '../../utils/commonviewshed';
import ViewShed3D2  from './ViewShed3D2';

export function ViewShedAnalysis(viewer) {
  let handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
  const pnts = [];
  let viewShed = null;
  const clear = () => {
    if (handler) {
      handler.destroy();
      handler = null;
    }
    if (viewShed) {
      viewShed.clear();
    }
  };
  handler.setInputAction((evt) => {
    if (pnts.length == 0) {
      const cartesian = MapUtil.getCatesian3FromPX(evt.position, viewer);
      let ps1 = Cesium.Cartographic.fromCartesian(cartesian)
      ps1.height += 10
      let cartesian2 = Cesium.Cartographic.toCartesian(ps1)
      pnts.push(cartesian2);
    }
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  handler.setInputAction((evt) => {
    if (pnts.length == 1) {
      const cartesian = MapUtil.getCatesian3FromPX(evt.position, viewer);
      let ps1 = Cesium.Cartographic.fromCartesian(cartesian)
      let cartesian2 = Cesium.Cartographic.toCartesian(ps1)
      pnts.push(cartesian2);
      handler.destroy();
      handler = null;
    }
  }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
  handler.setInputAction((evt) => {
    const cartesian = MapUtil.getCatesian3FromPX(evt.endPosition, viewer);
    if (pnts.length < 1 || pnts.length >= 2) {
      return;
    }
    // 将鼠标当前点坐标转化成经纬度
    const ptn1 = MapUtil.getLonLat(viewer, pnts[0]);
    const ptn2 = MapUtil.getLonLat(viewer, cartesian);
    const direction = MapUtil.getAngle(ptn1, ptn2);
    const distance = Cesium.Cartesian3.distance(pnts[0], cartesian);
    let pitch = Math.asin((Cesium.Cartographic.fromCartesian(pnts[0]).height - Cesium.Cartographic.fromCartesian(cartesian).height) / distance) / Math.PI * 180
    if (!viewShed) {
      viewShed = new ViewShed3D2({
        viewer,
        viewPosition: pnts[0],
        direction,
        pitch: pitch,
        startPosition:pnts[0],
        endPosition:cartesian
      });
    } else {
    // TODO: setDirectionDistancePitch改成_setDirectionDistancePitch 
      viewShed.setDirectionDistancePitch(direction, distance, pitch);
    }
  }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
  return { clear };
}
