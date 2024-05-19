import type {DrawHandlerOptions, DrawModel} from '@/types/drawHandler'
import * as Cesium from 'cesium'
import {
  Viewer,
  ScreenSpaceEventHandler,
  Entity,
  Cartesian2,
  ScreenSpaceEventType,
  CallbackProperty,
  Color,
  HeightReference,
  JulianDate
} from 'cesium'

class DrawHandler {
  viewer: Viewer
  model: DrawModel
  options: DrawHandlerOptions
  handler: ScreenSpaceEventHandler
  drawEntity: Entity | undefined
  index: number
  initId: number
  positions: []
  tempPositions: []
  minPositionCount: number


  constructor(viewer: Viewer, model: DrawModel, options?: DrawHandlerOptions) {
    this.viewer = viewer
    this.model = model
    this.options = options || {
      htmlStr: "",
      isShowDeleteBtn: false
    }

    this.index = 0
    this.handler = new ScreenSpaceEventHandler(this.viewer.scene.canvas)
  }

  activeState() {
    this.deactivete()
    this.clear()

    // 创建data对象
    const currentDate = new Date()
    // 获取当前时间戳作为当前ID
    this.initId = currentDate.getTime()
    this.positions = []
    this.tempPositions = []
    // 注册鼠标事件
    this.registerEvents()
    // 设置鼠标绘制样式
    // this.viewer.enableCursorStyle = false
    // this.viewer._element.style.cursor = 'default'
  }

  /**
   * 清空绘制
   */
  clear() {
    if (this.drawEntity) {
      this.viewer.entities.remove(this.drawEntity)
      this.drawEntity = undefined
    }
  }

  /**
   * 禁用状态
   */
  deactivete() {
    this.unRegisterEvents()
    this.drawEntity = undefined
    // 修改鼠标样式
    this.viewer._element.style.cursor = 'pointer';
    this.viewer.enableCursorStyle = true;
  }

  /**
   * 事件注册
   */
  registerEvents() {
    this.leftClickEvent()
    this.rightClickEvent()
    this.mouseMoveEvent()
  }

  leftClickEvent() {
    this.handler.setInputAction((event: { position: Cartesian2 }) => {
      this.viewer._element.style.cursor = 'default'
      let position = this.viewer.scene.pickPosition(event.position)
      if (!position) {
        position = this.viewer.scene.camera.pickEllipsoid(event.position, this.viewer.scene.globe.ellipsoid)
      }
      if (!position) return
      this.index++

      // 创建点
      this.createPoint(position)
      this.positions.push(position)

      if (this.positions.length === 1) {
        this.generatePolyline()
      }
    }, ScreenSpaceEventType.LEFT_CLICK)
  }

  rightClickEvent() {
    this.handler.setInputAction((event: { position: Cartesian2 }) => {
      if (!this.drawEntity) return this.deactivete()
      let tempPositions = this.tempPositions.slice(0, this.positions.length)
      this.drawEntity.polyline.positions = new CallbackProperty(event => {
        return tempPositions
      }, false)

      // 两点成线
      this.minPositionCount = 2
      if (this.positions.length < this.minPositionCount) {
        this.clear()
        this.deactivete()
        return
      }
      this.index = 0
      this.drawEnd()
    }, ScreenSpaceEventType.RIGHT_CLICK)
  }

  mouseMoveEvent() {
    this.handler.setInputAction((e: any) => {
      //由于鼠标移动时 Cesium会默认将鼠标样式修改为手柄 所以移动时手动设置回来
      this.viewer._element.style.cursor = 'default';
      let position = this.viewer.scene.pickPosition(e.endPosition);
      if (!position) {
        position = this.viewer.scene.camera.pickEllipsoid(e.startPosition, this.viewer.scene.globe.ellipsoid);
      }
      if (!position) return;
      if (!this.drawEntity) return;
      this.tempPositions = this.positions.concat([position]);
    }, ScreenSpaceEventType.MOUSE_MOVE)
  }

  /**
   * 绘制⚪
   * @param position: Cartesian2
   */
  createPoint(position: Cartesian2) {
    return this.viewer.entities.add({
      position,
      _nane: this.initId,
      point: {
        pixelSize: 10,
        color: Color.DARKRED,
        outlineWidth: 2,
        outlineColor: HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: 99000000,
        clampToGround: true,
      },
      label: {
        text: `${this.index}`,
        fillColor: Color.WHITE,
        font: '14px',
        pixelOffset: new Cartesian2(10, 10),
        heightReference: HeightReference.NONE, // 修改高度参考
        disableDepthTestDistance: Number.POSITIVE_INFINITY, // 禁用深度测试距离
        clampToGround: true,
      },
      show: true
    })
  }

