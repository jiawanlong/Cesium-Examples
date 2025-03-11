//var isWinRT = (typeof Windows === "undefined") ? false : true;
(function() {
    // var isWinRT = (typeof Windows === "undefined") ? false : true;
    var r = new RegExp("(^|(.*?\\/))(PlottingPanel.Include\.js)(\\?|$)"),
        s = document.getElementsByTagName('script'),
        src, m, baseurl = "";
    for(var i=0, len=s.length; i<len; i++) {
        src = s[i].getAttribute('src');
        if(src) {
            var m = src.match(r);
            if(m) {
                baseurl = m[1];
                break;
            }
        }
    }
    function inputLink(inc){
        inc=baseurl+inc;
        var link = '<' + 'link rel="stylesheet" type="text/css" media="screen,projection" href="' + inc + '"' + '/>';
        document.writeln(link);
    }

    function inputScript(inc){
        inc=baseurl+inc;
        var script = '<' + 'script type="text/javascript" src=' +inc + '><' + '/script>';
        document.writeln(script);
    }
    inputLink("colorpicker/css/colorpicker.css");
    inputLink("colorpicker/css/layout.css");
    inputLink("jquery-easyui-1.4.4/css/easyui.css");
    inputLink("zTree/css/zTreeStyle.css");

    inputScript("jquery-easyui-1.4.4/jquery.min.js");
    inputScript("jquery-easyui-1.4.4/jquery-ui.js");
    inputScript("jquery-easyui-1.4.4/jquery.easyui.min.js");

    inputScript("colorpicker/js/colorpicker.js");
    inputScript("colorpicker/js/colorpickerEditor.js");
    inputScript("colorpicker/js/eye.js");
    inputScript("colorpicker/js/utils.js");
    inputScript("colorpicker/js/layout.js");

    inputScript("zTree/jquery.ztree.core.js");

    inputScript("PublicStyleFunction.js");
    inputScript("PlotPanel.js");
    inputScript("StylePanel.js");
    inputScript("TreePanel.js");
})();
