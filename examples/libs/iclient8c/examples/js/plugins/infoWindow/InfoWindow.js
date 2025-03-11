/**
 * Class: SuperMap.InfoWindow
 * 信息弹窗类。在地图上可以打开或关闭，通常情况下点击一个 icon 打开弹窗，
 * 弹窗直接加载到map上，不需要创建图层，可用 SuperMap.Map.addPopup 方法在地图上添加使用。
 */
SuperMap.InfoWindow = SuperMap.Class({
    /**
     * Property: events
     * {<SuperMap.Events>} 自定义事件经理
     */
    events: null,

    /*
     * APIProperty: title
     * {String}  弹窗的标题名
     * */
    title: '详细信息',
    /*
     * APIProperty: titleBox
     * {Boolean}  在弹出的窗口中是否显示标题栏
     * */
    titleBox: true,

    /** Property: id
     * {String} 弹窗的ID号
     */
    id: "",

    /**
     * APIProperty: lonLat
     * {<SuperMap.LonLat>} 弹窗在地图上的地理坐标
     */
    lonLat: null,

    /**
     * Property: div
     * {DOMElement} 弹窗容器div
     */
    div: null,

    /**
     * APIProperty: size
     * {<SuperMap.Size>} 弹窗div的宽与高
     */
    size: null,

    /**
     * APIProperty: contentSize
     * {<SuperMap.Size>} 弹窗内容div的宽与高
     */
    contentSize: null,

    /**
     * Property: default_width
     * {<SuperMap.Size>} 弹窗内容div的默认宽度
     */
    default_width: 300,

    /**
     * Property: default_height
     * {<SuperMap.Size>} 弹窗内容div的默认高度
     */
    default_height: 200,

    /**
     * APIProperty: default_backgroundColor
     * {String} 弹窗的默认背景颜色
     */
    default_backgroundColor: 'white',

    /**
     * APIProperty: default_opacity
     * {float} 弹窗的默认透明度 (between 0.0 and 1.0)
     */
    default_opacity: 1,

    /**
     * APIProperty: default_border
     * {String} 弹窗的默认边框大小  (eg 2px)
     */
    default_border: 0,

    /**
     * APIProperty: contentHTML
     * {String} 弹窗内容
     */
    contentHTML: null,

    /**
     * APIProperty: closeOnMove
     * {Boolean} 当地图平移时，关闭弹窗。
     * 默认为false。
     */
    closeOnMove: false,

    /**
     * Property: closeBox
     * {Boolean} 在弹出窗口的里面是否显示关闭窗。
     */
    closeBox: true,

    /**
     * Property: closeBoxCallback
     * {Function} 关闭弹窗触发该回调函数。
     */
    closeBoxCallback: null,

    /*
     * APIProperty:content
     * {Object} 用户自定义信息
     * */
    content: null,

    /*
     * APIProperty:content
     * {SuperMap.Feature} 要素信息
     * */
    feature: null,

    /*
     * APIProperty:content
     * {Object} 弹窗偏移量
     * */
    offset: {x:0,y:0},


    /**
     * Constructor: SuperMap.InfoWindow
     * 创建弹窗。
     * 例如:
     * (code)
     * var InfoWindow = new SuperMap.InfoWindow("chicken",
     *                    new SuperMap.Size(200,200),
     *                    "元素信息",
     *                    "example InfoWindow",
     *                    true);
     * InfoWindow.closeOnMove = true;
     * InfoWindow.setLonLat(new SuperMap.LonLat(5,40),);
     * map.addPopup(InfoWindow);
     * (end)
     *
     * Parameters:
     * id - {String} 弹窗的唯一标识，如设为null，则将会自动生成。
     * title - {String}       弹窗标题名
     * contentHTML - {String}          弹窗中显示的一个HTML要素的字符串。
     */
    initialize: function (id, title, options) {
        if (id == null) {
            id = SuperMap.Util.createUniqueID(this.CLASS_NAME + "_");
        }

        this.id = id;
        this.title = (title != null) ? title : this.title;

        this.contentSize = options && options.contentSize;
        if(!this.contentSize) {
            this.contentSize = new SuperMap.Size(this.default_width, this.default_height);
        }

        if(options && options.size) {
            this.size= options.size
        }else {
            this.size = new SuperMap.Size(this.default_width, this.default_height+37);
        }
        if(options && options.map) {
            this.map = options.map;
        }
        if(options && options.titleBox) {
            this.titleBox = options.titleBox;
        }
        if(options && options.closeBox) {
            this.closeBox = options.closeBox;
        }
        this.render();
    },

    /**
     * APIMethod: render
     * 渲染弹窗
     */
    render: function () {
        this.div = SuperMap.Util.createDiv(this.id, null, null,
            null, null, null, "visible");
        this.div.className = "pop-container";

        //标题栏
        this.header = SuperMap.Util.createDiv(this.id + "_header", null, null,
            null, null, null, "visible");
        if (this.titleBox) {
            this.header.className = "pop-header";
            this.header.innerHTML = "<label class='pop-titlename'>" + this.title + "</label>";
        }
        else {
            this.header.className = "theme-pop-header";
        }

        //弹窗内容
        this.contentDiv = SuperMap.Util.createDiv(this.id + "_contentDiv", null, null,
            null, null, null, "auto");
        //this.contentDiv.className = "nano pop-content";
        this.contentDiv.style.overflowX = "hidden";
        this.groupDiv = SuperMap.Util.createDiv(this.id + "_groupDiv", null, null,
            null, null);
        //this.groupDiv.className = "nano-content";
        this.contentDiv.appendChild(this.groupDiv);

        //弹窗指向箭头
        this.arrow = SuperMap.Util.createDiv(this.id + "_arrow", null, null,
            null, null, null, "hidden");
        this.arrow.className = "arrow-container";
        this.arrow.innerHTML = '<div class="arrow"></div>';

        //弹窗关闭按钮
        if (this.closeBox) {
            this.addCloseBox(this.closeBoxCallback);
        }
        this.div.appendChild(this.header);
        this.div.appendChild(this.contentDiv);
        this.div.appendChild(this.arrow);

        this.registerEvents();
    },

    /**
     * APIMethod: destroy
     * 清除弹窗
     */
    destroy: function () {

        this.id = null;
        this.lonLat = null;
        this.size = null;
        this.contentHTML = null;

        this.backgroundColor = null;
        this.opacity = null;
        this.border = null;

        if (this.closeOnMove && this.map) {
            this.map.events.unregister("movestart", this, this.hide);
        }

        if (this.closeDiv) {
            SuperMap.Event.stopObservingElement(this.closeDiv);
            this.header.removeChild(this.closeDiv);
        }
        this.closeDiv = null;

        if (this.map != null) {
            this.map.removePopup(this);
        }
        this.map = null;
        this.div = null;
    },

    /**
     * Method: draw
     * 制作弹窗
     *
     * Parameters:
     * px - {<SuperMap.Pixel>} 弹窗的像素坐标
     *
     * Returns:
     * {DOMElement} 返回一个弹窗div
     */
    draw: function (px) {
        if (px == null) {
            if ((this.lonLat != null) && (this.map != null)) {
                px = this.map.getLayerPxFromLonLat(this.lonLat);
            }
        }
        if (this.closeOnMove) {
            this.map.events.register("movestart", this, this.hide);
        }

        this.setSize(this.contentSize);
        this.moveTo(px);
        this.setBackgroundColor();
        this.setOpacity();
        this.setBorder();
        this.setLonLat();

        return this.div;
    },

    /**
     * Method: updatePosition
     * 如果地图改变了弹窗的地理坐标，弹窗需要改变自己的位置
     */
    updatePosition: function () {
        if ((this.lonLat) && (this.map)) {
            var px = this.map.getLayerPxFromLonLat(this.lonLat);
            if (px) {
                this.moveTo(px);
            }
        }
    },

    /**
     * APIMethod: setLonLat
     * 允许用户自定义弹窗的地理坐标
     *
     * Parameters:
     * lonLat - {String} 弹窗的地理坐标
     * offset - {Object} 弹窗偏移量
     */
    setLonLat: function (lonlat,offset) {
        if(offset) {
            this.offset = offset;
        }
        if (lonlat) {
            this.lonLat = lonlat;
            if (this.map) {
                this.updatePosition();
            }
        }
    },

    /**
     * Method: moveTo
     *
     * Parameters:
     * px - {<SuperMap.Pixel>} 弹窗div的 top 与 left 值
     */
    moveTo: function (px) {
        if ((px != null) && (this.div != null)) {
            this.div.style.left = px.x - this.size.w * 0.5 - this.offset.x + "px";
            this.div.style.top = px.y - this.size.h - 25 - this.offset.y + "px";
        }
    },

    /**
     * APIMethod: hide
     * 隐藏弹窗
     */
    hide: function () {
        if (this.div) {
            this.div.style.display = 'none';
        }
    },

    /**
     * APIMethod: visible
     *
     * Returns:
     * {Boolean} 返回弹窗元素的可见性
     */
    visible: function () {
        return SuperMap.Element.visible(this.div);
    },

    /**
     * APIMethod: toggle
     * 转换弹窗的显示与隐藏
     */
    toggle: function () {
        if (this.visible()) {
            this.hide();
        } else {
            this.show(this.feature);
        }
    },
    /**
     * APIMethod: show
     * 显示弹窗
     *
     * Parameters:
     * titleArray 显示弹窗的要素
     * content 用户自定义弹窗的内容
     */
    show: function (titleArray,content) {
        this.setContentHTML(titleArray,content);
        if (this.div) {
            this.div.style.display = 'block';
        }
    },

    /**
     * APIMethod: setSize
     * 设置弹窗的大小
     *
     * Parameters:
     * contentSize - {<SuperMap.Size>} 弹窗内容的大小
     */
    setSize: function (contentSize) {
        this.size = contentSize.clone();
        this.size.h += 37;

        if (this.div != null) {
            this.div.style.width = this.size.w + "px";
            this.div.style.height = this.size.h + "px";
        }

        if (this.arrow != null) {
            this.arrow.style.left = this.size.w * 0.5 - 20 + "px";
        }

        if (this.contentDiv != null) {
            this.contentDiv.style.width = contentSize.w + "px";
            this.contentDiv.style.height = contentSize.h + "px";
            if (this.titleBox) {
                this.contentDiv.style.top = 36 + 'px';
            }
            else {
                this.contentDiv.style.top = 25 + 'px';
            }

        }
    },

    /**
     * APIMethod: setBackgroundColor
     * 设置弹出框的背景颜色.
     *
     * Parameters:
     * color - {String} 背景颜色.  如 "#FFBBBB"
     */
    setBackgroundColor: function (color) {
        if (color != undefined) {
            this.default_backgroundColor = color;
        }

        if (this.div != null) {
            this.div.style.backgroundColor = this.default_backgroundColor;
            this.arrow.firstChild.style.backgroundColor = this.default_backgroundColor;
        }
    },

    /**
     * APIMethod: setOpacity
     * 设置弹出框的透明度.
     *
     * Parameters:
     * opacity - {float} 该值在0.0（完全透明）到1.0（不透明）之间.
     */
    setOpacity: function (opacity) {
        if (opacity != undefined) {
            this.default_opacity = opacity;
        }

        if (this.div != null) {
            // for Mozilla and Safari
            this.div.style.opacity = this.default_opacity;

            // for IE
            this.div.style.filter = 'alpha(opacity=' + this.default_opacity * 100 + ')';
        }
    },

    /**
     * APIMethod: setBorder
     * 设置弹出窗体的边框样式.
     * 对应页面元素style的border属性
     * Parameters:
     * border - {String} 边框的样式值. 如 solid  代表实线
     */
    setBorder: function (border) {
        if (border != undefined) {
            this.default_border = border;
        }

        if (this.div != null) {
            this.div.style.border = this.default_border;
        }
    },

    /**
     * APIMethod: setContentHTML
     * 用于用户设置弹窗的内容
     *
     * Parameters:
     * contentHTML - {String} 弹窗内容
     */
    setContentHTML: function (titleArray,content) {
        if(content) {
            if(typeof(content) === "object") {
                //传入的对象属性
                var contentHtml = '<table class="content-table">';
                if(titleArray && titleArray.length>0) {
                    for (var key=0; key<titleArray.length; key++) {
                        var title = titleArray[key];
                        if(key % 2 === 0) {
                            contentHtml = contentHtml + '<tr><td class="col-xs-5"><span title="'+ title +'">' + title + '</span></td><td class="col-xs-5">' + content[title] + '</td></tr>';
                        } else {
                            contentHtml = contentHtml + '<tr class="gray-line"><td class="col-xs-5 title-td"><span title="'+ title +'">' + title + '</span></td><td class="col-xs-5">' + content[title] + '</td></tr>';
                        }
                    }
                } else {
                    key = 0;
                    this.content = SuperMap.Util.extend({}, content.attributes);
                    for(var propTitle in this.content) {
                        if(key % 2 === 0) {
                            contentHtml = contentHtml + '<tr><td class="col-xs-5"><span title="'+ propTitle +'">' + propTitle + '</span></td><td class="col-xs-5">' + this.content[propTitle] + '</td></tr>';
                        } else {
                            contentHtml = contentHtml + '<tr class="gray-line"><td class="col-xs-5"><span title="'+ propTitle +'">' + propTitle + '</span></td><td class="col-xs-5">' + this.content[propTitle] + '</td></tr>';
                        }
                        key++;
                    }
                }
                contentHtml = contentHtml + '</table>';
                this.contentHTML = contentHtml;
            } else {
                //传入html
                this.contentHTML = content;
            }
        }
        if ((this.contentDiv != null) &&
            (this.contentHTML != null) &&
            (this.contentHTML != this.groupDiv.innerHTML)) {

            this.groupDiv.innerHTML = this.contentHTML;
        }
    },

    /**
     * Method: addCloseBox
     *
     * Parameters:
     * callback - {Function} 当点击关闭按钮时，执行回调函数
     */
    addCloseBox: function (callback) {

        this.closeDiv = SuperMap.Util.createDiv(
            this.id + "_hide", null, new SuperMap.Size(17, 17)
        );
        if (this.titleBox == true) {
            this.closeDiv.className = "supermapol-icons-clear pop-hide";
        }
        else {
            this.closeDiv.className = "supermapol-icons-clear2 pop-hide";
        }
        this.header.appendChild(this.closeDiv);

        var closeInfoWindow = callback || function (e) {
                this.hide();
                SuperMap.Event.stop(e);
            };
        SuperMap.Event.observe(this.closeDiv, "click",
            SuperMap.Function.bindAsEventListener(closeInfoWindow, this));
    },

    /**
     * Method: registerEvents
     * 在弹出窗口上注册事件。
     *
     *   在一个单独的函数中这样做，以便子类可以选择重写它，
     *   如果他们希望对鼠标事件进行不同的处理
     *
     *   在以下的处理函数，需要特别注意正确处理鼠标和弹出音符。
     *
     *   因为用户可能会选择缩放矩形选项，然后拖动到一个弹出，
     *   我们需要一个安全的方式来允许MouseMove和mouseup事件通过弹出时，
     *   他们开始从外面。同样的程序是touchmove和touchend事件需要。
     *
     *   否则，我们想基本上杀死所有其他事件的事件传播，
     *   虽然我们必须这样做，小心，而不禁用基本的HTML功能，如点击超链接或拖动选择文本。
     */
    registerEvents: function () {
        this.events = new SuperMap.Events(this, this.div, null, true);

        function onTouchstart(evt) {
            SuperMap.Event.stop(evt, true);
        }

        this.events.on({
            "mousedown": this.onmousedown,
            "mousemove": this.onmousemove,
            "mouseup": this.onmouseup,
            "click": this.onclick,
            "mouseout": this.onmouseout,
            "dblclick": this.ondblclick,
            "touchstart": onTouchstart,
            scope: this
        });

    },
    /**
     * Method: onmousedown
     * 当鼠标落在弹出，请注意它的局部，
     * 然后不传播MouseDown（但这样做安全，用户可以选择文本内）
     *
     * Parameters:
     * evt - {Event}
     */
    onmousedown: function (evt) {
        this.mousedown = true;
        SuperMap.Event.stop(evt, true);
    },

    /**
     * Method: onmousemove
     * 如果拖在弹出的开始，然后不传播MouseMove
     * （但这样做安全，用户可以选择文本内）
     *
     * Parameters:
     * evt - {Event}
     */
    onmousemove: function (evt) {
        if (this.mousedown) {
            SuperMap.Event.stop(evt, true);
        }
    },

    /**
     * Method: onmouseup
     * 当鼠标出现在弹出窗口中，在它向下后，重置标志，
     * 然后（再次）不传播事件，但这样做安全，使用户可以选择文本内
     *
     * Parameters:
     * evt - {Event}
     */
    onmouseup: function (evt) {
        if (this.mousedown) {
            this.mousedown = false;
            SuperMap.Event.stop(evt, true);
        }
    },

    /**
     * Method: onclick
     * 忽略点击，但允许默认浏览器处理
     *
     * Parameters:
     * evt - {Event}
     */
    onclick: function (evt) {
        SuperMap.Event.stop(evt, true);
    },

    /**
     * Method: onmouseout
     *当鼠标跳出弹出窗口时，该标志将被设置为false，
     * 这样如果它们放了又拖回来，我们就不会被混淆了。
     *
     * Parameters:
     * evt - {Event}
     */
    onmouseout: function (evt) {
        this.mousedown = false;
    },

    /**
     * Method: ondblclick
     * 忽略双击，但允许默认浏览器处理
     *
     * Parameters:
     * evt - {Event}
     */
    ondblclick: function (evt) {
        SuperMap.Event.stop(evt, true);
    },

    CLASS_NAME: "SuperMap.InfoWindow"
});


