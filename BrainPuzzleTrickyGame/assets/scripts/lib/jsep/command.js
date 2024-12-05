const plugin = {
  name: "command",
  init(jsep) {
    const regex = /^\$\{([^\}]*)\}/; // 匹配 ${} 结构

    // jsep.addIdentifierChar("$");
    jsep.hooks.add("gobble-token", function gobbleCommand(env) {
      const match = this.expr.slice(this.index).match(regex);

      if (match) {
        const content = match[1]; // 提取 ${} 内的内容
        this.index += match[0].length; // 更新解析位置

        // 返回自定义解析结果
        env.node = {
          type: "CommandExpression", // 自定义类型
          value: content.trim(),
        };
      }
    });
  },
};

export default plugin;
