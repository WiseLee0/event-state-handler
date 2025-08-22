import type { SceneTree } from '@/core/models';
import type { IElementRenderer } from './base-renderer';
import { CardRenderer } from './card-renderer';

/**
 * 覆盖层渲染器工厂
 * 负责根据元素类型返回对应的渲染器
 */
export class OverlayerRendererFactory {
    static renderers: IElementRenderer[] = [
        new CardRenderer(),
    ];

    /**
     * 获取元素对应的渲染器
     */
    static getRenderer(sceneTree: SceneTree) {
        if (!sceneTree) return [];
        const reactNodes: React.ReactNode[] = [];
        sceneTree.root.children.forEach(node => {
            OverlayerRendererFactory.renderers.forEach(item => {
                if (item.canRender(node)) {
                    reactNodes.push(item.render(node))
                }
            })
        })
        return reactNodes;
    }
}