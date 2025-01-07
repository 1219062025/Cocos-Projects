const plugin = {
  name: "if_else",
  init(jsep) {
    const regexIf = /^\{if\s+((?<=if\s).*(?=\}))\}/; // 贪婪匹配 {if condition}
    const regexElse = /^\{else\}/; // 匹配 {else}
    const regexEndif = /^\{endif\}/; // 匹配 {endif}

    jsep.hooks.add("gobble-token", function gobbleIfElse(env) {
      const matchIf = this.expr.slice(this.index).match(regexIf);
      if (matchIf) {
        const condition = matchIf[1].trim(); // 提取 {if condition} 内的condition
        this.index += matchIf[0].length; // 更新解析位置

        // 返回自定义解析结果
        env.node = {
          type: "IfExpression", // 自定义类型
          condition: condition.trim(),
        };
      }

      const matchElse = this.expr.slice(this.index).match(regexElse);
      if (matchElse) {
        this.index += matchElse[0].length;
        env.node = { type: "ElseExpression" };
        return;
      }

      const matchEndif = this.expr.slice(this.index).match(regexEndif);
      if (matchEndif) {
        this.index += matchEndif[0].length;
        env.node = { type: "EndIfExpression" };
        return;
      }
    });
  },
};

export default plugin;
