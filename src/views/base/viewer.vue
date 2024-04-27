<template>
    <div id="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { Viewer, Ion } from 'cesium';
import { onMounted, ref } from 'vue';

// 设置AccessToken
Ion.defaultAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNjY2ZmQ5OS00NmU4LTRhNWItOWZkZi1lZTM5YjQ4ZWMyMGUiLCJpZCI6MTg5MzMxLCJpYXQiOjE3MTQxMjM3OTJ9.IkS0usNZfiZU4C8HYlPbmavFKBuj1GK2ZLvZXoJM1XE"

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
  baseLayerPicker: false
})


const initViewer = () => {
    const cesiumViewer = new Viewer("cesiumContainer", options.value)
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