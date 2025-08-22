import type { Canvas, CanvasKit } from "canvaskit-wasm";
import { GhostRenderer } from "./ghost-renderer";
import { SelectionRenderer } from "./selection-renderer";
import { HoverRenderer } from "./hover-renderer";
import type { ISelectionRenderer } from "./type";

/**
 * 选择框渲染器工厂
 */
export class SelectionRendererFactory {
    private renderers: ISelectionRenderer[] = [
        new GhostRenderer(),
        new HoverRenderer(),
        new SelectionRenderer(),
    ];

    execute(CK: CanvasKit, canvas: Canvas): void {
        this.renderers.forEach(renderer => {
            if (renderer.canRender()) {
                renderer.render(CK, canvas)
            }
        })
    }

    dispose(): void {
        this.renderers.forEach(r => r.dispose && r.dispose());
    }
}