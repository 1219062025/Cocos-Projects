const { ccclass, property } = cc._decorator;
@ccclass
export default class IsHitTransparent extends cc.Component {
  onLoad() {
    // _hitTest实际上是cocos内置的触摸检测，这里对触摸检测进行了重写
    // @ts-ignore
    this.node._hitTest = this.IsHitTransparent.bind(this);
  }

  /** 是否点击在图片透明区域内 */
  IsHitTransparent(point: cc.Vec2) {
    const spriteFrame = this.node.getComponent(cc.Sprite).spriteFrame;
    if (spriteFrame === null) return false;
    /** 点在节点内的局部坐标，原点为中点 */
    const pointInNode = this.node.convertToNodeSpaceAR(point);
    /** 节点尺寸 */
    const size = this.node.getContentSize();
    /** 图片纹理矩形区域 */
    const rect = spriteFrame.getRect();
    /** 图片纹理偏移量 */
    const offset = spriteFrame.getOffset();
    //如果点击位置超出节点范围，则无效
    if (Math.abs(pointInNode.x) > size.width / 2 || Math.abs(pointInNode.y) > size.height / 2) {
      return false;
    } else {
      let CheckCameraNode = cc.Canvas.instance.node.getChildByName('Check_Camera');
      if (!CheckCameraNode) {
        /** 创建摄像机 */
        CheckCameraNode = new cc.Node('Check_Camera');
        CheckCameraNode.setParent(cc.Canvas.instance.node);
        CheckCameraNode.addComponent(cc.Camera).cullingMask = -4;
      }
      CheckCameraNode.active = true;
      /** 获取摄像机组件 */
      const Camera = CheckCameraNode.getComponent(cc.Camera);
      /** 点在纹理矩形区域的局部坐标，原点为左下角 */
      const pointInRect = cc.v2(parseInt(`${pointInNode.x - offset.x + rect.width / 2}`), parseInt(`${pointInNode.y - offset.y + rect.height / 2}`));
      const texture = spriteFrame.getTexture();
      let data: Uint8Array;
      let destory = false;
      if (texture instanceof cc.RenderTexture) {
        this.node.group = 'UI';
        rt = texture;
      } else {
        this.node.group = 'camera';
        var rt = new cc.RenderTexture();
        rt.initWithSize(texture.width, texture.height);
        // rt.drawTextureAt(texture, 0, 0);
        destory = true;
      }
      // data就是这个texture的rgba值数组
      Camera.targetTexture = rt;
      Camera.render(undefined);
      2;
      //图集里的图片可能会旋转
      if (spriteFrame.isRotated()) {
        data = rt.readPixels(null, rect.x + pointInRect.y, rect.y + pointInRect.x, 1, 1);
      } else {
        data = rt.readPixels(null, rect.x + pointInRect.x, rect.y + rect.height - pointInRect.y, 1, 1);
      }
      Camera.targetTexture = null;
      Camera.enabled = false;
      CheckCameraNode.active = false;
      this.node.group = 'UI';
      destory && rt.destroy();
      if (data[3] <= 100) {
        return false;
      } else {
        return true;
      }
    }
  }

  onDestroy() {
    // @ts-ignore
    this.node._hitTest = this.IsHitTransparent.bind(null);
  }
}
