//初始化文本编辑器
function initCode() {
    var mylink;
    var href = window.location.toString();
    var mapUrl = href.substr(0, href.lastIndexOf('/') + 1);
    if (href.indexOf("#") == -1) {
        mylink = mapUrl + "3857Map.html";
    } else {
        mylink = mapUrl + href.split("#")[1] + ".html";
    }
    var html = $.ajax({url: mylink, async: false}).responseText; //获取网页文本内容
    if (html && html != "") {
        $('#code').val(html);
    }
    initEditor();
}

function initEditor() {
    if (!editor) {
        editor = CodeMirror.fromTextArea(document.getElementById("code"), {
            lineWrapping: true,       //是否换行
            foldGutter: true,        //是否折叠
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            lineNumbers: true,        //是否显示行号
            styleActiveLine: true,
            matchBrackets: true,
            selectionPointer: true,
            mode: "htmlmixed",
            extraKeys: {           //自动补全
                "Ctrl": "autocomplete"
            },
            viewportMargin: Infinity
        });
        //自动补全
        CodeMirror.commands.autocomplete = function (cm) {
            cm.showHint({hint: CodeMirror.hint.anyword});
        };
    } else {
        editor.setValue($("#code").val());
    }
}

/**将用户修改过的代码加载到iframe中**/
function run() {
    var iframeContent = $("#code").val();
    if (editor) {
        iframeContent = editor.getValue();
    }

    var iFrame = document.getElementById("examplesIframe").contentWindow;
    iFrame.document.open();
    iFrame.document.write(iframeContent);
    iFrame.document.close();
}

//开关代码编辑器
function toggleFooter() {
    var code_area = $('#code_area');
    var map = $('#mapContent');
    if (code_area[0].offsetWidth <= 2) {//如果已经关闭，则打开
        code_area.animate({
            width: "37%"
        }, 200);
        map.animate({
            width: "62%"
        }, 200);
    } else {
        code_area.animate({
            width: 0
        }, 200);
        map.animate({
            width: "99.8%"
        }, 200);
    }
    setTimeout(function () {
        codeChange()
    }, 200);
}

//显示隐藏代码打开关闭按钮
function codeChange() {
    if ($("#code_area")[0].offsetWidth > 2) {
        $("#code_open").hide();
        $("#code_close").show();
        $('#container-main').css("border", "1px solid #3473b7");
        $('#drag').css("display", "block");
    } else {
        $("#code_close").hide();
        $("#code_open").show();
        $('#container-main').css("border", "0");
        $('#drag').css("display", "none");

    }
}

//重置
function refresh() {
    initEditor();
    run();
}

//复制
function copy() {
    $('#foo').val(editor.getValue());
    var clipboard = new Clipboard('.copy');

    clipboard.on('success', function (e) {
        console.info('Action:', e.action);
        console.info('Text:', e.text);
        console.info('Trigger:', e.trigger);
        e.clearSelection();
        $(".copy-success").fadeIn("fast");
        setTimeout(function(){
            $(".copy-success").fadeOut("slow");
        },2000);

    });

    clipboard.on('error', function (e) {
        console.error('Action:', e.action);
        console.error('Trigger:', e.trigger);
    });
}

//拖拽效果
function dragCode() {
    $("#drag").mousedown(function () {
        var myWidth = $('#container-main').width();
        //使目标对象“禁止变蓝”
        document.onselectstart = function () {
            return false;
        };
        document.onmousemove = function (e) {
            var bottomX = (e || window.event).clientX - 0.3 * myWidth;
            if ($("#overiframe").is(":hidden") == true) {
                $("#overiframe").show();
            }
            if (bottomX <= 0) {
                bottomX = 0;
            }
            if (bottomX >= myWidth * 0.6) {
                bottomX = myWidth * 0.6;
            }
            $("#code_area").width(bottomX);
            $("#mapContent").width(myWidth * 0.99 - bottomX);
            $("#overiframe").width(myWidth * 0.99 - bottomX);
        };
        document.onmouseup = function () {
            document.onmousemove = null;
            $("#overiframe").hide();
            codeChange();
        };
    });
}