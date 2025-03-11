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
    function inputScript(inc){
       // if (!isWinRT) {
            var script = '<' + 'script type="text/javascript" src="' + inc + '"' + '><' + '/script>';
            document.writeln(script);
   //     } else {
   //         var script = document.createElement("script");
    //        script.src = inc;
    //        document.getElementsByTagName("HEAD")[0].appendChild(script);
      //  }
    }
    //加载类库资源文件
    function loadSMLibs() {
        inputScript(baseurl+'PlottingPanel.js');
    }
    loadSMLibs();
})();
