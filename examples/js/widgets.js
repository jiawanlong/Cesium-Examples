/* by jiawanlong*/
var widgets = {
    loader: {
        //显示loading
        showLoader: null,
        //设置loading文本，默认文本为'loading'
        setLoaderText: null,
        //设置loader显示相关属性
        setAttributes: null,
        //移除掉loader
        removeLoader: null
    },

    alert: {
        //弹出自定义弹框
        showAlert: null,
        //clear alert
        clearAlert: null
    }
};

(function (widgets, $) {

    var alertDiv;

    //弹出自定义提示框
    // msg：提示语；
    // state：提示框颜色（true=success;false=danger）；
    // width：提示框宽度；opacity：提示框透明度[0,1]；
    // withBorder：提示框是否加边框；
    function showAlert(msg, state, width, withBorder, opacity) {
        //提示框颜色
        var className = "alert-",
            border, alpha;
        className += state ? "success" : "danger";
        //提示框宽度
        if (width === null || typeof (width) === 'undefined') {
            //默认值300
            width = 300;
        }
        //是否开启边框
        border = withBorder ? {
            "border": "1px solid"
        } : "none";
        //设置透明度[0,1]之间
        alpha = opacity;
        if (alertDiv) {
            $(alertDiv).remove();
        }
        if (!$('#msg_container')[0]) {
            alertDiv = $("<div class='alert alert-dismissible' id='msg_container' role='alert' style='z-index:999999;position: absolute;top: 20px;left: 40%; display: none;text-align: center'><button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true' >&times;</span></button><strong><p id='msg' style='word-wrap: break-word; margin: 0'></p></strong></div>");
            $('body').append(alertDiv)
        }
        $('#msg_container').css('width', width + 'px');
        $('#msg_container').css(border);
        $('#msg_container').css('opacity', alpha);
        $('#msg_container').addClass(className);
        $('#msg_container').slideDown(300);
        $('#msg').html(msg);
    }

    //清除提示框
    function clearAlert() {
        $('#msg_container').hide();
    }


    /*显示loading*/
    function showLoader(text, type, attributes) {

        if (!type) {
            type = "loader-default";
            attributes = attributes || {
                'data-half': true
            }
        }

        var $body = document.getElementsByTagName('body');
        $body = $body && $body[0];
        if ($body) {
            var $loader = document.getElementsByClassName('loader')[0];
            if (!$loader) {
                $loader = createLoader(type);
            }
            $loader.classList.add('is-active');
            setLoaderText(text);
            setAttributes(attributes);
        }
    }

    /*设置loading文本，默认文本为"loading"*/
    function setLoaderText(text, textAttributeField) {
        text = text || 'loading...';
        var txtAttrField = textAttributeField != null ? textAttributeField : "data-text";
        var attributes = {};
        attributes[txtAttrField] = text;
        setAttributes(attributes);
    }

    /*设置loader显示相关属性*/
    function setAttributes(attributes) {
        var $loader = document.getElementsByClassName('loader')[0];
        if ($loader && attributes) {
            for (var attr in attributes) {
                $loader.setAttribute(attr, attributes[attr]);
            }
        }
    }

    /*移除loader*/
    function removeLoader() {
        var $loader = document.getElementsByClassName('loader')[0];
        if ($loader) {
            $loader.parentNode.removeChild($loader);
        }
    }


    function createLoader(className) {
        var $loader, $body = document.getElementsByTagName('body');
        $body = $body && $body[0];
        if ($body) {
            $loader = document.createElement('div');
            $loader.className = "loader " + className;
            $body.insertBefore($loader, $body.children[0]);
            var style = document.createElement('style');
            style.type = 'text/css';
            style.innerHTML = ".loader.is-active{" +
                "background-color: rgba(0, 0, 0, 0.4) !important;" +
                "}";
            if (document.getElementsByTagName('head')) {
                document.getElementsByTagName('head')[0].appendChild(style);
            }
        }
        return $loader;
    }


    widgets.alert.showAlert = showAlert;
    widgets.alert.clearAlert = clearAlert;

    widgets.loader.showLoader = showLoader;
    widgets.loader.setLoaderText = setLoaderText;
    widgets.loader.setAttributes = setAttributes;
    widgets.loader.removeLoader = removeLoader;

})(widgets, window.jQuery);