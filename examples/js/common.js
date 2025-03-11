/* by jiawanlong*/


    //目前只支持中英文
    window.initI18N= function (callback){
        var path = getCommonScriptPath();
        Localization.initializeI18N(path, function () {
            if (window.isSite) {
                localize();
            }
            $('html').attr("lang", utils.getLanguage());
            Localization.localize();
            onLoadCallBack(); //设置标题栏当前语言
            callback && callback();
        });
        $('.icl-header').on('click', '.lang-option', function () {
            var value = $(this).data('lang');
            utils.setLanguage(value);
            $('#lang').html($(this).html());
            i18next.changeLanguage(value);
            if (window.isSite) {
                localize();
                return;
            }
            window.location.reload();
        });
    }

    function onLoadCallBack() {
        var lan = utils.getLanguage();
        var lang_text = $("[data-lang=" + lan + "]").html() || "中文";
        $('#lang').html(lang_text);

        setCurrentVersion();
        resetCurrentVersionLink();
    }

    //设置头部版本号
    function setCurrentVersion() {
        var version = getVersion();
        if (!version && window.preRelease) {
            version = window.preRelease;
        }
        var versionText = version ? "" + version : "&nbsp;";
        $('#version').html(versionText);
    }

    function getVersion() {
        var pathname = window.location.pathname.replace("/en/", "/");
        var match = pathname.match(/^\/(dev|(?:\d+\.)+\d)\/.*/);//匹配版本:dev|9.0.0
        return match && match[1] ? match[1] : null;
    }


    //重置当前版本链接,不带版本号
    function resetCurrentVersionLink() {
        if (!window.version) {
            return;
        }

        var version = window.version;
        version = version.toString();
        $(".icl-nav-version").each(function (key, item) {
            if (item.href) {
                var reg = new RegExp("(.*)\/(" + version + ")(\/.*)");
                var match = item.href.match(reg);
                if (match && match[1] && match[3]) {
                    item.href = match[1] + match[3];
                }
            }
        });
    }

    function localize() {
        var lang = utils.getLanguage();
        var pathname = window.location.pathname.replace("/en/", "/");
        var hash = window.location.hash;
        var href = window.location.origin + pathname;
        if (lang === "en-US") {
            if (getVersion()) {
                href = window.location.origin + pathname.replace(/([^\/]*\/){1}([^\/]*)/, '$1$2/en');
                //href = window.location.origin + pathname.replace(/([^\/]*\/){2}([^\/]*)/, '/$1$2/en');
            } else if (window.isLocal) {
                href = window.location.origin + pathname.replace(/(([^\/]*\/){3})([^\/]*)/, '$1$3/en')
            } else {
                href = window.location.origin + pathname.replace(/([^\/]*\/){1}([^\/]*)/, '/en/$2');
                //href = window.location.origin + pathname.replace(/([^\/]*\/){1}([^\/]*)/, '/$2/en');
            }

        }
        if ((window.location.origin + window.location.pathname + hash) === href + hash) {
            return;
        }
        window.location = href + hash;
    }

    function getCommonScriptPath() {
        var r = new RegExp("(^|(.*?\\/))(common\.js)(\\?|$)"),
            s = document.getElementsByTagName('script'), relativePath;
        for (var i = 0; i < s.length; i++) {
            var src = s[i].getAttribute('src');
            if (src) {
                var m = src.match(r);
                if (m) {
                    relativePath = m[1] ? m[1].replace("js/", "") : "./";
                    break;
                }
            }
        }
        return relativePath;
    }
