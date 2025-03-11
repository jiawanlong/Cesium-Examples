/* by jiawanlong*/
/***
 * 该文件用来根据语言环境加载相应的示例页面文本提示
 * notice:
 * 1.依赖jQuery
 * 2.配置：依赖locales目录，具体的文本键值对在locales下的resources.js文件中配置。
 * 3.使用：在具体的示例页使用键值对，命名空间为resources.
 *   如 alert(resources.msg_tip),alert(resources.text_btn)
 */
var Localization = {
    //初始化加载国际化资源文件
    initializeI18N: null,
    //执行翻译替换
    localize: null,
    //挂在全局变量
    initGlobal: null
};
(function (nameSpace, $) {
    var targetScript = (function () {
        var r = new RegExp("(^|(.*?\\/js\\/))(localization\.js)(\\?|$)"),
            s = document.getElementsByTagName('script');
        for (var i = 0; i < s.length; i++) {
            var src = s[i].getAttribute('src');
            if (src && src.match(r)) {
                return s[i];
            }
        }
    })();


    function initializeI18N(path, callback) {
        var localPath = path + "./locales",
            file = "/resources.js";

        var filePathMap = {
            "en-US": localPath + "/en-US" + file,
            "zh-CN": localPath + "/zh-CN" + file
        };

        //脚本加载完成标志
        var lang = utils.getLanguage();

        inputScript(filePathMap[lang], function () {

            i18next.init({
                lng: lang,
                whitelist: ["zh-CN", "en-US"],
                fallbackLng: ["zh-CN", "en-US"]
            },function(){
                if (window.isSite) {
                    var webResourceURL = '../../web/locales/'+lang+'/resources.js';
                    $.get(webResourceURL, function () {
                        for (var name in window.webResources) {
                            var subWeb = window.webResources[name];
                            var subExamples = window.examplesResources[name];
                            //重名以webResource为准
                            if (typeof window.webResources[name] == 'object') {
    
                                if (!subExamples) {
                                    subExamples = {};
                                }
                                for (var name1 in subWeb) {
                                    subExamples[name1] = subWeb[name1];
                                }
                            } else {
                                subExamples[name1] = subWeb[name];
                            }
    
                        }
                        window.resources = window.examplesResources;
                        i18next.addResourceBundle && i18next.addResourceBundle(lang, 'translation', window.resources);
                        callback && callback();
    
                    })
    
                } else {
                    window.resources = window.examplesResources;
                    i18next.addResourceBundle && i18next.addResourceBundle(lang, 'translation', window.resources);
                    callback && callback();
                }
            });
            

        });

    }

    //国际化dom中的文本
    function localize() {
        jqueryI18next.init(i18next, $);
        $("html").localize(); //翻译页面所有含data-i18n属性的标签的文本
    }

    //全局变量挂载
    function initGlobal(root) {
        var rootNameSpace = root || window;
        if (rootNameSpace.resources) {
            rootNameSpace.oldResources = rootNameSpace.resources;
        }
        //example只开放资源映射到resources字段
        var resources = i18next.getResourceBundle && i18next.getResourceBundle(utils.getLanguage());
        rootNameSpace.resources = resources && resources.resources;
    }

    //插入script
    function inputScript(url, callback) {
        var script = document.createElement("script");
        script.type = "text/javascript";
        if (script.readyState) { //for IE
            script.onreadystatechange = function () {
                if (script.readyState === "loaded" || script.readyState === "complete") {
                    script.onreadystatechange = null;
                    callback && callback();
                }
            };
        } else { //for Others
            script.onload = function () {
                callback && callback();
            };
        }
        script.src = url;
        targetScript.parentElement.insertBefore(script, targetScript);
    }

    nameSpace.initializeI18N = initializeI18N;
    nameSpace.localize = localize;
    nameSpace.initGlobal = initGlobal;
})(Localization, jQuery);