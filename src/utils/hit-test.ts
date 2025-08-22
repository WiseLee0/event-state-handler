export interface MatrixElement {
    matrix: [number, number, number, number, number, number] | number[]; // [a, b, c, d, e, f]
    width: number;
    height: number;
}

// 预分配的内存池，避免频繁分配
const CORNER_POOL_1 = new Float64Array(8); // 4 corners * 2 coordinates
const CORNER_POOL_2 = new Float64Array(8);
const NORMAL_POOL = { x: 0, y: 0 };
const PROJ_POOL_1 = { min: 0, max: 0 };
const PROJ_POOL_2 = { min: 0, max: 0 };

export function hitMatrixNodeTest(element1: MatrixElement, element2: MatrixElement): boolean {
    const m1 = element1.matrix;
    const m2 = element2.matrix;
    
    // 内联轴对齐检查，避免重复调用
    const isAxis1 = Math.abs(m1[1]) < 1e-6 && Math.abs(m1[2]) < 1e-6;
    const isAxis2 = Math.abs(m2[1]) < 1e-6 && Math.abs(m2[2]) < 1e-6;
    
    if (isAxis1 && isAxis2) {
        return axisAlignedIntersectionInline(element1, element2);
    }
    
    // 快速边界框预检查 - 避免昂贵的SAT计算
    if (!boundingBoxIntersect(element1, element2)) {
        return false;
    }
    
    // 使用内存池的SAT检测
    return satIntersectOptimized(element1, element2);
}

// 内联轴对齐相交检测，减少函数调用开销
function axisAlignedIntersectionInline(element1: MatrixElement, element2: MatrixElement): boolean {
    const m1 = element1.matrix;
    const m2 = element2.matrix;
    
    // 直接访问矩阵元素，避免解构
    const w1 = element1.width * m1[0];
    const h1 = element1.height * m1[3];
    const w2 = element2.width * m2[0];
    const h2 = element2.height * m2[3];
    
    const left1 = m1[4];
    const right1 = m1[4] + w1;
    const top1 = m1[5];
    const bottom1 = m1[5] + h1;
    
    const left2 = m2[4];
    const right2 = m2[4] + w2;
    const top2 = m2[5];
    const bottom2 = m2[5] + h2;
    
    return left1 < right2 && right1 > left2 && top1 < bottom2 && bottom1 > top2;
}

// 快速边界框预检查
function boundingBoxIntersect(element1: MatrixElement, element2: MatrixElement): boolean {
    const m1 = element1.matrix;
    const m2 = element2.matrix;
    const w1 = element1.width;
    const h1 = element1.height;
    const w2 = element2.width;
    const h2 = element2.height;
    
    // 计算AABB边界框（考虑变换后的最大范围）
    const scale1 = Math.sqrt(m1[0] * m1[0] + m1[1] * m1[1]) * w1 + Math.sqrt(m1[2] * m1[2] + m1[3] * m1[3]) * h1;
    const scale2 = Math.sqrt(m2[0] * m2[0] + m2[1] * m2[1]) * w2 + Math.sqrt(m2[2] * m2[2] + m2[3] * m2[3]) * h2;
    
    const centerX1 = m1[4] + (m1[0] * w1 + m1[2] * h1) * 0.5;
    const centerY1 = m1[5] + (m1[1] * w1 + m1[3] * h1) * 0.5;
    const centerX2 = m2[4] + (m2[0] * w2 + m2[2] * h2) * 0.5;
    const centerY2 = m2[5] + (m2[1] * w2 + m2[3] * h2) * 0.5;
    
    const dx = Math.abs(centerX1 - centerX2);
    const dy = Math.abs(centerY1 - centerY2);
    
    return dx < (scale1 + scale2) * 0.5 && dy < (scale1 + scale2) * 0.5;
}

// 优化的SAT检测，使用内存池
function satIntersectOptimized(element1: MatrixElement, element2: MatrixElement): boolean {
    // 直接在内存池中计算角点，避免分配
    getTransformedCornersInPlace(element1, CORNER_POOL_1);
    getTransformedCornersInPlace(element2, CORNER_POOL_2);
    
    // 优化的多边形相交检测
    return polygonsIntersectOptimized(CORNER_POOL_1, CORNER_POOL_2);
}

// 在预分配内存中计算变换角点
function getTransformedCornersInPlace(element: MatrixElement, pool: Float64Array): void {
    const m = element.matrix;
    const w = element.width;
    const h = element.height;
    const a = m[0], b = m[1], c = m[2], d = m[3], e = m[4], f = m[5];
    
    // 直接计算四个角点到pool中
    // [0, 0]
    pool[0] = e;
    pool[1] = f;
    // [width, 0]
    pool[2] = a * w + e;
    pool[3] = b * w + f;
    // [width, height]
    pool[4] = a * w + c * h + e;
    pool[5] = b * w + d * h + f;
    // [0, height]
    pool[6] = c * h + e;
    pool[7] = d * h + f;
}

// 优化的多边形相交检测
function polygonsIntersectOptimized(poly1: Float64Array, poly2: Float64Array): boolean {
    // 检查poly1的边
    for (let i = 0; i < 4; i++) {
        const i2 = i * 2;
        const j2 = ((i + 1) % 4) * 2;
        
        // 计算法向量
        NORMAL_POOL.x = poly1[j2 + 1] - poly1[i2 + 1];
        NORMAL_POOL.y = poly1[i2] - poly1[j2];
        
        // 投影两个多边形
        projectPolygonOptimized(poly1, NORMAL_POOL, PROJ_POOL_1);
        projectPolygonOptimized(poly2, NORMAL_POOL, PROJ_POOL_2);
        
        // 检查分离
        if (PROJ_POOL_1.max < PROJ_POOL_2.min || PROJ_POOL_2.max < PROJ_POOL_1.min) {
            return false;
        }
    }
    
    // 检查poly2的边
    for (let i = 0; i < 4; i++) {
        const i2 = i * 2;
        const j2 = ((i + 1) % 4) * 2;
        
        NORMAL_POOL.x = poly2[j2 + 1] - poly2[i2 + 1];
        NORMAL_POOL.y = poly2[i2] - poly2[j2];
        
        projectPolygonOptimized(poly1, NORMAL_POOL, PROJ_POOL_1);
        projectPolygonOptimized(poly2, NORMAL_POOL, PROJ_POOL_2);
        
        if (PROJ_POOL_1.max < PROJ_POOL_2.min || PROJ_POOL_2.max < PROJ_POOL_1.min) {
            return false;
        }
    }
    
    return true;
}

// 优化的投影函数
function projectPolygonOptimized(polygon: Float64Array, normal: { x: number, y: number }, result: { min: number, max: number }): void {
    let min = normal.x * polygon[0] + normal.y * polygon[1];
    let max = min;
    
    // 展开循环，减少边界检查
    let proj = normal.x * polygon[2] + normal.y * polygon[3];
    if (proj < min) min = proj;
    else if (proj > max) max = proj;
    
    proj = normal.x * polygon[4] + normal.y * polygon[5];
    if (proj < min) min = proj;
    else if (proj > max) max = proj;
    
    proj = normal.x * polygon[6] + normal.y * polygon[7];
    if (proj < min) min = proj;
    else if (proj > max) max = proj;
    
    result.min = min;
    result.max = max;
}
