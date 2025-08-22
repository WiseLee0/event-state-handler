import type { IHittable, Point, BoundingBox } from '@/core/engine/collision';
import type { DesignElement, FillPaint } from '@/core/types';
import { deepClone } from '@/utils/deep-clone';
import type { Path } from 'canvaskit-wasm';
import { changeFillPaintState, changeSizeState, changeTransformState } from '@/store/node';
import type { ISceneTree } from '@/core/models/scene/scene-node/types';
import { DirtyFlag, NodeCacheManager } from '@/core/models/scene/scene-node/cache';
import { rotateAroundPoint } from '@/core/models/scene/scene-node/transform';
import { getAABBFromTransform } from '@/core/models/scene/scene-node/bounds';
import { hitTestPoint, intersectsWithGhost } from '@/core/models/scene/scene-node/hit-test';
import { computeStrokePath } from '@/utils/path';
import { Transform } from '@/utils/transform';
import type { TransformMatrix } from '@/core/types';

/**
 * 场景节点 — 基础单元
 */
export class SceneNode implements IHittable {
    private _parent: SceneNode | null = null;
    private _children: SceneNode[] = [];

    // 存储 DesignElement 相关属性
    readonly id: string;
    readonly type: DesignElement['type'];
    private _matrix: Transform;
    private _width: DesignElement['width'];
    private _height: DesignElement['height'];
    private _visible: DesignElement['visible'];
    private _fillPaints: FillPaint[];

    // 原始 DesignElement
    private _element: DesignElement;

    // 统一缓存管理器
    private cacheManager = new NodeCacheManager();

    // 场景树引用
    private sceneTree?: ISceneTree;

    constructor(element: DesignElement) {
        this.id = element.id;
        this.type = element.type
        this._matrix = new Transform(element.matrix);
        this._width = element.width;
        this._height = element.height;
        this._visible = element.visible;
        this._fillPaints = element.fillPaints ? [...element.fillPaints] : [];
        this._element = element;
        // 初始化时标记相关依赖为脏，确保首次计算正确
        this.cacheManager.markDirty(DirtyFlag.Matrix);
        this.cacheManager.markDirty(DirtyFlag.Width);
        this.cacheManager.markDirty(DirtyFlag.Height);
    }

    // ----- matrix -----
    get matrix(): TransformMatrix {
        return this.matrix2D.m;
    }
    get matrix2D(): Transform {
        return this._matrix;
    }
    set matrix(m: TransformMatrix) {
        this._matrix = new Transform(m);
        this.cacheManager.markDirty(DirtyFlag.Matrix);
        this.notifySceneTree();
        changeTransformState();
    }

    // ----- translate -----
    get x(): number {
        return this.matrix2D.m[4];
    }
    get y(): number {
        return this.matrix2D.m[5];
    }
    translate(dx: number, dy: number) {
        this.matrix2D.m[4] += dx;
        this.matrix2D.m[5] += dy;
        this.cacheManager.markDirty(DirtyFlag.Matrix);
        this.notifySceneTree();
        changeTransformState();
    }
    setPosition({ x, y }: { x?: number, y?: number }) {
        if (x !== undefined) this.matrix2D.m[4] = x;
        if (y !== undefined) this.matrix2D.m[5] = y;
        this.cacheManager.markDirty(DirtyFlag.Matrix);
        this.notifySceneTree();
        changeTransformState();
    }

    // ----- width -----
    get width(): number {
        return this._width;
    }

    // ----- height -----
    get height(): number {
        return this._height;
    }
    setSize({ w, h }: { w?: number, h?: number }) {
        if (w !== undefined) this._width = w;
        if (h !== undefined) this._height = h;
        this.cacheManager.markDirty(DirtyFlag.Width);
        this.cacheManager.markDirty(DirtyFlag.Height);
        this.notifySceneTree();
        changeSizeState();
    }

    // ----- visible -----
    get visible(): boolean {
        return this._visible;
    }
    set visible(v: boolean) {
        this._visible = v;
        this.notifySceneTree();
    }

    // ----- fillPaints -----
    get fillPaints(): FillPaint[] {
        return [...this._fillPaints];
    }
    set fillPaints(paints: FillPaint[]) {
        this._fillPaints = [...paints];
        this.notifySceneTree();
        changeFillPaintState();
    }

