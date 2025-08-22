import type { FillPaint } from "@/core/types";
import type {
  CanvasKit,
  EmbindEnumEntity,
  Paint,
} from "canvaskit-wasm";

const paintCache = new Map<string, Paint>();

const paintKey = (paint: FillPaint): string => {
  const c = paint.color;
  // 使用位运算将RGBA值转换为32位整数作为key的一部分
  const colorKey =
    ((Math.round(c[0] * 255) << 24) |
      (Math.round(c[1] * 255) << 16) |
      (Math.round(c[2] * 255) << 8) |
      Math.round(c[3] * 255)) >>>
    0;

  return `${colorKey}#${paint.blendMode}`;
};

export const createPaint = (
  canvasKit: CanvasKit,
  fillPaint: FillPaint
): Paint => {
  const key = paintKey(fillPaint);
  const cachedPaint = paintCache.get(key);
  if (cachedPaint) {
    return cachedPaint;
  }

  // 预定义常用blendMode映射
  const blendModeMap: Record<string, EmbindEnumEntity> = {
    NORMAL: canvasKit.BlendMode.SrcOver,
  };

  const paint = new canvasKit.Paint();
  const color = fillPaint.color;
  paint.setColor(color);

  const blendModeValue =
    blendModeMap[fillPaint.blendMode] ?? canvasKit.BlendMode.SrcOver;
  paint.setBlendMode(blendModeValue);

  paintCache.set(key, paint);
  return paint;
};

export const disposePaint = (): void => {
  for (const paint of paintCache.values()) {
    paint.delete();
  }
  paintCache.clear();
}