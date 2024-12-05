import jsep from "jsep";

type VariableResolver = (name: string) => any; // 动态变量解析器
type CommandExecutor = (id: string) => any; // 动态命令执行器

/** 表达式计算器 */
export class ExpressionEvaluator {
  /**  动态变量解析器 */
  private variableResolver: VariableResolver;
  /** 动态命令执行器 */
  private commandExecutor: CommandExecutor;

  constructor(
    variableResolver: VariableResolver,
    commandExecutor: CommandExecutor
  ) {
    this.variableResolver = variableResolver;
    this.commandExecutor = commandExecutor;
  }

  evaluate(expression: string): any {
    try {
      const ast = jsep(expression); // 解析为 AST
      console.log(ast);
      return this.evaluateNode(ast); // 递归计算 AST 节点
    } catch (error) {
      console.error(
        `[ExpressionEvaluator] Error evaluating expression: ${expression}`,
        error
      );
      return null;
    }
  }

  /** 开始解析ast节点 */
  private evaluateNode(node: jsep.Expression): any {
    switch (node.type) {
      case "Literal":
        return (node as jsep.Literal).value;
      case "VariableExpression":
        return this.variableResolver((node as jsep.VariableExpression).value);
      case "BinaryExpression":
        return this.evaluateBinary(node as jsep.BinaryExpression);
      case "ConditionalExpression":
        return this.evaluateConditional(node as jsep.ConditionalExpression);
      case "CommandExpression":
        return this.evaluateCommand(node as jsep.CommandExpression);
      default:
        console.warn(
          `[ExpressionEvaluator] Unsupported node type: ${node.type}`
        );
        return null;
    }
  }

  /** 解析二元运算符 */
  private evaluateBinary(node: jsep.BinaryExpression): any {
    const left = this.evaluateNode(node.left);
    const right = this.evaluateNode(node.right);
    switch (node.operator) {
      case "+":
        return left + right;
      case "-":
        return left - right;
      case "*":
        return left * right;
      case "/":
        return left / right;
      case "&&":
        return left && right;
      case "||":
        return left || right;
      case "===":
        return left === right;
      case "!==":
        return left !== right;
      case "<":
        return left < right;
      case "<=":
        return left <= right;
      case ">":
        return left > right;
      case ">=":
        return left >= right;
      default:
        console.warn(
          `[ExpressionEvaluator] Unsupported binary operator: ${node.operator}`
        );
        return null;
    }
  }

  /** 解析条件表达式 */
  private evaluateConditional(node: jsep.ConditionalExpression): any {
    const test = this.evaluateNode(node.test);
    return test
      ? this.evaluateNode(node.consequent)
      : this.evaluateNode(node.alternate);
  }

  // private evaluateCall(node: jsep.CommandExpression): any {
  //   const callee = this.evaluateNode(node.);
  //   if (typeof callee === "string") {
  //     // 假设 `callee` 是命令的唯一标识符
  //     return this.commandExecutor(callee);
  //   }
  //   console.warn(
  //     `[ExpressionEvaluator] Unsupported callee type: ${typeof callee}`
  //   );
  //   return null;
  // }

  /** 解析命令 */
  private evaluateCommand(node: jsep.CommandExpression): any {
    if (!this.commandExecutor) {
      console.error("[ExpressionEvaluator] does not exist CommandExecutor");
      return null;
    }
    const commandId = node.value;
    if (typeof commandId === "string") {
      return this.commandExecutor(commandId);
    }
    return null;
  }
}
