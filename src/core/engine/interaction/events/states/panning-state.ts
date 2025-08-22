import type { EventStateHandler } from '../event-state-handler';
import { BaseState } from './state';

/**
 * 平移状态 - 当用户按住鼠标中键并移动时进入此状态。
 */
export class PanningState extends BaseState {
    private lastMouseX = 0;
    private lastMouseY = 0;

    constructor(context: EventStateHandler) {
        super(context);
    }

    /**
     * 进入平移状态。
     * @param event 触发状态切换的鼠标事件，用于获取初始位置。
     */
    enter(event: MouseEvent): void {
        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
        this.context.canvas.style.cursor = 'grabbing';
    }

    /**
     * 退出平移状态，恢复鼠标样式。
     */
    exit(): void {
        this.context.canvas.style.cursor = 'default';
    }

    /**
     * 处理鼠标移动，计算位移并更新视口。
     */
    onMouseMove(event: MouseEvent): void {
        event.preventDefault();
        const deltaX = event.clientX - this.lastMouseX;
        const deltaY = event.clientY - this.lastMouseY;

        this.context.viewportManager.pan(deltaX, deltaY);

        this.lastMouseX = event.clientX;
        this.lastMouseY = event.clientY;
    }

    /**
     * 处理鼠标松开，切换回空闲状态。
     */
    onMouseUp(event: MouseEvent): void {
        event.preventDefault();
        this.context.transitionTo(this.context.states.idle);
    }

    /**
     * 处理鼠标离开画布，切换回空闲状态。
     */
    onMouseLeave(event: MouseEvent): void {
        event.preventDefault();
        this.context.transitionTo(this.context.states.idle);
    }
}