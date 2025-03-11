/* by jiawanlong*/
var utils = {
    //设置语言。参数："zh_CN"，"en-US"
    setLanguage: null,
    //获取当前语言。默认从cookie读取，没有则读取浏览器默认语言
    getLanguage: null,
    //设置cookie
    setCookie: null,
    //获取cookie
    getCookie: null,

    //获取给定key在当前语言环境下对应的key所对应的值。如读取name字段的值在英语环境下应该变为读取name_en字段的值
    getLocalPairs: null,
    //加载模板文件，依赖art-template库
    loadTemplate: null
};
(function (utils) {
    var cKey = "language";

    //设置语言。参数："zh_CN"，"en-US"
    function setLanguage(language) {
        //默认设置过期时间为7天
        setCookie(cKey, language, 7 * 24 * 60 * 60 * 1000);
    }

    //获取当前语言。默认从cookie读取，没有则读取浏览器默认语言
    function getLanguage() {
        var lang = getCookie(cKey);
        if (!lang) {
            if (navigator.appName === 'Netscape') {
                lang = navigator.language;
            } else {
                lang = navigator.browserLanguage;
            }
        }
        if (lang) {
            if (lang.indexOf('zh') === 0) {
                return 'zh-CN';
            }
            if (lang.indexOf('en') === 0) {
                return 'en-US';
            }
        }
        return 'zh-CN';
    }

    //设置cookie,参数分别为：key,value,过期时间（单位:ms）,域
    function setCookie(cKey, cValue, exp, domain) {
        var cookie = cKey + "=" + cValue;
        if (exp) {
            var d = new Date();
            d.setTime(d.getTime() + exp);
            cookie += ";expires=" + d.toUTCString();
        }
        cookie += domain ? ";path=" + domain : ";path=/";
        document.cookie = cookie;
    }

    function getCookie(cKey) {
        var name = cKey + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1);
            if (c.indexOf(name) !== -1) return c.substring(name.length, c.length);
        }
        return "";
    }

    //清除cookie
    function clearCookie(name) {
        setCookie(name, "", -1);
    }

    function getLocalKey(key) {
        var lang = getLanguage();
        var localKey = key;
        if (lang === "en-US") {
            localKey = key + "_" + "en";
        }
        return localKey;
    }

    function getLocalPairs(obj, key) {
        if (!obj) {
            return;
        }
        var localKey = getLocalKey(key);
        return obj[localKey] != null ? obj[localKey] : obj[key];
    }

    function loadTemplate(element, templateFilePath, data) {
        if (!window.$ || !window.jQuery) {
            throw new Error("jQuery is required")
        }
        if (!window.template) {
            throw new Error("art-template.js is required")
        }
        if (!element) {
            throw new Error("element is required")
        }
        $.get(templateFilePath, function (html) {
            if(data && data.nav && data.nav.path) {
              window.path = data.nav.path
            }
            $(element).html(window.template.compile(html)(data));
        });

    }

    utils.setLanguage = setLanguage;
    utils.getLanguage = getLanguage;
    utils.setCookie = setCookie;
    utils.getCookie = getCookie;
    utils.getLocalPairs = getLocalPairs;
    utils.loadTemplate = loadTemplate;

})(utils);


    function watermark(settings) {
        //默认设置
        var defaultSettings = {
            watermark_txt: "text",
            watermark_x: 20, //水印起始位置x轴坐标
            watermark_y: 20, //水印起始位置Y轴坐标
            watermark_rows: 20, //水印行数
            watermark_cols: 20, //水印列数
            watermark_x_space: 100, //水印x轴间隔
            watermark_y_space: 50, //水印y轴间隔
            watermark_color: '#aaa', //水印字体颜色
            watermark_alpha: 0.3, //水印透明度
            watermark_fontsize: '15px', //水印字体大小
            watermark_font: '微软雅黑', //水印字体
            watermark_width: 210, //水印宽度
            watermark_height: 80, //水印长度
            watermark_angle: 20 //水印倾斜度数
        };
        if(arguments.length === 1 && typeof arguments[0] === "object") {
            var src = arguments[0] || {};
            for(key in src) {
                if(src[key] && defaultSettings[key] && src[key] === defaultSettings[key]) continue;
                else if(src[key]) defaultSettings[key] = src[key];
            }
        }
        var oTemp = document.createDocumentFragment();
        var page_width = Math.max(document.body.scrollWidth, document.body.clientWidth);
        var cutWidth = page_width * 0.0150;
        var page_width = page_width - cutWidth;
        var page_height = document.body.scrollHeight ;
        page_height = Math.max(page_height, window.innerHeight - 30);
        if(defaultSettings.watermark_cols == 0 || (parseInt(defaultSettings.watermark_x + defaultSettings.watermark_width * defaultSettings.watermark_cols + defaultSettings.watermark_x_space * (defaultSettings.watermark_cols - 1)) > page_width)) {
            defaultSettings.watermark_cols = parseInt((page_width - defaultSettings.watermark_x + defaultSettings.watermark_x_space) / (defaultSettings.watermark_width + defaultSettings.watermark_x_space));
            defaultSettings.watermark_x_space = parseInt((page_width - defaultSettings.watermark_x - defaultSettings.watermark_width * defaultSettings.watermark_cols) / (defaultSettings.watermark_cols - 1));
        }
        // if(defaultSettings.watermark_rows == 0 || (parseInt(defaultSettings.watermark_y + defaultSettings.watermark_height * defaultSettings.watermark_rows + defaultSettings.watermark_y_space * (defaultSettings.watermark_rows - 1)) > page_height)) {
            defaultSettings.watermark_rows = parseInt((defaultSettings.watermark_y_space + page_height - defaultSettings.watermark_y) / (defaultSettings.watermark_height + defaultSettings.watermark_y_space));
            defaultSettings.watermark_y_space = parseInt(((page_height - defaultSettings.watermark_y) - defaultSettings.watermark_height * defaultSettings.watermark_rows) / (defaultSettings.watermark_rows - 1));
        // }
        var x;
        var y;
        for(var i = 0; i < defaultSettings.watermark_rows; i++) {
            y = defaultSettings.watermark_y + (defaultSettings.watermark_y_space + defaultSettings.watermark_height) * i;
            for(var j = 0; j < defaultSettings.watermark_cols; j++) {
                x = defaultSettings.watermark_x + (defaultSettings.watermark_width + defaultSettings.watermark_x_space) * j;
                var mask_div = document.createElement('div');
                mask_div.id = 'mask_div' + i + j;
                mask_div.className = '';
                mask_div.appendChild(document.createTextNode(defaultSettings.watermark_txt));
                mask_div.style.webkitTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                mask_div.style.MozTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                mask_div.style.msTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                mask_div.style.OTransform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                mask_div.style.transform = "rotate(-" + defaultSettings.watermark_angle + "deg)";
                mask_div.style.visibility = "";
                mask_div.style.position = "absolute";
                mask_div.style.left = x + 'px';
                mask_div.style.top = y + 'px';
                mask_div.style.overflow = "hidden";
                mask_div.style.zIndex = "9999";
                mask_div.style.pointerEvents = 'none';
                mask_div.style.opacity = defaultSettings.watermark_alpha;
                mask_div.style.fontSize = defaultSettings.watermark_fontsize;
                mask_div.style.fontFamily = defaultSettings.watermark_font;
                mask_div.style.color = defaultSettings.watermark_color;
                mask_div.style.textAlign = "center";
                mask_div.style.width = defaultSettings.watermark_width + 'px';
                mask_div.style.height = defaultSettings.watermark_height + 'px';
                mask_div.style.display = "block";
                oTemp.appendChild(mask_div);
            };
        };
        document.body.appendChild(oTemp);
    }
    
    function getNow() {
        var d = new Date();
        var year = d.getFullYear();
        var month = change(d.getMonth() + 1);
        var day = change(d.getDate());
        var hour = change(d.getHours());
        var minute = change(d.getMinutes());
        var second = change(d.getSeconds());
    
        function change(t) {
            if(t < 10) {
                return "0" + t;
            } else {
                return t;
            }
        }
        ; var time = year + '年' + month + '月' + day + '日 ' + hour + '时' + minute + '分' + second + '秒';
        var time = year + '-' + month + '-' + day + ' ' + hour + '-' + minute + '-' + second;
        return time;
    }
