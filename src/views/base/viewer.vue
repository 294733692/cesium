<template>
    <div id="cesiumContainer"></div>
</template>

<script setup lang="ts">
import { Viewer } from 'cesium';
import { onMounted } from 'vue';


const initViewer = () => {
    const cesiumViewer = new Viewer("cesiumContainer")
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