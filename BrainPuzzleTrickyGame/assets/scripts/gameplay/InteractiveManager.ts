import InstanceBase from "../../@framework/common/InstanceBase";
import { gi } from "../../@framework/gi";
import DragObject from "../entities/DragObject";
import TriggerControl from "../entities/TriggerController";
import Constant from "./Constant";

/** 场景交互管理器 */
class InteractiveManager extends InstanceBase {
  /** 拖拽物集合 */
  private _objects: DragObject[] = [];
  /** 触发器集合 */
  private _triggers: TriggerControl[] = [];
  /** 拖拽物映射表 */
  private _objectToTriggers = new Map<DragObject, TriggerControl[]>([]);
  /** 触发器映射表 */
  private _triggerToObjects = new Map<TriggerControl, DragObject[]>([]);

  constructor() {
    super();
  }

  /** 触发trigger */
  executeTrigger(trigger: TriggerControl) {
    trigger.execute();
  }

  /** 接受一个拖拽物，判断此时拖拽物是否能够触发某个trigger */
  checkTrigger(object: DragObject): TriggerControl | null {
    // 该拖拽物不存在映射关系返回null
    if (!this._objectToTriggers.has(object)) return null;

    const triggers = this._objectToTriggers.get(object);

    // 该拖拽物不存在映射的触发器返回null
    if (triggers.length === 0) return null;

    const validTriggers = triggers.filter((trigger) => {
      // 触发器所在节点未激活，不纳入
      if (!cc.isValid(trigger.node) || !trigger.node.active) {
        return false;
      }

      /** 碰撞器 */
      const collider = trigger.getComponent(cc.BoxCollider);
      /** 光标世界坐标，按照光标位置判断，而不是拖拽物节点的包围框 */
      const position = object.node.convertToWorldSpaceAR(cc.v2(0, 0));

      // @ts-ignore
      if (cc.Intersection.pointInPolygon(position, collider.world.points)) {
        return true;
      }
    });

    // 不存在可触发的触发器
    if (validTriggers.length === 0) return null;

    validTriggers.sort((a, b) => b.priority - a.priority);

    return validTriggers[0];
  }

  /** 根据匹配标签自动建立拖拽物与触发器的映射关系 */
  createMappingByTags() {
    const objects = this.getAllObjects();
    const triggers = this.getAllTriggers();

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      if (object.type !== Constant.DRAG_OBJECT_TYPE.INTERACTABLE) continue;

      for (let j = 0; j < triggers.length; j++) {
        const trigger = triggers[j];
        if (gi.Utils.hasIntersection(object.tags, trigger.tags)) {
          this.link(object, trigger);
        }
      }
    }
  }

  /** 建立映射链接 */
  link(object: DragObject, trigger: TriggerControl) {
    // 映射到_objectToTriggers
    if (!this._objectToTriggers.has(object)) {
      this._objectToTriggers.set(object, []);
    }
    const triggers = this._objectToTriggers.get(object);
    if (!triggers.includes(trigger)) triggers.push(trigger);

    // 映射到_triggerToObjects
    if (!this._triggerToObjects.has(trigger)) {
      this._triggerToObjects.set(trigger, []);
    }
    const objects = this._triggerToObjects.get(trigger);
    if (!objects.includes(object)) objects.push(object);
  }

  /** 断开映射链接 */
  unlink(object: DragObject, trigger: TriggerControl) {
    // 断开_objectToTriggers映射
    if (this._objectToTriggers.has(object)) {
      const triggers = this._objectToTriggers.get(object);
      if (triggers.includes(trigger)) gi.Utils.removeElement(triggers, trigger);
      if (triggers.length === 0) this._objectToTriggers.delete(object);
    }

    // 断开_triggerToObjects映射
    if (this._triggerToObjects.has(trigger)) {
      const objects = this._triggerToObjects.get(trigger);
      if (objects.includes(object)) gi.Utils.removeElement(objects, object);
      if (objects.length === 0) this._triggerToObjects.delete(trigger);
    }
  }

  /** 断开DragObject所有的映射 */
  private unlinkObject(object: DragObject) {
    // 断开_objectToTriggers映射
    if (this._objectToTriggers.has(object)) {
      this._objectToTriggers.delete(object);
    }
  }

  /** 断开TriggerControl所有的映射 */
  private unlinkTrigger(trigger: TriggerControl) {
    // 断开_triggerToObjects映射
    if (this._triggerToObjects.has(trigger)) {
      this._triggerToObjects.delete(trigger);
    }
  }

  /** 注册拖拽物 */
  registerObject(object: DragObject) {
    if (!this._objects.includes(object)) {
      // 将新的拖拽物添加到数组中
      this._objects.push(object);
    } else {
      console.warn(`DragObject ${object.node.name} is already registered.`);
    }
  }

  /** 注册触发器 */
  registerTrigger(trigger: TriggerControl) {
    if (!this._triggers.includes(trigger)) {
      // 将新的触发器添加到数组中
      this._triggers.push(trigger);
    } else {
      console.warn(
        `TriggerControl ${trigger.node.name} is already registered.`
      );
    }
  }

  /** 注销拖拽物 */
  unregisterObject(object: DragObject) {
    const index = this._objects.indexOf(object);
    if (index !== -1) {
      if (this._objectToTriggers.has(object)) {
        this._objectToTriggers.get(object).forEach((trigger) => {
          this.unlink(object, trigger);
        });
      }

      // 从数组中移除
      this._objects.splice(index, 1);
    } else {
      console.warn(`DragObject ${object.node.name} is not registered.`);
    }
  }

  /** 注销触发器 */
  unregisterTrigger(trigger: TriggerControl) {
    const index = this._triggers.indexOf(trigger);
    if (index !== -1) {
      if (this._triggerToObjects.has(trigger)) {
        this._triggerToObjects.get(trigger).forEach((object) => {
          this.unlink(object, trigger);
        });
      }

      // 从数组中移除
      this._triggers.splice(index, 1);
    } else {
      console.warn(`TriggerControl ${trigger.node.name} is not registered.`);
    }
  }

  /** 获取所有注册的拖拽物 */
  getAllObjects(): DragObject[] {
    return this._objects;
  }

  /** 获取所有注册的触发器 */
  getAllTriggers(): TriggerControl[] {
    return this._triggers;
  }

  /** 按类型获取拖拽物 */
  getObjectsByType(type: number): DragObject[] {
    return this._objects.filter((obj) => obj.type === type);
  }
}

export default InteractiveManager.instance();
