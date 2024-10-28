import { _decorator, Asset, Component, native, Node, resources, sys } from 'cc';
import type { FrameInfo, PlayerInfo } from '../libs/GOBE.d.ts';
import { PlayerData } from '../framework/playerData';
import { Util } from '../framework/util';
import * as GOBE from '../libs/GOBE.js';
import { ClientEvent } from '../framework/clientEvent';
import { Constant } from '../framework/constant';
import { UIManager } from '../framework/uiManager';
const { ccclass, property } = _decorator;

//#region 自定义类型
/** 玩家状态 */
export enum PLAYER_TYPE {
  /** 准备中 */
  READY = 0,
  /** 游戏已开始 */
  START = 1,
  /** 游戏已结束 */
  END = 2
}

/** 房间状态 */
export enum ROOM_TYPE {
  /** 准备中 */
  READY = 'ready',
  /** 游戏已开始 */
  START = 'start',
  /** 游戏已结束 */
  END = 'end'
}

/** Wifi模式 */
export enum WIFI_TYPE {
  /** 单机模式 */
  STAND_ALONE = 'stand-alone',
  /** 联网模式 */
  WIFI = 'wifi'
}

export class RoomAloneInfo {
  /** 玩家信息 */
  public players: PlayerInfo[] = [];
  /** 自定义玩家属性 */
  public customRoomProperties: string = '';
  /** 玩家自己的id */
  public ownerId: string = '';
  /** 房间代码 */
  public roomCode: string = '';
}
//#endregion

@ccclass('GobeUtil')
export class GobeUtil {
  private static _instance: GobeUtil = null;

  public static get instance() {
    if (this._instance == null) {
      this._instance = new GobeUtil();
    }

    return this._instance;
  }

  //#region 客户端密钥
  private static CLIENT_ID: string = '1476950786356296320'; // 需要手动修改
  private static CLIENT_SECRET: string = '2824D285815607DD678332D44F4F76936771BA182EA132FF5DBAF5A6C181D729'; // 需要手动修改
  private static APP_ID: string = '172249065903358625'; // 需要手动修改
  //#endregion

  //#region GET / SET
  /** --------------------------------- */
  /** -------------GET/SET------------- */
  /** --------------------------------- */
  /** 玩家的openID */
  private _openId: string = '';
  public get openId() {
    return this._openId;
  }

  /** 玩家自己的id */
  private _ownPlayerId: string = '';
  public get ownPlayerId() {
    return this._ownPlayerId;
  }

  /** 华为初始化是否成功 */
  private _isHwInit: boolean = false;
  public get isHwInit() {
    return this._isHwInit;
  }
  public set isHwInit(value: boolean) {
    this._isHwInit = value;
  }

  /** 是否华为登录 */
  private _isHwLogin: boolean = false;
  public get isHwLogin() {
    return this._isHwLogin;
  }
  public set isHwLogin(value: boolean) {
    this._isHwLogin = value;
  }

  /** wifi模式 */
  private _wifiType: WIFI_TYPE = WIFI_TYPE.WIFI;
  public get wifiType() {
    return this._wifiType;
  }

  /** 是否是机器人 */
  private _isAi: boolean = false;
  public get isAi() {
    return this._isAi;
  }

  /** 当前帧 */
  private _currFrame: number = 0;
  public get currFrame() {
    return this._currFrame;
  }

  /** 接收的帧数据信息映射 */
  private _recvMap: Map<number, FrameInfo[]> = new Map([]);
  public get recvMap() {
    return this._recvMap;
  }

  /** 单房间信息 */
  private _roomAloneInfo: RoomAloneInfo = null;
  public get roomAloneInfo() {
    return this._roomAloneInfo;
  }

  /** 房主有没有加入房间 */
  private _isRoomOwnIn: boolean = false;
  public get isRoomOwnIn() {
    return this._isRoomOwnIn;
  }

  /** 最后连接的房间ID。 */
  private _lastRoomId: string = null;
  public get lastRoomId() {
    return this._lastRoomId;
  }
  public set lastRoomId(value: any) {
    this._lastRoomId = value;
  }

  /** 房间内时间，ms */
  private _time: number = 0;
  public get time() {
    // 单机模式下直接返回当前系统时间
    if (this.wifiType == WIFI_TYPE.STAND_ALONE) {
      return new Date().getTime();
    }
    return this._time;
  }

  /** 是否是掉线重连 */
  private _isDisJoin: boolean = false;
  public get isDisJoin() {
    return this._isDisJoin;
  }
  //#endregion

