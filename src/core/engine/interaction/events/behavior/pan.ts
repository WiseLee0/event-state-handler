import type { EventStateHandler } from "../event-state-handler";

/**
 * 纯行为：处理滚轮造成的视口平移。
 * 注意：不维护状态生命周期，供各 State 组合复用。
 */
export class PanBehavior {
    /**
     * 基于鼠标滚轮事件进行平移。
     */
    handle(event: WheelEvent, context: EventStateHandler): void {
        const deltaX = -event.deltaX;
        const deltaY = -event.deltaY;
        context.viewportManager.pan(deltaX, deltaY);
    }
}