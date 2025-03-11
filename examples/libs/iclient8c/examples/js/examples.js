var loadedScript, dataCount = 0;
var isFile = document.location.toString().match(/file:\/\//);
var editor;

$(document).ready(function () {
    var url = location.href,isAutoClickTab = false,isAutoClickExample = false;
    if (url.lastIndexOf("#") > -1) {
        var exampleId = url.substring(url.lastIndexOf('#') + 1, url.length);
        //判断url中是否带有锚点
        if (exampleId) {
            //有锚点则打开相应的范例
            var a = $("a[data-name='" + exampleId + "']");
            var parentId = a.parents(".tab-pane").attr("id");
            addFunc(a);
            setTimeout(function(){
                isAutoClickTab = true;
                $("#myTab a[href='#" + parentId + "']").click();
                isAutoClickExample = true;
                a.click();
            },0);
        } else {
            //无锚点则默认打开第一个范例
            openDefalutExam();
        }
    } else {
        openDefalutExam();
    }

    function openDefalutExam() {
        setTimeout(function(){
            isAutoClickExample = true;
            $("#myTab li a").first().click();
        },0);
    }

    //添加单击事件
    $('#myTab').click(function (e) {
        if(isAutoClickTab){
            isAutoClickTab = false;
            return;
        }
        e = e || window.event;
        var target = e.target || e.srcElement;
        var eid = target.hash;
        isAutoClickExample = false;
        $(eid + " .span10 li a").first().click();
    });
    //添加单击事件
    $('#myTabContent').click(function (e) {
        if(isAutoClickExample){
            isAutoClickExample = false;
            return;
        }
        e = e || window.event;
        var target = e.target || e.srcElement;
        addFunc(target);
        //阻止浏览器冒泡
        if (typeof e.preventDefault === 'function') {
            e.preventDefault();
            e.stopPropagation();
        } else {
            e.returnValue = false;
            e.cancleBubble = true;
        }
    });

    //判断是否为本地打开
    if (!isFile) {
        $(window).resize(function () {
            var width = $('#container-main').width();
            $("#mapContent").width(width * 0.62);
            $("#code_area").width(width * 0.37);
        });

        $("#code_area").css("display", "block");
        $("#drag").css("display", "block");
        $("#mapContent").css("width", "62%");
        $("#container-main").css("border", "1px solid #3473b7");

        codeChange();
        initCode();
        dragCode();
    }
});


//加载具体的案例。
function addFunc(srcEle) {
    activeExample(srcEle);
    if (!isFile) {
        setTimeout(function () {
            initCode();
        }, 200);
    }
    //将选中地图属性名称添加到url上
    var urlName = $(srcEle).data("name");
    if (location.href.lastIndexOf('#') > 0) {
        location.href = location.href.substring(0, location.href.lastIndexOf('#')) + '#' + urlName;
    }
    else {
        location.href = location.href + '#' + urlName;
    }
}
function activeExample(srcEle) {
    updateClassName(srcEle);
    var $srcEle = $(srcEle);
    $('#sourceCode').prop('url', './' + $srcEle.data("name") + '.html');
    $('#skip').prop('href', './' + $srcEle.data("name") + '.html');
    runExample($srcEle);
}
function updateClassName(ele) {
    /*需要更精确的定位*/
    $('.tab-content').find('> .tab-pane  ul > .active').removeClass('active');
    $(ele).parent().addClass('active');
}

function attachScript(url, id) {
    $("#examplesIframe").attr("src", url);
}
function attachDetails(name) {
    var details = DemoDescription[name];
    if (!details.title) {
        details.title = "案例名称";
    }
    if (!details.desc) {
        details.desc = "对本案例的描述";
    }
    if (!details.oper) {
        details.oper = "详细的操作说明";
    }
    $('h3 #demo-title').text(details.title);
    $('#desc').text(details.desc);
    $('#oper').text(details.oper);
}
function runExample(srcEle) {
    var url = './' + srcEle.data("name") + '.html';
    attachScript(url, srcEle.data("name") + "_script");
    attachDetails(srcEle.data("name"));
}