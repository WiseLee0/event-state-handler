import { SceneNode } from "@/core/models/scene/scene-node";
import { getProjectState } from "@/store/project";
import { getViewportState } from "@/store/viewport";
import { hitMatrixNodeTest } from "@/utils/hit-test";

interface ViewportCache {
  viewport: {
    x: number;
    y: number;
    width: number;
    height: number;
    scale: number;
  };
  visibleNodes: SceneNode[];
  idSet: Set<string>;
}

/**
 * 视口剔除工具类
 * 用于判断元素是否在视口范围内，不在视口内的元素可以跳过处理
 * 支持缓存机制，当视口范围没有变化时复用缓存结果
 */
export class ViewportCulling {
  private static cache: ViewportCache | null = null;

  /**
   * 检查节点是否在视口范围外
   * @param node 场景节点
   * @returns true 表示节点在视口外，false 表示在视口内
   */
  private static isNodeOutsideViewport(node: SceneNode): boolean {
    if (node.type === "ROOT") return false;

    const viewport = getViewportState();
    const renderBox = node.getRenderBox();

    // 使用世界坐标系进行碰撞检测
    return !hitMatrixNodeTest(
      {
        matrix: [1, 0, 0, 1, viewport.x, viewport.y],
        width: viewport.width,
        height: viewport.height,
      },
      {
        matrix: [1, 0, 0, 1, renderBox.x, renderBox.y],
        width: renderBox.width,
        height: renderBox.height,
      }
    );
  }

  /**
   * 判断节点是否应该被剔除
   * @param node 场景节点
   * @returns true 表示应该剔除，false 表示应该渲染
   */
  static shouldCull(node: SceneNode): boolean {
    this.ensureCacheIsValid();
    return !this.cache!.idSet.has(node.id);
  }

  /**
   * 检查视口状态是否发生变化
   * @param currentViewport 当前视口状态
   * @returns true 表示视口发生了变化
   */
  private static isViewportChanged(currentViewport: any): boolean {
    if (!this.cache) return true;

    const { viewport: cached } = this.cache;
    return (
      cached.x !== currentViewport.x ||
      cached.y !== currentViewport.y ||
      cached.width !== currentViewport.width ||
      cached.height !== currentViewport.height ||
      cached.scale !== currentViewport.scale
    );
  }

  /**
   * 确保缓存是有效的，如果无效则重新构建
   */
  private static ensureCacheIsValid(): void {
    const viewport = getViewportState();
    if (!this.cache || this.isViewportChanged(viewport)) {
      this.rebuildCache();
    }
  }

  /**
   * 重新构建可见节点缓存
   */
  private static rebuildCache(): void {
    const viewport = getViewportState();
    const visibleNodes: SceneNode[] = [];
    const idSet = new Set<string>();

    this.collectVisibleNodes(
      getProjectState("sceneTree").root.children,
      visibleNodes,
      idSet
    );

    this.cache = {
      viewport: {
        x: viewport.x,
        y: viewport.y,
        width: viewport.width,
        height: viewport.height,
        scale: viewport.scale,
      },
      visibleNodes,
      idSet,
    };
  }

  /**
   * 递归收集视口内的可见节点
   * @param nodeList 节点列表
   * @param visibleNodes 收集的可见节点数组
   * @param idSet 可见节点ID集合
   */
  private static collectVisibleNodes(
    nodeList: SceneNode[],
    visibleNodes: SceneNode[],
    idSet: Set<string>
  ): void {
    for (const node of nodeList) {
      if (this.isNodeVisible(node)) {
        visibleNodes.push(node);
        idSet.add(node.id);
      }

      if (node.children?.length > 0) {
        this.collectVisibleNodes(node.children, visibleNodes, idSet);
      }
    }
  }

  /**
   * 检查节点是否可见（在视口内且visible属性为true）
   * @param node 场景节点
   * @returns true 表示节点可见
   */
  private static isNodeVisible(node: SceneNode): boolean {
    return !this.isNodeOutsideViewport(node) && node.visible;
  }

  /**
   * 获取当前视口内的所有可见节点
   * @returns 可见节点数组
   */
  static getVisibleNodes(): SceneNode[] {
    this.ensureCacheIsValid();
    return this.cache!.visibleNodes;
  }

  /**
   * 清除缓存
   */
  static clearCache(): void {
    this.cache = null;
  }
}
