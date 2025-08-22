import { setSelectionState } from '@/store/selection';
import type { EventStateHandler } from '../event-state-handler';
import { BaseState } from './state';
import { markRenderDirty } from '@/core/engine/renderers';
import { getViewportState } from '@/store/viewport';
import type { XYWH } from '@/core/types';
import { CollisionDetector } from '@/core/engine/collision';
import { ViewportCulling } from '@/core/engine/culling';

/**
 * 框选状态 - 当用户在画布上按住左键拖动时进入此状态。
 */
export class SelectingState extends BaseState {
    private startX = 0;
    private startY = 0;
    private selecting = false;
    private event: MouseEvent | null = null;

    constructor(context: EventStateHandler) {
        super(context);
    }

    /**
     * 进入选择状态
     * @param event 触发状态切换的鼠标事件，用于获取初始位置
     */
    enter(event: MouseEvent): void {
        const { canvas, viewportManager } = this.context;
        const rect = canvas.getBoundingClientRect();
        this.startX = event.clientX - rect.left;
        this.startY = event.clientY - rect.top;
        const pos = viewportManager.screenToWorld(this.startX, this.startY)
        setSelectionState({
            ghostBox: [pos.x, pos.y, 0, 0]
        })

        // 判断是否超越边界或者接近边界
        this.selecting = true
        this.event = event
        this._nearOrBeyondBoundary(rect)
        markRenderDirty()
    }

    /**
     * 退出选择状态，隐藏选择框
     */
    exit(): void {
        this.selecting = false
        this.event = null;
        setSelectionState({
            ghostBox: [0, 0, 0, 0]
        })
    }

    onMouseMove(event: MouseEvent): void {
        this.event = event
        markRenderDirty()
    }


    /**
     * 处理鼠标松开，执行选择逻辑并切换回空闲状态
     */
    onMouseUp(event: MouseEvent): void {
        event.preventDefault();
        this.event = event
        this.context.transitionTo(this.context.states.idle);
        markRenderDirty()
    }

    /**
     * 判断是否接近边界或者超越边界
     */
    private _nearOrBeyondBoundary(rect: DOMRect) {
        const scale = getViewportState('scale');
        const run = () => {
            if (!this.selecting || !this.event) return;
            const { viewportManager } = this.context;
            const currentX = this.event.clientX - rect.left;
            const currentY = this.event.clientY - rect.top;

            const width = Math.abs(currentX - this.startX);
            const height = Math.abs(currentY - this.startY);
            const left = Math.min(currentX, this.startX);
            const top = Math.min(currentY, this.startY);

            const pos = viewportManager.screenToWorld(left, top)
            const ghostBox = [pos.x, pos.y, width / scale, height / scale] as XYWH
            setSelectionState({
                ghostBox
            })

            // 如果框选接近或者超越边界，则移动画布
            let deltaX = 0;
            let deltaY = 0;

            if (left + width > rect.width - 10) {
                deltaX = -5
            } else if (left < 10) {
                deltaX = 5
            }

            if (top + height > rect.height - 10) {
                deltaY = -5
            } else if (top < 10) {
                deltaY = 5
            }

            this.context.viewportManager.pan(deltaX, deltaY);
            this._hitTest(ghostBox)
            requestAnimationFrame(run)
        }
        requestAnimationFrame(run)
    }

    /**
     * 框选碰撞检测
     * 使用视口剔除优化，只对视口内的元素进行碰撞检测
     */
    private _hitTest(box: XYWH) {
        const boundingBox = {
            x: box[0],
            y: box[1],
            width: box[2],
            height: box[3]
        }

        // 先过滤掉视口外的节点，减少碰撞检测的计算量
        const visibleNodes = ViewportCulling.getVisibleNodes();
        const nodes = CollisionDetector.findIntersecting(boundingBox, visibleNodes);
        const ids = new Set<string>();
        nodes.forEach(item => ids.add(item.id))
        setSelectionState({ ids })
    }
}