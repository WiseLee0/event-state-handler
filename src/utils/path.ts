import type { SceneNode } from "@/core/models";
import { getProjectState } from "@/store/project";

// 计算节点描边路径
export const computeStrokePath = (node: SceneNode) => {
    const CK = getProjectState('CK');
    if (node.type === 'RECTANGLE') {
        const path = new CK.Path();
        path.addRect([0, 0, node.width, node.height])
        return path;
    }
    return new CK.Path();
}
