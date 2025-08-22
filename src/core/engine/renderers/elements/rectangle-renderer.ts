import type { CanvasKit, Canvas, Paint } from 'canvaskit-wasm';
import type { SceneNode } from '@/core/models';
import { BaseRenderer } from './base-renderer';

/**
 * 矩形渲染器
 */
export class RectangleRenderer extends BaseRenderer {
  canRender(node: SceneNode): boolean {
    return node.type === 'RECTANGLE';
  }

  renderShape(canvasKit: CanvasKit, canvas: Canvas, node: SceneNode, paint: Paint): void {
    // 创建矩形区域
    const rect = canvasKit.XYWHRect(0, 0, node.width, node.height);

    // 绘制填充矩形
    canvas.drawRect(rect, paint);
  }
}