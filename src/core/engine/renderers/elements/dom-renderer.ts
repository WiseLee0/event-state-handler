import type { CanvasKit, Canvas, Paint } from 'canvaskit-wasm';
import type { SceneNode } from '@/core/models';
import { BaseRenderer } from './base-renderer';
import { getViewportState } from '@/store/viewport';

/**
 * DOM渲染器
 */
export class DOMCardRenderer extends BaseRenderer {
    canRender(node: SceneNode): boolean {
        return node.type.startsWith('DOM');
    }

    renderShape(_canvasKit: CanvasKit, _canvas: Canvas, _node: SceneNode, _paint: Paint): void {
        // 获取 DOM 覆盖层容器
        const overlay = document.getElementById('dom-overlay');
        if (!overlay) return;

        // 为每个节点创建或复用一个对应的 DOM 容器
        const id = `dom-node-${_node.id}`;
        let el = document.getElementById(id) as HTMLDivElement | null;
        if (!el) {
            el = document.createElement('div');
            el.id = id;
            el.style.position = 'absolute';
            el.style.top = '0px';
            el.style.left = '0px';
            el.style.transformOrigin = '0 0';
            el.style.pointerEvents = 'auto';
            overlay.appendChild(el);
            // 这里你可以用 ReactDOM 在 el 上挂载你的 React 组件
            // 例如：
            // const root = createRoot(el); root.render(<YourComponent node={_node} />);
        }

        const view = getViewportState('transformMatrix'); // 3x3
        const world = toMat3(_node.getAbsoluteMatrix());  // 3x3
        const m = multiply3x3(view, world);               // 3x3

        const [a, b, c, d, e, f] = [m[0], m[3], m[1], m[4], m[2], m[5]];
        el.style.transform = `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;

        // 设置元素大小（局部尺寸）
        el.style.width = `${_node.width}px`;
        el.style.height = `${_node.height}px`;
    }
}

function toMat3(m6: number[]): number[] {
    return [m6[0], m6[2], m6[4], m6[1], m6[3], m6[5], 0, 0, 1];
}

function multiply3x3(A: ArrayLike<number>, B: ArrayLike<number>): number[] {
    const out = new Array(9).fill(0);
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            out[r * 3 + c] = A[r * 3 + 0] * B[0 * 3 + c]
                           + A[r * 3 + 1] * B[1 * 3 + c]
                           + A[r * 3 + 2] * B[2 * 3 + c];
        }
    }
    return out;
}