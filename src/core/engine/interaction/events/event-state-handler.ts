import type { ViewportManager } from '../viewport';
import { IdleState, PanningState, SelectingState, MovingState, OverlayerState, type IState } from './states';

/**
 * 事件状态处理器
 * 负责处理画布上的鼠标和触摸事件，并使用状态机模式管理交互。
 */
export class EventStateHandler {
    public canvas: HTMLCanvasElement;
    public viewportManager: ViewportManager;

    // 状态机相关属性
    public states: { idle: IState; panning: IState; selecting: IState; moving: IState; overlayer: IState };
    private currentState: IState;

    // 事件监听器引用，用于清理
    private eventListeners: Array<{ element: EventTarget; type: string; listener: EventListener }> = [];

    constructor(canvas: HTMLCanvasElement, viewportManager: ViewportManager) {
        this.canvas = canvas;
        this.viewportManager = viewportManager;

        // 初始化所有状态
        this.states = {
            idle: new IdleState(this),
            panning: new PanningState(this),
            selecting: new SelectingState(this),
            moving: new MovingState(this),
            overlayer: new OverlayerState(this)
        };

        // 设置初始状态
        this.currentState = this.states.idle;
        this.currentState.enter();

        this.setupEvents();
    }

    /**
     * 切换状态
     * @param newState 要切换到的新状态
     * @param args 传递给新状态 enter 方法的参数
     */
    transitionTo(newState: IState, ...args: any[]): void {
        this.currentState.exit();
        this.currentState = newState;
        this.currentState.enter(...args);
    }

    /**
     * 设置所有事件监听器
     */
    private setupEvents(): void {
        this.setupWheelEvent();
        this.setupResizeEvent();
        this.setupMouseEvents();
        this.setupKeyboardEvents();
    }

    /**
     * 设置鼠标滚轮事件，并委托给当前状态处理。
     */
    private setupWheelEvent(): void {
        const wheelHandler = (e: WheelEvent) => {
            this.currentState.onWheel(e);
        };
        this.addEventListener(document, 'wheel', wheelHandler, { passive: false });
    }

    /**
     * 设置窗口大小变化事件，并委托给当前状态处理。
     */
    private setupResizeEvent(): void {
        const resizeHandler = (e: UIEvent) => {
            this.currentState.onResize(e);
        };
        this.addEventListener(document, 'resize', resizeHandler);
    }

    /**
     * 设置鼠标事件，并委托给当前状态处理。
     */
    private setupMouseEvents(): void {
        const mouseDownHandler = (e: MouseEvent) => {
            this.currentState.onMouseDown(e);
        };

        const mouseMoveHandler = (e: MouseEvent) => {
            this.currentState.onMouseMove(e);
        };

        const mouseUpHandler = (e: MouseEvent) => {
            this.currentState.onMouseUp(e);
        };

        const mouseLeaveHandler = (e: MouseEvent) => {
            this.currentState.onMouseLeave(e);
        };

        this.addEventListener(document, 'mousedown', mouseDownHandler);
        this.addEventListener(document, 'mousemove', mouseMoveHandler);
        this.addEventListener(document, 'mouseup', mouseUpHandler);
        this.addEventListener(document, 'mouseleave', mouseLeaveHandler);
    }

    /**
     * 设置键盘事件，并委托给当前状态处理。
     */
    private setupKeyboardEvents(): void {
        const keyDownHandler = (e: KeyboardEvent) => {
            this.currentState.onKeyDown(e);
        };
        this.addEventListener(document, 'keydown', keyDownHandler);
    }

    /**
     * 添加事件监听器并记录引用
     */
    private addEventListener(element: EventTarget, type: string, listener: any, options?: AddEventListenerOptions): void {
        element.addEventListener(type, listener, options);
        this.eventListeners.push({ element, type, listener });
    }

    /**
     * 获取鼠标在画布上的世界坐标
     */
    getWorldCoordinates(clientX: number, clientY: number): { x: number; y: number } {
        const rect = this.canvas.getBoundingClientRect();
        const screenX = clientX - rect.left;
        const screenY = clientY - rect.top;

        return this.viewportManager.screenToWorld(screenX, screenY);
    }

    /**
     * 销毁事件处理器，清理所有事件监听器
     */
    destroy(): void {
        // 退出当前状态，以防需要任何清理
        this.currentState.exit();

        this.eventListeners.forEach(({ element, type, listener }) => {
            element.removeEventListener(type, listener);
        });
        this.eventListeners = [];

        // 恢复画布样式
        this.canvas.style.cursor = 'default';
    }
}