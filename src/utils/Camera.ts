import * as Cesium from 'cesium'

export const cameraSetView = (viewer: Cesium.Viewer) => {
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(109, 39, 10000), //相机（眼睛）位置 不是地图位置
    //相机的姿态
    orientation: {
      heading: Cesium.Math.toRadians(0), // 朝向
      pitch: Cesium.Math.toRadians(-90), // 俯仰
      roll: 0.0 //滚转
    }
  })
}

export const cameraFlyTo = (viewer: Cesium.Viewer) => {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(109, 34, 1000000),
    orientation: {
      heading: Cesium.Math.toRadians(0), // 水平偏角，默认正北 0
      pitch: Cesium.Math.toRadians(-90), // 俯视角，默认-90，垂直向下
      roll: 0 // 旋转角
    },
    duration: 2
  })
}
