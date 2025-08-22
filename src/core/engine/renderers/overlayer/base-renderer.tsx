import type { SceneNode } from '@/core/models';
import { useNodeState } from '@/store/node';
import { useViewportState } from '@/store/viewport';

/**
 * 元素渲染器接口
 */
export interface IElementRenderer {
    /**
     * 判断是否可以渲染该元素
     */
    canRender(element: SceneNode): boolean;

    /**
     * 渲染元素
     */
    render(node: SceneNode): React.ReactNode;
}

/**
 * 覆盖层渲染器抽象类
 */
export abstract class OverlayerBaseRenderer implements IElementRenderer {
    abstract canRender(node: SceneNode): boolean;
    abstract renderShape(node: SceneNode): React.ReactNode;

    render(node: SceneNode): React.ReactNode {
        return <BaseRenderer node={node}>
            {this.renderShape(node)}
        </BaseRenderer>;
    }
}

const BaseRenderer = (props: { node: SceneNode, children: React.ReactNode }) => {
    const { node, children } = props;
    useNodeState('transformState')
    const scale = useViewportState('scale');
    const tm = useViewportState('transformMatrix'); // [a, c, tx, b, d, ty, 0, 0, 1]
    const tx = tm[2];
    const ty = tm[5];
    const m6 = node.matrix; // [a, b, c, d, e, f]
    const a = m6[0] * scale;
    const b = m6[1] * scale;
    const c = m6[2] * scale;
    const d = m6[3] * scale;
    const e = m6[4] * scale + tx;
    const f = m6[5] * scale + ty;
    const matrix = `matrix(${a}, ${b}, ${c}, ${d}, ${e}, ${f})`;

    return <div
        key={node.id}
        className="pointer-events-auto"
        style={{
            position: 'absolute',
            transform: matrix,
            transformOrigin: "left top",
            width: node.width,
            height: node.height,
        }}
    >
        {children}
    </div>
}