import Command from "./Command";
const { ccclass, property, menu } = cc._decorator;

@ccclass
@menu("Fungus/Command/Scripting | PrintCommand")
export class PrintCommand extends Command {
  @property
  message: string = "";

  execute() {
    console.log(this.message);

    return Promise.resolve();
  }
}
