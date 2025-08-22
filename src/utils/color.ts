export function floatRgbaToHex(r: number, g: number, b: number, a = 1.0) {
    // 将 [0-1] 范围的浮点数转换为 [0-255] 的整数
    const to255 = (v: number) => Math.round(v * 255);

    // 转换为十六进制字符串
    const toHex = (v: number) => to255(v).toString(16).padStart(2, '0');

    // 构建十六进制颜色字符串
    let hex = `${toHex(r)}${toHex(g)}${toHex(b)}`;

    // 如果透明度不是1.0，添加alpha通道
    if (a < 1.0) {
        hex += toHex(a);
    }

    return hex.toUpperCase();
}

export function floatRgbaToHexHash(r: number, g: number, b: number, a = 1.0) {
    return `#${floatRgbaToHex(r, g, b, a)}`;
}