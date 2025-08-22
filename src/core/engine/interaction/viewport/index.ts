import { setViewportState } from "@/store/viewport";

export interface ViewportState {
    scale: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

export class ViewportManager {
    private canvas: HTMLCanvasElement
    private scale = 1;
    private offsetX = 0;
    private offsetY = 0;

    // 缩放限制
    private minScale = 0.02;
    private maxScale = 16;

    // 事件监听器
    private listeners: Array<(state: ViewportState) => void> = [];

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas
    }

    /**
     * 缩放方法
     * @param delta 缩放增量（正数放大，负数缩小）
     * @param centerX 缩放中心点X坐标
     * @param centerY 缩放中心点Y坐标
     */
    zoomDelta(delta: number, centerX: number, centerY: number) {
        if (delta === 0) return;
        const oldScale = this.scale;

        let scaleFactor: number;

        if (delta > 0) {
            // 放大：缩放因子随当前缩放级别动态调整
            // 在较小缩放级别时使用较大的缩放步长，在较大缩放级别时使用较小的步长
            const dynamicFactor = 1.04 + (this.scale - 1) * 0.006;
            scaleFactor = Math.pow(Math.max(1.04, dynamicFactor), Math.abs(delta));
        } else {
            // 缩小：使用相应的反向缩放
            const dynamicFactor = 1.04 + (this.scale - 1) * 0.006;
            scaleFactor = 1 / Math.pow(Math.max(1.04, dynamicFactor), Math.abs(delta));
        }

        // 计算新的缩放比例
        const newScale = Math.max(
            this.minScale,
            Math.min(this.maxScale, this.scale * scaleFactor)
        );

        if (Math.abs(newScale - this.scale) < 0.001) return; // 变化太小则返回

        // 计算缩放前的世界坐标
        const worldX = (centerX - this.offsetX) / oldScale;
        const worldY = (centerY - this.offsetY) / oldScale;

        // 更新缩放比例
        this.scale = newScale;

        // 调整偏移量，使缩放中心保持不变
        this.offsetX = centerX - worldX * this.scale;
        this.offsetY = centerY - worldY * this.scale;

        // 通知状态变化
        this.notifyStateChange();
    }

    /**
     * 缩放方法
     * @param scale 缩放比例
     * @param centerX 缩放中心点X坐标
     * @param centerY 缩放中心点Y坐标
     */
    zoom(scale: number, centerX: number, centerY: number) {
        const oldScale = this.scale;

        // 计算新的缩放比例
        const newScale = Math.max(
            this.minScale,
            Math.min(this.maxScale, scale)
        );

        if (newScale === this.scale) return; // 没有变化则返回

        // 计算缩放前的世界坐标
        const worldX = (centerX - this.offsetX) / oldScale;
        const worldY = (centerY - this.offsetY) / oldScale;

        // 更新缩放比例
        this.scale = newScale;

        // 调整偏移量，使缩放中心保持不变
        this.offsetX = centerX - worldX * this.scale;
        this.offsetY = centerY - worldY * this.scale;

        // 通知状态变化
        this.notifyStateChange();
    }

    /**
     * 平移方法
     * @param deltaX X轴平移距离
     * @param deltaY Y轴平移距离
     */
    pan(deltaX: number, deltaY: number) {
        if (deltaX === 0 && deltaY === 0) return;
        this.offsetX += deltaX;
        this.offsetY += deltaY;

        // 通知状态变化
        this.notifyStateChange();
    }

    /**
     * 重置视口到初始状态
     */
    reset() {
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.notifyStateChange();
    }

    /**
     * 适应画布大小（将所有内容缩放到可见区域）
     * @param canvasWidth 画布宽度
     * @param canvasHeight 画布高度
     * @param contentBounds 内容边界 {x, y, width, height}
     */
    fitToContent(canvasWidth: number, canvasHeight: number, contentBounds: { x: number, y: number, width: number, height: number }) {
        if (contentBounds.width === 0 || contentBounds.height === 0) return;

        // 计算缩放比例，留出一些边距
        const padding = 50;
        const scaleX = (canvasWidth - padding * 2) / contentBounds.width;
        const scaleY = (canvasHeight - padding * 2) / contentBounds.height;
        const scale = Math.min(scaleX, scaleY, this.maxScale);

        // 计算居中偏移
        this.scale = Math.max(this.minScale, scale);
        this.offsetX = (canvasWidth - contentBounds.width * this.scale) / 2 - contentBounds.x * this.scale;
        this.offsetY = (canvasHeight - contentBounds.height * this.scale) / 2 - contentBounds.y * this.scale;

        this.notifyStateChange();
    }
    /**
     * 获取当前视口状态
     */
    getState(): ViewportState {
        return {
            scale: this.scale,
            x: -this.offsetX / this.scale,  // 视口左上角的世界坐标
            y: -this.offsetY / this.scale,  // 视口左上角的世界坐标
            width: (this.canvas.width / devicePixelRatio) / this.scale,
            height: (this.canvas.height / devicePixelRatio) / this.scale,
        };
    }

    /**
     * 屏幕坐标转世界坐标
     * @param screenX 屏幕X坐标
     * @param screenY 屏幕Y坐标
     */
    screenToWorld(screenX: number, screenY: number): { x: number, y: number } {
        return {
            x: (screenX - this.offsetX) / this.scale,
            y: (screenY - this.offsetY) / this.scale
        };
    }

    /**
     * 世界坐标转屏幕坐标
     * @param worldX 世界X坐标
     * @param worldY 世界Y坐标
     */
    worldToScreen(worldX: number, worldY: number): { x: number, y: number } {
        return {
            x: worldX * this.scale + this.offsetX,
            y: worldY * this.scale + this.offsetY
        };
    }

    /**
     * 设置缩放限制
     * @param minScale 最小缩放比例
     * @param maxScale 最大缩放比例
     */
    setScaleLimits(minScale: number, maxScale: number) {
        this.minScale = Math.max(0.01, minScale);
        this.maxScale = Math.max(this.minScale, maxScale);

        // 确保当前缩放在限制范围内
        this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale));
        this.notifyStateChange();
    }

    /**
     * 添加状态变化监听器
     * @param listener 监听器函数
     */
    addStateChangeListener(listener: (state: ViewportState) => void) {
        this.listeners.push(listener);
    }

    /**
     * 移除状态变化监听器
     * @param listener 要移除的监听器函数
     */
    removeStateChangeListener(listener: (state: ViewportState) => void) {
        const index = this.listeners.indexOf(listener);
        if (index > -1) {
            this.listeners.splice(index, 1);
        }
    }

    /**
     * 通知所有监听器状态已变化
     */
    private notifyStateChange() {
        const state = this.getState();
        setViewportState({
            scale: state.scale,
            x: state.x,
            y: state.y,
            width: state.width,
            height: state.height,
            transformMatrix: new Float32Array([this.scale, 0, this.offsetX, 0, this.scale, this.offsetY, 0, 0, 1])
        })
        this.listeners.forEach(listener => listener(state));
    }

    /**
     * 获取缩放限制
     */
    getScaleLimits(): { min: number, max: number } {
        return {
            min: this.minScale,
            max: this.maxScale
        };
    }

    /**
     * 判断是否可以继续放大
     */
    canZoomIn(): boolean {
        return this.scale < this.maxScale;
    }

    /**
     * 判断是否可以继续缩小
     */
    canZoomOut(): boolean {
        return this.scale > this.minScale;
    }
}
