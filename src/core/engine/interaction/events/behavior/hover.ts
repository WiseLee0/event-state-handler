import { CollisionDetector, type Point } from "@/core/engine/collision";
import type { SceneNode } from "@/core/models";
import { getProjectState } from "@/store/project";
import { getSelectionState, setSelectionState } from "@/store/selection";
import type { EventStateHandler } from "../event-state-handler";

export class HoverBehavior {

    hoverHitTest(event: MouseEvent, context: EventStateHandler, filterNodes?: (nodes: SceneNode[]) => SceneNode[]) {
        const point = context.getWorldCoordinates(event.clientX, event.clientY);
        const node = this._hoverHitTest(point, filterNodes);
        return node;
    };

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