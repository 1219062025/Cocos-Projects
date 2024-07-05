import Tree from './tree';
import Node from './node';

const { ccclass, property } = cc._decorator;

@ccclass
export default class QuadTree {
  /** 四叉树映射 */
  private static _quadTreeMap: Map<string, Tree<unknown>> = new Map([]);

  static createQuadTree<T>(name: string, options: { x: number; y: number; width: number; height: number; maxLen: number; ctx?: cc.Graphics }) {
    try {
      const tree = new Tree<T>(options.x, options.y, options.width, options.height, options.maxLen, options.ctx);
      this._quadTreeMap.set(name, tree);
    } catch (err) {
      console.log('创建四叉树出错，错误信息：', err);
    }
  }

  /** 获取四叉树 */
  static getQuadTree<T>(name: string) {
    const tree = this._quadTreeMap.get(name) as Tree<T>;
    return tree || null;
  }

  /** 四叉树插入节点，x、y坐标传入节点坐标，data传入该节点保存的数据 */
  static treeInsert<T>(name: string, options: { x: number; y: number; width: number; height: number; data: T }) {
    const node = new Node<T>(options.x, options.y, options.width, options.height, options.data);
    const tree = this._quadTreeMap.get(name) as Tree<T>;
    tree && tree.insert(node);
  }

  /** 四叉树搜索节点，x、y坐标传入节点坐标，返回数据数组 */
  static treeSearch<T>(name: string, x: number, y: number) {
    const tree = this._quadTreeMap.get(name) as Tree<T>;
    return tree && tree.search(x, y);
  }
}
