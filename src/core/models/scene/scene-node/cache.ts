// cache.ts - 统一管理 NodeCacheManager 使用的脏键，避免魔法字符串

export enum DirtyFlag {
    Matrix = 'matrix',
    Width = 'width',
    Height = 'height',
    Rotation = 'rotation',
    AbsoluteMatrix = 'absoluteMatrix',
    Parent = 'parent',
    Children = 'children',
    BoundingBox = 'boundingBox',
    StrokeBox = 'strokeBox',
    RenderBox = 'renderBox',
    StrokePath = 'strokePath',
    ArcData = 'arcData',
}


/**
 * 缓存依赖关系配置
 * key: 缓存键名
 * value: 该缓存依赖的属性列表
 */
const CACHE_DEPENDENCIES: Record<string, string[]> = {
    [DirtyFlag.AbsoluteMatrix]: [DirtyFlag.Matrix, DirtyFlag.Parent],
    [DirtyFlag.BoundingBox]: [DirtyFlag.AbsoluteMatrix, DirtyFlag.Width, DirtyFlag.Height, DirtyFlag.Children],
    [DirtyFlag.Rotation]: [DirtyFlag.Matrix],
    [DirtyFlag.StrokePath]: [DirtyFlag.Width, DirtyFlag.Height, DirtyFlag.ArcData],
    [DirtyFlag.StrokeBox]: [DirtyFlag.BoundingBox],
    [DirtyFlag.RenderBox]: [DirtyFlag.StrokeBox],
};

/**
 * 节点缓存管理器
 * 负责管理节点的各种缓存属性，提供自动失效机制
 */
export class NodeCacheManager {
    private cache = new Map<string, any>();
    private dirtyFlags = new Set<string>();
    private dependencyMap: Map<string, Set<string>> | null = null;

    /**
     * 获取缓存值，如果缓存失效则重新计算
     * @param key 缓存键
     * @param computer 计算函数
     * @returns 缓存值
     */
    get<T>(key: string, computer: (oldValue?: any) => T): T {
        if (this.isCacheDirty(key)) {
            const value = computer(this.cache.get(key));
            this.cache.set(key, value);
            this.clearDirtyFlag(key);
            return value;
        }
        return this.cache.get(key);
    }

    /**
     * 标记依赖项为脏状态
     * @param dependency 依赖项名称
     */
    markDirty(dependency: string): void {
        this.dirtyFlags.add(dependency);

        // 立即清除相关缓存，避免微任务开销
        this.clearDependentCachesImmediate(dependency);
    }

    /**
     * 立即清除依赖指定属性的所有缓存
     * @param dependency 依赖项名称
     */
    private clearDependentCachesImmediate(dependency: string): void {
        // 使用静态缓存映射表，避免重复计算
        const dependentCaches = this.getCachedDependentCaches(dependency);

        // 直接删除相关缓存，不使用递归
        for (const cacheKey of dependentCaches) {
            this.cache.delete(cacheKey);
        }
    }

    /**
     * 获取依赖指定属性的所有缓存键
     * @param dependency 依赖项名称
     * @returns 依赖该属性的所有缓存键（包括间接依赖）
     */
    private getCachedDependentCaches(dependency: string): Set<string> {
        // 使用静态映射表缓存依赖关系，避免重复计算
        if (!this.dependencyMap) {
            this.buildDependencyMap();
        }

        return this.dependencyMap!.get(dependency) || new Set();
    }

    /**
     * 构建完整的依赖关系映射表（包括间接依赖）
     */
    private buildDependencyMap(): void {
        this.dependencyMap = new Map();

        // 为每个依赖项构建完整的依赖缓存集合
        const allDependencies = new Set<string>();
        Object.values(CACHE_DEPENDENCIES).forEach(deps =>
            deps.forEach(dep => allDependencies.add(dep))
        );

        for (const dependency of allDependencies) {
            const dependentCaches = new Set<string>();
            this.collectAllDependentCaches(dependency, dependentCaches, new Set());
            this.dependencyMap.set(dependency, dependentCaches);
        }
    }

    /**
     * 递归收集所有依赖指定属性的缓存键（包括间接依赖）
     * @param dependency 依赖项名称
     * @param result 结果集合
     * @param visited 已访问的缓存键，防止循环依赖
     */
    private collectAllDependentCaches(
        dependency: string,
        result: Set<string>,
        visited: Set<string>
    ): void {
        for (const [cacheKey, deps] of Object.entries(CACHE_DEPENDENCIES)) {
            if (deps.includes(dependency) && !visited.has(cacheKey)) {
                result.add(cacheKey);
                visited.add(cacheKey);

                // 递归收集依赖当前缓存键的其他缓存
                this.collectAllDependentCaches(cacheKey, result, visited);
            }
        }
    }

    /**
     * 清除所有缓存
     */
    clearAll(): void {
        this.cache.clear();
        this.dirtyFlags.clear();
        this.dependencyMap = null;
    }

    /**
     * 检查缓存是否需要重新计算
     * @param key 缓存键
     * @returns 是否为脏状态
     */
    private isCacheDirty(key: string): boolean {
        // 如果缓存不存在，需要计算
        if (!this.cache.has(key)) {
            return true;
        }

        // 检查依赖项是否有变化
        const deps = CACHE_DEPENDENCIES[key] || [];
        return deps.some(dep => this.dirtyFlags.has(dep));
    }

    /**
     * 清除与指定缓存相关的脏标记
     * @param key 缓存键
     */
    private clearDirtyFlag(key: string): void {
        const deps = CACHE_DEPENDENCIES[key] || [];
        deps.forEach(dep => this.dirtyFlags.delete(dep));
    }

    /**
     * 获取当前缓存状态（调试用）
     */
    getDebugInfo(): { cacheKeys: string[], dirtyFlags: string[] } {
        return {
            cacheKeys: Array.from(this.cache.keys()),
            dirtyFlags: Array.from(this.dirtyFlags)
        };
    }
}