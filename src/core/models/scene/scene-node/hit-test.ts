// hit-test.ts - 命中检测相关的纯函数封装，避免 SceneNode 直接持有实现
import { hitGhostStrategies, hitPointStrategies } from '../hit-strategies';
import type { BoundingBox, Point } from '@/core/engine/collision';

export function hitTestPoint(
  pt: Point,
  node: any, // 这里使用 any 以避免导入 SceneNode 产生循环依赖
): boolean {
  const local = node.getAbsoluteTransform().invert().point(pt);
  const fn = (hitPointStrategies as any)[node.type];
  return fn ? fn(local, node) : false;
}

export function intersectsWithGhost(
  box: BoundingBox,
  node: any,
): boolean {
  const fn = (hitGhostStrategies as any)[node.type];
  return fn ? fn(box, node) : false;
}
