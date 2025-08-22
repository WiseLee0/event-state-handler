import type { CanvasKit, Canvas, Paint } from 'canvaskit-wasm';
import type { SceneNode } from '@/core/models';
import { createPaint } from '../cache/create-paint';

/**
 * 元素渲染器接口
 */
export interface IElementRenderer {
    /**
     * 判断是否可以渲染该元素
     */
    canRender(element: SceneNode): boolean;

    /**
     * 渲染元素
     */
    render(canvasKit: CanvasKit, canvas: Canvas, node: SceneNode): void;
}

/**
 * 基础渲染器抽象类
 * 提供通用的变换、样式处理逻辑
 */
export abstract class BaseRenderer implements IElementRenderer {
    abstract canRender(node: SceneNode): boolean;
    abstract renderShape(canvasKit: CanvasKit, canvas: Canvas, node: SceneNode, paint: Paint): void;
    private mat9: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1];

    render(canvasKit: CanvasKit, canvas: Canvas, node: SceneNode): void {
        if (!node.visible) return;

        canvas.save();

        // 应用变换矩阵
        this.applyTransform(canvas, node.matrix);

        // 处理填充样式
        node.fillPaints.forEach(fillPaint => {
            if (fillPaint.visible) {
                const paint = createPaint(canvasKit, fillPaint);
                this.renderShape(canvasKit, canvas, node, paint);
            }
        });

        canvas.restore();
    }

    /**
     * 应用变换矩阵
     */
    protected applyTransform(canvas: Canvas, matrix: number[]): void {
        this.mat9[0] = matrix[0]; this.mat9[1] = matrix[2]; this.mat9[2] = matrix[4];
        this.mat9[3] = matrix[1]; this.mat9[4] = matrix[3]; this.mat9[5] = matrix[5];
        this.mat9[6] = 0; this.mat9[7] = 0; this.mat9[8] = 1;
        canvas.concat(this.mat9 as any);
    }
}