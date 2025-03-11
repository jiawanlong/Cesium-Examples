(function(){
     var imgSize = {
         "A0":{
             width:parseInt(118.9*28.3),
             height:parseInt(84.1*28.3)
         },
         "A1":{
             width:parseInt(84.1*28.3),
             height:parseInt(59.4*28.3)
         }
     }
     var LargeFormatPrint = {};
    /**
     * url:"http://localhost:8090/iserver/services/map-china400/rest/maps/China"
     * projection:"3857"
     * scale:0.000000004339
     * center:new SuperMap.LonLat(0,0)
     * pageSize:"A0",仅支持A1和A0
     * */
     LargeFormatPrint.excute = function(url,projection,scale,center,pageSize,map,callback){
         if(url&&projection&&scale&&center&&pageSize){
             //向服务端请求一张整张的图片
             var requestUrl = url+"/image.png?";
             requestUrl += "scale="+scale;
             requestUrl += "&center="+encodeURIComponent(JSON.stringify({x:center.lon,y:center.lat}));
             var size = imgSize[pageSize];
             requestUrl += "&width="+size.width+"&height="+size.height;
             requestUrl += "&transparent=false&prjCoordSys="+encodeURIComponent('{"epsgCode":'+projection+'}');

             var img = new Image();
             img.src = requestUrl;
             if (img.addEventListener) {
                 img.addEventListener("load", onImgLoad, false);
             } else if (element.attachEvent) {
                 img.attachEvent('onload', onImgLoad);
             }
         }
         else{
             alert("参数不正确");
         }

         function onImgLoad(){
             //将图片放到页面上先预览效果，如果觉得不对，可点击取消重来
             var div = document.createElement("div");
             div.style.position = "absolute";
             div.style.top = "0px";
             div.style.zIndex = 999;
             div.style.left = "0px";
             //div.style.border = "solid 5px #4c4c4c";
             div.style.background = "#ffffff";
             div.style.height = "558px";
             div.style.width = "100%";
             document.body.appendChild(div);

             var imgDiv = document.createElement("div");
             imgDiv.style.position = "relative";
             imgDiv.style.height = "520px";
             imgDiv.style.textAlign = "center";
             imgDiv.style.border = "1px solid #4c4c4c";
             img.style.position="relative";
             //img.style.verticalAlign = "middle";
            // img.style.zIndex = 999;
             //img.style.left="0px";
             //img.style.top = "38px";
            // img.style.width = "935px";
             img.style.height = "520px";
             img.style.width = "auto";

             imgDiv.appendChild(img);
             //window.body.appendChild(img);

             var div1 = document.createElement("div");
             div1.style.position = "relative";
             div1.style.height = "38px";
             div.appendChild(div1);
             div.appendChild(imgDiv);

             var button = document.createElement("button");
             div1.appendChild(button);
             button.innerHTML = "打印";
             button.onclick = function(){
                 //将图片放于页面上，并调用浏览器打印接口
                 document.body.removeChild(div);

                 img.style.left="0px";
                 img.style.top = "0px";
                 img.style.width = "";
                 img.style.height = "";
                 img.style.zIndex = 999;
                 img.style.border = "";
                 document.body.appendChild(img);
                 if(map)map.div.style.display = "none";
                 window.print();
                 if(map)map.div.style.display = "block";
                 document.body.removeChild(img);
                 if(callback)callback();
             }

             var button1 = document.createElement("button");
             div1.appendChild(button1);
             button1.innerHTML = "取消";
             button1.onclick = function(){
                 document.body.removeChild(div);
                 if(callback)callback();
             }
         }
     }
     window.LargeFormatPrint = LargeFormatPrint;
})()