// transform.ts - 与 2D 仿射矩阵相关的纯函数工具
import { Transform } from '@/utils/transform';

// 围绕点旋转，保持缩放不变
export function rotateAroundPoint(
  node: any,
  deg: number,
  px: number,
  py: number,
): void {
  // 如果提供了旋转中心点，需要先平移到中心点，旋转，再平移回来
  const currentRotation = node.rotation;
  const deltaRotation = deg - currentRotation;

  if (Math.abs(deltaRotation) < 0.0001) return;

  // 创建旋转变换：平移到旋转中心 -> 旋转 -> 平移回来
  const rotationTransform = new Transform()
    .translate(px, py)
    .rotate(deltaRotation * Math.PI / 180)
    .translate(-px, -py);

  // 应用变换
  node._matrix.multiply(rotationTransform);
}
