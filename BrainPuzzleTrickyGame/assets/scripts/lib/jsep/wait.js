const plugin = {
  name: "wait",
  init(jsep) {
    const regex = /^\{wait\s+((?<=wait\s).*?(?=\}))\}/; // 匹配 {wait delay} 非贪婪匹配

    jsep.hooks.add("gobble-token", function gobbleWait(env) {
      const match = this.expr.slice(this.index).match(regex);
      if (match) {
        const delay = match[1].trim(); // 提取 {wait delay} 内的delay
        this.index += match[0].length; // 更新解析位置

        // 返回自定义解析结果
        env.node = {
          type: "WaitExpression", // 自定义类型
          delay: Number(delay),
        };
      }
    });
  },
};

export default plugin;
