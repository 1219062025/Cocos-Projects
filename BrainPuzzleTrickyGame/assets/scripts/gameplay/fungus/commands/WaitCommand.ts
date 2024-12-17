import Command from "./Command";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Fungus/Command/Scripting | WaitCommand")
export class WaitCommand extends Command {
  @property({ displayName: "等待时间/s" })
  delay: number = 0;

  execute() {
    return new Promise((resolve) => {
      this.scheduleOnce(resolve, this.delay);
    }) as Promise<void>;
  }
}