  //#region 公有变量
  /** --------------------------------- */
  /** -------------公有变量------------- */
  /** --------------------------------- */
  /** 房间状态 */
  public roomType: ROOM_TYPE = ROOM_TYPE.READY;

  /** false-只有单机模式 true-可以切换 */
  public isChangeWifiType: boolean = true;

  /** 服务器与客户端时间间隔 */
  public serverTimeDis: number = 0;
  //#endregion

  //#region 私有变量
  /** --------------------------------- */
  /** -------------私有变量------------- */
  /** --------------------------------- */
  /** 客户端 */
  private _client: GOBE.Client = null!;
  /** 房间 */
  private _room: GOBE.Room = null;

  /** 当前玩家是否在游戏中 */
  private _isStartGame: boolean = false;
  /** 对手是否在游戏中 */
  private _isOtherStartGame: boolean = false;
  /** 对手掉线了多久了，满10秒时游戏结束 */
  private _otherDisInterval: number = 0;
  /** 是否是在准备阶段掉线的 */
  private _isReadyDis: boolean = false;
  /** 是否是开始帧 */
  private _isStartFS: Boolean = false;

  /** 证书在平台的资源路径 */
  private _cacertNativeUrl: string = '';
  //#endregion

  //#region 创建房间，单机模式
  /**
   * 创建房间，单机模式
   * @param callback 回调函数
   * @param errorCallback 发生错误时的回调函数
   * @returns
   */
  public createRoomAI(callback: Function, errorCallback: Function) {
    this.serverTimeDis = 0;
    this.roomType = ROOM_TYPE.READY;

    this._isAi = true;
    this._wifiType = WIFI_TYPE.STAND_ALONE;
    this._currFrame = 0;
    this._recvMap = new Map([]);
    this._roomAloneInfo = new RoomAloneInfo();
    this._roomAloneInfo.ownerId = this._ownPlayerId;
    this._roomAloneInfo.roomCode = '0001' + Math.floor(Math.random() * 100);
    this._roomAloneInfo.players = [];
    // 将玩家自己加入列表
    this._roomAloneInfo.players.push({
      playerId: this._ownPlayerId,
      customPlayerProperties: PlayerData.instance.playerInfo['playerName']
    });

    // 随机一个机器人
    Util.randomName(1).then(playerName => {
      this._roomAloneInfo.players.push({
        playerId: 'ai00000',
        customPlayerProperties: playerName
      });
    });

    this._roomAloneInfo.customRoomProperties = JSON.stringify({ 'type': ROOM_TYPE.READY, 'time': 0 });

    this._time = 0;
    this._isStartFS = true;
    callback && callback();
  }
  //#endregion

  //#region 加入房间
  /**
   * 加入房间
   * @param roomId 房间号
   * @param callback 成功的回调函数
   * @param errorCallback 失败的回调函数
   */
  public joinRoom(roomId: string, callback: Function, errorCallback: Function) {
    // 重置联网帧数据
    this._currFrame = 0;
    this._recvMap = new Map();
    // 既然是加入房间，就不是单机模式了，那就不是机器人
    this._isAi = false;
    // 设置成联网模式
    this._wifiType = WIFI_TYPE.WIFI;

    // 调用客户端的加入房间方法
    this._client
      .joinRoom(roomId, { customPlayerStatus: 0, customPlayerProperties: PlayerData.instance.playerInfo['playerName'] })
      .then(room => {
        // room是计入房间成功后服务器返回的房间信息，将其赋值给_room
        this._room = room;
        this._lastRoomId = room.roomId;
        this._enabledEventRoom();

        // 既然是 joinRoom 加入房间，那么不管是房主掉线重连还是非房主进入房间/掉线重连，房主都应该在房间里
        if (this._room.players.length == Constant.MAX_PLAYER) {
          this._isRoomOwnIn = true;
        }

        callback && callback();
      })
      .catch(e => {
        errorCallback && errorCallback(e);
      });
  }
  //#endregion

