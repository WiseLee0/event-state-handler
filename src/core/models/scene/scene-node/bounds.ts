import type { Vector2d } from '@/core/types';
import { Transform } from '@/utils/transform';

export function getAABBFromTransform(t: Transform, width: number, height: number) {
  const corners: Vector2d[] = [
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ];

  const transformedCorners = corners.map(c => t.point(c));
  const xs = transformedCorners.map(c => c.x);
  const ys = transformedCorners.map(c => c.y);
  return {
    x: Math.min(...xs),
    y: Math.min(...ys),
    width: Math.max(...xs) - Math.min(...xs),
    height: Math.max(...ys) - Math.min(...ys),
  };
}
