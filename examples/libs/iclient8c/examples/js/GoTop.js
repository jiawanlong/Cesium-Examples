/**
 * 页面滚动条不是在最顶端时 页面出现top按钮，点击回到最顶端,按钮隐藏
 *
 * 使用 直接引入 <script src="./js/GoTop.js" id="js_gotop"></script>
 */
(function() {
    //获取当前js路径 然后处理图片路径 即绝对路径 （避免在多处引用图片路径不对）
    var path = document.getElementById('js_gotop').src;
    path_out = path.replace("js/GoTop.js","images/gotop_out.png");
    path_over = path.replace("js/GoTop.js","images/gotop_over.png");
    // html 元素
    var div = document.createElement('div');
    div.id = "gotop";
    div.onmouseout = function(e){this.firstChild.src = path_out};
    div.onmouseover = function(e){this.firstChild.src = path_over};
    div.setAttribute("style","display:'';position:fixed;width:30px;height:30px;bottom:50px;right:50px;opacity:0;margin: 20px");
    document.body.appendChild(div);
    var inner = '<img border=0 src='+'"'+path_out+'"'+'>';
    document.getElementById('gotop').innerHTML = inner;

    //屏幕滚动 元素淡入淡出 参数设置
    window.onscroll = function() {
        getScrollTop() > 0 ? fadein(div,100,1000,5): fadeout(div,0,1000,5);
    };
    //元素点击事件
    div.onclick = function() {
        var goTop = setInterval(scrollMove, 10);
        function scrollMove() {
            setScrollTop(getScrollTop() / 1.1);
            if (getScrollTop() < 1) clearInterval(goTop);
        }
    };

    /**
     * 获取滚动条的高度
     *
     * @returns {number} 滚动条高度
     */
    function getScrollTop() {
        return document.documentElement.scrollTop + document.body.scrollTop;
    }
    /**
     * 设置滚动条的值
     *
     * @param value
     */
    function setScrollTop(value) {
        if (document.documentElement.scrollTop) {
            document.documentElement.scrollTop = value;
        } else {
            document.body.scrollTop = value;
        }
    }

    /**
     * 元素透明度设置 浏览器兼容
     *
     * @param element 元素
     * @param opacity 透明度 0·100 正整数
     */
    function setOpacity(element,opacity){
        //兼容firfox Chrome 和新版的IE
        if(element.style.opacity !== undefined)
        {
            element.style.opacity = opacity/100;
        }
        else {
            element.style.filter = "alpha(opacity = "+ opacity +")"; //兼容老版的IE
        }
    }

    /**
     * 淡入
     *
     * @param element 元素
     * @param opacity 最终透明度 0`100 正整数
     * @param time 总共时间 单位 毫秒
     * @param value 每次变化值 0`100 正整数
     */
    function fadein(element, opacity,time,value){
        if(element){
            //获取当前的透明度
            var v = element.style.opacity || element.style.filter.replace("alpha(opacity=","").replace(")","");
            v = v > 1 ? v*1 : v*100;
            //变化透明度
            var changeopacity = opacity - v;
            if(changeopacity <= 0) return;
            //元素可见
            element.style.display = "";
            //变化次数
            var count = changeopacity/value;
            //变化时间间隔
            var speed = time/count;
            var timer = null;
            timer = setInterval(function(){
                if(v<opacity) {
                    v +=value;
                    setOpacity(element,v);
                }
                else{
                    clearInterval(timer);
                }
            },speed);
        }
    }

    /**
     * 淡出
     *
     * @param element 元素
     * @param opacity 最终透明度 0`100 正整数
     * @param time 总共时间 单位 毫秒
     * @param value 每次变化值 0`100 正整数
     */
    function fadeout(element,opacity,time,value){
        if(element){
            //获取当前的透明度
            var v = element.style.filter.replace("alpha(opacity=","").replace(")","") || element.style.opacity || 100;
            v = v > 1 ? v*1 : v*100;
            //变化透明度
            var changeopacity = v - opacity;
            if(changeopacity <= 0) return;
            //变化次数
            var count = changeopacity/value;
            //变化时间间隔
            var speed = time/count;
            var timer = null;
            timer = setInterval(function(){
                if((v-value) >= opacity){
                    v -= value;
                    setOpacity(element,v);
                }
                else {
                    clearInterval(timer);
                    element.style.display = "none";
                }
            },speed)
        }
    }
})();