    // ----- rotation -----
    get rotation(): number {
        return this.cacheManager.get(DirtyFlag.Rotation, () => this.matrix2D.decompose().rotation);
    }
    setRotation(deg: number, dx?: number, dy?: number) {
        const px = dx ?? this.width / 2;
        const py = dy ?? this.height / 2;
        rotateAroundPoint(this, deg, px, py);
        this.cacheManager.markDirty(DirtyFlag.Matrix);
        this.notifySceneTree();
        changeTransformState();
    }

    /** 获取子节点列表 */
    get children(): SceneNode[] {
        return this._children;
    }

    /** 获取父级节点 */
    get parent(): SceneNode | null {
        return this._parent;
    }

    /** 设置场景树引用 */
    setSceneTree(sceneTree: ISceneTree): void {
        this.sceneTree = sceneTree;
        // 递归设置子节点的场景树引用
        for (const child of this._children) {
            child.setSceneTree(sceneTree);
        }
    }

    /** 通知父节点变化（内部使用） */
    private notifyParentChange(): void {
        this.cacheManager.markDirty(DirtyFlag.Parent);
        this.notifySceneTree();
    }

    /** 通知场景树节点变脏 */
    private notifySceneTree(): void {
        if (this.sceneTree) {
            this.sceneTree.markNodeDirty(this);
        }
    }

    /** 标记子节点变化 */
    private markChildrenDirty(): void {
        this.cacheManager.markDirty(DirtyFlag.Children);
        this.notifySceneTree();
        // 向上传播，父节点的包围盒等也可能受影响
        if (this._parent) {
            this._parent.markChildrenDirty();
        }
    }

    /** 转回设计元素 */
    toElement(): DesignElement {
        return deepClone({
            ...this._element,
            matrix: this.matrix,
            width: this._width,
            height: this._height,
            visible: this._visible,
            fillPaints: this._fillPaints,
        });
    }

    appendChild(node: SceneNode) {
        if (node._parent) node._parent.removeChild(node);
        node._parent = this;
        this._children.push(node);

        // 通知子节点父节点已变化
        node.notifyParentChange();

        // 为新子节点设置场景树引用
        if (this.sceneTree) {
            node.setSceneTree(this.sceneTree);
        }

        this.markChildrenDirty();
    }

    removeChild(node: SceneNode) {
        const i = this._children.indexOf(node);
        if (i > -1) {
            node._parent = null;
            // 通知子节点父节点已变化
            node.notifyParentChange();
            this._children.splice(i, 1);
            this.markChildrenDirty();
        }
    }

    removeChildren() {
        for (const c of this._children) c._parent = null;
        this._children = [];
        this.markChildrenDirty();
    }

    /** 世界变换 */
    private getAbsoluteTransform(): Transform {
        return this.cacheManager.get(DirtyFlag.AbsoluteMatrix, () => {
            const t = this.matrix2D.copy();
            if (this.parent) {
                const pt = this.parent.getAbsoluteTransform();
                t.multiply(pt);
            }
            return t;
        });
    }

    getAbsoluteMatrix(): number[] {
        const transform = this.getAbsoluteTransform();
        return transform.m;
    }

    /** 世界包围盒 */
    getAbsoluteBoundingBox(): BoundingBox {
        return this.cacheManager.get(DirtyFlag.BoundingBox, () => {
            const transform = this.getAbsoluteTransform();
            return getAABBFromTransform(transform, this.width, this.height);
        });
    }

    /**
     * 描边包围盒
     * 包含描边的包围盒
     */
    getStrokeBox(): BoundingBox {
        return this.cacheManager.get(DirtyFlag.StrokeBox, () => {
            // 目前直接返回基础包围盒，后续可以根据描边宽度扩展
            return this.getAbsoluteBoundingBox();
        });
    }

    /**
     * 渲染包围盒
     * 包含描边、阴影、模糊等影响渲染的包围盒
     */
    getRenderBox(): BoundingBox {
        return this.cacheManager.get(DirtyFlag.RenderBox, () => {
            // 目前基于描边包围盒，后续可以根据阴影、模糊等效果扩展
            return this.getStrokeBox();
        });
    }

    /**
     * 获取描边路径
     */
    getStrokePath() {
        return this.cacheManager.get(DirtyFlag.StrokePath, (oldPath: Path) => {
            oldPath?.delete?.();
            return computeStrokePath(this);
        });
    }

    /**
     * 点碰撞检测
     */
    hitTest(pt: Point): boolean {
        if (!this.visible) return false;
        return hitTestPoint(pt, this);
    }

    /**
     * 框选碰撞检测
     */
    intersectsWith(box: BoundingBox): boolean {
        if (!this.visible) return false;
        return intersectsWithGhost(box, this);
    }
}