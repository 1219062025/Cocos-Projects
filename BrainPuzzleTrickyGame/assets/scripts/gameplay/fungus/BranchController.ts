import ContextManager from "../context/ContextManager";
import CommandManager from "./commands/CommandManager";
import ExpressionEvaluator from "./ExpressionEvaluator";

const { ccclass, property, menu, disallowMultiple, executionOrder } =
  cc._decorator;

interface IfElseStack {
  type: "if" | "else";
  active: boolean;
}

@ccclass
@disallowMultiple
@executionOrder(10)
@menu("Fungus/BranchController")
export default class BranchController extends cc.Component {
  @property({
    type: [cc.String],
    tooltip: "分支表达式",
  })
  expressions: string[] = [];

  @property({ tooltip: "是否立即执行" })
  immediately: boolean = false;

  /** 命令管理器 */
  private _manager: CommandManager;

  /** 表达式解析器 */
  private _evaluator: ExpressionEvaluator;
  public get evaluator() {
    return this._evaluator;
  }

  onLoad() {
    this._manager = this.node.getComponent(CommandManager);

    this._evaluator = new ExpressionEvaluator(
      (path, value) => ContextManager.setVariable(path, value), // 上下文管理器设置变量
      (name) => ContextManager.getVariable(name), // 从上下文管理器解析变量
      (id) => this._manager.executeCommand(id) // 执行命令
    );

    if (this.immediately) {
      this.scheduleOnce(() => {
        this.executeBranch();
      });
    }
  }

  async executeBranch() {
    let i = 0;
    const stack: IfElseStack[] = [];

    while (i < this.expressions.length) {
      const expression = this.expressions[i];
      const ast = this._evaluator.jsepAST(expression);

      switch (ast.type) {
        case "IfExpression":
          const result = await this._evaluator.evaluate(ast);
          stack.push({ type: "if", active: this.isActive(stack) && result });

          break;

        case "ElseExpression":
          if (stack.length > 0 && stack[stack.length - 1].type === "if") {
            const lastIf = stack.pop();
            stack.push({
              type: "else",
              active: this.isActive(stack) && !lastIf.active, // 激活 else 块
            });
          } else {
            throw new Error("Unexpected 'else' without matching 'if'");
          }

          break;

        case "EndIfExpression":
          if (
            stack.length > 0 &&
            (stack[stack.length - 1].type === "if" ||
              stack[stack.length - 1].type === "else")
          ) {
            stack.pop(); // 弹出当前 if-else 块
          } else {
            throw new Error(
              "Unexpected 'endif' without matching 'if' or 'else'"
            );
          }

          break;

        default:
          if (this.isActive(stack)) {
            await this._evaluator.evaluate(ast);
          }
      }
      i++;
    }
    if (stack.length > 0) {
      // 调用endif前，要么只有一个if，要么if-else的数量要匹配
      /**
       * 如果if完想接着if，那就要两个endif，例如：
       * {if {{player.hp}} === 1}
       * ${2}
       * {if {{player.hp}} === 0 && ${3} }
       * ${4}
       * {endif}
       * {endif}
       */
      throw new Error("Unmatched 'if' or 'else' block");
    }
  }

  private isActive(stack: IfElseStack[]): boolean {
    // 栈顶层状态决定当前块是否激活
    return stack.every((frame) => frame.active);
  }
}
