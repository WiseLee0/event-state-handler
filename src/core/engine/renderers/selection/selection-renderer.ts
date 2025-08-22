import type { CanvasKit, Canvas, Paint } from 'canvaskit-wasm';
import { THEME_COLOR } from '@/core/constants/theme';
import { type XYWH } from '@/core/types';
import { getSelectionState } from '@/store/selection';
import type { ISelectionRenderer } from './type';
import { getViewportState } from '@/store/viewport';
import { findByIds } from '@/store/project';

export class SelectionRenderer implements ISelectionRenderer {
    // Cached paints and temp buffers to reduce per-frame allocations
    private strokePaint?: Paint;
    private cornerStrokePaint?: Paint;
    private cornerFillPaint?: Paint;
    private lastScale?: number;
    private mat9: number[] = [1, 0, 0, 0, 1, 0, 0, 0, 1];
    canRender(): boolean {
        const selectionBoxs = getSelectionState('selectionBoxs');
        return selectionBoxs?.length > 0
    }

    render(CK: CanvasKit, canvas: Canvas): void {
        const scale = getViewportState('scale');
        const selectionBoxs = getSelectionState('selectionBoxs');
        if (!this.strokePaint) {
            this.strokePaint = new CK.Paint();
            this.strokePaint.setStyle(CK.PaintStyle.Stroke);
        }
        if (!this.cornerStrokePaint) {
            this.cornerStrokePaint = new CK.Paint();
            this.cornerStrokePaint.setStyle(CK.PaintStyle.Stroke);
        }
        if (!this.cornerFillPaint) {
            this.cornerFillPaint = new CK.Paint();
            this.cornerFillPaint.setStyle(CK.PaintStyle.Fill);
            this.cornerFillPaint.setColor(CK.Color(255, 255, 255, 1));
        }
        this.strokePaint.setColor(CK.Color(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2], 1));
        this.cornerStrokePaint.setColor(CK.Color(THEME_COLOR[0], THEME_COLOR[1], THEME_COLOR[2], 1));
        if (this.lastScale !== scale) {
            this.strokePaint.setStrokeWidth(1 / scale);
            this.cornerStrokePaint.setStrokeWidth(1 / scale);
            this.lastScale = scale;
        }



        /** 绘制内层元素的选中框 */
        const ids = getSelectionState('ids');
        const nodes = findByIds(ids)
        for (const node of nodes) {
            const path = node.getStrokePath()
            canvas.save()
            const matrix = node.getAbsoluteMatrix();
            this.mat9[0] = matrix[0]; this.mat9[1] = matrix[2]; this.mat9[2] = matrix[4];
            this.mat9[3] = matrix[1]; this.mat9[4] = matrix[3]; this.mat9[5] = matrix[5];
            this.mat9[6] = 0; this.mat9[7] = 0; this.mat9[8] = 1;
            canvas.concat(this.mat9 as any);
            canvas.drawPath(path, this.strokePaint)
            canvas.restore()
        }

        /** 绘制最外层的选中框 */
        for (const item of selectionBoxs) {
            canvas.save()
            const matrix = item.matrix;
            this.mat9[0] = matrix[0]; this.mat9[1] = matrix[2]; this.mat9[2] = matrix[4];
            this.mat9[3] = matrix[1]; this.mat9[4] = matrix[3]; this.mat9[5] = matrix[5];
            this.mat9[6] = 0; this.mat9[7] = 0; this.mat9[8] = 1;
            canvas.concat(this.mat9 as any);
            const box = [0, 0, item.width, item.height] as XYWH
            // 绘制选择框边框

            canvas.drawRect(CK.XYWHRect(...box), this.strokePaint);

            // 计算小矩形的大小
            const handleSize = 6 / scale;

            // 直接绘制四个角的小矩形，避免数组分配
            const half = handleSize / 2;
            // 左上角
            let rect = CK.XYWHRect(box[0] - half, box[1] - half, handleSize, handleSize);
            canvas.drawRect(rect, this.cornerFillPaint);
            canvas.drawRect(rect, this.cornerStrokePaint);
            // 右上角
            rect = CK.XYWHRect(box[0] + box[2] - half, box[1] - half, handleSize, handleSize);
            canvas.drawRect(rect, this.cornerFillPaint);
            canvas.drawRect(rect, this.cornerStrokePaint);
            // 左下角
            rect = CK.XYWHRect(box[0] - half, box[1] + box[3] - half, handleSize, handleSize);
            canvas.drawRect(rect, this.cornerFillPaint);
            canvas.drawRect(rect, this.cornerStrokePaint);
            // 右下角
            rect = CK.XYWHRect(box[0] + box[2] - half, box[1] + box[3] - half, handleSize, handleSize);
            canvas.drawRect(rect, this.cornerFillPaint);
            canvas.drawRect(rect, this.cornerStrokePaint);


            canvas.restore()
        }
    }

    dispose(): void {
        this.strokePaint?.delete?.();
        this.cornerStrokePaint?.delete?.();
        this.cornerFillPaint?.delete?.();
        this.strokePaint = undefined;
        this.cornerStrokePaint = undefined;
        this.cornerFillPaint = undefined;
    }
}