import type { BoundingBox, Point } from '@/core/engine/collision';

/**
 * 将变换矩阵应用到点上
 * @param point 要变换的点
 * @param matrix 变换矩阵 [a, b, c, d, e, f]
 * @returns 变换后的点
 */
function applyTransform(point: Point, matrix: number[]): Point {
    const [a, b, c, d, e, f] = matrix;
    return {
        x: a * point.x + c * point.y + e,
        y: b * point.x + d * point.y + f,
    };
}

/**
 * 计算元素在应用变换矩阵后的绝对包围盒
 * @param matrix 作用于该元素的变换矩阵
 * @returns {BoundingBox} 绝对包围盒
 */
export function getAbsoluteBoundingBoxForMatrix({ width, height }: { width: number, height: number }, matrix: number[]): BoundingBox {
    // 在本地坐标系中的四个顶点
    const localCorners: Point[] = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: width, y: height },
        { x: 0, y: height },
    ];

    // 将矩阵应用到每个顶点上，得到世界坐标
    const transformedCorners = localCorners.map(p => applyTransform(p, matrix));

    // 从变换后的顶点中找出最小和最大的 x, y 坐标
    const minX = Math.min(...transformedCorners.map(p => p.x));
    const minY = Math.min(...transformedCorners.map(p => p.y));
    const maxX = Math.max(...transformedCorners.map(p => p.x));
    const maxY = Math.max(...transformedCorners.map(p => p.y));

    // 返回最终的、与坐标轴对齐的包围盒
    return {
        x: minX,
        y: minY,
        width: maxX - minX,
        height: maxY - minY,
    };
}



export function decomposeMatrix(matrix: number[]) {
    const [a, b, c, d, e, f] = matrix;

    // 1. 提取平移
    const x = c;
    const y = f;

    // 2. 提取旋转
    const rotation = Math.atan2(d, a) * (180 / Math.PI);

    // 3. 提取缩放
    const scaleX = Math.sqrt(a * a + d * d);
    const scaleY = Math.sqrt(b * b + e * e);

    return { x, y, rotation, scaleX, scaleY };
}