import {DrawModelType} from "@/enums/drawHandle";

export type DrawModel = DrawModelType.Point | DrawModelType.Line | DrawModelType.Polygon | DrawModelType.Circle | DrawModelType.Rectangle

export interface DrawHandlerOptions {
    // 删除点样式
    htmlStr: string
    // 是否显示移除点
    isShowDeleteBtn: boolean
}