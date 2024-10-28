import { _decorator, BlockInputEvents, Component, Layers, Node } from 'cc';
import { LayerUI } from './LayerUI';
import { UICallbacks, UIConfig } from '../../types';
const { ccclass, property } = _decorator;

/** 弹出框层，允许同时存在多个弹出框 */
@ccclass('LayerPopup')
export class LayerPopup extends LayerUI {
  protected black!: BlockInputEvents;

  constructor(name: string) {
    super(name);
    this.layer = Layers.Enum.UI_2D;
    this.black = this.addComponent(BlockInputEvents);
    this.black.enabled = false;
  }

  add(config: UIConfig, params: any, callbacks?: UICallbacks): string {
    this.black.enabled = true;
    return super.add(config, params, callbacks);
  }

  removeByPath(prefabPath: string, isDestroy: boolean): void {
    super.removeByPath(prefabPath, isDestroy);
    this.black.enabled = false;
  }

  removeByUuid(prefabPath: string, isDestroy: boolean): void {
    super.removeByUuid(prefabPath, isDestroy);
    this.black.enabled = false;
  }

  clear(isDestroy: boolean) {
    super.clear(isDestroy);
    this.black.enabled = false;
    this.active = false;
  }
}
