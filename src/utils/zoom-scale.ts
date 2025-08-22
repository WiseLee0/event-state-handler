const zoomLevels = [0.02, 0.03, 0.06, 0.13, 0.25, 0.5, 1, 2, 4, 8, 16];

export function matchZoomScale(scale: number, isZoomIn: boolean = false): number {
    const index = zoomLevels.indexOf(scale);

    // 如果当前缩放比例正好在列表中
    if (index !== -1) {
        if (isZoomIn) {
            // 放大：取下一个更大的值（如果已经是最大值，则保持不变）
            return index < zoomLevels.length - 1 ? zoomLevels[index + 1] : scale;
        } else {
            // 缩小：取前一个更小的值（如果已经是最小值，则保持不变）
            return index > 0 ? zoomLevels[index - 1] : scale;
        }
    }

    const candidates = isZoomIn
        ? zoomLevels.filter(level => level > scale)
        : zoomLevels.filter(level => level < scale);

    if (candidates.length === 0) {
        return isZoomIn
            ? zoomLevels[zoomLevels.length - 1]  // 已经是最大放大，返回最大值
            : zoomLevels[0];                     // 已经是最小缩小，返回最小值
    }

    // 找到最接近当前缩放比例的值
    const closest = candidates.reduce((prev, curr) => {
        return (Math.abs(curr - scale) < Math.abs(prev - scale) ? curr : prev);
    });

    return closest;
}