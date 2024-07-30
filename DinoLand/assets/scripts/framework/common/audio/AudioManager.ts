import { _decorator, Component, director, Node } from 'cc';
import { AudioEffect } from './AudioEffect';
import { AudioMusic } from './AudioMusic';
import { storage } from '../storage/localStorage';
const { ccclass, property } = _decorator;

const LOCAL_STORE_KEY = 'game_audio';

@ccclass('AudioManager')
export class AudioManager extends Component {
  private static _instance: AudioManager;
  public static get instance() {
    if (!this._instance) {
      // 挂载全局音频管理脚本组件，并声明为常驻节点
      const node = new Node('UIAudioManager');
      this._instance = node.addComponent(AudioManager);
      director.addPersistRootNode(node);

      // 创建音乐管理节点
      const musicNode = new Node('UIAudioMusic');
      musicNode.setParent(node);
      this._instance._music = musicNode.addComponent(AudioMusic);

      // 创建音效管理节点
      const effectNode = new Node('UIAudioEffect');
      effectNode.setParent(node);
      this._instance._effect = effectNode.addComponent(AudioEffect);

      this._instance.init();
    }
    return this._instance;
  }

  /** 本地存储的数据 */
  private _localData: any = {};
  /** 音乐控制 */
  private _music: AudioMusic;
  /** 音效控制 */
  private _effect: AudioEffect;
  /** 音乐音量，百分比0-1 */
  private _musicVolume: number = 1;
  /** 音效音量，百分比0-1 */
  private _effectVolume: number = 1;
  /** 音乐是否打开 */
  private _musicSwitch: boolean = true;
  /** 音效是否打开 */
  private _effectSwitch: boolean = true;
  /** 玩家唯一标识，一般为玩家数据库唯一编号 */
  private _uuid: string = '10000';
  /** 本地存储标签名 */
  private _localStorageTag: string = LOCAL_STORE_KEY;

  /** 初始化 */
  init() {
    const data = storage.get(this._localStorageTag);

    // 如果存在本地存储时，按照存储的数据初始化
    if (data) {
      try {
        this._localData = JSON.parse(data);
        this._musicVolume = this._localData._musicVolume;
        this._effectVolume = this._localData._effectVolume;
        this._musicSwitch = this._localData._musicSwitch;
        this._effectSwitch = this._localData._effectSwitch;
      } catch (err) {
        this._localData = {};
        this._musicVolume = 1;
        this._effectVolume = 1;
        this._musicSwitch = true;
        this._effectSwitch = true;
      }
    }

    this._music.volume = this._musicVolume;
    this._effect.volume = this._effectVolume;
  }

  /** 设置玩家唯一标识 */
  public setUuid(value: string) {
    this._uuid = value;
    this._localStorageTag = `${LOCAL_STORE_KEY}_${this._uuid}`;
  }

  /**
   *  播放音乐
   * @param url 资源地址
   * @param callback  音乐播放完成回调
   */
  public playMusic(url: string, callback?: Function) {
    if (this._musicSwitch) {
      this._music.load(url);
      this._music.onComplete = callback;
    }
  }

  /**
   * 播放音效
   * @param url 资源地址
   */
  public playEffect(url: string) {
    if (this._effectSwitch) {
      this._effect.load(url);
    }
  }

  /** 音乐音量 */
  public get musicVolume(): number {
    return this._musicVolume;
  }
  public set musicVolume(value: number) {
    this._musicVolume = value;
    this._music.volume = value;
  }

  /** 音效音量 */
  public get effectVolume(): number {
    return this._effectVolume;
  }
  public set effectVolume(value: number) {
    this._effectVolume = value;
    this._effect.volume = value;
  }

  /** 音乐开关 */
  public getSwitchMusic(): boolean {
    return this._musicSwitch;
  }
  public setSwitchMusic(value: boolean) {
    this._musicSwitch = value;

    this.save();

    if (value == false) this._music.stop();
    else this._music.play();
  }

  /** 音效开关 */
  public getSwitchEffect(): boolean {
    return this._effectSwitch;
  }
  public setSwitchEffect(value: boolean) {
    this._effectSwitch = value;
    this.save();
    if (value == false) this._effect.stop();
  }

  /** 播放所有被暂停的音频 */
  public resumeAll() {
    if (this._music && this._musicSwitch) {
      this._music.play();
    }

    if (this._effect && this._effectSwitch) {
      this._effect.play();
    }
  }

  /** 暂停所有音频 */
  public pauseAll() {
    if (this._music) {
      this._music.pause();
    }

    if (this._effect) {
      this._effect.pause();
    }
  }

  /** 停止所有音频 */
  public stopAll() {
    if (this._music) {
      this._music.stop();
      this._effect.stop();
    }
    if (this._effect) {
      this._effect.stop();
    }
  }

  /** 保存当前音频配置信息 */
  save() {
    this._localData.volume_music = this._musicVolume;
    this._localData.volume_effect = this._effectVolume;
    this._localData.switch_music = this._musicSwitch;
    this._localData.switch_effect = this._effectSwitch;

    let data = JSON.stringify(this._localData);
    storage.set(this._localStorageTag, data);
  }
}
