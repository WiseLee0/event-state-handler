import type { IHittable, Point, BoundingBox } from './type';

/**
 * 碰撞检测器
 * 提供了一组静态方法，用于处理场景中对象的命中测试和区域相交测试。
 * 它本身是无状态的，所有操作都通过传入参数完成。
 */
export class CollisionDetector {
    /**
     * 查找在指定点命中的最上层对象。
     * @param point 要测试的点（世界坐标）。
     * @param objects 要进行检测的对象数组。数组的顺序很重要，通常渲染在最上层的对象应该放在数组的末尾。
     * @returns {IHittable | null} 返回命中的最上层对象。如果未命中任何对象，则返回 null。
     */
    public static findHit(point: Point, objects: IHittable[]): IHittable | null {
        // 从后向前遍历，因为数组末尾的元素被认为是渲染在最上层的。
        // 这样可以确保我们优先选中最上方的对象。
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            // 首先进行粗略的包围盒检测，提高性能
            if (this.isPointInBox(point, obj.getAbsoluteBoundingBox())) {
                // 如果点在包围盒内，再进行精确的命中测试
                if (obj.hitTest(point)) {
                    return obj;
                }
            }
        }
        return null;
    }

    /**
     * 查找与指定矩形区域相交的所有对象。
     * @param box 要测试的矩形区域（世界坐标），例如选择框。
     * @param objects 要进行检测的对象数组。
     * @returns {IHittable[]} 返回所有与矩形区域相交的对象的数组。
     */
    public static findIntersecting(box: BoundingBox, objects: IHittable[]): IHittable[] {
        return objects.filter(obj => obj.intersectsWith(box));
    }

    /**
     * 辅助函数：检查一个点是否在包围盒内。
     */
    private static isPointInBox(point: Point, box: BoundingBox): boolean {
        return (
            point.x >= box.x &&
            point.x <= box.x + box.width &&
            point.y >= box.y &&
            point.y <= box.y + box.height
        );
    }
}