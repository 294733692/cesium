import cesium from "@/store/cesium"; // 存储cesium viewer的store文件
import * as Cesium from "cesium";
import * as turf from "@turf/turf";
import { Message } from "element-ui";

/**
 * 屏幕坐标转经纬度高程
 * @param { Cesium.Cartesian2 } position 屏幕坐标
 * @returns 经纬度高程
 */
let getCurrentPosition = (position) => {
  let viewer = cesium.state.viewer;
  let lonLatPoint = null;
  if (viewer) {
    //捕获椭球体，将笛卡尔二维平面坐标转为椭球体的笛卡尔三维坐标，返回球体表面的点
    let ellipsoid = viewer.scene.globe.ellipsoid;
    let cartesian = viewer.camera.pickEllipsoid(position, ellipsoid);
    if (cartesian) {
      //将笛卡尔三维坐标转为地图坐标（弧度）
      let cartographic =
        viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
      //将地图坐标（弧度）转为十进制的度数
      // 经度
      let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(4);
      //纬度
      let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
      //海拔
      let altitude = (viewer.camera.positionCartographic.height / 1000).toFixed(
        2
      );
      lonLatPoint = [Number(longitude), Number(latitude), Number(altitude)];
    }
  }
  return lonLatPoint;
};

/**
 * 设置屏幕空间事件监听
 * @param {Cesium.ScreenSpaceEventType} type
 * @param {() => {}} next
 */
let setInputAction = (type, next) => {
  let viewer = cesium.state.viewer;
  if (viewer) {
    let handler = cesium.state.handler;
    if (handler) {
      handler.removeInputAction(type);
      handler.setInputAction((e) => {
        next(e);
      }, type);
    }
  }
};

/**
 * 移除屏幕空间事件监听
 * @param {Cesium.ScreenSpaceEventType} type 屏幕空间事件类型
 */
let removeInputAction = (type) => {
  let handler = cesium.state.handler;
  if (handler) {
    handler.removeInputAction(type);
  }
};

/**
 * 相机视角切换
 * @param {{longitude: number, latitude: number, altitude: number}} position 经纬度高程
 */
let cameraFlyTo = (position) => {
  let viewer = cesium.state.viewer;
  if (viewer) {
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        position.longitude,
        position.latitude,
        position.altitude
      ),
    });
  }
};

/**
 * 绘制多边形
 * @param {string} name 名称
 * @param {Array<number>} positions 经纬度数组
 * @returns
 */
let drawPolygon = (name, positions) => {
  let viewer = cesium.state.viewer;
  let polygonEntity = null;
  if (viewer) {
    polygonEntity = viewer.entities.add({
      name,
      polygon: {
        show: true,
        hierarchy: Cesium.Cartesian3.fromDegreesArray([...positions]),
        material: Cesium.Color.fromAlpha(Cesium.Color.RED, 0.5),
        fill: true,
        heightReference: Cesium.HeightReference.CLAMP_TO_GROUND, // 贴地
      },
    });

    // 多边形的坐标集合
    let polygonPointArr = polygonEntity.polygon.hierarchy.getValue(
      Cesium.JulianDate.now()
    ).positions;
    // 保存转换后的点数组，这个格式必须按照 turf 的要求来
    let turfArr = [[]];
    // 坐标转换
    polygonPointArr.forEach((val) => {
      let polyObj = {};
      // 空间坐标转世界坐标(弧度) 同 Cesium.Cartographic.fromCartesian
      let cartographic =
        viewer.scene.globe.ellipsoid.cartesianToCartographic(val);
      // 弧度转为角度（经纬度）
      polyObj.lon = Cesium.Math.toDegrees(cartographic.longitude);
      polyObj.lat = Cesium.Math.toDegrees(cartographic.latitude);
      turfArr[0].push([polyObj.lon, polyObj.lat]);
    });
    // turf 需要将整个点闭合，所以最后一个点必须和起点重合。
    turfArr[0].push(turfArr[0][0]);
    let turfPosition = turf.polygon(turfArr);
    let turfPositionPoint = turf.centerOfMass(turfPosition);
    // 设置标签坐标
    polygonEntity.position = Cesium.Cartesian3.fromDegrees(
      turfPositionPoint.geometry.coordinates[0],
      turfPositionPoint.geometry.coordinates[1],
      0
    );
    // 添加标签
    polygonEntity.label = {
      text: name,
      color: Cesium.Color.fromCssColorString("#fff"),
      font: "normal 12px MicroSoft YaHei",
      heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
    };
  }
  return polygonEntity;
};

/**
 * 绘制多段线
 * @param {string} name 名称
 * @param {Array<number>} positions 经纬度数组
 * @returns
 */
let drawPolyline = (name, positions) => {
  let viewer = cesium.state.viewer;
  let polyline = null;
  if (viewer) {
    polyline = viewer.entities.add({
      name,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArray([...positions]),
        width: 2,
        material: Cesium.Color.RED,
        clampToGround: true, // 指定折线是否应固定在地面上
      },
    });
  }
  return polyline;
};

/**
 * 默认左键点击事件
 */
