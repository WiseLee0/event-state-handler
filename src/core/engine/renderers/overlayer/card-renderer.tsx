import { Card } from "antd";
import { OverlayerBaseRenderer } from "./base-renderer";
import type { SceneNode } from '@/core/models';
import { useState } from "react";

export class CardRenderer extends OverlayerBaseRenderer {
    canRender(node: SceneNode): boolean {
        return node.type.startsWith('DOM');
    }

    renderShape(_node: SceneNode): React.ReactNode {
        return <CardRenderShape />;
    }

}


const CardRenderShape = () => {
    const [content, setContent] = useState(Array.from({ length: 10 }, (_, i) => `Card content ${i}`));

    return <Card
        title="Default size card"
        extra={<a data-button="true" onClick={() => {
            setContent(['Card content'])
        }}>reset content</a>}
        style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
        <div style={{ overflowY: 'auto', flex: 1, height: '100px' }} onWheel={(e) => {
            // 阻止事件冒泡到画布状态机，避免触发画布缩放/平移
            e.stopPropagation();
        }}>
            {content.map((item, index) => <p key={index}>{item}</p>)}
        </div>
    </Card>
}