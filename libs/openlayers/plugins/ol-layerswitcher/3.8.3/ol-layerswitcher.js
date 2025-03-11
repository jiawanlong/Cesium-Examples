(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('ol/control/Control'), require('ol/Observable'), require('ol/layer/Group')) :
	typeof define === 'function' && define.amd ? define(['ol/control/Control', 'ol/Observable', 'ol/layer/Group'], factory) :
	(global.LayerSwitcher = factory(global.ol.control.Control,global.ol.Observable,global.ol.layer.Group));
}(this, (function (Control,ol_Observable,LayerGroup) { 'use strict';

Control = 'default' in Control ? Control['default'] : Control;
LayerGroup = 'default' in LayerGroup ? LayerGroup['default'] : LayerGroup;

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();







var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

/**
 * @protected
 */
var CSS_PREFIX = 'layer-switcher-';
/**
 * OpenLayers LayerSwitcher Control, displays a list of layers and groups
 * associated with a map which have a `title` property.
 *
 * To be shown in the LayerSwitcher panel layers must have a `title` property;
 * base map layers should have a `type` property set to `base`. Group layers
 * (`LayerGroup`) can be used to visually group layers together; a group
 * with a `fold` property set to either `'open'` or `'close'` will be displayed
 * with a toggle.
 *
 * See [BaseLayerOptions](#baselayeroptions) for a full list of LayerSwitcher
 * properties for layers (`TileLayer`, `ImageLayer`, `VectorTile` etc.) and
 * [GroupLayerOptions](#grouplayeroptions) for group layer (`LayerGroup`)
 * LayerSwitcher properties.
 *
 * Layer and group properties can either be set by adding extra properties
 * to their options when they are created or via their set method.
 *
 * Specify a `title` for a Layer by adding a `title` property to it's options object:
 * ```javascript
 * var lyr = new ol.layer.Tile({
 *   // Specify a title property which will be displayed by the layer switcher
 *   title: 'OpenStreetMap',
 *   visible: true,
 *   source: new ol.source.OSM()
 * })
 * ```
 *
 * Alternatively the properties can be set via the `set` method after a layer has been created:
 * ```javascript
 * var lyr = new ol.layer.Tile({
 *   visible: true,
 *   source: new ol.source.OSM()
 * })
 * // Specify a title property which will be displayed by the layer switcher
 * lyr.set('title', 'OpenStreetMap');
 * ```
 *
 * To create a LayerSwitcher and add it to a map, create a new instance then pass it to the map's [`addControl` method](https://openlayers.org/en/latest/apidoc/module-ol_PluggableMap-PluggableMap.html#addControl).
 * ```javascript
 * var layerSwitcher = new LayerSwitcher({
 *   reverse: true,
 *   groupSelectStyle: 'group'
 * });
 * map.addControl(layerSwitcher);
 * ```
 *
 * @constructor
 * @extends {ol/control/Control~Control}
 * @param opt_options LayerSwitcher options, see  [LayerSwitcher Options](#options) and [RenderOptions](#renderoptions) which LayerSwitcher `Options` extends for more details.
 */

var LayerSwitcher = function (_Control) {
    inherits(LayerSwitcher, _Control);

    function LayerSwitcher(opt_options) {
        classCallCheck(this, LayerSwitcher);

        var options = Object.assign({}, opt_options);
        // TODO Next: Rename to showButtonTitle
        var tipLabel = options.tipLabel ? options.tipLabel : 'Legend';
        // TODO Next: Rename to hideButtonTitle
        var collapseTipLabel = options.collapseTipLabel ? options.collapseTipLabel : 'Collapse legend';
        var element = document.createElement('div');

        var _this = possibleConstructorReturn(this, (LayerSwitcher.__proto__ || Object.getPrototypeOf(LayerSwitcher)).call(this, { element: element, target: options.target }));

        _this.activationMode = options.activationMode || 'mouseover';
        _this.startActive = options.startActive === true;
        // TODO Next: Rename to showButtonContent
        var label = options.label !== undefined ? options.label : '';
        // TODO Next: Rename to hideButtonContent
        var collapseLabel = options.collapseLabel !== undefined ? options.collapseLabel : '\xBB';
        _this.groupSelectStyle = LayerSwitcher.getGroupSelectStyle(options.groupSelectStyle);
        _this.reverse = options.reverse !== false;
        _this.mapListeners = [];
        _this.hiddenClassName = 'ol-unselectable ol-control layer-switcher';
        if (LayerSwitcher.isTouchDevice_()) {
            _this.hiddenClassName += ' touch';
        }
        _this.shownClassName = 'shown';
        element.className = _this.hiddenClassName;
        var button = document.createElement('button');
        button.setAttribute('title', tipLabel);
        button.setAttribute('aria-label', tipLabel);
        element.appendChild(button);
        _this.panel = document.createElement('div');
        _this.panel.className = 'panel';
        element.appendChild(_this.panel);
        LayerSwitcher.enableTouchScroll_(_this.panel);
        button.textContent = label;
        element.classList.add(CSS_PREFIX + 'group-select-style-' + _this.groupSelectStyle);
        element.classList.add(CSS_PREFIX + 'activation-mode-' + _this.activationMode);
        if (_this.activationMode === 'click') {
            // TODO Next: Remove in favour of layer-switcher-activation-mode-click
            element.classList.add('activationModeClick');
            if (_this.startActive) {
                button.textContent = collapseLabel;
                button.setAttribute('title', collapseTipLabel);
                button.setAttribute('aria-label', collapseTipLabel);
            }
            button.onclick = function (e) {
                var evt = e || window.event;
                if (_this.element.classList.contains(_this.shownClassName)) {
                    _this.hidePanel();
                    button.textContent = label;
                    button.setAttribute('title', tipLabel);
                    button.setAttribute('aria-label', tipLabel);
                } else {
                    _this.showPanel();
                    button.textContent = collapseLabel;
                    button.setAttribute('title', collapseTipLabel);
                    button.setAttribute('aria-label', collapseTipLabel);
                }
                evt.preventDefault();
            };
        } else {
            button.onmouseover = function () {
                _this.showPanel();
            };
            button.onclick = function (e) {
                var evt = e || window.event;
                _this.showPanel();
                evt.preventDefault();
            };
            _this.panel.onmouseout = function (evt) {
                if (!_this.panel.contains(evt.relatedTarget)) {
                    _this.hidePanel();
                }
            };
        }
        return _this;
    }
    /**
     * Set the map instance the control is associated with.
     * @param map The map instance.
     */


    createClass(LayerSwitcher, [{
        key: 'setMap',
        value: function setMap(map) {
            var _this2 = this;

            // Clean up listeners associated with the previous map
            for (var i = 0; i < this.mapListeners.length; i++) {
                ol_Observable.unByKey(this.mapListeners[i]);
            }
            this.mapListeners.length = 0;
            // Wire up listeners etc. and store reference to new map
            get(LayerSwitcher.prototype.__proto__ || Object.getPrototypeOf(LayerSwitcher.prototype), 'setMap', this).call(this, map);
            if (map) {
                if (this.startActive) {
                    this.showPanel();
                } else {
                    this.renderPanel();
                }
                if (this.activationMode !== 'click') {
                    this.mapListeners.push(map.on('pointerdown', function () {
                        _this2.hidePanel();
                    }));
                }
            }
        }
        /**
         * Show the layer panel.
         */

    }, {
        key: 'showPanel',
        value: function showPanel() {
            if (!this.element.classList.contains(this.shownClassName)) {
                this.element.classList.add(this.shownClassName);
                this.renderPanel();
            }
        }
        /**
         * Hide the layer panel.
         */

    }, {
        key: 'hidePanel',
        value: function hidePanel() {
            if (this.element.classList.contains(this.shownClassName)) {
                this.element.classList.remove(this.shownClassName);
            }
        }
        /**
         * Re-draw the layer panel to represent the current state of the layers.
         */

    }, {
        key: 'renderPanel',
        value: function renderPanel() {
            this.dispatchEvent('render');
            LayerSwitcher.renderPanel(this.getMap(), this.panel, {
                groupSelectStyle: this.groupSelectStyle,
                reverse: this.reverse
            });
            this.dispatchEvent('rendercomplete');
        }
        /**
         * **_[static]_** - Re-draw the layer panel to represent the current state of the layers.
         * @param map The OpenLayers Map instance to render layers for
         * @param panel The DOM Element into which the layer tree will be rendered
         * @param options Options for panel, group, and layers
         */

    }], [{
        key: 'renderPanel',
        value: function renderPanel(map, panel, options) {
            // Create the event.
            var render_event = new Event('render');
            // Dispatch the event.
            panel.dispatchEvent(render_event);
            options = options || {};
            options.groupSelectStyle = LayerSwitcher.getGroupSelectStyle(options.groupSelectStyle);
            LayerSwitcher.ensureTopVisibleBaseLayerShown(map, options.groupSelectStyle);
            while (panel.firstChild) {
                panel.removeChild(panel.firstChild);
            }
            // Reset indeterminate state for all layers and groups before
            // applying based on groupSelectStyle
            LayerSwitcher.forEachRecursive(map, function (l, _idx, _a) {
                l.set('indeterminate', false);
            });
            if (options.groupSelectStyle === 'children' || options.groupSelectStyle === 'none') {
                // Set visibile and indeterminate state of groups based on
                // their children's visibility
                LayerSwitcher.setGroupVisibility(map);
            } else if (options.groupSelectStyle === 'group') {
                // Set child indetermiate state based on their parent's visibility
                LayerSwitcher.setChildVisibility(map);
            }
            var ul = document.createElement('ul');
            panel.appendChild(ul);
            // passing two map arguments instead of lyr as we're passing the map as the root of the layers tree
            LayerSwitcher.renderLayers_(map, map, ul, options, function render(_changedLyr) {
                LayerSwitcher.renderPanel(map, panel, options);
            });
            // Create the event.
            var rendercomplete_event = new Event('rendercomplete');
            // Dispatch the event.
            panel.dispatchEvent(rendercomplete_event);
        }
        /**
         * **_[static]_** - Determine if a given layer group contains base layers
         * @param grp Group to test
         */

    }, {
        key: 'isBaseGroup',
        value: function isBaseGroup(grp) {
            if (grp instanceof LayerGroup) {
                var lyrs = grp.getLayers().getArray();
                return lyrs.length && lyrs[0].get('type') === 'base';
            } else {
                return false;
            }
        }
    }, {
        key: 'setGroupVisibility',
        value: function setGroupVisibility(map) {
            // Get a list of groups, with the deepest first
            var groups = LayerSwitcher.getGroupsAndLayers(map, function (l) {
                return l instanceof LayerGroup && !l.get('combine') && !LayerSwitcher.isBaseGroup(l);
            }).reverse();
            // console.log(groups.map(g => g.get('title')));
            groups.forEach(function (grp) {
                // TODO Can we use getLayersArray, is it public in the esm build?
                var descendantVisibility = grp.getLayersArray().map(function (l) {
                    var state = l.getVisible();
                    // console.log('>', l.get('title'), state);
                    return state;
                });
                // console.log(descendantVisibility);
                if (descendantVisibility.every(function (v) {
                    return v === true;
                })) {
                    grp.setVisible(true);
                    grp.set('indeterminate', false);
                } else if (descendantVisibility.every(function (v) {
                    return v === false;
                })) {
                    grp.setVisible(false);
                    grp.set('indeterminate', false);
                } else {
                    grp.setVisible(true);
                    grp.set('indeterminate', true);
                }
            });
        }
    }, {
        key: 'setChildVisibility',
        value: function setChildVisibility(map) {
            // console.log('setChildVisibility');
            var groups = LayerSwitcher.getGroupsAndLayers(map, function (l) {
                return l instanceof LayerGroup && !l.get('combine') && !LayerSwitcher.isBaseGroup(l);
            });
            groups.forEach(function (grp) {
                var group = grp;
                // console.log(group.get('title'));
                var groupVisible = group.getVisible();
                var groupIndeterminate = group.get('indeterminate');
                group.getLayers().getArray().forEach(function (l) {
                    l.set('indeterminate', false);
                    if ((!groupVisible || groupIndeterminate) && l.getVisible()) {
                        l.set('indeterminate', true);
                    }
                });
            });
        }
        /**
         * Ensure only the top-most base layer is visible if more than one is visible.
         * @param map The map instance.
         * @param groupSelectStyle
         * @protected
         */

    }, {
        key: 'ensureTopVisibleBaseLayerShown',
        value: function ensureTopVisibleBaseLayerShown(map, groupSelectStyle) {
            var lastVisibleBaseLyr = void 0;
            LayerSwitcher.forEachRecursive(map, function (lyr, _idx, _arr) {
                if (lyr.get('type') === 'base' && lyr.getVisible()) {
                    lastVisibleBaseLyr = lyr;
                }
            });
            if (lastVisibleBaseLyr) LayerSwitcher.setVisible_(map, lastVisibleBaseLyr, true, groupSelectStyle);
        }
        /**
         * **_[static]_** - Get an Array of all layers and groups displayed by the LayerSwitcher (has a `'title'` property)
         * contained by the specified map or layer group; optionally filtering via `filterFn`
         * @param grp The map or layer group for which layers are found.
         * @param filterFn Optional function used to filter the returned layers
         */

    }, {
        key: 'getGroupsAndLayers',
        value: function getGroupsAndLayers(grp, filterFn) {
            var layers = [];
            filterFn = filterFn || function (_lyr, _idx, _arr) {
                return true;
            };
            LayerSwitcher.forEachRecursive(grp, function (lyr, idx, arr) {
                if (lyr.get('title')) {
                    if (filterFn(lyr, idx, arr)) {
                        layers.push(lyr);
                    }
                }
            });
            return layers;
        }
        /**
         * Toggle the visible state of a layer.
         * Takes care of hiding other layers in the same exclusive group if the layer
         * is toggle to visible.
         * @protected
         * @param map The map instance.
         * @param lyr layer whose visibility will be toggled.
         * @param visible Set whether the layer is shown
         * @param groupSelectStyle
         * @protected
         */

    }, {
        key: 'setVisible_',
        value: function setVisible_(map, lyr, visible, groupSelectStyle) {
            // console.log(lyr.get('title'), visible, groupSelectStyle);
            lyr.setVisible(visible);
            if (visible && lyr.get('type') === 'base') {
                // Hide all other base layers regardless of grouping
                LayerSwitcher.forEachRecursive(map, function (l, _idx, _arr) {
                    if (l != lyr && l.get('type') === 'base') {
                        l.setVisible(false);
                    }
                });
            }
            if (lyr instanceof LayerGroup && !lyr.get('combine') && groupSelectStyle === 'children') {
                lyr.getLayers().forEach(function (l) {
                    LayerSwitcher.setVisible_(map, l, lyr.getVisible(), groupSelectStyle);
                });
            }
        }
        /**
         * Render all layers that are children of a group.
         * @param map The map instance.
         * @param lyr Layer to be rendered (should have a title property).
         * @param idx Position in parent group list.
         * @param options Options for groups and layers
         * @protected
         */

    }, {
        key: 'renderLayer_',
        value: function renderLayer_(map, lyr, idx, options, render) {
            var li = document.createElement('li');
            var lyrTitle = lyr.get('title');
            var checkboxId = LayerSwitcher.uuid();
            var label = document.createElement('label');
            if (lyr instanceof LayerGroup && !lyr.get('combine')) {
                var isBaseGroup = LayerSwitcher.isBaseGroup(lyr);
                li.classList.add('group');
                if (isBaseGroup) {
                    li.classList.add(CSS_PREFIX + 'base-group');
                }
                // Group folding
                if (lyr.get('fold')) {
                    li.classList.add(CSS_PREFIX + 'fold');
                    li.classList.add(CSS_PREFIX + lyr.get('fold'));
                    var btn = document.createElement('button');
                    btn.onclick = function (e) {
                        var evt = e || window.event;
                        LayerSwitcher.toggleFold_(lyr, li);
                        evt.preventDefault();
                    };
                    li.appendChild(btn);
                }
                if (!isBaseGroup && options.groupSelectStyle != 'none') {
                    var input = document.createElement('input');
                    input.type = 'checkbox';
                    input.id = checkboxId;
                    input.checked = lyr.getVisible();
                    input.indeterminate = lyr.get('indeterminate');
                    input.onchange = function (e) {
                        var target = e.target;
                        LayerSwitcher.setVisible_(map, lyr, target.checked, options.groupSelectStyle);
                        render(lyr);
                    };
                    li.appendChild(input);
                    label.htmlFor = checkboxId;
                }
                label.innerHTML = lyrTitle;
                li.appendChild(label);
                var ul = document.createElement('ul');
                li.appendChild(ul);
                LayerSwitcher.renderLayers_(map, lyr, ul, options, render);
            } else {
                li.className = 'layer';
                var _input = document.createElement('input');
                if (lyr.get('type') === 'base') {
                    _input.type = 'radio';
                    _input.name = 'base';
                } else {
                    _input.type = 'checkbox';
                }
                _input.id = checkboxId;
                _input.checked = lyr.get('visible');
                _input.indeterminate = lyr.get('indeterminate');
                _input.onchange = function (e) {
                    var target = e.target;
                    LayerSwitcher.setVisible_(map, lyr, target.checked, options.groupSelectStyle);
                    render(lyr);
                };
                li.appendChild(_input);
                label.htmlFor = checkboxId;
                label.innerHTML = lyrTitle;
                var rsl = map.getView().getResolution();
                if (rsl > lyr.getMaxResolution() || rsl < lyr.getMinResolution()) {
                    label.className += ' disabled';
                }
                li.appendChild(label);
            }
            return li;
        }
        /**
         * Render all layers that are children of a group.
         * @param map The map instance.
         * @param lyr Group layer whose children will be rendered.
         * @param elm DOM element that children will be appended to.
         * @param options Options for groups and layers
         * @protected
         */

    }, {
        key: 'renderLayers_',
        value: function renderLayers_(map, lyr, elm, options, render) {
            var lyrs = lyr.getLayers().getArray().slice();
            if (options.reverse) lyrs = lyrs.reverse();
            for (var i = 0, l; i < lyrs.length; i++) {
                l = lyrs[i];
                if (l.get('title')) {
                    elm.appendChild(LayerSwitcher.renderLayer_(map, l, i, options, render));
                }
            }
        }
        /**
         * **_[static]_** - Call the supplied function for each layer in the passed layer group
         * recursing nested groups.
         * @param lyr The layer group to start iterating from.
         * @param fn Callback which will be called for each layer
         * found under `lyr`.
         */

    }, {
        key: 'forEachRecursive',
        value: function forEachRecursive(lyr, fn) {
            lyr.getLayers().forEach(function (lyr, idx, a) {
                fn(lyr, idx, a);
                if (lyr instanceof LayerGroup) {
                    LayerSwitcher.forEachRecursive(lyr, fn);
                }
            });
        }
        /**
         * **_[static]_** - Generate a UUID
         * Adapted from http://stackoverflow.com/a/2117523/526860
         * @returns {String} UUID
         */

    }, {
        key: 'uuid',
        value: function uuid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
            });
        }
        /**
         * Apply workaround to enable scrolling of overflowing content within an
         * element. Adapted from https://gist.github.com/chrismbarr/4107472
         * @param elm Element on which to enable touch scrolling
         * @protected
         */

    }, {
        key: 'enableTouchScroll_',
        value: function enableTouchScroll_(elm) {
            if (LayerSwitcher.isTouchDevice_()) {
                var scrollStartPos = 0;
                elm.addEventListener('touchstart', function (event) {
                    scrollStartPos = this.scrollTop + event.touches[0].pageY;
                }, false);
                elm.addEventListener('touchmove', function (event) {
                    this.scrollTop = scrollStartPos - event.touches[0].pageY;
                }, false);
            }
        }
        /**
         * Determine if the current browser supports touch events. Adapted from
         * https://gist.github.com/chrismbarr/4107472
         * @returns {Boolean} True if client can have 'TouchEvent' event
         * @protected
         */

    }, {
        key: 'isTouchDevice_',
        value: function isTouchDevice_() {
            try {
                document.createEvent('TouchEvent');
                return true;
            } catch (e) {
                return false;
            }
        }
        /**
         * Fold/unfold layer group
         * @param lyr Layer group to fold/unfold
         * @param li List item containing layer group
         * @protected
         */

    }, {
        key: 'toggleFold_',
        value: function toggleFold_(lyr, li) {
            li.classList.remove(CSS_PREFIX + lyr.get('fold'));
            lyr.set('fold', lyr.get('fold') === 'open' ? 'close' : 'open');
            li.classList.add(CSS_PREFIX + lyr.get('fold'));
        }
        /**
         * If a valid groupSelectStyle value is not provided then return the default
         * @param groupSelectStyle The string to check for validity
         * @returns The value groupSelectStyle, if valid, the default otherwise
         * @protected
         */

    }, {
        key: 'getGroupSelectStyle',
        value: function getGroupSelectStyle(groupSelectStyle) {
            return ['none', 'children', 'group'].indexOf(groupSelectStyle) >= 0 ? groupSelectStyle : 'children';
        }
    }]);
    return LayerSwitcher;
}(Control);
if (window['ol'] && window['ol']['control']) {
    window['ol']['control']['LayerSwitcher'] = LayerSwitcher;
}

return LayerSwitcher;

})));
