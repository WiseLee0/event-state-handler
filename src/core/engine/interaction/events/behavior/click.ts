import { CollisionDetector, type Point } from "@/core/engine/collision";
import type { SceneNode } from "@/core/models";
import { getProjectState } from "@/store/project";
import { getSelectionState, setSelectionState } from "@/store/selection";
import type { EventStateHandler } from "../event-state-handler";
import { hitMatrixNodeTest } from "@/utils/hit-test";

export class ClickBehavior {
    hitTest(event: MouseEvent, context: EventStateHandler, filterNodes?: (nodes: SceneNode[]) => SceneNode[]) {
        const point = context.getWorldCoordinates(event.clientX, event.clientY);
        const isHit = this._downHitTest(point, filterNodes)
        return isHit;
    };

    private _downHitTest(point: Point, filterNodes?: (nodes: SceneNode[]) => SceneNode[]) {
        const selectionBoxs = getSelectionState('selectionBoxs');
        // 先对选中框进行碰撞检测
        for (let i = 0; i < selectionBoxs.length; i++) {
            const selectionBox = selectionBoxs[i]
            const isHit = hitMatrixNodeTest({ matrix: [1, 0, 0, 1, point.x, point.y], width: 1, height: 1 }, selectionBox)
            if (isHit) {
                setSelectionState({
                    moveInfo: {
                        type: 'selection-box',
                        value: i
                    }
                })
                return true
            }
        }
        // 在对元素进行碰撞检测
        const node = this._hoverHitTest(point, filterNodes)
        if (node?.id) {
            setSelectionState({
                moveInfo: {
                    type: 'id',
                    value: node.id
                },
                ids: new Set([node.id]),
                selectionBoxs: [],
                hoverId: node.id
            })
            return true
        }

        // 什么都没命中
        setSelectionState({
            moveInfo: null
        })
        return false
    }

    private _hoverHitTest(point: Point, filterNodes?: (nodes: SceneNode[]) => SceneNode[]): SceneNode | null {
        const sceneTree = getProjectState('sceneTree')
        const nodes = filterNodes ? filterNodes(sceneTree.root.children) : sceneTree.root.children;
        const node = CollisionDetector.findHit(point, nodes) as SceneNode;
        const ids = getSelectionState('ids');
        // hover元素不能在选择框内
        if (node?.id && ids.size > 1 && ids.has(node.id)) {
            setSelectionState({ hoverId: null })
            return null;
        }
        setSelectionState({
            hoverId: node?.id || null
        })
        return node || null
    }
}