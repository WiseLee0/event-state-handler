import { CanvasRenderer } from "@/core/engine";
import { SceneTree } from "@/core/models";
import { useHotKey } from "@/hooks/useHotKey";
import { getProjectState, setProjectState } from "@/store/project";
import { useEffect } from "react";
import "./index.css";
import { usePageState } from "@/store/page";

export const MainCanvas = () => {
  const pageFillPaint = usePageState("fillPaint");
  useHotKey();
  useEffect(() => {
    const elements = getProjectState("mockElements");
    const sceneTree = new SceneTree();
    sceneTree.build(elements);
    CanvasRenderer.init(sceneTree).then((props) => {
      setProjectState({
        sceneTree,
        CK: props?.canvasKit,
        surface: props?.surface,
      });
    });
    return () => {
      CanvasRenderer.destroy();
    }
  }, []);

  return (
    <canvas
      id={"main-canvas"}
      className={
        pageFillPaint.color[3] !== 1 || !pageFillPaint.visible
          ? "checkerboard"
          : "default-canvas"
      }
    />
  );
};
