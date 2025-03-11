(function() {
    var r = new RegExp("(^|(.*?\\/))(SuperMap.Include\.js)(\\?|$)"),
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
        var script = '<' + 'script type="text/javascript" src="' + inc + '"' + '><' + '/script>';
        document.writeln(script);
    }
    function inputCSS(style){
        var css = '<' + 'link rel="stylesheet" href="' + baseurl + '../theme/default/' + style + '"' + '><' + '/>';
        document.writeln(css);
    }
    //加载类库资源文件
    function loadSMLibs() {
        inputScript(baseurl+'SuperMap-8.1.1-17729.js');
        if(!window.excludePlot){
            inputScript(baseurl+'SuperMap_Plot-8.1.1-17729.js');
        }
        loadLocalization();
        inputCSS('style.css');
        inputCSS('google.css');
    }
    //引入汉化资源文件
    function loadLocalization() {
        var userLang;
        //针对不通浏览器做语言浏览器做判断
        if(navigator.userLanguage){
            //针对IE浏览器
            userLang = navigator.userLanguage;
        }else if(navigator.languages){
            //针对Chrome
            userLang = navigator.languages[0];
        }else{
            //其他
            userLang = navigator.language;
        }
        if(userLang.indexOf('zh') > -1){
            inputScript(baseurl + 'Lang/zh-CN.js');
        }else{
            inputScript(baseurl + 'Lang/en.js');
        }
    }
    loadSMLibs();loadLocalization();
})();
