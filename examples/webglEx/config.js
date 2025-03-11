/* by jiawanlong*/
var identification = {
    name: "wengl"
};
var exampleConfig = {
    "base": {
        name: "1、基础",
        name_en: "base",
        content: {
            "map": {
                name: "1.1、基础",
                name_en: "base",
                content: [
                    {
                        name: "1.1、绘制点",
                        name_en: "1.1、绘制点",
                        thumbnail: "1.1、绘制点.png",
                        fileName: "1.1、绘制点"
                    },
                    {
                        name: "1.2、绘制线",
                        name_en: "1.2、绘制线",
                        thumbnail: "1.2、绘制线.png",
                        fileName: "1.2、绘制线"
                    },
                    {
                        name: "1.3、绘制三角形",
                        name_en: "1.3、绘制三角形",
                        thumbnail: "1.3、绘制三角形.png",
                        fileName: "1.3、绘制三角形"
                    },


                ]
            },
        }
    },

};


/**
 *key值：为exampleConfig配置的key值或者fileName值
 *      （为中间节点时是key值，叶结点是fileName值）
 *value值：fontawesome字体icon名
 *不分层
 */
var sideBarIconConfig = {
    "base": "fa-server",
    "iPortal": "fa-desktop",
    "Online": "fa-cloud",
    "iManager": "fa-group",
    "Elasticsearch": "fa-tasks",
    "plot": "fa-edit",
    "dynamicPlot": "fa-pencil",
    "control": "fa-sliders",
    "components": "fa-window-restore",
    "clientSpatialAnalyst": "fa-object-group",
    "viz": "fa-map",
    "OGC": "fa-globe",
    "mapping": "fa-send"
};

/**
 *key值：为exampleConfig配置的key值
 *value值：fontawesome字体icon名
 *与sideBarIconConfig的区别：sideBarIconConfig包括侧边栏所有层级目录的图标，exampleIconConfig仅包括一级标题的图标
 */
var exampleIconConfig = {
    "base": "fa-server",
    "iPortal": "fa-desktop",
    "Online": "fa-cloud",
    "iManager": "fa-group",
    "Elasticsearch": "fa-tasks",
    "plot": "fa-edit",
    "dynamicPlot": "fa-pencil",
    "control": "fa-sliders",
    "components": "fa-window-restore",
    "clientSpatialAnalyst": "fa-object-group",
    "viz": "fa-map",
    "OGC": "fa-globe",
    "mapping": "fa-send"
};
window.leafletExampleConfig = exampleConfig;
