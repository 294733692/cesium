import {defineStore} from "pinia";
import {Viewer} from 'cesium'

interface Map {
  viewer: Viewer | null //地图插入的节点
}

export const useCesiumViewer = defineStore("cesiumStore", {
  state(): Map {
    return {
      viewer: null
    }
  }
})


export default useCesiumViewer