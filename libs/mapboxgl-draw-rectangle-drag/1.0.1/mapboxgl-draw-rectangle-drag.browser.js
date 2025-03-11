/*!
 * 	   Copyright (c) 2019 CARTO.
 *     github: https://github.com/CartoDB/mapboxgl-draw-rectangle-drag
 *     license: MIT License
 *     version: 1.0.1
 */
var mapboxGLDrawRectangleDrag = (function () {
  'use strict';
  return {
    onSetup() {
      const t = this.newFeature({ type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[]] } });
      var e;
      return (
        this.addFeature(t),
        this.clearSelectedFeatures(),
        this.updateUIClasses({ mouse: 'add' }),
        this.setActionableState({ trash: !0 }),
        (e = this),
        setTimeout(() => {
          const { map: t } = e,
            a = t && t.doubleClickZoom;
          t && a && a.disable();
        }, 0),
        { rectangle: t }
      );
    },
    onMouseDown(t, e) {
      e.preventDefault();
      const a = [e.lngLat.lng, e.lngLat.lat];
      (t.startPoint = a), t.rectangle.updateCoordinate('0.0', t.startPoint[0], t.startPoint[1]);
    },
    onDrag(t, e) {
      t.startPoint &&
        (t.rectangle.updateCoordinate('0.1', e.lngLat.lng, t.startPoint[1]),
        t.rectangle.updateCoordinate('0.2', e.lngLat.lng, e.lngLat.lat),
        t.rectangle.updateCoordinate('0.3', t.startPoint[0], e.lngLat.lat),
        t.rectangle.updateCoordinate('0.4', t.startPoint[0], t.startPoint[1]));
    },
    onMouseUp(t, e) {
      (t.endPoint = [e.lngLat.lng, e.lngLat.lat]),
        this.updateUIClasses({ mouse: 'pointer' }),
        this.changeMode('simple_select', { featuresId: t.rectangle.id });
    },
    onStop(t) {
      var e;
      (e = this),
        setTimeout(() => {
          const t = e._ctx && e._ctx.store,
            a = e.map && e.map;
          (a || t.getInitialValue) && t.getInitialConfigValue('doubleClickZoom') && a.doubleClickZoom.enable();
        }, 0),
        this.updateUIClasses({ mouse: 'none' }),
        this.getFeature(t.rectangle.id) &&
          (t.rectangle.removeCoordinate('0.4'),
          t.rectangle.isValid()
            ? this.map.fire('draw.create', { features: [t.rectangle.toGeoJSON()] })
            : (this.deleteFeature([t.rectangle.id], { silent: !0 }),
              this.changeMode('simple_select', {}, { silent: !0 })));
    },
    onTrash(t) {
      this.deleteFeature([t.rectangle.id], { silent: !0 }), this.changeMode('simple_select');
    },
    toDisplayFeatures(t, e, a) {
      const n = e.properties.id === t.rectangle.id;
      (e.properties.active = n.toString()), n ? t.startPoint && a(e) : a(e);
    }
  };
})();
