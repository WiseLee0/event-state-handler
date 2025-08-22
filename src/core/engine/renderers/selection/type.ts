import type { CanvasKit, Canvas } from 'canvaskit-wasm';

/**
 * 选择框渲染器接口
 */
export interface ISelectionRenderer {
    /**
     * 判断是否可以渲染该选择框
     */
    canRender(): boolean;

    /**
     * 渲染选择框
     */
    render(canvasKit: CanvasKit, canvas: Canvas): void;

    /**
     * 资源释放（可选）
     */
    dispose?(): void;
}