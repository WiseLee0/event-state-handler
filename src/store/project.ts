import type { SceneTree } from "@/core/models";
import type { DesignElement } from "@/core/types";
import { createStoreUtils } from "@/utils/create-store";
import type { CanvasKit, Surface } from "canvaskit-wasm";

// 创建一些模拟数据
const mockElements: DesignElement[] = [
  {
    id: "0",
    type: "RECTANGLE",
    matrix: [1, 0, 0, 1, 10, 10],
    width: 100,
    height: 100,
    visible: true,
    fillPaints: [
      {
        type: 'SOLID',
        color: [1, 0, 0, 1],
        visible: true,
        blendMode: "NORMAL",
      },
    ],
  },
  {
    id: "1",
    type: "RECTANGLE",
    matrix: [1, 0, 0, 1, 120, 10],
    width: 100,
    height: 100,
    visible: true,
    fillPaints: [
      {
        type: 'SOLID',
        color: [1, 1, 0, 1],
        visible: true,
        blendMode: "NORMAL",
      },
    ],
  },
  {
    id: "2",
    type: "RECTANGLE",
    matrix: [1, 0, 0, 1, 10, 120],
    width: 100,
    height: 100,
    visible: true,
    fillPaints: [
      {
        type: 'SOLID',
        color: [0, 0, 1, 1],
        visible: true,
        blendMode: "NORMAL",
      },
    ],
  },
  {
    id: "3",
    type: "RECTANGLE",
    matrix: [1, 0, 0, 1, 120, 120],
    width: 100,
    height: 100,
    visible: true,
    fillPaints: [
      {
        type: 'SOLID',
        color: [0, 1, 1, 1],
        visible: true,
        blendMode: "NORMAL",
      },
    ],
  },
  {
    id: "4",
    type: "DOM_CARD",
    matrix: [1, 0, 0, 1, 400, 200],
    width: 300,
    height: 200,
    visible: true,
  },
];

interface ProjectState {
  mockElements: DesignElement[];
  sceneTree: SceneTree;
  CK: CanvasKit;
  surface: Surface;
}
const _projectState = {
  mockElements,
  sceneTree: null!,
  CK: null!,
  surface: null!,
};

export const {
  useStore: useProjectState,
  setState: setProjectState,
  getState: getProjectState,
} = createStoreUtils<ProjectState>(_projectState);

export const findById = (id: string) => {
  const sceneTree = getProjectState("sceneTree");
  return sceneTree.findById(id);
};

export const findByIds = (ids?: string[] | Set<string>) => {
  const sceneTree = getProjectState("sceneTree");
  return sceneTree.findByIds(ids);
};

export const getRootNode = () => {
  const sceneTree = getProjectState("sceneTree");
  return sceneTree.root;
};
