import { UIConfig } from './types';

/*
 * 配置类
 */
export class AppConfig {
  /** 客户端版本号配置 */
  public version: string = '1.0.0';

  /** 包名 */
  public package: string = 'com.dinoland.app';

  /** 游戏每秒传输帧数 */
  public frameRate: number = 60;

  /** 本地存储内容加密 key */
  public localDataKey: string = 'dinoland';

  /** 本地存储内容加密 iv */
  public localDataIv: string = '10000';

  /** Http 服务器地址 */
  public httpServer: string = '';

  /** Http 请求超时时间 */
  public httpTimeout: number = 30000;

  /** 所有界面的配置数据 */
  public guiConfigData: { [key: number]: UIConfig } = {};

  /** 设计宽度 */
  public designWidth: number = 720;

  /** 设计高度 */
  public designHeight: number = 1280;
}
