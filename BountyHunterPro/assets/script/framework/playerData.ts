import { Constant } from './constant';
import { StorageManager } from './storageManager';
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

/** 玩家信息 */
interface PlayerInfo {
  /** 玩家标识 */
  playerId?: string;
  /** 玩家昵称 */
  playerName?: any;
  /** 玩家分数 */
  score?: number;
  /** 玩家头像icon key值 */
  icon?: number;
  /** 0-角色1 1-角色2 */
  staticId?: number;
}

/** 玩家类 */
@ccclass('PlayerData')
export class PlayerData extends Component {
  private static _instance: PlayerData;

  /** 玩家单例 */
  public static get instance() {
    if (this._instance == null) {
      this._instance = new PlayerData();
    }
    return this._instance;
  }

  private _userId: string = '';
  private _playerInfo: PlayerInfo = null;
  private _history: any = null;
  private _settings: any = null;
  private _isNewBee: boolean = false; // 默认非新手

  /** 用户唯一标识符 */
  get userId() {
    return this._userId;
  }
  /** 玩家信息 */
  get playerInfo() {
    return this._playerInfo;
  }
  /** 关卡通关记录 */
  get history() {
    return this._history;
  }
  /** 设置相关，所有杂项 */
  get settings() {
    return this._settings;
  }
  /** 是否是新手 */
  get isNewBee() {
    return this._isNewBee;
  }

  /** 是否初始化了玩家 */
  public isInit: boolean = false;

  /** 创建一个新玩家 */
  public createPlayerInfo(info: PlayerInfo) {
    this._playerInfo = {};

    if (info) {
      for (const key in info) {
        if (Object.prototype.hasOwnProperty.call(info, key)) {
          this._playerInfo[key] = info[key];
        }
      }
    }

    this.savePlayerInfoToLocalCache();
  }

  /**
   * 更新玩家信息
   * 例如钻石、金币、道具
   * @param {String} key
   * @param {Number} value
   */
  public updatePlayerInfo(key: string, value: any) {
    this._playerInfo[key] = value;
    this.savePlayerInfoToLocalCache();
  }

  /** 保存玩家数据到本地存储 */
  public savePlayerInfoToLocalCache() {
    StorageManager.instance.setConfigData(Constant.LOCAL_CACHE.PLAYER, JSON.stringify(this._playerInfo));
  }

  /** 加载本地存储的玩家数据，如果没有则先随机生成一个新玩家 */
  public loadFromCache() {
    const userId: string = StorageManager.instance.getUserId();
    if (userId) {
      this._userId = userId;
    } else {
      this.generateRandomAccount();
    }

    // 读取玩家数据
    this._playerInfo = this._loadDataByKey(Constant.LOCAL_CACHE.PLAYER);
    this._history = this._loadDataByKey(Constant.LOCAL_CACHE.HISTORY);
    this._settings = this._loadDataByKey(Constant.LOCAL_CACHE.SETTINGS);
  }

  /**
   * 根据key值读取本地存储数据
   * @param key
   */
  private _loadDataByKey(key: any) {
    const dataJson = StorageManager.instance.getConfigData(key);
    if (dataJson) {
      try {
        return JSON.parse(dataJson);
      } catch (err) {
        return {};
      }
    }
  }

  /**
   * 生成随机账户
   * @returns
   */
  public generateRandomAccount() {
    this._userId = new Date().getTime() + '_' + Math.floor(Math.random() * 1000);
    StorageManager.instance.setUserId(this.userId);
  }
}
