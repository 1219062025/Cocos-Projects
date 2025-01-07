import jsep from "jsep";

type VariableAssignment = (path: string, value: any) => any; // 动态变量赋值器
type VariableResolver = (name: string) => any; // 动态变量解析器
type CommandExecutor = (id: string) => any; // 动态命令执行器

/** 表达式解析器 */
export default class ExpressionEvaluator {
  /** 动态变量赋值器 */
  private variableAssignment: VariableAssignment;
  /** 动态变量解析器 */
  private variableResolver: VariableResolver;
  /** 动态命令执行器 */
  private commandExecutor: CommandExecutor;

  constructor(
    variableAssignment: VariableAssignment,
    variableResolver: VariableResolver,
    commandExecutor: CommandExecutor
  ) {
    this.variableAssignment = variableAssignment;
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
    // 递归解析 AST 节点
    return this.evaluateNode(ast);
  }

  /** 开始解析ast节点 */
  private evaluateNode(node: jsep.Expression) {
    switch (node.type) {
      case "Literal":
        return (node as jsep.Literal).value;
      case "IfExpression":
        return this.evaluateIf(node as jsep.IfExpression);
      case "ElseExpression":
        return null;
      case "EndIfExpression":
        return null;
      case "WaitExpression":
        return this.evaluateWait(node as jsep.WaitExpression);
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
  private async evaluateIf(node: jsep.IfExpression) {
    return await this.evaluateNode(jsep(node.condition));
  }

  /** 解析Wait */
  private async evaluateWait(node: jsep.WaitExpression) {
    return await new Promise((resolve) => {
      setTimeout(resolve, node.delay * 1000);
    });
  }

  /** 解析命令 */
  private evaluateCommand(node: jsep.CommandExpression) {
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
  private async evaluateBinary(node: jsep.BinaryExpression) {
    const left = await this.evaluateNode(node.left);
    const right = await this.evaluateNode(node.right);
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
  private async evaluateAssignment(node: jsep.AssignmentExpression) {
    // @ts-nocheck
    const leftType =
      (node.left.right && node.left.right["type"]) || node.left["type"];
    // @ts-nocheck
    const leftValue =
      (node.left.right && node.left.right["value"]) || node.left["value"];

    let left = await this.evaluateNode(node.left);
    let right = await this.evaluateNode(node.right);

    switch (node.operator) {
      case "=":
        left = right;
        break;
      case "*=":
        left = left * right;
        break;
      case "**=":
        left = left ** right;
        break;
      case "/=":
        left = left / right;
        break;
      case "%=":
        left = left % right;
        break;
      case "+=":
        left = left + right;
        break;
      case "-=":
        left = left - right;
        break;
      case "<<=":
        left = left << right;
        break;
      case ">>=":
        left = left >> right;
        break;
      case ">>>=":
        left = left >>> right;
        break;
      case "&=":
        left = left & right;
        break;
      case "^=":
        left = left ^ right;
        break;
      case "|=":
        left = left | right;
        break;
      case "||=":
        left = !left ? right : left;
        break;
      case "&&=":
        left = left ? right : left;
        break;
      case "??=":
        left = left == null ? right : left;
        break;
      default:
        console.warn(
          `[ExpressionEvaluator] Unsupported assignment operator: ${node.operator}`
        );
        return null;
    }

    // 如果分配符的分配对象是上下文中的变量的话，需要手动调用variableAssignment分配
    if (leftType === "VariableExpression") {
      const variablePath = leftValue;
      this.variableAssignment(variablePath, left);
    }
    return left;
  }

  /** 解析条件表达式 */
  private async evaluateConditional(node: jsep.ConditionalExpression) {
    const test = await this.evaluateNode(node.test);
    return test
      ? await this.evaluateNode(node.consequent)
      : await this.evaluateNode(node.alternate);
  }
}
