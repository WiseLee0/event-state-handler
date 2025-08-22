interface BoundingBox {
    x: number;
    y: number;
    width: number;
    height: number;
}

export function mergeBoundingBoxes(boxes: BoundingBox[]): BoundingBox {
    // 初始化最小和最大坐标值
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    // 遍历所有边界框，找出最小和最大坐标
    for (const box of boxes) {
        const currentMinX = box.x;
        const currentMinY = box.y;
        const currentMaxX = box.x + box.width;
        const currentMaxY = box.y + box.height;

        minX = Math.min(minX, currentMinX);
        minY = Math.min(minY, currentMinY);
        maxX = Math.max(maxX, currentMaxX);
        maxY = Math.max(maxY, currentMaxY);
    }

    // 计算合并后的边界框
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}