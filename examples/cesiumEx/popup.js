/*
 * @class {Popup} 地图弹窗
 * @param {viewer} viewer 三维视图
 * @param {className} string 样式名
 * */

class Popup {
    constructor(option) {
        this.options = option;
        this.viewer = option.viewer; //弹窗创建的viewer
        this.className = option.className;
        this.html = option.html || null;
        this.id = 0;
        this.ctnList = {};
    }
    add(conf) {
        var _this = this;
        var geometry = conf.geometry; //弹窗挂载的位置
        var id = "popup_" + (((1 + Math.random()) * 0x10000) | 0).toString(16) + _this.id++;
        var ctn = document.createElement('div');
        ctn.className = "bx-popup-ctn" + (this.className ? " " + this.className : " bx-popup-ctn1");
        ctn.id = id;
        document.getElementById(_this.viewer.container.id).appendChild(ctn);
        //测试弹窗内容
        var testConfig = conf.content;
        ctn.innerHTML = _this.createHtml(testConfig.header, testConfig.content, conf.isclose);
        _this.ctnList[id] = [geometry, ctn];
        _this.render();
        // ctn.style.transform = 'translateY(-' + ctn.offsetHeight + 'px)';
        // if (this.className == "bx-popup-ctn2")
        // ctn.style.marginLeft = '-' + (ctn.offsetWidth / 2) + 'px';
        if (!_this.eventListener) {
            _this.eventListener = function (clock) {
                _this.render();
            };
            _this.viewer.clock.onTick.addEventListener(_this.eventListener)
        }

        if (conf.isclose === false) {} else {
            if (ctn.getElementsByClassName("bx-popup-close") && ctn.getElementsByClassName("bx-popup-close").length > 0) {
                ctn.getElementsByClassName("bx-popup-close")[0].onclick = function () {
                    _this.close(ctn);
                };
            }
        }
        return ctn;
    }
    render() {
        var _this = this;
        for (var c in _this.ctnList) {
            // var s1 = _this.viewer.scene.cartesianToCanvasCoordinates(_this.ctnList[c][0]);
            var position = Cesium.SceneTransforms.wgs84ToWindowCoordinates(_this.viewer.scene, _this.ctnList[c][0]);
            // console.log(s1.toString() + " ---- " + position.toString());
            if (position && position.x && position.y) {
                if (Math.abs(position.x) > (window.innerWidth * 2) || Math.abs(position.y) > (window.innerHeight * 2)) {
                    _this.ctnList[c][1].style.display = "none";
                } else {
                    _this.ctnList[c][1].style.display = "";
                    _this.ctnList[c][1].style.left = position.x + "px";
                    _this.ctnList[c][1].style.top = position.y + "px";
                }
            }
        }
    }
    createHtml(header, content, isclose) {
        if (this.html) {
            return this.html(header, content);
        } else {
            var html = `
            ${(isclose === false ? '' : '<div class="bx-popup-close"><span class="iconfont_DEU icon-guanbi">×</span></div>')}
            <div class="divpoint-wrap">
            <div class="divpoint-border">
            <div class="divpoint-center">
            <div class="bx-popup-header-ctn">
            ${header}
            </div>
            <div class="bx-popup-content-ctn" >
            <div class="bx-popup-content" >
            ${content}
            </div>
            </div>
            </div>
            </div>
            </div>
            <div class="directional"></div>
            `;
            return html;
        }
    }
    close(e) {
        e.remove();
        delete this.ctnList[e.id];
        if (Object.keys(this.ctnList).length == 0) {
            this.viewer.clock.onTick.removeEventListener(this.eventListener);
            this.eventListener = null;
        }
    }
    closeAll(e) {
        for (var o in this.ctnList) {
            this.ctnList[o][1].remove();
        }
        this.ctnList = {};
        this.viewer.clock.onTick.removeEventListener(this.eventListener);
        this.eventListener = null;
    }
}

/*
 * @class {Tooltip} 地图弹窗cesium中
 * @param {opt} 配置 
 * */
class Tooltip {
    constructor(opt) {
        this.options = {
            color: 'rgb(32, 160, 255)',
            stroke: 'rgb(56, 218, 255)',
            opacity: 0.6,
            textcolor: 'white',
            strokewidth: 3,
            lineheight: 25,
            fontSize: '14px',
            x: 15,
            y: 50,
            defaultHeight: 200,
            width: 200,
        }
        this.options = Object.assign(this.options, opt);
        this.tooltipEntitylist = {};
        this.viewer = opt.viewer; //弹窗创建的viewer
        this.dataSource = new Cesium.CustomDataSource("tooltipname");
        this.viewer.dataSources.add(this.dataSource);
    }
    add(option) {
        var this_ = this;
        var header = option.header,
            content = option.content;
        var contlist = content.split("<br/>");
        var x = this_.options.x,
            y = this_.options.y,
            height = this_.options.defaultHeight;
        var width = option.width || this_.options.width;
        height = contlist.length * this_.options.lineheight + 10;
        if (header && header != '') {
            height += 27;
        }
        var cen = '';
        for (var i = 0; i < contlist.length; i++) {
            cen += '<tspan x="' + x + '" y="' + y + '">' + contlist[i] + '</tspan>';
            y += this_.options.lineheight;
        }
        var data = `data:image/svg+xml,
                <svg width="${width+10}" height="${height+30}" version="1.1" xmlns="http://www.w3.org/2000/svg">
                    
    <path d=" M${width+5} 15 Q${width+5} 5 ${width+5-10} 5 L15 5 Q5 5 5 15 L5 ${height-10+5} Q5 ${height+5} 15 ${height+5} L${width/2-10+5} ${height+5} ${width/2+5} ${height+20+5} ${width/2+10+5} ${height+5} ${width-10+5} ${height+5} Q${width+5} ${height+5} ${width+5} ${height-10+5} Z"
     fill="${this_.options.color}" stroke="${this_.options.stroke}" style="${this_.options.strokewidth}:3;opacity:${this_.options.opacity};stroke-opacity:0.8"></path>
    <path d=" M${width+5} 15 Q${width+5} 5 ${width+5-10} 5 L15 5 Q5 5 5 15 L5 30 ${width+5} 30 Z" 
    fill="${this_.options.color}" style="opacity:0.5;"></path>
<text x="15" y="22" fill="${this_.options.textcolor}" style="font-size:${this_.options.fontSize}; font-weight: 600;">${header}</text>
         <text fill="${this_.options.textcolor}" style="font-size: ${this_.options.fontSize};">
            ${cen}
      </text>

    </svg>
    `;
        var entity = {
            position: option.position,
            billboard: {
                image: data,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                verticalOrigin: Cesium.VerticalOrigin.BOTTOM
            },
        };
        var ety=this_.dataSource.entities.add(entity);
        var id = option.id || Cesium.createGuid();
        var tooltip = {
            id: id,
            entity: ety,
            clear: function () {
                this_.cleartooltip(id)
            }
        };
        this_.tooltipEntitylist[id] = tooltip;
    }

    cleartooltip(id) {
        var this_ = this;
        if (id) {
            this_.dataSource.entities.remove(this_.tooltipEntitylist[id].entity)
            delete this_.tooltipEntitylist[id]
        } else {
            this_.dataSource.entities.removeAll();
            this_.tooltipEntitylist = {};
        }
    }
}

