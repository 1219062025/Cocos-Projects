import CommandManager from "./commands/CommandManager";
import { ExpressionEvaluator } from "./ExpressionEvaluator";

const { ccclass, property, menu, disallowMultiple, requireComponent } =
  cc._decorator;

@ccclass
@disallowMultiple
@menu("Fungus/BranchController")
export default class BranchController extends cc.Component {
  @property({ displayName: "分支选择表达式", tooltip: "分支表达式" })
  expression: string = "";

  /** 表达式解析器 */
  private _evaluator: ExpressionEvaluator;
  /** 命令管理器 */
  private _manager: CommandManager;

  onLoad(): void {
    this._manager = this.node.getComponent(CommandManager);
    this._evaluator = new ExpressionEvaluator(
      (name) => 2, // 从全局变量管理器解析变量
      (id) => this._manager.executeCommand(id) // 执行命令
    );
  }

  executeBranch() {
    try {
      if (!this._manager) {
        console.error(
          `[BranchController] CommandManager not found on node '${this.node.name}'.`
        );
        return;
      }

      this._evaluator.evaluate(this.expression);
    } catch (error) {
      console.error(
        `[BranchController] Failed to execute branch: ${error.message}`
      );
    }
  }
}
