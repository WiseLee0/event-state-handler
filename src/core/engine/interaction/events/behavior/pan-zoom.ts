import { getHotKeyState } from "@/store/hotkey";
import type { EventStateHandler } from "../event-state-handler";
import { PanBehavior } from "./pan";
import { ZoomBehavior } from "./zoom";

/**
 * 组合行为：统一处理滚轮交互（缩放/平移）。
 */
export class PanZoomBehavior {
  constructor(
    private zoomBehavior: ZoomBehavior = new ZoomBehavior(),
    private panBehavior: PanBehavior = new PanBehavior()
  ) {}

  handle(event: WheelEvent, context: EventStateHandler): void {
    event.preventDefault();
    // 主修饰键（Ctrl/Cmd）按下：缩放
    if (getHotKeyState("isMainPressed")) {
      const delta = -event.deltaY / 100;
      this.zoomBehavior.handle(context, event, delta);
      return;
    }

    // mac 平台的 Ctrl/Meta 特例缩放（与现有逻辑保持一致）
    if (event.metaKey || event.ctrlKey) {
      const delta = -event.deltaY / 5;
      this.zoomBehavior.handle(context, event, delta);
      return;
    }

    // 否则滚轮平移
    this.panBehavior.handle(event, context);
  }
}
