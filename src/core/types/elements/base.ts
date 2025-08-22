import type { FillPaint } from "../fillpaint";
import type { TransformMatrix } from "../matrix";
import type { RectangleElement } from "./rectangle";
import type { RootElement } from "./root";
import type { CardElement } from "./card";

type BaseElement = {
    id: string;
    matrix: TransformMatrix;
    width: number;
    height: number;
    fillPaints?: FillPaint[];
    visible: boolean;
    children?: DesignElement[];
}
export type DesignElement = BaseElement & (RectangleElement | RootElement | CardElement)