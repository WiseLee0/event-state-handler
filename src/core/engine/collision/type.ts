/**
 * 定义一个二维点
 */
export interface Point {
    x: number;
    y: number;
}

/**
 * 定义一个包围盒（Bounding Box）
 * 用于粗略计算和区域检测。
 */
export interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

/**
 * 可碰撞检测对象的接口。
 */
export interface IHittable {
    /**
     * 获取对象的唯一标识ID
     */
    id: string;

    /**
     * 获取对象的AABB包围盒。
     * 包围盒可用于快速的、初步的碰撞判断，以优化性能。
     * @returns {BoundingBox} 对象的包围盒
     */
    getAbsoluteBoundingBox(): BoundingBox;

    /**
     * 精确检测一个点是否与该对象发生碰撞（命中）。
     * @param point 要检测的点，通常是鼠标的世界坐标。
     * @returns {boolean} 如果点在对象内部（或边上），则返回 true。
     */
    hitTest(point: Point): boolean;

    /**
     * 检测一个矩形区域是否与该对象相交。
     * 这对于实现框选功能至关重要。
     * @param box 要检测的矩形区域，例如选择框。
     * @returns {boolean} 如果区域与对象有任何重叠，则返回 true。
     */
    intersectsWith(box: BoundingBox): boolean;
}