  /**
   * 解除鼠标事件
   */
  unRegisterEvents() {
    this.handler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
    this.handler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
    this.handler.removeInputAction(ScreenSpaceEventType.MOUSE_MOVE);
  }

  /**
   *  绘制结束 触发结束事件
   */
  drawEnd() {
    this.drawEntity.remove = () => {
      this.viewer.entities.remove(this.drawEntity)
    }
    this.deactivete()
  }

  /**
   * 连接线段
   */
  generatePolyline() {
    this.drawEntity = this.viewer.entities.add({
      id: this.initId + 'polyline',
      polyline: {
        positions: new CallbackProperty(e => {
          return this.tempPositions;
        }, false),
        width: 2,
        material: Color.YELLOW,
        depthFailMaterial: Color.YELLOW,
        clampToGround: true,
      },
    })
  }
}

class EntityEdit {
  viewer: Viewer
  tempPositions: []
  eventHandler: ScreenSpaceEventHandler
  isEditing: boolean
  entityPolyline: any
  pickId: any

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.tempPositions = []
    this.initEventHandler();
  }

  //鼠标事件
  initEventHandler() {
    this.eventHandler = new ScreenSpaceEventHandler(this.viewer.scene.canvas);
  }

  //激活编辑
  activate() {
    this.isEditing = false;
    this.deactivate();
    //鼠标左键点击事件 鼠标左键点击拾取需要编辑的对象
    this.initLeftClickEventHandler();
    //鼠标拖动事件
    this.initMoseMoveEventHandler();
    this.initRightClickEventHandler();
  }

  initRightClickEventHandler() {
    this.eventHandler.setInputAction(e => {
      if (this.isEditing) {
        let cartesian = this.viewer.scene.camera.pickEllipsoid(
          e.position,
          this.viewer.scene.globe.ellipsoid
        );
        if (cartesian) {
          // console.log(, 30);
          // this.entityPolyline.entity.position.setValue = this.tempPositions
          let tempPositions = this.tempPositions


          // this.entityPolyline.polyline.positions = this.tempPositions
          this.entityPolyline.polyline.positions = new CallbackProperty(e => {
            return tempPositions;
          }, false)
          this.tempPositions = []

        }
        this.isEditing = false
      }
    }, ScreenSpaceEventType.RIGHT_CLICK)
  }

  //鼠标拖动事件
  initMoseMoveEventHandler() {
    this.eventHandler.setInputAction(e => {
      if (this.isEditing) {
        let cartesian = this.viewer.scene.camera.pickEllipsoid(
          e.endPosition,
          this.viewer.scene.globe.ellipsoid
        );
        if (cartesian) {
          this.pickId.position = cartesian;
          this.tempPositions[this.index] = cartesian
        }
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE)

  }

  //左键点击事件
  initLeftClickEventHandler() {
    this.eventHandler.setInputAction(e => {
      let id = this.viewer.scene.pick(e.position);
      if (id) {
        this.handlePickEditEntity(id);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  handlePickEditEntity(pickId) {

    if (pickId.collection) {
      this.pickId = pickId.id
      //通过点实体的_name属性找到 polyline实体并判断要编辑的是哪个线的位置
      this.entityPolyline = this.viewer.entities.getById(this.pickId._name + 'polyline');
      this.isEditing = true;
      if (this.entityPolyline.polyline._positions._value || this.entityPolyline.polyline.positions) {
        this.tempPositions = this.entityPolyline.polyline._positions._value || this.entityPolyline.polyline.positions.getValue(JulianDate.now());
        this.tempPositions.forEach((item, index) => {
          if (JSON.stringify(item) === JSON.stringify(this.pickId.position._value)) {
            this.index = index;
          }
        })
        this.entityPolyline.polyline.positions = new CallbackProperty(e => {
          return this.tempPositions;
        }, false)
      }

    }
  }

  //禁用编辑
  deactivate() {
    this.eventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
    this.unRegisterEvents();

  }

  handleEditEntity() {
    this.unRegisterEvents();
    let editEntity = this.editEntity;
    if (!editEntity) return;
    this.closeEntityEditMode();
    this.editEntity = undefined;
    if (!this.isEdited) return; //没有任何编辑 直接返回
    //触发编辑事件
    this.isEdited = false;
    this.isEditing = false;
  }

  //取消事件监听
  unRegisterEvents() {
    this.eventHandler.removeInputAction(ScreenSpaceEventType.LEFT_CLICK);
    this.eventHandler.removeInputAction(ScreenSpaceEventType.LEFT_UP);
    this.eventHandler.removeInputAction(ScreenSpaceEventType.RIGHT_CLICK);
  }
}

export default DrawHandler