  //#region 离开房间
  /**
   * 离开房间
   * @param callback 成功的回调函数
   * @param errorCallback 失败的回调函数
   * @param isLeaveMedia
   */
  public leaveRoom(callback?: Function, errorCallback?: Function, isLeaveMedia: boolean = true) {
    if (this._isReadyDis) {
      this._isReadyDis = false;
      if (this._room) this._room.sendToServer(Constant.DISMISS);
    }

    if (this._lastRoomId && this._client) {
      this._client
        .leaveRoom()
        .then(client => {
          console.log(`离开了房间id为${this._lastRoomId}的房间`);
          this._client = client;
          /** 移除客户端上的所有事件监听 */
          this._client.removeAllListeners();
          /** 移除房间的所有事件监听 */
          this._room && this._room.removeAllListeners();
          this._room = null;
          callback && callback();
        })
        .catch(e => {
          console.log(`离开了房间id为${this._lastRoomId}的房间时发生了错误，error`, e);
          errorCallback && errorCallback(e);
        });

      if (isLeaveMedia) {
        // this.leaveChannel();
        // this.mediaLeaveRoom();
        UIManager.instance.hideDialog(Constant.PANEL_NAME.MEDIA_PANEL);
      }
    } else {
      this._roomAloneInfo = null;
      callback && callback();
    }
  }
  //#endregion

  //#region 监听房间事件
  /** 统一在这里监听服务器发送的房间事件，例如加入房间成功、失败，实时服务器广播信息等等。。。 */
  private _enabledEventRoom() {
    this._isStartGame = false;
    this._isOtherStartGame = false;

    /** --------------------加入房间成功，做相关游戏逻辑处理-------------------- */
    this._room.onJoin(playerInfo => {
      console.log(`进入房间成功，该房间的房主id为${this._room.ownerId}，本次进入房间的玩家id为${playerInfo.playerId}`);

      if (this._room.ownerId != playerInfo.playerId) {
        // 发送事件：非房主进入了房间
        ClientEvent.dispatchEvent(Constant.EVENT_NAME.ON_OTHER_JOIN_ROOM, playerInfo.playerId);
      } else {
        // 房主加入了房间，设置对应属性
        this._isRoomOwnIn = true;
      }

      // 进入房间的不是玩家自身，那么重置另外一个玩家的掉线倒计时。
      if (playerInfo.playerId != this._ownPlayerId) {
        if (this._otherDisInterval > 0) {
          clearInterval(this._otherDisInterval);
          this._otherDisInterval = 0;
        }
      }

      // 进入房间的是玩家自身，根据自定义房间属性初始化相关状态
      if (this._room && playerInfo.playerId === this._ownPlayerId && this._room.customRoomProperties) {
        if (this._room.customRoomProperties === ROOM_TYPE.READY) {
          this.roomType = ROOM_TYPE.READY;
          this._time = 0;
        } else if (this._room.customRoomProperties === ROOM_TYPE.END) {
          this.roomType = ROOM_TYPE.END;
          this._time = new Date().getTime() - Constant.GAME_TIME * 1000;
        } else {
          const info: object = JSON.parse(this._room.customRoomProperties);
          this.roomType = info['type'];
          this._time = info['time'];
        }
      }
    });

    /** --------------------加入房间失败-------------------- */
    this._room.onJoinFailed(error => {
      console.log('进入房间失败，error：', error);
    });
  }
  //#endregion

  /**
   * 初始化SDK
   * @param openId 玩家唯一标示符
   * @param callback 回调函数
   * @returns
   */
  public initSDK(openId: string, callback: Function) {
    this._openId = openId;
    this._getToken(callback);
  }

  /**
   * 获取token
   * @param callback 回调函数
   */
  private _getToken(callback: Function) {
    const url: string = 'https://connect-drcn.hispace.hicloud.com/agc/apigw/oauth2/v1/token';
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=utf-8');
    xhr.onload = () => {
      if (xhr.status !== 200) {
        return;
      }

      console.log('请求token响应数据JSON：', xhr.response);
      const info = JSON.parse(xhr.response);
      this._initMgobe(info['access_token'], callback);
    };

    const data = {
      'client_id': GobeUtil.CLIENT_ID,
      'client_secret': GobeUtil.CLIENT_SECRET,
      'grant_type': 'client_credentials',
      'useJwt': 0
    };

    xhr.send(JSON.stringify(data));
  }

