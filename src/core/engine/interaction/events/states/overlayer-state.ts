import { PanZoomBehavior } from "../behavior";
import type { EventStateHandler } from "../event-state-handler";
import { BaseState } from "./state";
import { ClickBehavior } from "../behavior/click";
import { HoverBehavior } from "../behavior/hover";

export class OverlayerState extends BaseState {
    private panZoomBehavior: PanZoomBehavior;
    private clickBehavior: ClickBehavior;
    private hoverBehavior: HoverBehavior;

    constructor(context: EventStateHandler) {
        super(context);
        this.panZoomBehavior = new PanZoomBehavior();
        this.clickBehavior = new ClickBehavior();
        this.hoverBehavior = new HoverBehavior();
    }

    /**
     * 在 DOM_CARD 悬停层的点击行为：
     * - 左键：进入移动状态
     * - 中键：进入平移状态
     */
    onMouseDown(event: MouseEvent): void {
        if ((event.target as HTMLDivElement).attributes.getNamedItem('data-button')?.value === 'true') {
            return;
        }
        if (event.button === 0) { // 左键            
            const isHit = this.clickBehavior.hitTest(event, this.context)
            if (isHit) {
                // 移动状态
                this.context.transitionTo(this.context.states.moving, event);
            } else {
                // 框选状态
                this.context.transitionTo(this.context.states.selecting, event);
            }
        } else if (event.button === 1) { // 中键
            this.context.transitionTo(this.context.states.panning, event);
        }
    }


    onMouseMove(event: MouseEvent): void {
        // 只需要对 dom card nodes 进行碰撞检测，如果检测到的不是 dom card，切换回空闲状态
        const node = this.hoverBehavior.hitTest(event, this.context, (nodes) => nodes.filter(node => node.type === 'DOM_CARD'));
        if (node?.type !== 'DOM_CARD') {
            this.context.transitionTo(this.context.states.idle);
        }
    }

    onWheel(event: WheelEvent): void {
        this.panZoomBehavior.handle(event, this.context);
    }

    onResize(event: UIEvent): void {
        event.preventDefault();
    }

}