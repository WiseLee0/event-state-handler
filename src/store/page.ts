import { markRenderDirty } from "@/core/engine";
import type { FillPaint } from "@/core/types";
import { createStoreUtils } from "@/utils/create-store";

interface PageInterface {
  fillPaint: FillPaint;
}

const _page: PageInterface = {
  fillPaint: {
    type: 'SOLID',
    color: [0.9529411764705882, 0.9568627450980393, 0.9568627450980393, 1], // #F3F4F4
    visible: true,
    blendMode: "NORMAL",
  },
};

const {
  useStore: usePageState,
  setState: _setPageState,
  getState: getPageState,
} = createStoreUtils<PageInterface>(_page);

const setPageState = (data: Partial<PageInterface>) => {
  if (data?.fillPaint) {
    markRenderDirty();
  }
  _setPageState(data);
};

export { usePageState, setPageState, getPageState };
