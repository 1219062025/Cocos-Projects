import ContextManager from "../../context/ContextManager";
import BranchController from "../BranchController";
import ExpressionEvaluator from "../ExpressionEvaluator";
import Command from "./Command";
import CommandManager from "./CommandManager";
const { ccclass, property, menu } = cc._decorator;

const VariableType = {
  String: 0,
  Number: 1,
  Boolean: 2,
  Node: 3,
  Skeleton: 4,
  Vec2: 5,
};

const OperationType = {
  "=": 0,
  "+=": 1,
  "-=": 2,
  "*=": 3,
  "/=": 4,
};

const NumberOperations = {
  "=": (currentValue: any, newValue: any) => newValue,
  "+=": (currentValue: any, newValue: any) => currentValue + newValue,
  "-=": (currentValue: any, newValue: any) => currentValue - newValue,
  "*=": (currentValue: any, newValue: any) => currentValue * newValue,
  "/=": (currentValue: any, newValue: any) => currentValue / newValue,
};

const Vec2Operations = {
  "=": (currentValue: cc.Vec2, newValue: cc.Vec2) => newValue,
  "+=": (currentValue: cc.Vec2, newValue: cc.Vec2) =>
    currentValue.addSelf(newValue),
  "-=": (currentValue: cc.Vec2, newValue: cc.Vec2) =>
    currentValue.subSelf(newValue),
  "*=": (currentValue: cc.Vec2, newValue: cc.Vec2) =>
    currentValue.scaleSelf(newValue),
  "/=": (currentValue: cc.Vec2, newValue: cc.Vec2) =>
    currentValue.scaleSelf(cc.v2(1 / newValue.x, 1 / newValue.y)),
};

@ccclass
@menu("Fungus/Command/Set | SetVariableCommand")
export class SetVariableCommand extends Command {
  @property({ tooltip: '当前关卡上下文中的变量，例如"player.hp"、"step"' })
  variablePath: string = "";

  @property({
    type: cc.Enum(VariableType),
    tooltip: "Variable Path对应变量的类型，最终会转化为该类型赋予对应变量",
  })
  variableType: number = 0;

  @property({
    type: cc.Enum(OperationType),
    visible() {
      return [1, 5].includes(this.variableType);
    },
    tooltip: "操作符",
  })
  operation: number = 0;

  @property({
    tooltip:
      "值表达式，填入的字符串会先被解析，再被转化成Variable Type指定的类型赋予Variable Path对应变量。",
    visible() {
      return [0, 1, 2].includes(this.variableType);
    },
  })
  value: string = "";

  @property({
    type: cc.Node,
    visible() {
      return this.variableType === 3;
    },
  })
  targetNode: cc.Node = null;

  @property({
    type: sp.Skeleton,
    visible() {
      return this.variableType === 4;
    },
  })
  skeleton: sp.Skeleton = null;

  @property({
    displayName: "X",
    tooltip:
      "X分量上的值表达式，会先解析后转化为number类型，最终与Y合成cc.Vec2并与指定的Variable Path对应变量进行计算",
    visible() {
      return this.variableType === 5;
    },
  })
  vec2X: string = "";

  @property({
    displayName: "Y",
    tooltip:
      "Y分量上的值表达式，会先解析后转化为number类型，最终与X合成cc.Vec2并与指定的Variable Path对应变量进行计算",
    visible() {
      return this.variableType === 5;
    },
  })
  vec2Y: string = "";

  private _evaluator: ExpressionEvaluator;

  start() {
    const branchController = this.node.getComponent(BranchController);

    if (branchController && branchController.evaluator) {
      this._evaluator = branchController.evaluator;
    } else {
      const manager = this.node.getComponent(CommandManager);

      this._evaluator = new ExpressionEvaluator(
        (path, value) => ContextManager.setVariable(path, value), // 上下文管理器设置变量
        (name) => ContextManager.getVariable(name), // 从上下文管理器解析变量
        (id) => manager.executeCommand(id) // 执行命令
      );
    }
  }

  async execute() {
    try {
      let result: any;
      let operationFn: Function;
      const currentVariable = ContextManager.getVariable(this.variablePath);

      if (!currentVariable) {
        throw new Error(
          `Variable '${this.variablePath}' not found in current context.Please check the command with ID ${this.id} on node ${this.node.name}`
        );
      }

      switch (this.variableType) {
        // 设置string值
        case VariableType.String:
          result = String(
            await this._evaluator.evaluate(this._evaluator.jsepAST(this.value))
          );
          break;

        // 设置number值
        case VariableType.Number:
          const number = Number(
            await this._evaluator.evaluate(this._evaluator.jsepAST(this.value))
          );
          operationFn = NumberOperations[OperationType[this.operation]];
          result = operationFn(currentVariable, number);
          break;

        // 设置boolean值
        case VariableType.Boolean:
          result = Boolean(
            await this._evaluator.evaluate(this._evaluator.jsepAST(this.value))
          );
          break;

        // 设置cc.Node值
        case VariableType.Node:
          result = this.targetNode;
          break;

        // 设置sp.Skeleton值
        case VariableType.Skeleton:
          result = this.skeleton;
          break;

        // 设置cc.Vec2值
        case VariableType.Vec2:
          if (!(currentVariable instanceof cc.Vec2)) {
            throw new Error(`currentVariable not cc.Vec2`);
          }
          const x = Number(
            await this._evaluator.evaluate(this._evaluator.jsepAST(this.vec2X))
          );
          const y = Number(
            await this._evaluator.evaluate(this._evaluator.jsepAST(this.vec2Y))
          );
          const vec2 = cc.v2(x, y);
          operationFn = Vec2Operations[OperationType[this.operation]];
          result = operationFn(currentVariable, vec2);
          break;

        default:
          throw new Error(`Unsupported variable type: ${this.variableType}`);
      }

      ContextManager.setVariable(this.variablePath, result);
    } catch (error) {
      throw new Error(error.message);
    }

    return Promise.resolve();
  }
}
