import Command from "./Command";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Fungus/Command/Scripting | WaitCommand")
export class WaitCommand extends Command {
  @property({
    displayName: "等待时间/s",
    tooltip:
      "需要注意的是：仅对WaitCommand当前序号之后的表达式生效，同序号使用&&链接的其他表达式不受影响",
  })
  delay: number = 0;

  execute() {
    return new Promise((resolve) => {
      this.scheduleOnce(resolve, this.delay);
    }) as Promise<void>;
  }
}
