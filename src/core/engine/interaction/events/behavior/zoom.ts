import type { EventStateHandler } from "../event-state-handler";

/**
 * 纯行为：处理基于滚轮的缩放。
 */
export class ZoomBehavior {
    /**
     * 计算以鼠标位置为中心的缩放坐标，并应用缩放。
     */
    handle(context: EventStateHandler, event: WheelEvent, delta: number): void {
        const { canvas } = context;
        const rect = canvas.getBoundingClientRect();
        const centerX = event.clientX - rect.left;
        const centerY = event.clientY - rect.top;
        context.viewportManager.zoomDelta(delta, centerX, centerY);
    }
}
