import { getSelectionState } from "@/store/selection";
import type { CanvasKit, Canvas, Paint } from "canvaskit-wasm";
import type { ISelectionRenderer } from "./type";
import { findById } from "@/store/project";
import { THEME_COLOR } from "@/core/constants/theme";
import { getViewportState } from "@/store/viewport";

export class HoverRenderer implements ISelectionRenderer {
    private hoverPaint?: Paint;
    private lastScale?: number;
    private mat9: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    canRender(): boolean {
        const hoverId = getSelectionState('hoverId');
        return Boolean(hoverId?.length)
    }

    render(CK: CanvasKit, canvas: Canvas): void {
        const scale = getViewportState('scale');
        const hoverId = getSelectionState('hoverId')!;
        const node = findById(hoverId);
        if (!node) return;
        canvas.save()
        if (!this.hoverPaint) {
            this.hoverPaint = new CK.Paint();
            this.hoverPaint.setStyle(CK.PaintStyle.Stroke);
        }
        const matrix = node.getAbsoluteMatrix()
        this.mat9[0] = matrix[0]; this.mat9[1] = matrix[2]; this.mat9[2] = matrix[4];
        this.mat9[3] = matrix[1]; this.mat9[4] = matrix[3]; this.mat9[5] = matrix[5];
        this.mat9[6] = 0; this.mat9[7] = 0; this.mat9[8] = 1;
        canvas.concat(this.mat9 as any)
        this.hoverPaint.setColor(CK.Color(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2], 1));
        if (this.lastScale !== scale) {
            this.hoverPaint.setStrokeWidth(2 / scale);
            this.lastScale = scale;
        }
        const path = node.getStrokePath();
        canvas.drawPath(path, this.hoverPaint);
        canvas.restore()
    }

    dispose(): void {
        this.hoverPaint?.delete?.();
        this.hoverPaint = undefined;
    }

}