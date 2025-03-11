(function () {
    function A(option) {
        var t = this;
        t.div = null;
        t.map = null;
        t.data = [];
        t.d3Layer = null;

        t._svg = null;
        t._tempData=null;
        t._stepPointCount = 4;//每一步所走过的点
        t._stepPointCountOffset = 5;//每一步所走过的点范围
        t._minStepLength = 5;//每一段的长度
        t._maxStepLength = 15;
        t._stepStatus = {};
        t._stepPointMargin =3;
        t._stepNum =3;//有多少个小段
        t._stepOffset = 30; //点的偏移量
        t._maxSpeed = 500;
        t._minSpeed = 200;

        t._startOpacity = 0.1;
        t._endOpacity = 0.9;
        t._pointCountMultiple = 2;
        t._mindelay = 30;
        t._maxdelay = 300;
        t._startColor=187;
        t._endColor=94;
        t._isStop = false;
        t._isMove = false;
        t._isAddData = false;
        t.__isStop = null;
        for (var key in option) {
            t[key] = option[key];
        }

        t.createSVG();

        t.d3Layer.events.on({moveend: function (evt) {
            //console.log("moveend");
            if(t._isMove){
                t._isMove = false;
                //t._isStop = t.__isStop;
                //t.__isStop = null;
            }
            t._refresh(evt);
        }});
//        t.d3Layer.events.on({movestart: function (evt) {
//            console.log("movestart");
//            t._isStop = true;
//        }});
        t.d3Layer.events.on({move: function (evt) {
            //console.log("move");
            if(!t._isMove){
                //t.__isStop = t._isStop;
                //t._isStop = true;
                t._isMove = true;
                //t._svg.selectAll("path").style("display","none");
            }
            t._svg.selectAll("path").style("display","none");
        }});
    }
    var P = A.prototype;
    P.createSVG = function () {
        var t = this;
        var size = t.map.getSize();
        t._svg = d3.select(t.div)
            .append("svg")
            .attr("width", size.w)
            .attr("height", size.h);

        //d3.select(t.div).html("<span id='fefe'></span>");
    }
    P.addData = function(data){
        var t = this;
        if(t._isAddData){
           return;
        }
        else{
            t._isAddData = true;
        }
        t._isStop = false;
        t.data = data;
        var defs = d3.select("svg")
            .append("defs");
        var linearGradient = defs.append("linearGradient").attr({
            id:"orange_red",
            x1:"0%",
            y1:"0%",
            x2:"100%",
            y2:"0%"
        });
        linearGradient.append("stop").attr({
            offset:"0%"
        })
        .style({
            "stop-color":"rgb("+t._startColor+","+t._startColor+","+t._startColor+")",
            "stop-opacity":1
        });

        linearGradient.append("stop").attr({
            offset:"100%"
        })
            .style({
                "stop-color":"rgb("+t._endColor+","+t._endColor+","+t._endColor+")",
                "stop-opacity":1
            });
        var tempData = t._tempData = t.getPosition(data);
        var bindData = [];
        for(var i=0;i<data.length;i+=2){    //data.length
            bindData.push(i);
        }
        t._svg.selectAll('path')
            .data(bindData)
            .enter()
            .append("path")
            .style("stroke", "url(#orange_red)")
            .style("stroke-width", 1)
            .style("fill", "none")
            .style("opacity",0.9)
            .call(function(selection){
                t.lineAnimate(selection);
            });


    }
    P.getPath = function(index){
        var t = this;
        var line = t._tempData[index];
        var length = line.length;
        var status = t._stepStatus[index];
        var pointStrArray = [];
        for(var i=0;i<status.length;i++){ //status.length
            var statusi = status[i];
            var start = statusi.start;
            var pointCount =statusi.pointCount;
            start = start+pointCount;
            var end = statusi.end;
            var stepLength = statusi.stepLength;
            if(start>=length){
                start = length;
            }
            if(start-end<=stepLength){

            }
            else{
                end = end+pointCount;
            }

            var newStart = start;

            var offsetX =statusi.offsetX;
            var offsetY = statusi.offsetY;

            pointStrArray.push("M"+offset(line[end],offsetX,offsetY).join(" "));
            if(stepLength>=4){
                for(var j=end+1;j<end+stepLength;j++){
                    if(j<start){
                        pointStrArray.push((j==0?"C":"")+offset(line[j],offsetX,offsetY).join(" "));
                    }
                    else{
                        pointStrArray.push((j==0?"C":"")+offset(line[start-1],offsetX,offsetY).join(" "));
                    }
                }
            }
            else{
                for(var j=end+1;j<end+stepLength;j++){
                    if(j<start){
                        pointStrArray.push("L"+offset(line[j],offsetX,offsetY).join(" "));
                    }
                    else{
                        pointStrArray.push("L"+offset(line[start-1],offsetX,offsetY).join(" "));
                    }
                }
            }


            statusi.start = newStart;
            statusi.end = end;
        }

        function offset(point,offsetX,offsetY){
            return [point[0]+offsetX,point[1]+offsetY];
        }
        return pointStrArray.join(" ");// + " Z"
    }
    P.lineAnimate = function(selection) {
        var t = this;
        selection.style("opacity", t._startOpacity);
//        window.setTimeout(function(selection){
//            return function(){
//
//            }
//        }(selection),Math.round(t._mindelay+Math.random()*(t._maxdelay- t._mindelay)));

        selection
            .transition()
            .duration(function(){
                return Math.round(t._mindelay+Math.random()*(t._maxdelay- t._mindelay))
            })
            .attr("d",function(d){
                var line = t._tempData[d];
                var length = line.length;
                var stepDistance = t._stepPointCount+ t._stepPointMargin;
                var count = t._stepNum;
                t._stepStatus[d] = [];
                for(var i=0;i<count;i++){
                    var start = stepDistance*i;
                    if(start>=length){
                        break;
                    }
                    var stepLength = t._minStepLength+Math.round(Math.random()*(t._maxStepLength- t._minStepLength));
                    if(start+stepLength>=length){
                        stepLength = length-start;
                    }
                    for(var j=0;j<t._pointCountMultiple;j++){
                        t._stepStatus[d].push({
                            start:start,
                            end:start,
                            offsetX:Math.round(Math.random()*t._stepOffset-t._stepOffset/2),
                            offsetY:Math.round(Math.random()*t._stepOffset-t._stepOffset/2),
                            pointCount: t._stepPointCount+Math.round(Math.random()*(t._stepPointCountOffset-t._stepPointCount)),
                            stepLength:stepLength
                        });
                    }
                }
                t._stepStatus[d].speed = t._minSpeed + Math.round(Math.random()*(t._maxSpeed-t._minSpeed));
                var path = t.getPath(d);
                return path;
            })
            .call(function(selection){
                t.step(selection);
            });
    }
    P.step = function(selection){
        //console.log("step");
        var t = this;
        selection.transition()
            .ease('linear')
            .duration(function(d){
                return t._stepStatus[d].speed;
            })
            .attr("d",function(d){
                var path = t.getPath(d);
                return path;
            })
            .style("opacity",function(d){
                var status = t._stepStatus[d];
                var lastStart = status[status.length-1].start;
                var line = t._tempData[d];
                var length = line.length;

                var opacity = t._startOpacity + (lastStart/length)*(t._endOpacity- t._startOpacity);
                return opacity;
            })
            .each('end', function() {
                if(t._isStop)return;
                var obj = d3.select(this);
                var d = obj.data()[0];
                var status = t._stepStatus[d];
                var lastStart = status[status.length-1].start;
                var line = t._tempData[d];
                var length = line.length;
                if(lastStart>=length){
                    obj
                        .transition()
                        .duration(500)
                        .style('opacity', t._startOpacity)
                        .each('end',function(){
                            d3.select(this).call(function(selection){
                                t.lineAnimate(selection);
                            });
                        });
                }
                else{
                    obj.call(function(selection){
                        t.step(selection);
                    });
                }
            });
    }
    P.getPosition = function(datas){
        var tempDatas = [],t = this;
        if(datas){
            for(var i=0;i<datas.length;i++){
                var line = datas[i];
                var tempLine = [];
                for(var j=0;j<line.length;j++){
                    var point = line[j];
                    var tempPoint = this.d3Layer.getLayerPxFromLonLat(new SuperMap.LonLat(point[0],point[1]));
                    tempLine.push([tempPoint.x,tempPoint.y]);
                }
                tempDatas.push(tempLine);
            }

        }
        return tempDatas;
    }
    P._refresh = function(evt){
        var t = this;
        var tempData = t._tempData = t.getPosition(t.data);
        if(tempData){
            if(t._isStop){
                t._svg.selectAll("path").attr("d",function(d){
                    var path = t.getPath(d);
                    return path;
                });
                t._svg.selectAll("path").style("display","block");
            }
            else{
                //if(evt.zoomChanged){
                    t._svg.selectAll("path").style("display","none");
                //}
                t._svg.selectAll("path").attr("d",function(d){
                    var path = t.getPath(d);
                    return path;
                });
                t._isStop = true;
                setTimeout(function(){
                    t._isStop = false;
                    t._svg.selectAll("path")
                    .attr("d",function(d){
                        var path = t.getPath(d);
                        return path;
                    })
                    .style("display","block")
                    .call(function(selection){
                        t.step(selection);
                    });
                    //if(evt.zoomChanged){
                        t._svg.selectAll("path").style("display","block");
                    //}
                },300);
            }
        }
    }
    P.clear = function(){
        var t = this;
        t._isStop = true;
        t._svg.selectAll("path").remove();
        t._svg.selectAll("defs").remove();
        t._isAddData = false;
    }
    P.stop = function(){
        this._isStop = true;
    }
    P.run = function(){
        var t = this;
        if(t._isStop){
            t._isStop = false;
            t._svg.selectAll("path").call(function(selection){
                t.step(selection);
            });
        }
    }
    window.D3WindMap = A;
})()