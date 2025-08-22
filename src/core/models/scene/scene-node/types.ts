// types.ts - SceneNode 相关类型，抽离以减少循环依赖与魔法字符串

// 场景树接口，避免直接依赖 SceneNode 类型以降低循环依赖风险
export interface ISceneTree {
  markNodeDirty(node: unknown): void;
}

// 后续拆分各模块使用的统一内部状态描述（目前作为占位，便于逐步迁移）
export interface SceneNodeState {
  id: string;
  type: string;
  // 2D 变换矩阵（a,b,c,d,tx,ty）
  matrix: number[];
  width: number;
  height: number;
  visible: boolean;
  fillPaints: unknown[];
  arcData?: unknown;
  // 父子关系
  parent: unknown | null;
  children: unknown[];
}
