// Leaflet.PixiOverlay
// version: 1.8.1
// author: Manuel Baclet <mbaclet@gmail.com>
// license: MIT

(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['leaflet', 'pixi.js'], factory);
	} else if (typeof module !== 'undefined') {
		// Node/CommonJS
		module.exports = factory(require('leaflet'), require('pixi.js'));
	} else {
		// Browser globals
		if (typeof window.L === 'undefined') {
			throw new Error('Leaflet must be loaded first');
		}
		if (typeof window.PIXI === 'undefined') {
			throw new Error('Pixi.js must be loaded first');
		}
		factory(window.L, window.PIXI);
	}
}(function (L, PIXI) {

	var round = L.Point.prototype._round;
	var no_round = function () {return this;};

	function setInteractionManager(interactionManager, destroyInteractionManager, autoPreventDefault) {
		if (destroyInteractionManager) {
			interactionManager.destroy();
		} else if (!autoPreventDefault) {
			interactionManager.autoPreventDefault = false;
		}
	}

	var pixiOverlayClass = {

		options: {
			// @option padding: Number = 0.1
			// How much to extend the clip area around the map view (relative to its size)
			// e.g. 0.1 would be 10% of map view in each direction
			padding: 0.1,
			// @option forceCanvas: Boolean = false
			// Force use of a 2d-canvas
			forceCanvas: false,
			// @option doubleBuffering: Boolean = false
			// Help to prevent flicker when refreshing display on some devices (e.g. iOS devices)
			// It is ignored if rendering is done with 2d-canvas
			doubleBuffering: false,
			// @option resolution: Number = 1
			// Resolution of the renderer canvas
			resolution: L.Browser.retina ? 2 : 1,
			// @option projectionZoom(map: map): Number
			// return the layer projection zoom level
			projectionZoom: function (map) {return (map.getMaxZoom() + map.getMinZoom()) / 2;},
			// @option destroyInteractionManager:  Boolean = false
			// Destroy PIXI Interaction Manager
			destroyInteractionManager: false,
			// @option
			// Customize PIXI Interaction Manager autoPreventDefault property
			// This option is ignored if destroyInteractionManager is set
			autoPreventDefault: true,
			// @option resolution: Boolean = false
			// Enables drawing buffer preservation
			preserveDrawingBuffer: false,
			// @option resolution: Boolean = true
			// Clear the canvas before the new render pass
			clearBeforeRender: true,
			// @option shouldRedrawOnMove(e: moveEvent): Boolean
			// filter move events that should trigger a layer redraw
			shouldRedrawOnMove: function () {return false;},
		},

		initialize: function (drawCallback, pixiContainer, options) {
			L.setOptions(this, options);
			L.stamp(this);
			this._drawCallback = drawCallback;
			this._pixiContainer = pixiContainer;
			this._rendererOptions = {
				transparent: true,
				resolution: this.options.resolution,
				antialias: true,
				forceCanvas: this.options.forceCanvas,
				preserveDrawingBuffer: this.options.preserveDrawingBuffer,
				clearBeforeRender: this.options.clearBeforeRender
			};
			this._doubleBuffering = PIXI.utils.isWebGLSupported() && !this.options.forceCanvas &&
				this.options.doubleBuffering;
		},

		_setMap: function () {},

		_setContainerStyle: function () {},

		_addContainer: function () {
			this.getPane().appendChild(this._container);
		},

		_setEvents: function () {},

		onAdd: function (targetMap) {
			this._setMap(targetMap);
			if (!this._container) {
				var container = this._container = L.DomUtil.create('div', 'leaflet-pixi-overlay');
				container.style.position = 'absolute';
				this._renderer = PIXI.autoDetectRenderer(this._rendererOptions);
				setInteractionManager(
					this._renderer.plugins.interaction,
					this.options.destroyInteractionManager,
					this.options.autoPreventDefault
				);
				container.appendChild(this._renderer.view);
				if (this._zoomAnimated) {
					L.DomUtil.addClass(container, 'leaflet-zoom-animated');
					this._setContainerStyle();
				}
				if (this._doubleBuffering) {
					this._auxRenderer = PIXI.autoDetectRenderer(this._rendererOptions);
					setInteractionManager(
						this._auxRenderer.plugins.interaction,
						this.options.destroyInteractionManager,
						this.options.autoPreventDefault
					);
					container.appendChild(this._auxRenderer.view);
					this._renderer.view.style.position = 'absolute';
					this._auxRenderer.view.style.position = 'absolute';
				}
			}
			this._addContainer();
			this._setEvents();

			var map = this._map;
			this._initialZoom = this.options.projectionZoom(map);
			this._wgsOrigin = L.latLng([0, 0]);
			this._wgsInitialShift = map.project(this._wgsOrigin, this._initialZoom);
			this._mapInitialZoom = map.getZoom();
			var _layer = this;

			this.utils = {
				latLngToLayerPoint: function (latLng, zoom) {
					zoom = (zoom === undefined) ? _layer._initialZoom : zoom;
					var projectedPoint = map.project(L.latLng(latLng), zoom);
					return projectedPoint;
				},
				layerPointToLatLng: function (point, zoom) {
					zoom = (zoom === undefined) ? _layer._initialZoom : zoom;
					var projectedPoint = L.point(point);
					return map.unproject(projectedPoint, zoom);
				},
				getScale: function (zoom) {
					if (zoom === undefined) return map.getZoomScale(map.getZoom(), _layer._initialZoom);
					else return map.getZoomScale(zoom, _layer._initialZoom);
				},
				getRenderer: function () {
					return _layer._renderer;
				},
				getContainer: function () {
					return _layer._pixiContainer;
				},
				getMap: function () {
					return _layer._map;
				}
			};
			this._update({type: 'add'});
		},

		onRemove: function () {
			L.DomUtil.remove(this._container);
		},

		getEvents: function () {
			var events = {
				zoom: this._onZoom,
				move: this._onMove,
				moveend: this._update
			};
			if (this._zoomAnimated) {
				events.zoomanim = this._onAnimZoom;
			}
			return events;
		},

		_onZoom: function () {
			this._updateTransform(this._map.getCenter(), this._map.getZoom());
		},

		_onAnimZoom: function (e) {
			this._updateTransform(e.center, e.zoom);
		},

		_onMove: function(e) {
			if (this.options.shouldRedrawOnMove(e)) {
				this._update(e);
			}
		},

		_updateTransform: function (center, zoom) {
			var scale = this._map.getZoomScale(zoom, this._zoom),
				viewHalf = this._map.getSize().multiplyBy(0.5 + this.options.padding),
				currentCenterPoint = this._map.project(this._center, zoom),

				topLeftOffset = viewHalf.multiplyBy(-scale).add(currentCenterPoint)
					.subtract(this._map._getNewPixelOrigin(center, zoom));

			if (L.Browser.any3d) {
				L.DomUtil.setTransform(this._container, topLeftOffset, scale);
			} else {
				L.DomUtil.setPosition(this._container, topLeftOffset);
			}
		},

		_redraw: function(offset, e) {
			this._disableLeafletRounding();
			var scale = this._map.getZoomScale(this._zoom, this._initialZoom),
				shift = this._map.latLngToLayerPoint(this._wgsOrigin)
				._subtract(this._wgsInitialShift.multiplyBy(scale))._subtract(offset);
			this._pixiContainer.scale.set(scale);
			this._pixiContainer.position.set(shift.x, shift.y);
			this._drawCallback(this.utils, e);
			this._enableLeafletRounding();
		},

		_update: function (e) {
			// is this really useful?
			if (this._map._animatingZoom && this._bounds) {return;}

			// Update pixel bounds of renderer container
			var p = this.options.padding,
				mapSize = this._map.getSize(),
				min = this._map.containerPointToLayerPoint(mapSize.multiplyBy(-p)).round();

			this._bounds = new L.Bounds(min, min.add(mapSize.multiplyBy(1 + p * 2)).round());
			this._center = this._map.getCenter();
			this._zoom = this._map.getZoom();

			if (this._doubleBuffering) {
				var currentRenderer = this._renderer;
				this._renderer = this._auxRenderer;
				this._auxRenderer = currentRenderer;
			}

			var view = this._renderer.view;
			var b = this._bounds,
				container = this._container,
				size = b.getSize();

			if (!this._renderer.size || this._renderer.size.x !== size.x || this._renderer.size.y !== size.y) {
				if (this._renderer.gl) {
					this._renderer.resolution = this.options.resolution;
					if (this._renderer.rootRenderTarget) {
						this._renderer.rootRenderTarget.resolution = this.options.resolution;
					}
				}
				this._renderer.resize(size.x, size.y);
				view.style.width = size.x + 'px';
				view.style.height = size.y + 'px';
				if (this._renderer.gl) {
					var gl = this._renderer.gl;
					if (gl.drawingBufferWidth !== this._renderer.width) {
						var resolution = this.options.resolution * gl.drawingBufferWidth / this._renderer.width;
						this._renderer.resolution = resolution;
						if (this._renderer.rootRenderTarget) {
							this._renderer.rootRenderTarget.resolution = resolution;
						}
						this._renderer.resize(size.x, size.y);
					}
				}
				this._renderer.size = size;
			}

			if (this._doubleBuffering) {
				var self = this;
				requestAnimationFrame(function() {
					self._redraw(b.min, e);
					self._renderer.gl.finish();
					view.style.visibility = 'visible';
					self._auxRenderer.view.style.visibility = 'hidden';
					L.DomUtil.setPosition(container, b.min);
				});
			} else {
				this._redraw(b.min, e);
				L.DomUtil.setPosition(container, b.min);
			}
		},

		_disableLeafletRounding: function () {
			L.Point.prototype._round = no_round;
		},

		_enableLeafletRounding: function () {
			L.Point.prototype._round = round;
		},

		redraw: function (data) {
			if (this._map) {
				this._disableLeafletRounding();
				this._drawCallback(this.utils, data);
				this._enableLeafletRounding();
			}
			return this;
		}

	};

	if (L.version >= "1") {

		L.PixiOverlay = L.Layer.extend(pixiOverlayClass);

	} else {

		// backport some leaflet@1.0.0 methods
		L.Map.prototype.getZoomScale = function (toZoom, fromZoom) {
			var crs = this.options.crs;
			fromZoom = fromZoom === undefined ? this._zoom : fromZoom;
			return crs.scale(toZoom) / crs.scale(fromZoom);
		};

		L.DomUtil.setTransform = function (el, offset, scale) {
			var pos = offset || new L.Point(0, 0);

			el.style[L.DomUtil.TRANSFORM] =
				(L.Browser.ie3d ?
					'translate(' + pos.x + 'px,' + pos.y + 'px)' :
					'translate3d(' + pos.x + 'px,' + pos.y + 'px,0)') +
				(scale ? ' scale(' + scale + ')' : '');
		};

		// patch pixiOverlayClass for leaflet@0.7.7
		pixiOverlayClass.includes = L.Mixin.Events;

		pixiOverlayClass.addTo = function (map) {
			map.addLayer(this);
			return this;
		};

		pixiOverlayClass._setMap = function (map) {
			this._map = map;
			this._zoomAnimated = map._zoomAnimated;
		};

		pixiOverlayClass._setContainerStyle = function () {
			var self = this;
			[
				'-webkit-transform-origin',
				'-ms-transform-origin',
				'transform-origin'
			].forEach(function (property) {
				self._container.style[property] = '0 0';
			});
		};

		pixiOverlayClass._addContainer = function () {
			this._map.getPanes()[this.options.pane || 'overlayPane']
				.appendChild(this._container);
		};

		pixiOverlayClass._setEvents = function () {
			var events = this.getEvents();
			for (var evt in events) {
				this._map.on(evt, events[evt], this);
			}
		};

		pixiOverlayClass.onRemove = function () {
			this._map.getPanes()[this.options.pane || 'overlayPane']
				.removeChild(this._container);
			var events = this.getEvents();
			for (var evt in events) {
				this._map.off(evt, events[evt], this);
			}
		};

		L.PixiOverlay = L.Class.extend(pixiOverlayClass);

	}

	// @factory L.pixiOverlay(drawCallback: function, pixiContainer: PIXI.Container, options?: L.PixiOverlay options)
	// Creates a PixiOverlay with the given arguments.
	L.pixiOverlay = function (drawCallback, pixiContainer, options) {
		return L.Browser.canvas ? new L.PixiOverlay(drawCallback, pixiContainer, options) : null;
	};

}));