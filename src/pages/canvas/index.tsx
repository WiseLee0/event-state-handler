import { MainCanvas } from "@/components/canvas";
import { OverlayerRendererFactory } from "@/core/engine/renderers/overlayer/renderer-factory";
import { useProjectState } from "@/store/project";
export function CanvasPage() {

  return (
    <div id="canvas-contianer" className="w-screen h-screen" style={{ position: 'relative' }}>
      <MainCanvas />
      <Overlayer />
    </div>
  );
}

const Overlayer = () => {
  const sceneTree = useProjectState("sceneTree");
  return (
    <div id="dom-overlay" className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {OverlayerRendererFactory.getRenderer(sceneTree)}
    </div>
  );
}
