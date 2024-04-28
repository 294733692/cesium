import * as Cesium from "cesium";



// 添加 地名+路网
const imageLayer = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
  url: "http://webst01.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
  minimumLevel: 1,
  maximumLever: 18
}))


const addImageryLayer = (viewer: Cesium.Viewer) => {
  viewer.imageryLayers.add(imageLayer)
}
export default addImageryLayer