let defaultLeftClick = () => {
  let leftClick = Cesium.ScreenSpaceEventType.LEFT_CLICK;
  let next = (e) => {
    let viewer = cesium.state.viewer;
    if (viewer) {
      let pick = viewer.scene.pick(e.position);
      console.log("pick---------", pick);
    }
    getCurrentPosition(e.position);
  };
  setInputAction(leftClick, next);
};

/**
 * 绘制区域（动态绘制多边形）
 */
let createRegion = () => {
  console.log("createRegion----------");
  let msg = Message({
    message: "点击鼠标左键选择点，点击鼠标右键结束绘制",
    duration: 0,
  });
  let viewer = cesium.state.viewer;
  if (viewer) {
    // 选中的经纬度
    let selectedPos = [];
    // 临时保存多段线
    let polyline = null;
    // 临时保存多边形
    let polygon = null;

    // 清空已绘制线或面
    let clearDraw = () => {
      if (polygon) {
        viewer.entities.remove(polygon);
      }
      if (polyline) {
        viewer.entities.remove(polyline);
      }
    };

    // 绘制操作
    let draw = (points) => {
      clearDraw();
      if (points.length == 4) {
        polyline = drawPolyline("临时区域", points);
      } else if (points.length >= 6) {
        polygon = drawPolygon("临时区域", points);
      }
    };

    // 左键点击事件
    let leftClick = Cesium.ScreenSpaceEventType.LEFT_CLICK;
    let leftClickNext = (e) => {
      let pos = getCurrentPosition(e.position);
      selectedPos.push(pos[0]);
      selectedPos.push(pos[1]);
      draw(selectedPos);
    };
    setInputAction(leftClick, leftClickNext);

    // 鼠标移动事件
    let mouseMove = Cesium.ScreenSpaceEventType.MOUSE_MOVE;
    let mouseMoveNext = (e) => {
      let pos = getCurrentPosition(e.endPosition);
      if (pos && pos.length == 3) {
        draw([...selectedPos, pos[0], pos[1]]);
      }
    };
    setInputAction(mouseMove, mouseMoveNext);

    // 右键点击事件
    let rightClick = Cesium.ScreenSpaceEventType.RIGHT_CLICK;
    let rightClickNext = () => {
      // 清空已绘制线或面
      clearDraw();
      // 绘制多边形
      if (selectedPos.length >= 6) {
        let regions = cesium.state.regions;
        let region = drawPolygon("区域" + (regions.length + 1), selectedPos);
        console.log("region", region);
      }
      selectedPos = [];
      removeInputAction(mouseMove);
      removeInputAction(rightClick);
      defaultLeftClick();
      msg.close();
    };
    setInputAction(rightClick, rightClickNext);
  }
};

/**
 * 获取区域各顶点经纬度高程
 * @param {Cesium.Entity} region 区域实体
 * @returns 区域各顶点经纬度高程
 */
let getRegionPositions = (region) => {
  let positions = [];
  let cartesians = region.polygon.hierarchy.getValue(
    Cesium.JulianDate.now()
  ).positions;
  let viewer = cesium.state.viewer;
  if (viewer) {
    for (let i = 0; i < cartesians.length; i++) {
      let cartesian = cartesians[i];
      if (cartesian) {
        //将笛卡尔三维坐标转为地图坐标（弧度）
        let cartographic =
          viewer.scene.globe.ellipsoid.cartesianToCartographic(cartesian);
        //将地图坐标（弧度）转为十进制的度数
        // 经度
        let longitude = Cesium.Math.toDegrees(cartographic.longitude).toFixed(
          4
        );
        //纬度
        let latitude = Cesium.Math.toDegrees(cartographic.latitude).toFixed(4);
        //海拔
        let altitude = (
          viewer.camera.positionCartographic.height / 1000
        ).toFixed(2);
        positions.push([Number(longitude), Number(latitude), Number(altitude)]);
      }
    }
  }
  return positions;
};

/**
 * 设置区域显隐
 * @param {Cesium.Entity} regions 区域实体
 * @param {boolean} isShow 是否显示
 */
let setRegionsVisible = (regions, isShow) => {
  for (let i = 0; i < regions.length; i++) {
    regions[i].show = isShow;
  }
};

/**
 * 计算区域面积
 * @param {Cesium.Entity} region 区域实体
 * @returns 区域面积（平方米）
 */
let computedRegionArea = (region) => {
  let positions = region.polygon.hierarchy.getValue(
    Cesium.JulianDate.now()
  ).positions;
  let area = 0;
  for (let i = 0; i < positions.length; i++) {
    let j = (i + 1) % positions.length;
    area += positions[i].x * positions[j].y;
    area -= positions[i].y * positions[j].x;
  }
  area /= 2;
  return Math.abs(area);
};

export default {
  getCurrentPosition,
  setInputAction,
  removeInputAction,
  cameraFlyTo,
  drawPolygon,
  drawPolyline,
  defaultLeftClick,
  createRegion,
  getRegionPositions,
  setRegionsVisible,
  computedRegionArea,
};
