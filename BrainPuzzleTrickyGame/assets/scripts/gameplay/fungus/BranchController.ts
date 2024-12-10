import context from "../context/ContextManager";
import CommandManager from "./commands/CommandManager";
import { ExpressionEvaluator } from "./ExpressionEvaluator";

const { ccclass, property, menu, disallowMultiple } = cc._decorator;

@ccclass
@disallowMultiple
@menu("Fungus/BranchController")
export default class BranchController extends cc.Component {
  @property({
    type: [cc.String],
    displayName: "分支选择表达式",
    tooltip: "分支表达式",
  })
  expressions: string[] = [];

  /** 表达式解析器 */
  private _evaluator: ExpressionEvaluator;
  /** 命令管理器 */
  private _manager: CommandManager;

  onLoad(): void {
    this._manager = this.node.getComponent(CommandManager);
    this._evaluator = new ExpressionEvaluator(
      (name) => context.getVariable(name), // 从上下文管理器解析变量
      (id) => this._manager.executeCommand(id) // 执行命令
    );
  }

  async executeBranch() {
    try {
      for (const expr of this.expressions) {
        // 等待每个命令解析并执行完成后再继续下一个命令
        await this._evaluator.evaluate(expr);
      }
    } catch (error) {
      console.error(
        `[BranchController] Failed to execute branch: ${error.message}`
      );
    }
  }
}
