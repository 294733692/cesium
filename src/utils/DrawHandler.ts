import type {DrawHandlerOptions, DrawModel} from '@/types/drawHandler'
import { Viewer } from 'cesium'
import * as Cesium from 'cesium'

class DrawHandler {
  viewer: Viewer
  model: DrawModel
  options: DrawHandlerOptions

  constructor(viewer: Viewer, model: DrawModel, options?: DrawHandlerOptions) {
    this.viewer = viewer
    this.model = model

  }

  initDrawHandle() {

  }
}

export default DrawHandler