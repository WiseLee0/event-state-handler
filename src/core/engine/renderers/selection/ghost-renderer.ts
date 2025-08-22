import type { CanvasKit, Canvas, Paint } from 'canvaskit-wasm';
import { THEME_COLOR } from '@/core/constants/theme';
import { getSelectionState } from '@/store/selection';
import type { ISelectionRenderer } from './type';
import { getViewportState } from '@/store/viewport';

export class GhostRenderer implements ISelectionRenderer {
    private fillPaint?: Paint;
    private strokePaint?: Paint;
    private lastScale?: number;
    canRender(): boolean {
        const ghostBox = getSelectionState('ghostBox');
        return ghostBox[2] !== 0 && ghostBox[3] !== 0
    }

    render(CK: CanvasKit, canvas: Canvas): void {
        const scale = getViewportState('scale');
        const ghostBox = getSelectionState('ghostBox');
        if (!this.fillPaint) {
            this.fillPaint = new CK.Paint();
            this.fillPaint.setStyle(CK.PaintStyle.Fill);
        }
        if (!this.strokePaint) {
            this.strokePaint = new CK.Paint();
            this.strokePaint.setStyle(CK.PaintStyle.Stroke);
        }
        this.fillPaint.setColor(CK.Color(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2], 0.15));
        this.strokePaint.setColor(CK.Color(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2], 1));
        if (this.lastScale !== scale) {
            this.strokePaint.setStrokeWidth(1 / scale);
            this.lastScale = scale;
        }

        canvas.drawRect(CK.XYWHRect(...ghostBox), this.fillPaint);
        canvas.drawRect(CK.XYWHRect(...ghostBox), this.strokePaint);
    }

    dispose(): void {
        this.fillPaint?.delete?.();
        this.strokePaint?.delete?.();
        this.fillPaint = undefined;
        this.strokePaint = undefined;
    }
}