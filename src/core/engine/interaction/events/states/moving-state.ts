import type { EventStateHandler } from '../event-state-handler';
import { BaseState } from './state';
import { getSelectionState, setSelectionState, updateSelectionBoxs } from '@/store/selection';
import { findById, getProjectState, getRootNode } from '@/store/project';
import { CollisionDetector } from '@/core/engine/collision';

/**
 * 移动状态 - 当用户选中一个元素并拖动时进入此状态。
 */
export class MovingState extends BaseState {
    // 上一次鼠标在世界坐标系中的位置
    private lastWorldX = 0;
    private lastWorldY = 0;
    private isMoveTriggered = false;

    constructor(context: EventStateHandler) {
        super(context);
    }

    /**
     * 进入移动状态。
     * @param initialEvent 触发状态切换的鼠标事件，用于获取初始位置。
     */
    enter(initialEvent: MouseEvent): void {
        const moveInfo = getSelectionState('moveInfo')
        if (!moveInfo) {
            console.error('Moving State Exception')
            this.exit()
            return;
        }
        // 获取初始的世界坐标
        const initialWorldCoords = this.context.getWorldCoordinates(initialEvent.clientX, initialEvent.clientY);
        this.lastWorldX = initialWorldCoords.x;
        this.lastWorldY = initialWorldCoords.y;
        this.isMoveTriggered = false;
    }

    /**
     * 退出移动状态，恢复鼠标样式。
     */
    exit(): void {
        this.context.canvas.style.cursor = 'default';
    }

    /**
     * 处理鼠标移动，计算位移并更新节点位置。
     */
    onMouseMove(event: MouseEvent): void {
        event.preventDefault();

        // 获取当前的世界坐标
        const currentWorldCoords = this.context.getWorldCoordinates(event.clientX, event.clientY);

        // 计算在世界坐标系中的位移增量
        const deltaX = currentWorldCoords.x - this.lastWorldX;
        const deltaY = currentWorldCoords.y - this.lastWorldY;

        // 判断是否触发移动
        if (Math.abs(deltaX) >= 2 || Math.abs(deltaY) >= 2) {
            this.isMoveTriggered = true;
        }

        // 如果未触发移动，不更新节点位置
        if (!this.isMoveTriggered) return;

        // 更新选框 | 节点位置
        this.updatePosition(deltaX, deltaY);

        // 保存当前位置，用于下一次计算
        this.lastWorldX = currentWorldCoords.x;
        this.lastWorldY = currentWorldCoords.y;
    }

    /**
     * 处理鼠标松开，切换回空闲状态。
     */
    onMouseUp(event: MouseEvent): void {
        event.preventDefault();
        // 如果未触发移动，更新节点选中
        if (!this.isMoveTriggered) {
            const sceneTree = getProjectState('sceneTree');
            const point = this.context.getWorldCoordinates(event.clientX, event.clientY);
            const node = CollisionDetector.findHit(point, sceneTree.root.children)
            const ids = new Set<string>();
            if (node?.id) ids.add(node.id)
            setSelectionState({ ids })
            // 切换回空闲状态
            this.context.transitionTo(this.context.states.idle);
            return;
        }
        // 更新选框计算
        const ids = getSelectionState('ids')
        updateSelectionBoxs(ids)
        // 切换回空闲状态
        this.context.transitionTo(this.context.states.idle);
    }


    private updatePosition(deltaX: number, deltaY: number) {
        const moveInfo = getSelectionState('moveInfo')
        // 更新节点位置
        if (moveInfo?.type === 'id') {
            const node = findById(moveInfo.value as string)
            node?.translate(deltaX, deltaY);
        }
        // 更新选框内节点位置
        if (moveInfo?.type === 'selection-box') {
            const ids = getSelectionState('ids')
            const rootNode = getRootNode()
            const selectionNodes = rootNode.children.filter(item => ids.has(item.id))
            for (const item of selectionNodes) {
                item.translate(deltaX, deltaY)
            }
            setSelectionState({
                selectionBoxs: []
            })
        }
    }
}