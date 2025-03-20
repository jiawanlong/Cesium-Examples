/* by jiawanlong*/
var identification = {
    name: "Leaflet"
};


var exampleConfig = {
    "base": {
        name: "base",
        name_en: "base",
        content: {
            "map": {
                name: "base",
                name_en: "base",
                content: [
                    // {
                    //     name: "1.1、默认设置",
                    //     thumbnail: "1.1、默认设置.png",
                    //     fileName: "1.1、默认设置"
                    // },
                ]
            },
        }
    },

};
gallery_demos.forEach(element => {
    exampleConfig.base.content.map.content.push({
        name: element.name,
        fileName: 'https://sandcastle.cesium.com/gallery/' + element.name + '.html',
        thumbnail: 'https://sandcastle.cesium.com/gallery/' + element.img + '',
    })
});

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
