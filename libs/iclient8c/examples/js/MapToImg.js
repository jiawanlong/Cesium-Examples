(function(){
    var PrintMap = {};
    var LAYER_COUNT = 0;
    var LAYER_LENGTH = 0;
    window.MapToImg = PrintMap;

    PrintMap.excute = function(map){
        var canvas = document.createElement("canvas");
        var broz = SuperMap.Browser.name;
        if(!canvas.getContext||(broz=='msie'&&!canvas.msToBlob)){
            alert("您的浏览器版本太低，请升级。");
            return;
        }
        if(document.location.toString().match(/file:\/\//)){
            alert("该功能需要在服务器中发布出来后，方可使用");
            return;
        }
        LAYER_COUNT = 0;

        var layers = map.layers.concat([]);

        //layers排序，将markers放到最上边
        var layers1 = [];
        for(var i=0;i<layers.length;){
            if(layers[i].CLASS_NAME == "SuperMap.Layer.Markers"){
                var templayer = layers.splice(i,1);
                layers1.push(templayer[0]);
            } else if(layers[i].CLASS_NAME == "SuperMap.Layer.GOAnimationLayer" ||
                layers[i].CLASS_NAME == "SuperMap.Layer.PlottingLayer.Temporary" ||
                (layers[i].CLASS_NAME == "SuperMap.Layer.PlottingLayer" && !layers[i].getVisibility()) ||
                layers[i].CLASS_NAME == "SuperMap.Layer.PlottingLayer.RootContainer"){
                //处理标绘图层的动画图层和图层不显示
                layers.splice(i,1);
            } else {
                i++;
            }
        }
        layers = layers.concat(layers1);

        LAYER_LENGTH = layers.length;
        var imgUrls = [];
        for(var i=0;i<layers.length;i++){
            var layer = layers[i];
            if(layer.CLASS_NAME == "SuperMap.Layer.TiledDynamicRESTLayer"){
                if(layer.useCanvas==false){
                    draw(getImgLayerData(layer,map),i,imgUrls);
                }
                else{
                    draw(getCanvasLayerData(layer),i,imgUrls);
                }
            }
            else if(layer.CLASS_NAME == "SuperMap.Layer.Markers"){
                draw(getImgLayerData(layer,map),i,imgUrls);
            }
            else if(layer.CLASS_NAME == "SuperMap.Layer.Vector"){
                getVectorLayerData(layer,map,function(imgUrls,i){
                    return function(img){
                        draw(img,i,imgUrls);
                    }
                }(imgUrls,i))
            }
            else if(layer.CLASS_NAME == "SuperMap.Layer.PlottingLayer"){
                getPlottingLayerData(layer,map,function(imgUrls,i){
                    return function(img){
                        draw(img,i,imgUrls);
                    }
                }(imgUrls,i))
            }
        }
    };

    function draw(img,i,imgUrls){
        imgUrls[i] = img;
        LAYER_COUNT++;

        if(LAYER_COUNT>=LAYER_LENGTH){
            var canvas = document.createElement("canvas");
            var size = map.getSize();
            canvas.height = size.h;
            canvas.width = size.w;
            var ctx = canvas.getContext("2d");

            canvas.style.position = "relative";
            canvas.style.border = "1px solid #4c4c4c";

            //document.body.appendChild(canvas);

            var panel = document.createElement("div");

            panel.style.position = "absolute";
            panel.style.left = "0px";
            panel.style.top = "0px";
            panel.style.height = "100%";
            panel.style.width = "100%";
            // panel.style.background = "#e6e8eb";
            panel.style.background = "#ffffff";
            document.body.appendChild(panel);


            var buttonPanel = document.createElement("div");
            buttonPanel.style.position = "relative";
            panel.appendChild(buttonPanel);
            panel.appendChild(canvas);

            window.setTimeout(function(){
                for(var i=0;i<imgUrls.length;i++){
                    ctx.drawImage(imgUrls[i],0,0);
                }

                if(canvas.msToBlob){
                    var button = document.createElement("input");
                    buttonPanel.appendChild(button);
                    button.type = "button";
                    button.value = "保存";

                    button.onclick = function(){
                        window.navigator.msSaveBlob(canvas.msToBlob(), 'map.png');
                    }
                }
                else{
                    var aa = document.createElement("a");
                    buttonPanel.appendChild(aa);
                    aa.target = "_blank";
                    aa.download="map.png";
                    aa.href=canvas.toDataURL();

                    var button = document.createElement("input");
                    aa.appendChild(button);
                    button.type = "button";
                    button.value = "保存";
                }

                var button = document.createElement("input");
                buttonPanel.appendChild(button);
                button.type = "button";
                button.value = "关闭";
                button.onclick = function(){
                    document.body.removeChild(panel);
                }
            },30);
        }
    }
    //截取图片图层
    function getImgLayerData(layer,map){
        var div = layer.div;
        var pdiv = div.parentNode;
        var offsetX =  parseInt(pdiv.style.left.replace(/px/,""));
        var offsetY =  parseInt(pdiv.style.top.replace(/px/,""));

        var canvas = document.createElement("canvas");
        var size = map.getSize();
        canvas.height = size.h;
        canvas.width = size.w;
        var ctx = canvas.getContext("2d");

        canvas.style.position = "absolute";
        canvas.style.left = "5px";
        canvas.style.top = "600px";
        canvas.style.border = "1px solid #f00";

        //document.body.appendChild(canvas);

        var divs = div.getElementsByTagName("div");
        for(var i=0;i<divs.length;i++){
            var div1 = divs[i];
            if(div1.style.display!="none"){
                var left = parseInt(div1.style.left.replace(/px/,""));
                var top = parseInt(div1.style.top.replace(/px/,""));
                var img = div1.getElementsByTagName("img")[0];
                var imgWidth = img.style.width;
                var imgHeight = img.style.height;
                var imgW = null,imgH = null;
                if(imgWidth!=null||imgWidth!=""){
                    imgW = parseInt(imgWidth.replace(/px/,""));
                }
                if(imgHeight!=null||imgHeight!=""){
                    imgH = parseInt(imgHeight.replace(/px/,""));
                }
                if(imgW!=null&&imgH!=null){
                    ctx.drawImage(img,left+offsetX,top+offsetY,imgW,imgH);
                }
                else{
                    ctx.drawImage(img,left+offsetX,top+offsetY);
                }
            }
        }

        var imageUrl = canvas.toDataURL("image/png");
        var img = new Image();
        img.src = imageUrl;
        return img;
    }
    //截取canvas图层
    function getCanvasLayerData(layer){
        var div = layer.div;
        var canvas0 = div.getElementsByTagName("canvas")[0];
        var imageUrl = canvas0.toDataURL("image/png");
        var img = new Image();
        img.src = imageUrl;

        return img;
    }
    //截取Vector图层
    function getVectorLayerData(layer,map,callback){
        var printLayer,
            strategies = [],
            features1 = [],
            features = layer.features,
            layerStrategies = layer.strategies;
        //GeoText无法截图问题修复
        if(layerStrategies){
            for(var i = 0; i<layerStrategies.length; i++){
                if (layerStrategies[i].CLASS_NAME === "SuperMap.Strategy.GeoText"){
                    strategies.push(layerStrategies[i].clone());
                }else{
                    strategies.push(layerStrategies[i]);
                }
            }
            printLayer = new SuperMap.Layer.Vector("PRINT_LAYER", {strategies: strategies, visibility: true, renderers: ["Canvas"]});
        }else{
            printLayer = new SuperMap.Layer.Vector("PRINT_LAYER", {visibility: true, renderers: ["Canvas"]});
        }
        map.addLayer(printLayer);
        for(var j=0;j<features.length;j++){
            var feature = features[j];
            var feature1 = new SuperMap.Feature.Vector();
            feature1.geometry = feature.geometry.clone();
            feature1.style = feature.style;

            features1.push(feature1);
        }
        if(layer.style){
            printLayer.style = layer.style;
        }

        printLayer.setOpacity(0);
        printLayer.addFeatures(features1);

        window.setTimeout(function(printLayer,map,callback){
            return function(){
                var div = printLayer.div;
                var canvas1 = div.getElementsByTagName("canvas")[0];
                var cxt1 = canvas1.getContext("2d");
                var imageUrl = canvas1.toDataURL("image/png");

                map.removeLayer(printLayer);
                printLayer.destroy();

                var img = new Image();
                img.src = imageUrl;

                callback(img);
            }
        }(printLayer,map,callback),30);
    }

    //截取Plotting图层
    function getPlottingLayerData(layer,map,callback){
        var printLayer,
            features1 = [],
            features = layer.features,

        printLayer = new SuperMap.Layer.PlottingLayer("PRINT_LAYER", layer.serverUrl, {visibility: true, renderers: ["Canvas"]});
        //printLayer.spatialAnalystUrl = layer.spatialAnalystUrl;

        map.addLayer(printLayer);
        for(var j=0;j<features.length;j++){
            if(features[j].geometry instanceof SuperMap.Geometry.PlottingGeometry){
                var feature = features[j];
                var feature1 = SuperMap.Plot.PlottingUtil.copyFeature(feature);
                features1.push(feature1);
            } else {
                var feature1 = new SuperMap.Feature.Vector();
                feature1.geometry = features[j].geometry.clone();
                feature1.style = features[j].style;
                features1.push(feature1);
            }
        }
        if(layer.style){
            printLayer.style = layer.style;
        }

        printLayer.setOpacity(0);
        printLayer.addFeatures(features1);

        window.setTimeout(function(printLayer,map,callback){
            return function(){
                var div = printLayer.div;
                var canvas1 = div.getElementsByTagName("canvas")[0];
                var cxt1 = canvas1.getContext("2d");
                var imageUrl = canvas1.toDataURL("image/png");

                map.removeLayer(printLayer);
                printLayer.destroy();

                var img = new Image();
                img.src = imageUrl;

                callback(img);
            }
        }(printLayer,map,callback),30);
    }
})();