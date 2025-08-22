import type { DesignElement, Vector2d } from '@/core/types';
import type { SceneNode } from './scene-node';
import type { BoundingBox } from '@/core/engine/collision';
import { hitMatrixNodeTest } from '@/utils/hit-test';

/** 命中测试策略集合 */
export const hitPointStrategies: Record<DesignElement['type'], (pt: Vector2d, node: SceneNode) => boolean> = {
  RECTANGLE: (p, n) => p.x >= 0 && p.x <= n.width && p.y >= 0 && p.y <= n.height,
  ROOT: () => false,
  DOM_CARD: (p, n) => p.x >= 0 && p.x <= n.width && p.y >= 0 && p.y <= n.height,
};

export const hitGhostStrategies: Record<DesignElement['type'], (box: BoundingBox, node: SceneNode) => boolean> = {
  RECTANGLE: (box, node) => {
    return hitMatrixNodeTest({ matrix: [1, 0, 0, 1, box.x, box.y], width: box.width, height: box.height }, {
      matrix: node.getAbsoluteMatrix(),
      width: node.width,
      height: node.height
    })
  },
  ROOT: () => false,
  DOM_CARD: (box, node) => {
    return hitMatrixNodeTest({ matrix: [1, 0, 0, 1, box.x, box.y], width: box.width, height: box.height }, {
      matrix: node.getAbsoluteMatrix(),
      width: node.width,
      height: node.height
    })
  },
}
