import type { DesignColor, DesignBlendMode } from "./constans";

export interface FillPaint {
    type: 'SOLID';
    color: DesignColor;
    visible: boolean;
    blendMode: DesignBlendMode;
}