import InstanceBase from "../../../@framework/common/InstanceBase";
import { levelContext50 } from "./LevelContext50";
import { levelContext57 } from "./LevelContext57";

/** 关卡上下文 */
export interface LevelContext {
  /** 关卡变量 */
  variables?: Record<string, any>;
  /** 关卡函数 */
  functions?: Record<string, (...args: any[]) => any>;
}

/** 上下文管理器 */
class ContextManager extends InstanceBase {
  /** 当前上下文 */
  private _currentContext: LevelContext | null = null;

  constructor() {
    super();
  }

  /** 注册新的上下文 */
  public loadContext(context: LevelContext): void {
    this._currentContext = context;
  }

  /** 清理当前上下文 */
  public clearContext(): void {
    this._currentContext = null;
  }

  /** 获取当前关卡变量 */
  public getVariable(path: string): any {
    if (this._currentContext) {
      const keys = path.split(".");
      return keys.reduce((acc, key) => {
        if (acc && key in acc) {
          return acc[key];
        } else {
          return undefined;
        }
      }, this._currentContext.variables);
    }
    throw new Error(`No active context to get variable '${path}'.`);
  }

  /** 设置当前关卡变量 */
  public setVariable(path: string, value: any): void {
    if (this._currentContext) {
      const { parent, key } = this._resolveNestedProperty(
        this._currentContext.variables,
        path
      );
      if (key) {
        parent[key] = value;
      } else {
        throw new Error(`Invalid variable path: '${path}'`);
      }
    } else {
      throw new Error(`No active context to set variable '${path}'.`);
    }
  }

  /** 调用当前关卡函数 */
  public callFunction(name: string, ...args: any[]) {
    if (
      this._currentContext &&
      this._currentContext.functions &&
      Object.prototype.hasOwnProperty.call(this._currentContext.functions, name)
    ) {
      return this._currentContext.functions[name](...args);
    }
    throw new Error(`Function '${name}' not found in current context.`);
  }

  /** 获取所有关卡函数 */
  public getFunctions() {
    if (this._currentContext && this._currentContext.functions) {
      return this._currentContext.functions;
    } else {
      return {};
    }
  }

  /** 工具函数：解析嵌套属性路径 */
  private _resolveNestedProperty(obj: any, path: string) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const parent = keys.reduce((acc, key) => {
      if (!acc[key]) acc[key] = {}; // 自动创建嵌套对象
      return acc[key];
    }, obj);

    return { parent, key: lastKey! };
  }
}

const context = ContextManager.instance();

context.loadContext(levelContext50);
context.loadContext(levelContext57);

export default context;
