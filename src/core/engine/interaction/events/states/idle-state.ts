import { getHotKeyState } from '@/store/hotkey';
import { matchZoomScale } from '@/utils/zoom-scale';
import type { EventStateHandler } from '../event-state-handler';
import { BaseState } from './state';
import { getViewportState } from '@/store/viewport';
import { ClickBehavior, HoverBehavior, PanZoomBehavior } from '../behavior';

/**
 * 空闲状态 - 默认状态，处理非特定操作（如平移、选择）之外的通用交互。
 */
export class IdleState extends BaseState {
    private panZoomBehavior: PanZoomBehavior;
    private clickBehavior: ClickBehavior;
    private hoverBehavior: HoverBehavior;
    constructor(context: EventStateHandler) {
        super(context);
        this.panZoomBehavior = new PanZoomBehavior();
        this.clickBehavior = new ClickBehavior();
        this.hoverBehavior = new HoverBehavior();
    }

    /**
     * 处理鼠标按下事件。
     * - 左键按下: 切换到框选 | 移动状态。
     * - 中键按下: 切换到平移状态。
     */
    onMouseDown(event: MouseEvent): void {
        // 如果当前有输入框获得焦点，在点击画布后失去焦点
        if (document.activeElement instanceof HTMLInputElement) {
            document.activeElement?.blur?.();
        }
        if (event.button === 0) { // 0 是鼠标左键
            event.preventDefault();
            const isHit = this.clickBehavior.hitTest(event, this.context)
            if (isHit) {
                // 移动状态
                this.context.transitionTo(this.context.states.moving, event);
            } else {
                // 框选状态
                this.context.transitionTo(this.context.states.selecting, event);
            }
        } else if (event.button === 1) { // 1 是鼠标中键
            event.preventDefault();
            this.context.transitionTo(this.context.states.panning, event);
        }
    }

    /**
     * 处理悬停事件，元素进行碰撞检测
     */
    onMouseMove(event: MouseEvent): void {
        const hoverNode = this.hoverBehavior.hitTest(event, this.context)
        if (hoverNode?.type === 'DOM_CARD') {
            this.context.transitionTo(this.context.states.overlayer, event);
        }
    }

    /**
     * 处理鼠标滚轮事件。
     * - Ctrl/Cmd + 滚轮: 缩放视口。
     * - 直接滚轮: 平移视口。
     */
    onWheel(event: WheelEvent): void {
        this.panZoomBehavior.handle(event, this.context);
    }

    /**
     * 处理键盘按下事件，用于快捷键。
     * - Ctrl/Cmd + 0: 重置视口。
     * - Ctrl/Cmd + =: 放大。
     * - Ctrl/Cmd + -: 缩小。
     */
    onKeyDown(event: KeyboardEvent): void {
        const { canvas, viewportManager } = this.context;

        if (getHotKeyState('isMainPressed') && event.key === '0') {
            event.preventDefault();
            viewportManager.reset();
        }

        if (getHotKeyState('isMainPressed') && event.key === '=') {
            event.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const scale = getViewportState('scale');
            viewportManager.zoom(matchZoomScale(scale, true), centerX, centerY);
        }

        if (getHotKeyState('isMainPressed') && event.key === '-') {
            event.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const scale = getViewportState('scale');
            viewportManager.zoom(matchZoomScale(scale, false), centerX, centerY);
        }
    }
}