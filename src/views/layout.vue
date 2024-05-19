<template>
  <div id="cesiumContainer"></div>
  <btnWrapper />
  <router-view/>
</template>

<script setup lang="ts">
import {useCesiumViewer} from '@/store/cesiumViewer'
import {Viewer, Ion,} from 'cesium';
import {onMounted, ref} from 'vue';
import addImageryLayer from '@/utils/ImageryLayer'
import {cameraSetView, cameraFlyTo} from '@/utils/Camera'
import * as Cesium from "cesium";
import btnWrapper from '@/components/btnWrapper.vue'

const cesiumStore = useCesiumViewer()


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
  baseLayer: new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
    url: "http://webst01.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}",
    minimumLevel: 1,
    maximumLevel: 18
  }))
})



const initViewer = () => {
  cesiumViewer.value = new Viewer("cesiumContainer", options.value)
  cesiumStore.viewer = cesiumViewer.value
}


onMounted(() => {
  initViewer()
  addImageryLayer(cesiumViewer.value)
  // cameraFlyTo(cesiumViewer.value)
  cameraSetView(cesiumViewer.value)
})
</script>

<style scoped lang="scss">
#cesiumContainer {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>