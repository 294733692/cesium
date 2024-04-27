<script setup lang="ts">
import {onMounted, nextTick } from 'vue'
import * as Cesium from "cesium";
import {useCesiumViewer} from '@/store/cesiumViewer'
const cesiumStore = useCesiumViewer()



// 添加 地名+路网
const imageLayer = new Cesium.ImageryLayer(new Cesium.UrlTemplateImageryProvider({
  url: "http://webst01.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}",
  minimumLevel: 1,
  maximumLever: 18
}))


const addImageryLayer = () => {
  cesiumStore.viewer.imageryLayers.add(imageLayer)
}


onMounted(() => {
  nextTick (() => {
    addImageryLayer()

    console.log(cesiumStore.viewer);
  })
})
</script>