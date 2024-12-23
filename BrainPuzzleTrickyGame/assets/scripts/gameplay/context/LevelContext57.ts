import { gi } from "../../../@framework/gi";
import { wait } from "../../utils/index";
import Constant from "../Constant";
import { LevelContext } from "./ContextManager";

interface Variables {
  /** 血量 */
  hp: number;
  /** 杀虫剂节点 */
  insecticide: cc.Node;
  /** 是否使用了粘虫贴 */
  useCockroachHouse: boolean;
}

export const levelContext57: LevelContext = {
  variables: {
    hp: 100,
    insecticide: null,
    useCockroachHouse: false,
  },
  functions: {
    start: (options) => {
      const variable = levelContext57.variables as Variables;

      variable.insecticide = options.nodes[0];
    },
    /** 杀虫 */
    insecticideAnimate: (options) => {
      return new Promise(async (resolve) => {
        const variable = levelContext57.variables as Variables;

        const animation = variable.insecticide.getComponent(cc.Animation);
        const worldPos = options.trigger.node.convertToWorldSpaceAR(
          cc.v2(0, 0)
        );
        const targetPos =
          variable.insecticide.parent.convertToNodeSpaceAR(worldPos);

        variable.insecticide.setPosition(targetPos); // 杀虫剂定位到蟑螂堆
        variable.insecticide.active = true;
        options.object.node.active = false; // 执行动画时不要显示出杀虫剂拖拽物

        animation.play();

        await wait(2); // 动画持续两秒

        animation.stop();
        variable.insecticide.active = false;
        options.object.node && (options.object.node.active = true);

        options.nodes[0].active = false; // 隐藏蟑螂堆

        resolve(true);
      });
    },
    moutWoman: (options) => {
      const variable = levelContext57.variables as Variables;

      console.log(options.object.node.name);
    },
    lose: () => {
      gi.UIManager.show(Constant.UI_PREFAB.LOSE_POP);
    },
    victory: () => {
      gi.UIManager.show(Constant.UI_PREFAB.VICTORY_POP);
    },
  },
};
