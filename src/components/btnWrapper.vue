<template>
  <div class="content">
    <span @click="drawLine">线绘制</span>
    <span>面绘制</span>
  </div>
</template>

<script setup lang="ts">
import {useCesiumViewer} from '@/store/cesiumViewer'
import DrawHandler from "@/utils/DrawHandler";
import {DrawModelType} from "@/enums/drawHandle";

const cesiumStore = useCesiumViewer()
let lineHandler

const drawLine = () => {
  console.log(DrawModelType.Line);
  lineHandler = new DrawHandler(cesiumStore.viewer, DrawModelType.Line)
}

</script>

<style scoped>
.content {
  position: fixed;
  top: 20px;
  left: 100px;
  display: flex;
}

.content span {
  margin: 0 10px;
  background: #fff;
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
}
</style>
