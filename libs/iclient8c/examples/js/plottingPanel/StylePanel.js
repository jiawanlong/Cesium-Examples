
/**
 *
 * Class: SuperMap.Plotting.StylePanel
 * 属性面板类。
 *
 */
SuperMap.Plotting.StylePanel = new SuperMap.Class({

    /**
     * Property: editLayers
     * {<SuperMap.Layer.PlottingLayer>} 标绘图层数组
     */
    editLayers: [],

    /**
     * Property: selectFeatures
     * {<SuperMap.Feature.Vector>} 要修改的要素
     */
    selectFeatures:[],
    groupIndex:0,
    /**
     * Constructor: SuperMap.Plotting.StylePanel
     * 标号库管理类。
     *
     * Parameters:
     * div - {String} 属性面板div
     *
     * Returns:
     * {<SuperMap.Plotting.StylePanel>}  结果类型对象。
     */
    initialize : function(div){
        function afterModifySelectFeature(rowIndex, rowData, changes){
            var updated = $('#pg').propertygrid('getChanges', "updated");
            if(updated.length !== 0){
                //var  groups = $('#pg').propertygrid("groups");
                //for(var i=0;i<groups.length;i++){
                //    if(updated[0].group === groups[i].value){me.groupIndex = i;}
                //}
                me.updateSelectFeature(updated[0], me.selectFeatures);
                var SF = me.selectFeatures;
                if(me.selectFeatures ===null){
                    return;
                }
                if(updated[0].name == "对象可见性"){
                    while(me.selectFeatures.length !== 0){
                        me.selectFeatures[0].layer.drawFeature(me.selectFeatures[0]);
                    }
                }else{
                    for(var i=0;i<me.selectFeatures.length;i++){
                        if(me.selectFeatures[i].layer.renderer.CLASS_NAME === "SuperMap.Renderer.PlotCanvas2"){
                            me.selectFeatures[i].layer.redraw();
                        }else{
                            me.selectFeatures[i].layer.drawFeature(me.selectFeatures[i]);
                        }

                        if(me.selectFeatures[i] !==undefined ){
                            if(me.selectFeatures[i].graphicsLayer !== undefined){
                                me.selectFeatures[i].graphicsLayer.updateGraphics(me.selectFeatures[i]);
                            }
                        }
                    }
                }


                var  rows = collectionPropertyGridRows(me.selectFeatures);
                $('#pg').propertygrid('loadData', rows);
                //$('#pg').propertygrid('collapseGroup');
                //$('#pg').propertygrid('expandGroup',0);
                //$('#pg').propertygrid('expandGroup',me.groupIndex);
            }
        }

        var stylePanel = document.getElementById(div);
        var pg = document.createElement("table");
        pg.id = "pg";
        pg.className = "easyui-propertygrid";
        stylePanel.appendChild(pg);

        $('#pg').propertygrid({
            showGroup:true,
            columns: [[
                { field: 'name', title: 'Name', width: 100, resizable: true },
                { field: 'value', title: 'Value', width: 100, resizable: false
                }
            ]],
            onAfterEdit: afterModifySelectFeature
        });
        var me = this;
    },

    /**
     * APIMethod: addEditLayer
     * 添加标绘图层
     *
     * Parameters:
     * editLayer - {<SuperMap.Layer.PlottingLayer>}标绘图层
     *
     * Returns:
     */
    addEditLayer: function(editLayer){
        for(var i = 0 ; i < this.editLayers.length; i++)
        {
            if(editLayer === this.editLayers[i]){
                return;
            }
        }
        if(editLayer instanceof SuperMap.Layer.PlottingGraphics){
            if(editLayer.plottingGraphicsEdit !== null){
                editLayer = editLayer.plottingGraphicsEdit.plottingLayer;
            } else {
                return;
            }
        }
        editLayer.events.register("featureselected", this, this.showFeatureProperty);
        editLayer.events.register("featuremodified", this, this.showFeatureProperty);
        editLayer.events.register("featureunselected", this, this.hideFeatureProperty);
    },
    /**
     * APIMethod: removeEditLayer
     * 移除标绘图层
     *
     * Parameters:
     * editLayer - {<SuperMap.Layer.PlottingLayer>}标绘图层
     *
     * Returns:
     */
    removeEditLayer : function(editLayer) {
        for(var i = 0; i < this.editLayers.length; i++)
        {
            if(editLayer === this.editLayers[i])
            {
                this.editLayers[i].events.unregister("featureselected", this, this.showFeatureProperty);
                this.editLayers[i].events.unregister("featuremodified", this, this.showFeatureProperty);
                this.editLayers[i].events.unregister("featureunselected", this, this.hideFeatureProperty);
                this.editLayers.slice(i,1);
                break;
            }
        }
    },
    showFeatureProperty: function(selectFeatueEvt) {
        if(selectFeatueEvt.type === "featureselected"){
            this.selectFeatures=this.selectFeatures.concat(selectFeatueEvt.features);
        }
        if(this.selectFeatures.length !==0){
            var rows = collectionPropertyGridRows(this.selectFeatures);
            $('#pg').propertygrid('loadData', rows);
            //$('#pg').propertygrid('collapseGroup');
            //$('#pg').propertygrid('expandGroup',0);
            //$('#pg').propertygrid('expandGroup',this.groupIndex);
        }
        SuperMap.Event.stop(selectFeatueEvt);
    },
    hideFeatureProperty: function(selectFeatueEvt) {
        for(var i = 0; i < selectFeatueEvt.features.length; i++){
            var index = SuperMap.Util.indexOf(this.selectFeatures, selectFeatueEvt.features[i]);
            if(index !== -1){
                this.selectFeatures.splice(index, 1);
            }
        }
        if(this.selectFeatures.length !==0){
            var rows = collectionPropertyGridRows(this.selectFeatures);
            $('#pg').propertygrid('loadData', rows);
        } else {
            var rows = [];
            $('#pg').propertygrid('loadData', rows);
        }
        SuperMap.Event.stop(selectFeatueEvt);
    },
    addExtendPropertyfunction :function(rows,geometry) {
    var extendProperty = geometry.getExtendProperty();
    var nIndex = 0;
    var property = extendProperty.getPropertyByIndex(nIndex);
    while(null != property)
    {
        var propertyName  = property.getKey();
        var undoValue = property.getValue();
        var extendePropertyObj  = new Object();
        extendePropertyObj.name = propertyName;
        extendePropertyObj.value = undoValue;
        extendePropertyObj.group = "自定义属性";
        extendePropertyObj.editor = "text";
        rows.push(extendePropertyObj);
        nIndex++;
        property = extendProperty.getPropertyByIndex(nIndex);
    }

 },
    updateSelectFeature: function(updated, selectfeatures) {
        var transaction = new SuperMap.Plot.Transaction();
        SuperMap.Plotting.getInstance(this.map).getTransManager().add(transaction);
        for(var i=0;i<selectfeatures.length;i++){
            var transInfo = new SuperMap.Plot.TransactionInfo();
            transInfo.layerId = selectfeatures[i].layer.id;
            transInfo.uuid = selectfeatures[i].geometry.uuid;
            if (updated != null) {
                switch(updated.name) {
                    case displayName[0]:
                        transInfo.functionName = "setLocked";
                        transInfo.undoParams = [selectfeatures[i].geometry.getLocked()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setLocked(fromCheckboxValue(updated.value));
                        break;
                    case  displayName[1]:
                        transInfo.propertyName = "display";
                        transInfo.undoValue = selectfeatures[i].style.display;
                        transInfo.redoValue = updated.value;
                        selectfeatures[i].style.display = updated.value;
                        break;
                    case displayLineStyleName[0]:
                        if (selectfeatures[i].geometry instanceof SuperMap.Geometry.GroupObject) {
                            transInfo.functionName = "setStrokeWidth";
                            transInfo.undoParams = [selectfeatures[i].geometry.getStrokeWidth()];
                            transInfo.redoParams = [parseInt(updated.value)];
                            selectfeatures[i].geometry.setStrokeWidth(parseInt(updated.value));
                        }
                        else {
                            transInfo.propertyName = "strokeWidth";
                            transInfo.undoValue = selectfeatures[i].style.strokeWidth;
                            transInfo.redoValue = parseInt(updated.value);
                            selectfeatures[i].style.strokeWidth = parseInt(updated.value);
                            if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT){
                                selectfeatures[i].geometry.applyStyle("strokeWidth");
                            }
                            if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.LITERATESIGN){
                                selectfeatures[i].geometry.route.applyTextStyle(selectfeatures[i].style);
                            }
                        }
                        break;
                    case displayLineStyleName[1]:
                        if (selectfeatures[i].geometry instanceof SuperMap.Geometry.GroupObject) {
                            transInfo.functionName = "setStrokeColor";
                            transInfo.undoParams = [selectfeatures[i].geometry.getStrokeColor()];
                            transInfo.redoParams = [updated.value];
                            selectfeatures[i].geometry.setStrokeColor(updated.value);
                        }
                        else {
                            transInfo.propertyName = "strokeColor";
                            transInfo.undoValue = selectfeatures[i].style.strokeColor;
                            transInfo.redoValue = updated.value;
                            selectfeatures[i].style.strokeColor = updated.value;
                            if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT ){
                                selectfeatures[i].geometry.applyStyle("strokeColor");
                            }
                            if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.LITERATESIGN){
                                selectfeatures[i].geometry.route.applyTextStyle(selectfeatures[i].style);
                            }
                        }
                        break;
                    case displayLineStyleName[2]:
                        transInfo.propertyName = "strokeDashstyle";
                        transInfo.undoValue = selectfeatures[i].style.strokeDashstyle;
                        transInfo.redoValue = updated.value;
                        selectfeatures[i].style.strokeDashstyle = updated.value;
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT ||
                            selectfeatures[i].geometry instanceof SuperMap.Geometry.GroupObject
                        ){
                            selectfeatures[i].geometry.applyStyle("strokeDashstyle");
                        }
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.LITERATESIGN){
                            selectfeatures[i].geometry.route.applyTextStyle(selectfeatures[i].style);
                        }
                        break;
                    case displayLineStyleName[3]:
                    {
                        var opacity = parseFloat(updated.value) < 0 ? 0 : parseFloat(updated.value);
                        opacity = parseFloat(updated.value) > 1 ? 1 : parseFloat(updated.value);
                        transInfo.propertyName = "strokeOpacity";
                        transInfo.undoValue = selectfeatures[i].style.strokeOpacity;
                        transInfo.redoValue = opacity;
                        selectfeatures[i].style.strokeOpacity = opacity;
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT ||
                            selectfeatures[i].geometry instanceof SuperMap.Geometry.GroupObject){
                            selectfeatures[i].geometry.applyStyle("strokeOpacity");
                        }
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.LITERATESIGN){
                            selectfeatures[i].geometry.route.applyTextStyle(selectfeatures[i].style);
                        }
                    }
                        break;
                    case displaySurroundLineName[0]:
                        transInfo.functionName = "setSurroundLineType";
                        transInfo.undoParams = [selectfeatures[i].geometry.getSurroundLineType()];
                        transInfo.redoParams = [parseInt(updated.value)];
                        selectfeatures[i].geometry.setSurroundLineType(parseInt(updated.value));
                        break;
                    case displaySurroundLineName[1]:
                        transInfo.propertyName = "surroundLineWidth";
                        transInfo.undoValue = selectfeatures[i].style.surroundLineWidth;
                        transInfo.redoValue = parseInt(updated.value);
                        selectfeatures[i].style.surroundLineWidth = parseInt(updated.value);
                        break;
                    case displaySurroundLineName[2]:
                        transInfo.propertyName = "surroundLineColor";
                        transInfo.undoValue = selectfeatures[i].style.surroundLineColor;
                        transInfo.redoValue = updated.value;
                        selectfeatures[i].style.surroundLineColor = updated.value;
                        break;
                    case displaySurroundLineName[3]:
                    {
                        var opacity = parseFloat(updated.value) < 0 ? 0 : parseFloat(updated.value);
                        opacity = parseFloat(updated.value) > 1 ? 1 : parseFloat(updated.value);
                        transInfo.propertyName = "surroundLineColorOpacity";
                        transInfo.undoValue = selectfeatures[i].style.surroundLineColorOpacity;
                        transInfo.redoValue = opacity;
                        selectfeatures[i].style.surroundLineColorOpacity = opacity;
                    }
                        break;
                    case displayFillStyleName[0]:
                        transInfo.propertyName = "fillSymbolID";
                        transInfo.undoValue = selectfeatures[i].style.fillSymbolID;
                        transInfo.redoValue = parseFloat(updated.value);
                        selectfeatures[i].style.fillSymbolID = parseFloat(updated.value);
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT ||
                            selectfeatures[i].geometry instanceof SuperMap.Geometry.GroupObject){
                            selectfeatures[i].geometry.applyStyle("fillSymbolID");
                        }
                        break;
                    case displayFillStyleName[1]:
                        transInfo.propertyName = "fillColor";
                        transInfo.undoValue = selectfeatures[i].style.fillColor;
                        transInfo.redoValue = updated.value;
                        selectfeatures[i].style.fillColor = updated.value;
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT){
                            selectfeatures[i].geometry.applyStyle("fillColor");
                        }
                        break;
                    case displayFillStyleName[2]:
                    {
                        var opacity = parseFloat(updated.value) < 0 ? 0 : parseFloat(updated.value);
                        opacity = parseFloat(updated.value) > 1 ? 1 : parseFloat(updated.value);
                        transInfo.propertyName = "fillOpacity";
                        transInfo.undoValue = selectfeatures[i].style.fillOpacity;
                        transInfo.redoValue = opacity;
                        selectfeatures[i].style.fillOpacity = opacity;
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT){
                            selectfeatures[i].geometry.applyStyle("fillOpacity");
                        }
                    }
                        break;
                    case displayFillStyleName[3]:
                        transInfo.propertyName = "fillGradientMode";
                        transInfo.undoValue = selectfeatures[i].style.fillGradientMode;
                        transInfo.redoValue = updated.value;
                        selectfeatures[i].style.fillGradientMode = updated.value;
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT){
                            selectfeatures[i].geometry.applyStyle("fillGradientMode");
                        }
                        break;
                    case displayFillStyleName[4]:
                        transInfo.propertyName = "fillBackColor";
                        transInfo.undoValue = selectfeatures[i].style.fillBackColor;
                        transInfo.redoValue = updated.value;
                        selectfeatures[i].style.fillBackColor = updated.value;
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT){
                            selectfeatures[i].geometry.applyStyle("fillBackColor");
                        }
                        break;
                    case displayFillStyleName[5]:
                    {
                        var opacity = parseFloat(updated.value) < 0 ? 0 : parseFloat(updated.value);
                        opacity = parseFloat(updated.value) > 1 ? 1 : parseFloat(updated.value);
                        transInfo.propertyName = "fillBackOpacity";
                        transInfo.undoValue = selectfeatures[i].style.fillBackOpacity;
                        transInfo.redoValue = opacity;
                        selectfeatures[i].style.fillBackOpacity = opacity;
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT){
                            selectfeatures[i].geometry.applyStyle("fillBackOpacity");
                        }
                    }
                        break;
                    case displayFillStyleName[6]:
                    {
                        var angle = parseFloat(updated.value) < 0 ? 0 : parseFloat(updated.value);
                        angle = parseFloat(updated.value) >= 360 ? 0 : parseFloat(updated.value);
                        transInfo.propertyName = "fillAngle";
                        transInfo.undoValue = selectfeatures[i].style.fillAngle;
                        transInfo.redoValue = angle;
                        selectfeatures[i].style.fillAngle = angle;
                    }
                        break;
                    case displayFillStyleName[7]:
                    {
                        var X = parseFloat(updated.value) < -1 ? -1 : parseFloat(updated.value);
                        X = parseFloat(updated.value) > 1 ? 1 : parseFloat(updated.value);
                        transInfo.propertyName = "fillCenterOffsetX";
                        transInfo.undoValue = selectfeatures[i].style.fillCenterOffsetX;
                        transInfo.redoValue = X;
                        selectfeatures[i].style.fillCenterOffsetX = X;
                    }
                        break;
                    case displayFillStyleName[8]:
                    {
                        var Y = parseFloat(updated.value) < -1 ? -1 : parseFloat(updated.value);
                        Y = parseFloat(updated.value) > 1 ? 1 : parseFloat(updated.value);
                        transInfo.propertyName = "fillCenterOffsetY";
                        transInfo.undoValue = selectfeatures[i].style.fillCenterOffsetY;
                        transInfo.redoValue = Y;
                        selectfeatures[i].style.fillCenterOffsetY = Y;
                    }
                        break;
                    case displayNameDot[0]:
                        transInfo.functionName = "setRotate";
                        transInfo.undoParams = [selectfeatures[i].geometry.getRotate()];
                        transInfo.redoParams = [parseFloat(updated.value)];
                        selectfeatures[i].geometry.setRotate(parseFloat(updated.value));
                        break;
                    case displayNameDot[1]:
                        transInfo.functionName = "setScaleByMap";
                        transInfo.undoParams = [selectfeatures[i].geometry.getScaleByMap()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setScaleByMap(fromCheckboxValue(updated.value));
                        break;
                    case displayNameDot[2]:
                        transInfo.functionName = "setNegativeImage";
                        transInfo.undoParams = [selectfeatures[i].geometry.getNegativeImage()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setNegativeImage(fromCheckboxValue(updated.value));
                        break;
                    case displayNameDot[3]:
                        transInfo.functionName = "setSymbolRank";
                        transInfo.undoParams = [selectfeatures[i].geometry.getSymbolRank()];
                        transInfo.redoParams = [updated.value];
                        selectfeatures[i].geometry.setSymbolRank(updated.value);
                        break;
                    case displayNameDot[4]:
                        transInfo.functionName = "setPositionOffset";
                        transInfo.undoParams = [selectfeatures[i].geometry.getPositionOffset()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setPositionOffset(fromCheckboxValue(updated.value));
                        break;
                    case displayNameDot[5]:
                        transInfo.functionName = "setPositionOffsetType";
                        transInfo.undoParams = [selectfeatures[i].geometry.getPositionOffsetType()];
                        transInfo.redoParams = [parseInt(updated.value)];
                        selectfeatures[i].geometry.setPositionOffsetType(parseInt(updated.value));
                        break;
                    case  displayNameDot[6]:
                        transInfo.functionName = "setWidthHeightLimit";
                        transInfo.undoParams = [selectfeatures[i].geometry.getWidthHeightLimit()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setWidthHeightLimit(fromCheckboxValue(updated.value));
                        break;
                    case displayNameDot[7]:
                        transInfo.functionName = "setSymbolSize";
                        transInfo.undoParams = [selectfeatures[i].geometry.getSymbolSize().w];
                        transInfo.redoParams = [parseFloat(updated.value), selectfeatures[i].geometry.getSymbolSize().h];
                        selectfeatures[i].geometry.setSymbolSize(parseFloat(updated.value), selectfeatures[i].geometry.getSymbolSize().h);
                        break;
                    case displayNameDot[8]:
                        transInfo.functionName = "setSymbolSize";
                        transInfo.undoParams = [selectfeatures[i].geometry.getSymbolSize().h];
                        transInfo.redoParams = [selectfeatures[i].geometry.getSymbolSize().w, parseFloat(updated.value)];
                        selectfeatures[i].geometry.setSymbolSize(selectfeatures[i].geometry.getSymbolSize().w, parseFloat(updated.value));
                        break;
                    case displayTextContentName[0]:
                        if (selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT) {
                            // transInfo.propertyName = "textContent";
                            // transInfo.undoValue = selectfeatures[i].geometry.symbolTexts[0].textContent;
                            // transInfo.redoValue = updated.value;
                            transInfo.functionName = "updateSymbolText";
                            transInfo.undoParams = [selectfeatures[i].geometry.symbolTexts[0].clone(), 0];
                            selectfeatures[i].geometry.symbolTexts[0].textContent = updated.value;
                            selectfeatures[i].geometry.updateSymbolText(selectfeatures[i].geometry.symbolTexts[0], 0);
                            transInfo.redoParams = [selectfeatures[i].geometry.symbolTexts[0], 0];
                            //selectfeatures[i].geometry.calculateParts();
                        } else if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT1 ||
                            selectfeatures[i].geometry.symbolType ===SuperMap.Plot.SymbolType.PATHTEXT) {
                            transInfo.functionName = "setTextContent";
                            transInfo.undoParams = [selectfeatures[i].geometry.getTextContent()];
                            var updatedValueStr=updated.value;
                            var textContent=updatedValueStr.split(",");
                            transInfo.redoParams = [textContent];
                            selectfeatures[i].geometry.setTextContent(textContent);
                        }else{
                            transInfo.functionName = "setTextContent";
                            transInfo.undoParams = [selectfeatures[i].geometry.getTextContent()];
                            transInfo.redoParams = [updated.value];
                            selectfeatures[i].geometry.setTextContent(updated.value);
                        }
                        break;
                    case displayTextContentName[0] + "2":
                        selectfeatures[i].geometry.symbolTexts[1].textContent = updated.value;
                        selectfeatures[i].geometry.setTextContent(updated.value);
                        break;
                    case displayTextContentName[1]:
                        if (selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.PATHTEXT) {
                            transInfo.functionName = "setRelLineText";
                            transInfo.undoParams = [selectfeatures[i].geometry.getRelLineText()];
                            transInfo.redoParams = [parseInt(updated.value)];
                            selectfeatures[i].geometry.setRelLineText(parseInt(updated.value));
                        } else {
                            transInfo.functionName = "setTextPosition";
                            transInfo.undoParams = [selectfeatures[i].geometry.getTextPosition()];
                            transInfo.redoParams = [parseInt(updated.value)];
                            selectfeatures[i].geometry.setTextPosition(parseInt(updated.value));
                        }
                        break;
                    case displayTextContentName[2]:
                        transInfo.propertyName = "fontSize";
                        transInfo.undoValue = selectfeatures[i].style.fontSize;
                        transInfo.redoValue = parseFloat(updated.value);
                        selectfeatures[i].style.fontSize = parseFloat(updated.value);
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT||
                            selectfeatures[i].geometry instanceof SuperMap.Geometry.GroupObject){
                            selectfeatures[i].geometry.applyStyle("fontSize");
                        } else {
                            selectfeatures[i].geometry.calculateParts();
                        }
                        break;
                    case displayTextContentName[3]:
                        transInfo.propertyName = "fontColor";
                        transInfo.undoValue = selectfeatures[i].style.fontColor;
                        transInfo.redoValue = updated.value;
                        selectfeatures[i].style.fontColor = updated.value;
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT||
                            selectfeatures[i].geometry instanceof SuperMap.Geometry.GroupObject){
                            selectfeatures[i].geometry.applyStyle("fontColor");
                        }
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL && selectfeatures[i].geometry.textPosition === 8){//支持中间注记修改字体颜色
                            selectfeatures[i].geometry.calculateParts();
                        }
                        break;
                    case displayTextContentName[4]:
                        transInfo.propertyName = "fontFamily";
                        transInfo.undoValue = selectfeatures[i].style.fontFamily;
                        transInfo.redoValue = updated.value;
                        selectfeatures[i].style.fontFamily = updated.value;
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.SYMBOLTEXT ||
                            selectfeatures[i].geometry instanceof SuperMap.Geometry.GroupObject){
                            selectfeatures[i].geometry.applyStyle("fontFamily");
                        }
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.DOTSYMBOL && selectfeatures[i].geometry.textPosition === 8){//支持中间注记修改字体颜色
                            selectfeatures[i].geometry.calculateParts();
                        }
                        break;
                    case displayTextContentName[5]:
                        transInfo.functionName = "setSpace";
                        transInfo.undoParams = [selectfeatures[i].geometry.getSpace()];
                        transInfo.redoParams = [parseInt(updated.value)];
                        selectfeatures[i].geometry.setSpace(parseInt(updated.value));
                        break;
                    case displayTextContentName[6]:
                        transInfo.propertyName = "fontSpace";
                        transInfo.undoValue = selectfeatures[i].style.fontSpace;
                        transInfo.redoValue = parseInt(updated.value);
                        selectfeatures[i].style.fontSpace = parseInt(updated.value);
                        break;
                    case displayTextContentName[7]:
                        transInfo.propertyName = "fontPercent";
                        transInfo.undoValue = selectfeatures[i].style.fontPercent;
                        transInfo.redoValue = parseInt(updated.value);
                        selectfeatures[i].style.fontPercent = parseInt(updated.value);
                        break;
                    case displayTextContentName[8]:
                        transInfo.propertyName = "fontStroke";
                        transInfo.undoValue = selectfeatures[i].style.fontStroke;
                        transInfo.redoValue = fromCheckboxValue(updated.value);
                        selectfeatures[i].style.fontStroke = fromCheckboxValue(updated.value);
                        break;
                    case displayTextContentName[9]:
                        transInfo.propertyName = "fontStrokeColor";
                        transInfo.undoValue = selectfeatures[i].style.fontStrokeColor;
                        transInfo.redoValue = updated.value;
                        selectfeatures[i].style.fontStrokeColor = updated.value;
                        break;
                    case displayTextContentName[10]:
                        transInfo.propertyName = "fontStrokeWidth";
                        transInfo.undoValue = selectfeatures[i].style.fontStrokeWidth;
                        transInfo.redoValue = parseInt(updated.value);
                        selectfeatures[i].style.fontStrokeWidth = parseInt(updated.value);
                        break;
                    case displayTextContentName[11]:
                        transInfo.propertyName = "fontBackground";
                        transInfo.undoValue = selectfeatures[i].style.fontBackground;
                        transInfo.redoValue = fromCheckboxValue(updated.value);
                        selectfeatures[i].style.fontBackground = fromCheckboxValue(updated.value);
                        break;
                    case displayTextContentName[12]:
                        transInfo.propertyName = "fontBackgroundColor";
                        transInfo.undoValue = selectfeatures[i].style.fontBackgroundColor;
                        transInfo.redoValue = updated.value;
                        selectfeatures[i].style.fontBackgroundColor = updated.value;
                        break;
                    case displayTextContentName[13]:
                        transInfo.propertyName = "fontShadow";
                        transInfo.undoValue = selectfeatures[i].style.fontShadow;
                        transInfo.redoValue = fromCheckboxValue(updated.value);
                        selectfeatures[i].style.fontShadow = fromCheckboxValue(updated.value);
                        break;
                    case displayTextContentName[14]:
                        transInfo.propertyName = "fontShadowColor";
                        transInfo.undoValue = selectfeatures[i].style.fontShadowColor;
                        transInfo.redoValue =  updated.value;
                        selectfeatures[i].style.fontShadowColor = updated.value;
                        break;
                    case displayTextContentName[15]:
                        transInfo.propertyName = "fontShadowOffsetX";
                        transInfo.undoValue = selectfeatures[i].style.fontShadowOffsetX;
                        transInfo.redoValue = parseInt(updated.value);
                        selectfeatures[i].style.fontShadowOffsetX = parseInt(updated.value);
                        break;
                    case displayTextContentName[16]:
                        transInfo.propertyName = "fontShadowOffsetY";
                        transInfo.undoValue = selectfeatures[i].style.fontShadowOffsetY;
                        transInfo.redoValue = parseInt(updated.value);
                        selectfeatures[i].style.fontShadowOffsetY = parseInt(updated.value);
                        break;
                    case displayNameNew[0]:
                        transInfo.functionName = "setArrowHeadType";
                        transInfo.undoParams = [selectfeatures[i].geometry.getArrowHeadType()];
                        transInfo.redoParams = [parseInt(updated.value)];
                        selectfeatures[i].geometry.setArrowHeadType(parseInt(updated.value));
                        break;
                    case displayNameNew[1]:
                        transInfo.functionName = "setArrowBodyType";
                        transInfo.undoParams = [selectfeatures[i].geometry.getArrowBodyType()];
                        transInfo.redoParams = [parseInt(updated.value)];
                        selectfeatures[i].geometry.setArrowBodyType(parseInt(updated.value));
                        break;
                    case displayNameNew[2]:
                        transInfo.functionName = "setArrowTailType";
                        transInfo.undoParams = [selectfeatures[i].geometry.getArrowTailType()];
                        transInfo.redoParams = [parseInt(updated.value)];
                        selectfeatures[i].geometry.setArrowTailType(parseInt(updated.value));
                        break;
                    case displayNameNew[3]:
                        transInfo.functionName = "setStartArrowType";
                        transInfo.undoParams = [selectfeatures[i].geometry.getStartArrowType()];
                        transInfo.redoParams = [parseInt(updated.value)];
                        selectfeatures[i].geometry.setStartArrowType(parseInt(updated.value));
                        break;
                    case displayNameNew[4]:
                        transInfo.functionName = "setEndArrowType";
                        transInfo.undoParams = [selectfeatures[i].geometry.getEndArrowType()];
                        transInfo.redoParams = [parseInt(updated.value)];
                        selectfeatures[i].geometry.setEndArrowType(parseInt(updated.value));
                        break;
                    case displayNameNew[5]:
                        transInfo.functionName = "setShowPathLine";
                        transInfo.undoParams = [selectfeatures[i].geometry.getShowPathLine()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setShowPathLine(fromCheckboxValue(updated.value));
                        break;
                    case displayNameNew[6]:
                        transInfo.functionName = "setCurveLine";
                        transInfo.undoParams = [selectfeatures[i].geometry.getIsCurveLine()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setCurveLine(fromCheckboxValue(updated.value));
                        break;
                    case displayNameNew[7]:
                        transInfo.functionName = "setShowPathLineArrow";
                        transInfo.undoParams = [selectfeatures[i].geometry.getShowPathLineArrow()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setShowPathLineArrow(fromCheckboxValue(updated.value));
                        break;
                    case displayNameNew[8]:
                        transInfo.functionName = "setAvoidLine";
                        transInfo.undoParams = [selectfeatures[i].geometry.getIsAvoidLine()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setAvoidLine(fromCheckboxValue(updated.value));
                        break;
                    case displayNameNew[9]:
                        transInfo.functionName = "setTextBoxType";
                        transInfo.undoParams = [selectfeatures[i].geometry.getTextBoxType()];
                        transInfo.redoParams = [parseInt(updated.value)];
                        selectfeatures[i].geometry.setTextBoxType(parseInt(updated.value));
                        break;
                    case displayNameNew[10]:
                        transInfo.functionName = "setRoundBox";
                        transInfo.undoParams = [selectfeatures[i].geometry.getRoundBox()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setRoundBox(fromCheckboxValue(updated.value));
                        break;
                    case displayNameNew[11]:
                        transInfo.functionName = "setFrame";
                        transInfo.undoParams = [selectfeatures[i].geometry.getFrame()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setFrame(fromCheckboxValue(updated.value));
                        break;
                    case displayNameNew[12]:
                        transInfo.functionName = "setRadiusLineType";
                        transInfo.undoParams = [selectfeatures[i].geometry.getRadiusLineType()];
                        transInfo.redoParams = [parseInt(updated.value)];
                        selectfeatures[i].geometry.setRadiusLineType(parseInt(updated.value));
                        break;
                    case displayNameNew[13]:
                        transInfo.functionName = "setRadiusTextPos";
                        transInfo.undoParams = [selectfeatures[i].geometry.getRadiusTextPos()];
                        transInfo.redoParams = [updated.value];
                        selectfeatures[i].geometry.setRadiusTextPos(updated.value);
                        break;
                    case displayNameNew[14]:
                        transInfo.functionName = "setRadiusText";
                        transInfo.undoParams = [selectfeatures[i].geometry.radiusText[0],0];
                        transInfo.redoParams = [updated.value, 0];
                        selectfeatures[i].geometry.setRadiusText(updated.value, 0);
                        break;
                    case displayNameNew[15]:
                        transInfo.functionName = "setRadiusText";
                        transInfo.undoParams = [selectfeatures[i].geometry.radiusText[1],1];
                        transInfo.redoParams = [updated.value, 1];
                        selectfeatures[i].geometry.setRadiusText(updated.value, 1);
                        break;
                    case displayNameNew[16]:
                        transInfo.functionName = "setVisible";
                        transInfo.undoParams = [selectfeatures[i].geometry.getVisible()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setVisible(fromCheckboxValue(updated.value));
                        break;
                    case displayNameNew[17]:
                        transInfo.functionName = "setType";
                        transInfo.undoParams = [selectfeatures[i].geometry.routeNode.type];
                        transInfo.redoParams = [updated.value];
                        selectfeatures[i].geometry.setType(updated.value);
                        break;
                    case displayNameNew[18]:
                        transInfo.functionName = "setRotate";
                        transInfo.undoParams = [selectfeatures[i].geometry.getRotate()];
                        transInfo.redoParams = [parseFloat(updated.value)];
                        selectfeatures[i].geometry.setRotate(parseFloat(updated.value));
                        break;
                    case displayNameNew[19]:
                        transInfo.functionName = "setLineRelationType";
                        transInfo.undoParams = [selectfeatures[i].geometry.getLineRelationType()];
                        transInfo.redoParams = [parseInt(updated.value)];
                        selectfeatures[i].geometry.setLineRelationType(parseInt(updated.value));
                        break;
                    case displayNameNew[20]:
                        transInfo.functionName = "setPolylineConnectLocationPoint";
                        transInfo.undoParams = [selectfeatures[i].geometry.getPolylineConnectLocationPoint()];
                        transInfo.redoParams = [fromCheckboxValue(updated.value)];
                        selectfeatures[i].geometry.setPolylineConnectLocationPoint(fromCheckboxValue(updated.value));
                        break;
                    case displayNameNew[21]:
                        transInfo.propertyName = "labelAlign";
                        transInfo.undoValue = selectfeatures[i].style.labelAlign;
                        transInfo.redoValue = fontAlignTypeValue(updated.value);
                        selectfeatures[i].style.labelAlign = fontAlignTypeValue(updated.value);
                        selectfeatures[i].geometry.calculateParts();
                        break;
                }
                if (updated.group == group[8]) {
                    if (updated.name == displayName[2]) {
                        if(updated.value !== null){
                            transInfo.propertyName = displayName[2];
                            transInfo.undoValue = selectfeatures[i].geometry.getSubSymbols()[updated.index].libID;
                            transInfo.redoValue = parseInt(updated.value);
                            selectfeatures[i].geometry.subSymbols[0].libID = parseInt(updated.value);
                        }
                    }
                    if (updated.name == displayName[3]) {
                        var code = parseInt(updated.value);
                        if(selectfeatures[i].geometry.symbolType === SuperMap.Plot.SymbolType.NODECHAIN && code != null) {
                            var symbolLibManager = plotting.getSymbolLibManager();
                            var subCode = symbolLibManager.findSymbolByCode(code);
                            if(subCode.length !== 0 && subCode[0].symbolType === "SYMBOL_DOT"){
                                transInfo.functionName = "setSubSymbol";
                                if(selectfeatures[i].geometry.getSubSymbols()[updated.index]) {
                                    transInfo.undoParams = [selectfeatures[i].geometry.getSubSymbols()[updated.index].code, updated.index,subCode[0].libID];
                                } else {
                                    transInfo.undoParams = [-1, updated.index];
                                }

                                transInfo.redoParams = [code, updated.index, subCode[0].libID];
                                selectfeatures[i].geometry.setSubSymbol(code, updated.index, subCode[0].libID);
                            }
                        } else if (code !== null) {
                            transInfo.functionName = "setSubSymbol";
                            if(selectfeatures[i].geometry.getSubSymbols()[updated.index]) {
                                transInfo.undoParams = [selectfeatures[i].geometry.getSubSymbols()[updated.index].code, updated.index,selectfeatures[i].geometry.getSubSymbols()[updated.index].libID];
                            } else {
                                transInfo.undoParams = [-1, updated.index];
                            }
                            transInfo.redoParams = [code, updated.index];
                            selectfeatures[i].geometry.setSubSymbol(code, updated.index);
                        }
                    }
                }
                transaction.transInfos.push(transInfo);
            }
            SuperMap.Plot.AnalysisSymbol.setStyle(selectfeatures[i].style, selectfeatures[i].geometry.symbolData);
        }
    },
    CLASS_NAME: "SuperMap.Plotting.StylePanel"
});
