<template>
    <div id="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { Viewer, Ion, } from 'cesium';
import { onMounted, ref } from 'vue';
import * as Cesium from "cesium";



// 设置AccessToken
// Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNjY2ZmQ5OS00NmU4LTRhNWItOWZkZi1lZTM5YjQ4ZWMyMGUiLCJpZCI6MTg5MzMxLCJpYXQiOjE3MTQxMjM3OTJ9.IkS0usNZfiZU4C8HYlPbmavFKBuj1GK2ZLvZXoJM1XE"

const cesiumViewer = ref()

const options = ref({
  // 搜索框
  geocoder: false,
  // home键
  homeButton: false,
  // 动画控件
  animation: false,
  // 全屏按钮
  fullscreenButton: false,
  // 场景选择器
  sceneModePicker: false,
  // 时间轴
  timeline: false,
  // 导航提示
  navigationHelpButton: false,
  // 地图选择器
  baseLayerPicker: false,
  // 基础地图
  baseLayer:  new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
    url: "http://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    minimumLevel: 1,
    maximumLever: 18
  }))
})

// 添加 地名+路网
const imageLayer = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
  url: "http://webst01.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
  minimumLevel: 1,
  maximumLever: 18
}))


const initViewer = () => {
  cesiumViewer.value = new Viewer("cesiumContainer", options.value)
  cesiumViewer.value.imageryLayers.add(imageLayer)
}



onMounted(() => {
    initViewer()
})
</script>

<style scoped lang="scss">
#cesiumContainer {
    width: 100%;
    height: 100%;
    overflow: hidden;
}
</style>