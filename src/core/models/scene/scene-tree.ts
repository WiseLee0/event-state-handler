import type { DesignElement } from '@/core/types';
import { SceneNode } from './scene-node';
import { ViewportCulling } from '@/core/engine/culling';

/**
 * 场景树管理类
 * 维护根节点并提供快速查找
 */
export class SceneTree {
    readonly root: SceneNode;
    private nodeMap: Map<string, SceneNode> = new Map();
    private sceneChangeCallback?: () => void;

    // 脏节点管理
    private dirtyNodes = new Set<SceneNode>();
    private flushScheduled = false;

    constructor() {
        const rootEl: DesignElement = {
            id: 'ROOT',
            type: 'ROOT',
            matrix: [1, 0, 0, 1, 0, 0],
            width: 0,
            height: 0,
            fillPaints: [],
            visible: true,
            children: [],
        };
        this.root = new SceneNode(rootEl);
        this.nodeMap.set(rootEl.id, this.root);
    }

    /**
     * 设置场景变化回调
     */
    onSceneChange(callback: () => void): void {
        this.sceneChangeCallback = callback;
        // 为根节点和所有现有节点设置场景树引用
        this.root.setSceneTree(this);
    }

    /**
     * 标记节点为脏状态
     */
    markNodeDirty(node: SceneNode): void {
        this.dirtyNodes.add(node);
        this.scheduleFlush();
    }

    /**
     * 调度刷新操作
     */
    private scheduleFlush(): void {
        if (!this.flushScheduled) {
            this.flushScheduled = true;
            // 在下一个微任务中执行，确保批量处理
            Promise.resolve().then(() => {
                this.flushChanges();
            });
        }
    }

    /**
     * 批量处理脏节点变化
     */
    private flushChanges(): void {
        if (this.dirtyNodes.size > 0) {
            this.notifySceneChange();
            this.dirtyNodes.clear();
        }
        this.flushScheduled = false;
    }

    /**
    /**
     * 触发场景变化回调
     */
    private notifySceneChange(): void {
        if (this.sceneChangeCallback) {
            this.sceneChangeCallback();
        }
    }

    /**
     * 根据元素数组重建场景树
     */
    build(elements: DesignElement[]) {
        // 移除根节点所有子节点
        this.root.removeChildren();
        const nodeMap: Map<string, SceneNode> = new Map();
        nodeMap.set(this.root.id, this.root);

        // 递归构建或复用
        for (const el of elements) {
            this.buildRecursive(el, this.root, nodeMap);
        }
        this.nodeMap = nodeMap;

        // 标记场景重建完成，触发变化通知
        this.markNodeDirty(this.root);

        // 清除视口剔除缓存
        ViewportCulling.clearCache();
    }

    private buildRecursive(el: DesignElement, parent: SceneNode, map: Map<string, SceneNode>) {
        // 创建节点
        const node = new SceneNode(el);

        // 设置场景树引用
        node.setSceneTree(this);

        parent.appendChild(node);
        map.set(node.id, node);

        // 递归处理子元素
        if (el.children?.length) {
            for (const child of el.children) {
                this.buildRecursive(child, node, map);
            }
        }
    }

    /** 通过 ID 查找单个节点 */
    findById(id: string): SceneNode | undefined {
        return this.nodeMap.get(id);
    }

    /** 批量查找节点 */
    findByIds(ids: string[] | Set<string> = []): SceneNode[] {
        const result = []
        for (const id of ids) {
            const node = this.nodeMap.get(id)
            if (node) result.push(node);
        }
        return result
    }
}
