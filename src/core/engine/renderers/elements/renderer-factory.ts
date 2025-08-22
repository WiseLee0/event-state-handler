import type { SceneNode } from '@/core/models';
import type { IElementRenderer } from './base-renderer';
import { RectangleRenderer } from './rectangle-renderer';

/**
 * 元素渲染器工厂
 * 负责根据元素类型返回对应的渲染器
 */
export class ElementRendererFactory {
    private renderers: IElementRenderer[] = [
        new RectangleRenderer(),
    ];

    /**
     * 获取元素对应的渲染器
     */
    getRenderer(node: SceneNode): IElementRenderer | null {
        return this.renderers.find(renderer => renderer.canRender(node)) || null;
    }
}