/* by jiawanlong*/
(function () {
    var r = new RegExp("(^|(.*?\\/))(PlottingPanel.Include\.js)(\\?|$)"),
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

    //加载类库资源文件
    function load() {
        var includes = (targetScript.getAttribute('include') || "").split(",");
        var excludes = (targetScript.getAttribute('exclude') || "").split(",");

        if (inArray(includes, 'PlotPanel')) {
            inputScript("../js/plottingPanel/PlotPanel.js");
        }
        if (inArray(includes, 'StylePanel')) {
            inputScript("../js/plottingPanel/customEditor/ColorpickerEditor.js");
            inputScript("../js/plottingPanel/PublicStyleFunction.js");
            inputScript("../js/plottingPanel/StylePanel.js");
        }
        if (inArray(includes, 'SMLInfosPanel')) {
            inputScript("../js/plottingPanel/SMLInfosPanel.js");
        }
        if (inArray(includes, 'iPortalStylePanel')) {
            inputScript("../js/plottingPanel/iPortalStylePanel.js");
        }
    }

    load();
})();
