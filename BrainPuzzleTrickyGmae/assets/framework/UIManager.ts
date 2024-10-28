import InstanceBase from './common/instanceBase';
import ViewBase from './module/viewBase';

export class UIManager extends InstanceBase {
  private uiMap: Map<any, ViewBase>;

  constructor() {
    super();
  }
}

export default UIManager.instance();
