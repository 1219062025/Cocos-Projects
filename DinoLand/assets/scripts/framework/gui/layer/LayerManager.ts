import { Camera, Component, Node } from 'cc';

export class LayerManager {
  /** 根组件 */
  public root: Node;
  /** 界面层摄像机 */
  public camera: Camera;

  constructor(root: Node) {
    this.root = root;
    this.camera = this.root.getComponentInChildren(Camera);
  }
}
