/** 数据模块 */
export interface DataModule {
  /** 保存数据 */
  save(): any;
  /** 加载数据 */
  load(data: any): void;
}
