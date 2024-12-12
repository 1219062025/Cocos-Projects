import jsep from "jsep";
import InstanceBase from "../../../@framework/common/InstanceBase";

type VariableResolver = (name: string) => any; // 动态变量解析器
type CommandExecutor = (id: string) => any; // 动态命令执行器

/** 表达式解析器 */
class ExpressionEvaluator extends InstanceBase {
  /** 动态变量解析器 */
  private variableResolver: VariableResolver;
  /** 动态命令执行器 */
  private commandExecutor: CommandExecutor;

  constructor() {
    super();
  }

  install(
    variableResolver: VariableResolver,
    commandExecutor: CommandExecutor
  ) {
    this.variableResolver = variableResolver;
    this.commandExecutor = commandExecutor;
  }

  /** 解析表达式成AST */
  jsepAST(expression: string) {
    try {
      const ast = jsep(expression); // 解析为 AST
      return ast;
    } catch (error) {
      console.error(
        `[ExpressionEvaluator] Error evaluating expression: ${expression}`,
        error
      );
    }
  }

  /** 解析AST */
  evaluate(ast: jsep.Expression): Promise<any> {
    console.log(ast);
    return new Promise((resolve, reject) => {
      // 递归解析 AST 节点
      resolve(this.evaluateNode(ast));
    });
  }

  /** 开始解析ast节点 */
  private evaluateNode(node: jsep.Expression): any {
    switch (node.type) {
      case "Literal":
        return (node as jsep.Literal).value;
      case "IfExpression":
        return this.evaluateIf(node as jsep.IfExpression);
      case "ElseExpression":
        return null;
      case "EndIfExpression":
        return null;
      case "CommandExpression":
        return this.evaluateCommand(node as jsep.CommandExpression);
      case "VariableExpression":
        return this.evaluateVariable(node as jsep.VariableExpression);
      case "BinaryExpression":
        return this.evaluateBinary(node as jsep.BinaryExpression);
      case "AssignmentExpression":
        return this.evaluateAssignment(node as jsep.AssignmentExpression);
      case "ConditionalExpression":
        return this.evaluateConditional(node as jsep.ConditionalExpression);
      default:
        console.warn(
          `[ExpressionEvaluator] Unsupported node type: ${node.type}`
        );
        return null;
    }
  }

  /** 解析If */
  private evaluateIf(node: jsep.IfExpression): any {
    return this.evaluateNode(jsep(node.condition));
  }

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

  /** 解析变量 */
  private evaluateVariable(node: jsep.VariableExpression) {
    if (!this.variableResolver) {
      console.error("[ExpressionEvaluator] does not exist VariableResolver");
      return null;
    }
    const name = node.value;
    if (typeof name === "string") {
      return this.variableResolver(name);
    }
    return null;
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

  /** 解析分配运算符 */
  private evaluateAssignment(node: jsep.AssignmentExpression): any {
    let left = this.evaluateNode(node.left);
    let right = this.evaluateNode(node.right);
    switch (node.operator) {
      case "=":
        return (left = right);
      case "*=":
        return (left = left * right);
      case "**=":
        return (left = left ** right);
      case "/=":
        return (left = left / right);
      case "%=":
        return (left = left % right);
      case "+=":
        return (left = left + right);
      case "-=":
        return (left = left - right);
      case "<<=":
        return (left = left << right);
      case ">>=":
        return (left = left >> right);
      case ">>>=":
        return (left = left >>> right);
      case "&=":
        return (left = left & right);
      case "^=":
        return (left = left ^ right);
      case "|=":
        return (left = left | right);
      case "||=":
        return (left = !left ? right : left);
      case "&&=":
        return (left = left ? right : left);
      case "??=":
        return (left = left == null ? right : left);
      default:
        console.warn(
          `[ExpressionEvaluator] Unsupported assignment operator: ${node.operator}`
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
}

export default ExpressionEvaluator.instance();