  //#region 初始化Mgobe
  /**
   * 初始化Mgobe
   * @param token token
   * @param callback 回调函数
   */
  private _initMgobe(token: string, callback: Function) {
    if (sys.platform === sys.Platform.ANDROID || sys.platform === sys.Platform.OPENHARMONY) {
      // 如果当前平台是安卓或者鸿蒙时

      // 还没加载证书
      if (this._cacertNativeUrl == '') {
        return this._loadCert(token, callback);
      }

      console.log('登录安卓/鸿蒙平台，token：', token);
      this._client = new GOBE.Client({
        appId: GobeUtil.APP_ID, // 应用ID
        openId: this._openId, // 玩家ID，区别不同用户
        clientId: GobeUtil.CLIENT_ID, // 客户端ID
        clientSecret: GobeUtil.CLIENT_SECRET, // 客户端密钥
        accessToken: token, // AGC接入凭证(推荐)
        platform: GOBE.PlatformType.OTHERS,
        cerPath: this._cacertNativeUrl
      });
    } else {
      console.log('登录非安卓/鸿蒙平台，token：', token);
      this._client = new GOBE.Client({
        appId: GobeUtil.APP_ID, // 应用ID
        openId: this._openId, // 玩家ID，区别不同用户
        clientId: GobeUtil.CLIENT_ID, // 客户端ID
        clientSecret: GobeUtil.CLIENT_SECRET, // 客户端密钥
        accessToken: token // AGC接入凭证(推荐)
      });
    }

    this._statistics();

    // 发送客户端初始化请求
    this._client
      .init()
      .then(client => {
        // 已完成初始化请求，这里先设置一部分状态。还有其他状态需要依赖服务器返回的结果设置，具体初始化结果通过下面客户端注册的onInitResult回调函数获取。
        this._ownPlayerId = client.playerId;
        this._lastRoomId = this._client.lastRoomId;
        this.serverTimeDis = client.loginTimestamp - new Date().getTime();
      })
      .catch(err => {
        // 初始化请求失败，重新初始化或联系华为技术支持
        console.log('客户端初始化失败，error：', err);
        callback && callback(false);
      });

    // 注册客户端初始化结果回调函数，获取初始化成功后具体的结果并处理
    this._client.onInitResult(resultCode => {
      if (resultCode == 0) {
        callback && callback(true);

        if (this._lastRoomId) {
          GobeUtil.instance.joinRoom(
            this.lastRoomId,
            () => {
              if (this._room.customRoomProperties === ROOM_TYPE.READY) {
                // 游戏未开始，退出房间
                this.leaveRoom();
                this._lastRoomId = '';
              } else {
                const info: Object = JSON.parse(this._room.customRoomProperties);
                if (info['type'] === ROOM_TYPE.END) {
                  // 游戏已经结束，退出房间
                  this.leaveRoom();
                  this._lastRoomId = '';
                } else {
                  // 游戏时间内，判断是否已经超过了最大掉线重连时间
                  const time: number = info['time'];
                  const currTime: number = Math.floor(Constant.GAME_TIME - (new Date().getTime() - time + GobeUtil.instance.serverTimeDis) / 1000);

                  if (currTime > 5) {
                    setTimeout(() => {
                      // 游戏时间内 重新进入房间
                      UIManager.instance.showDialog(Constant.PANEL_NAME.READY, null, () => {}, true);
                      UIManager.instance.showTips(Constant.ROOM_TIPS.JOIN_ROOM_SUCCESS);
                      UIManager.instance.hideDialog(Constant.PANEL_NAME.JOIN_ROOM_PANEL);
                    }, 500);

                    this._isDisJoin = true;
                  } else {
                    // 超过游戏时间 退出房间
                    this.leaveRoom();
                    this._lastRoomId = '';
                  }
                }
              }

              console.log(`重新进入房间id为${this._lastRoomId}的房间成功`);
            },
            error => {
              console.log(`重新进入房间id为${this._lastRoomId}的房间失败，error：`, error);
            }
          );
        }
      }
    });
  }

  private _statistics() {
    let params = {
      'appType': 'hwsdk',
      'reportType': 'Start',
      'sdkName': 'hwgobe',
      'appId': GobeUtil.APP_ID,
      'time': Date.now(),
      'version': '1.0.0_13.6.2'
    };
    fetch('https://k.cocos.org/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(params)
    })
      .then((response: Response) => {
        return response.text();
      })
      .then(value => {
        console.log(value);
      });
  }
  //#endregion

  /**
   * 获取证书 url
   * @param token token
   * @param callback 回调函数
   */
  private _loadCert(token: string, callback: Function) {
    resources.load('/endpoint-cert', Asset, (err, asset) => {
      console.log('加载证书结束 ' + !err);
      if (err) {
        return;
      }

      this._cacertNativeUrl = asset.nativeUrl;
      this._initMgobe(token, callback);
    });
  }

  /** 初始化华为 */
  public initHuawei() {
    if (sys.platform == sys.Platform.ANDROID) {
      native.reflection.callStaticMethod('com/cocos/game/JosAppControl', 'initHuawei', '()V');
    }
  }

  /** 登录华为 */
  public hwSignIn() {
    if (sys.platform == sys.Platform.ANDROID) {
      native.reflection.callStaticMethod('com/cocos/game/JosAppControl', 'signIn', '()V');
    }
  }
}
