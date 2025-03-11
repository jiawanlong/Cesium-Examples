/**
 LazyLoad makes it easy and painless to lazily load one or more external
 JavaScript or CSS files on demand either during or after the rendering of a web
 page.

 Supported browsers include Firefox 2+, IE6+, Safari 3+ (including Mobile
 Safari), Google Chrome, and Opera 9+. Other browsers may or may not work and
 are not officially supported.

 Visit https://github.com/rgrove/lazyload/ for more info.

 Copyright (c) 2011 Ryan Grove <ryan@wonko.com>
 All rights reserved.

 Permission is hereby granted, free of charge, to any person obtaining a copy of
 this software and associated documentation files (the 'Software'), to deal in
 the Software without restriction, including without limitation the rights to
 use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
 the Software, and to permit persons to whom the Software is furnished to do so,
 subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
 FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
 COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
 IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

 @module lazyload
 @class LazyLoad
 @static
 @version 2.0.3 (git)
 */
LazyLoad=(function(doc){var env,head,pending={},pollCount=0,queue={css:[],js:[]},styleSheets=doc.styleSheets;function createNode(name,attrs){var node=doc.createElement(name),attr;for(attr in attrs){if(attrs.hasOwnProperty(attr)){node.setAttribute(attr,attrs[attr])}};return node};function finish(type){var p=pending[type],callback,urls;if(p){callback=p.callback;urls=p.urls;urls.shift();pollCount=0;if(!urls.length){callback&&callback.call(p.context,p.obj);pending[type]=null;queue[type].length&&load(type)}}};function getEnv(){var ua=navigator.userAgent;env={async:doc.createElement('script').async===true};(env.webkit=/AppleWebKit\//.test(ua))||(env.ie=/MSIE|Trident/.test(ua))||(env.opera=/Opera/.test(ua))||(env.gecko=/Gecko\//.test(ua))||(env.unknown=true)};function load(type,urls,callback,obj,context){var _finish=function(){finish(type)},isCSS=type==='css',nodes=[],i,len,node,p,pendingUrls,url;env||getEnv();if(urls){urls=typeof urls==='string'?[urls]:urls.concat();if(isCSS||env.async||env.gecko||env.opera){queue[type].push({urls:urls,callback:callback,obj:obj,context:context})}else{for(i=0,len=urls.length;i<len;++i){queue[type].push({urls:[urls[i]],callback:i===len-1?callback:null,obj:obj,context:context})}}};if(pending[type]||!(p=pending[type]=queue[type].shift())){return};head||(head=doc.head||doc.getElementsByTagName('head')[0]);pendingUrls=p.urls;for(i=0,len=pendingUrls.length;i<len;++i){url=pendingUrls[i];if(isCSS){node=env.gecko?createNode('style'):createNode('link',{href:url,rel:'stylesheet'})}else{node=createNode('script',{src:url});node.async=false};node.className='lazyload';node.setAttribute('charset','utf-8');if(env.ie&&!isCSS&&'onreadystatechange'in node&&!('draggable'in node)){node.onreadystatechange=function(){if(/loaded|complete/.test(node.readyState)){node.onreadystatechange=null;_finish()}}}else if(isCSS&&(env.gecko||env.webkit)){if(env.webkit){p.urls[i]=node.href;pollWebKit()}else{node.innerHTML='@import "'+url+'";';pollGecko(node)}}else{node.onload=node.onerror=_finish};nodes.push(node)};for(i=0,len=nodes.length;i<len;++i){head.appendChild(nodes[i])}};function pollGecko(node){var hasRules;try{hasRules=!!node.sheet.cssRules}catch(ex){pollCount+=1;if(pollCount<200){setTimeout(function(){pollGecko(node)},50)}else{hasRules&&finish('css')};return};finish('css')};function pollWebKit(){var css=pending.css,i;if(css){i=styleSheets.length;while(--i>=0){if(styleSheets[i].href===css.urls[0]){finish('css');break}};pollCount+=1;if(css){if(pollCount<200){setTimeout(pollWebKit,50)}else{finish('css')}}}};return{css:function(urls,callback,obj,context){load('css',urls,callback,obj,context)},js:function(urls,callback,obj,context){load('js',urls,callback,obj,context)}}})(this.document);
var r = new RegExp("(^|(.*?\\/))(js\/bevInclude\.js)(\\?|$)"),
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
window.Bev = {};
Bev.loader = LazyLoad;
Bev.inputScript = function(inc){
    var script = '<' + 'script type="text/javascript" src="' + inc + '"' + '><' + '/script>';
    document.writeln(script);
};
//Bev.inputScript("js/controls/theme.js");

/**
 * Class: Bev.Theme
 * 主题类,设置框架的主题。
 */
Bev.Theme = {};
Bev.Theme.themeName = "cupertino";
Bev.Theme.currentTheme="";
/**
 * APIMethod: set
 * 设置主题
 *
 * Parameters:
 * themeName - {String} 主题名称
 *
 * Examples:
 * (code)
 * Bev.Theme.set("base");
 * //可以设置的主题如下:
 * //cupertino
 * //base
 * //eggplant
 * //flick
 * //overcast
 * //pepper-grinder
 * //redmond
 * //smoothness
 * //start
 * //ui-darkness
 * //vader
 * (end)
 */
Bev.Theme.set = function(themeName){
  var path = [];
  if(!themeName)themeName = Bev.Theme.themeName;
  Bev.Theme.currentTheme=themeName;
  path.push(baseurl+"css/icon.css");
  Bev.loader.css(path,function(){
    Bev.Theme.setStyle(themeName);
    Bev.Theme.setFontColor(themeName);
    $(window).resize();
 });

 //Bev.Theme.setIconStyle(themeName);
}
Bev.Theme.setIconStyle = function(themeName){
 var path = baseurl+"css/icons/"+themeName+".css";
 Bev.loader.css(path);
}

/**
 * APIMethod: getCurrentTheme
 * 获取当前的主题名
 *
 * Returns:
 * currentTheme - {string}当前的主题名
 * */
Bev.Theme.getCurrentTheme=function(){
 if(Bev.Theme.currentTheme=="")return Bev.Theme.themeName;
 return Bev.Theme.currentTheme;
}
/**
 * APIMethod: createStyle
 * 动态创建css样式
 *
 * Parameters:
 * css - {String} css样式
 */
Bev.Theme.createStyle = function(css){
 if(document.all){
  window.style=css;
  document.createStyleSheet("javascript:style");
 }else{
  var style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML=css;
  document.getElementsByTagName('head').item(0).appendChild(style);
 }
};
/**
 * Method: setFontColor
 * 对几个个别的主题的文字颜色做处理
 *
 * Parameters:
 * theme - {String} 主题名称
 */
Bev.Theme.setFontColor = function(theme){
 var themesArr = "south-street,black-tie,eggplant,excite-bike,flick,pepper-grinder,vader";

 var para = {
  "black-tie":"#3472AC",
  "eggplant":"#3472AC",
  "vader":"#3472AC"
 };
 if(themesArr.indexOf(theme)>=0){
  var cssTxt = ".tab_txt,.menu_txt,.dialog_title_txt {" +
      "color: "+ (para[theme]||"#0D1314") +
      "}";
  Bev.Theme.createStyle(cssTxt);
 }
}
/**
 * Method: setStyle
 * 对一些样式做特别处理
 */
Bev.Theme.setStyle = function(){
 var cssTxt,borderCss;

 $("#head").addClass("bev-banner").css({
//        "opacity":0.9,
//        "filter":"alpha(opacity=90)",
  "fontWeight":"normal"
 });

 $("#left_back").addClass("ui-widget-overlay");
 $("#toolbar_back").addClass("ui-widget-overlay");
 try{
  //var testbtn = document.getElementById("hideBtn");
  //var border = this.getStyleProperty(document.getElementById("hideBtn"),"border");//$("#hideBtn").css("border");
  $("#bd_left")
      .addClass("ui-state-default")
      .css({
       "border-top":"0px solid",
       "border-left":"0px solid",
       "border-bottom":"0px solid",
       "font-weight":"normal"
//                "background":"none repeat scroll 0 0 transparent",
//                "color":"transparent"
      });

  $("#bd_toolbar")
      .addClass("ui-state-default")
      .css({
       "border-top":"0px solid",
       "border-left":"0px solid",
       "border-right":"0px solid",
       "font-weight":"normal"
//                "background":"none repeat scroll 0 0 transparent",
//                "color":"transparent"
      });
//            $("#bd_toolbar").css({
//                "border-bottom":border
//            });
  $("#hideBtn").css({
   "opacity":0.8,
   "filter":"alpha(opacity=80)"
  })
 }catch(e){}

 borderCss = $(".ui-widget-header").css("border");
 cssTxt = ".widgetControl {" +
 "border: " + borderCss +
 "}";
 Bev.Theme.createStyle(cssTxt);
}



