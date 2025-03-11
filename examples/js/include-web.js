/* by jiawanlong*/
(function () {
    
    var r = new RegExp("(^|(.*?\\/))(include-web\.js)(\\?|$)"),
        s = document.getElementsByTagName('script'), targetScript;
    for (var i = 0; i < s.length; i++) {
        var src = s[i].getAttribute('src');
        if (src) {
            var m = src.match(r);
            if (m) {
                targetScript = s[i];
                break;
            }
        }
    }

    function inputScript(url) {
        var script = '<script type="text/javascript" src="' + url + '"><' + '/script>';
        document.writeln(script);
    }

    function inputCSS(url) {
        var css = '<link rel="stylesheet" href="' + url + '">';
        document.writeln(css);
    }

    function inArray(arr, item) {
        for (i in arr) {
            if (arr[i] == item) {
                return true;
            }
        }
        return false;
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

    function getLanguage() {
      var lang = getCookie('language');
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

    //加载类库资源文件
    function load(config) {
        var libsurl = config.libsurl;
        var includes = (targetScript.getAttribute('include') || "").split(",");
        var excludes = (targetScript.getAttribute('exclude') || "").split(",");
        const resourceLanguage = getLanguage();
        inputScript("../locales/" + resourceLanguage + "/resources.js");
        inputScript("../js/tokengenerator.js");
        var jQueryInclude = false;
        if (!inArray(excludes, 'example-i18n')) {
            inputScript(libsurl + '/jquery/jquery.min.js');

            inputScript(libsurl + '/i18next/i18next.min.js');
            inputScript(libsurl + '/jquery-i18next/jquery-i18next.min.js');
            inputScript(libsurl + '/css-vars-ponyfill/2.4.8/css-vars-ponyfill.min.js');
            inputScript(libsurl + '/compare-versions/5.0.3/index.min.js');

            inputScript("../js/utils.js");
            inputScript("../js/localization.js");
            document.writeln("<script>Localization.initializeI18N('../', function () {Localization.localize();Localization.initGlobal();}); </script>");
            jQueryInclude = true;
        }
        if (inArray(includes, 'theme')) {
            inputScript("../js/theme/themeConfig.js");
            inputScript("../js/theme/theme.js");
        }
        if (inArray(includes, 'jquery') && !jQueryInclude) {
            inputScript(libsurl + '/jquery/jquery.min.js');
        }

        if (inArray(includes, 'bootstrap')) {
            inputScript(libsurl + '/jquery/jquery.min.js');
            inputCSS(libsurl + '/bootstrap/css/bootstrap.min.css');
            inputScript(libsurl + '/bootstrap/js/bootstrap.min.js');
        }
        if (inArray(includes, 'bootstrap-css')) {
            inputCSS(libsurl + '/bootstrap/css/bootstrap.min.css')
        }

        if (inArray(includes, 'bootstrap-js')) {
            inputScript(libsurl + '/bootstrap/js/bootstrap.min.js');
        }

        if (inArray(includes, 'jquery-ui')) {
            inputCSS(libsurl + '/jquery-ui/1.12.1/jquery-ui.css');
            inputScript(libsurl + '/jquery-ui/1.12.1/jquery-ui.min.js');
        }

        if (inArray(includes, 'template')) {
            inputScript(libsurl + '/art-template/4.12.2/template-web.js');
        }
        if (inArray(includes, 'randomcolor')) {
            inputScript(libsurl + '/randomcolor/randomColor.min.js');
        }
        if (inArray(includes, 'papaparse')) {
            inputScript(libsurl + '/papaparse/papaparse.min.js');
        }
        if (inArray(includes, 'moment')) {
            inputScript(libsurl + '/moment/2.29.4/moment.min.js');
            inputScript(libsurl + '/moment/2.29.4/zh-cn.min.js');
        }
        if (inArray(includes, 'bootstrap-datetimepicker')) {
            inputCSS(libsurl + '/bootstrap-datetimepicker/bootstrap-datetimepicker.min.css');
            inputScript(libsurl + '/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js');
        }
        if (inArray(includes, 'bootstrap-select')) {
            inputCSS(libsurl + '/bootstrap-select/bootstrap-select.min.css');
            inputScript(libsurl + '/bootstrap-select/bootstrap-select.min.js');
        }
        if (inArray(includes, 'geohash')) {
            inputScript(libsurl + '/geohash/geohash.js');
        }
        if (inArray(includes, 'dat-gui')) {
            inputScript(libsurl + '/dat-gui/0.7.6/dat.gui.min.js');
            datGuiI18N();
        }
        if (inArray(includes, 'admin-lte')) {
            inputCSS(libsurl + '/admin-lte/css/AdminLTE.min.css');
            inputCSS(libsurl + '/admin-lte/css/skins/skin-blue.min.css');
            inputCSS(libsurl + '/font-awesome/css/font-awesome.min.css');
            inputScript(libsurl + '/admin-lte/js/app.min.js');
        }
        if (inArray(includes, 'jquery.scrollto')) {
            inputScript(libsurl + '/jquery.scrollto/jquery.scrollTo.min.js');
        }
        if (inArray(includes, 'ace')) {
            inputScript(libsurl + '/ace/ace.js');
        }
        if (inArray(includes, 'widgets.alert')) {
            inputScript("../js/widgets.js");
        }

        if (inArray(includes, 'widgets')) {
            inputCSS(libsurl + '/css-loader/css-loader.css');
            inputScript("../js/widgets.js");
        }
        if (inArray(includes, 'zTree')) {
            inputCSS(libsurl + '/iclient8c/examples/js/plottingPanel/zTree/css/zTreeStyle.css');
            inputScript(libsurl + '/iclient8c/examples/js/plottingPanel/zTree/jquery.ztree.core.js');
        }
        if (inArray(includes, 'jquery-scontextMenu')) {
            inputCSS(libsurl + '/jquery.contextMenu/jquery.contextMenu.min.css');
            inputScript(libsurl + '/jquery.contextMenu/jquery.contextMenu.min.js');
        }
        if (inArray(includes, 'colorpicker')) {
            inputScript(libsurl + '/iclient8c/examples/js/jquery.js');
            inputScript(libsurl + '/iclient8c/examples/js/jquery.colorpicker.js');
        }
        if (inArray(includes, 'fileupLoad')) {
            inputScript(libsurl + '/iclient8c/examples/js/jquery.js');
            inputScript(libsurl + '/iclient8c/examples/js/fileupLoad.js');
        }
        if (inArray(includes, 'sticklr')) {
            inputCSS(libsurl + '/iclient8c/examples/css/jquery-sticklr.css');
            inputCSS(libsurl + '/iclient8c/examples/css/icon.css');
        }
        if (inArray(includes, 'responsive')) {
            inputCSS(libsurl + '/iclient8c/examples/css/bootstrap-responsive.min.css');
        }
        if (inArray(includes, 'lazyload')) {
            inputScript(libsurl + '/lazyload/jquery.lazyload.min.js');
        }
        if (inArray(includes, 'i18n')) {
            inputScript(libsurl + '/i18next/i18next.min.js');
            inputScript(libsurl + '/jquery-i18next/jquery-i18next.min.js');
        }
        if (inArray(includes, 'react')) {
            inputScript(libsurl + '/react/16.4.2/react.production.min.js');
            inputScript(libsurl + '/react/16.4.2/react-dom.production.min.js');
            inputScript(libsurl + '/babel/6.26.0/babel.min.js');
        }
        if (inArray(includes, 'vue')) {
            inputScript(libsurl + '/vue/2.5.17/vue.min.js');
        }
        if (inArray(includes, 'ionRangeSlider')) {
            inputCSS(libsurl + '/ionRangeSlider/2.2.0/css/ion.rangeSlider.css');
            inputCSS(libsurl + '/ionRangeSlider/2.2.0/css/normalize.css');
            inputCSS(libsurl + '/ionRangeSlider/2.2.0/css/ion.rangeSlider.skinHTML5.css');
            inputScript(libsurl + '/ionRangeSlider/2.2.0/js/ion.rangeSlider.min.js');
        }
        if (inArray(includes, 'plottingPanel')) {
            inputScript(libsurl + '/iclient8c/examples/js/plottingPanel/zTree/jquery.ztree.core.js');
            inputCSS(libsurl + '/iclient8c/examples/js/plottingPanel/zTree/css/zTreeStyle.css');
            inputScript(libsurl + '/iclient8c/examples/js/plottingPanel/jquery-easyui-1.4.4/jquery.easyui.min.js');
            inputCSS(libsurl + '/iclient8c/examples/js/plottingPanel/jquery-easyui-1.4.4/css/easyui.css');
            inputScript(libsurl + '/iclient8c/examples/js/plottingPanel/colorpicker/js/colorpicker.js');
            inputCSS(libsurl + '/iclient8c/examples/js/plottingPanel/colorpicker/css/colorpicker.css');
        }
    }

    function datGuiI18N() {
        document.writeln("<script>function registerEventListener(evt,fn){" +
            "if(window.attachEvent){window.attachEvent('on'+evt,fn);}" +
            "else{window.addEventListener(evt,fn,false);}" +
            "}</script>");
        document.writeln("<script>registerEventListener('load',function() { " +
            "dat.GUI.TEXT_CLOSED=resources.text_close;dat.GUI.TEXT_OPEN=resources.text_open;" +
            "})</script>")
    }

    load({
        libsurl: '../libs'
    });
    window.isLocal = false;
    window.server = document.location.toString().match(/file:\/\//) ? "http://localhost:8090" : document.location.protocol + "//" + document.location.host;
    window.version = "11.1.1";
    window.preRelease = "";




})();
