import { StorageManager } from './storageManager';
import { _decorator, AudioSource, Component, director, Node } from 'cc';
const { ccclass, property } = _decorator;

interface AudioData {
  /** 音频组件 */
  source: AudioSource;
  /** 是否是音乐 */
  isMusic: boolean;
}

interface AudioDataMap {
  [name: string]: AudioData;
}

/** 全局音频管理类 */
@ccclass('AudioManager')
export class AudioManager {
  private static _instance: AudioManager = null;

  /** 全局音频管理单例 */
  public static get instance() {
    if (this._instance == null) {
      this._instance = new AudioManager();
    }

    return this._instance;
  }

  /** 全局音频管理常驻节点 */
  private _persistRootNode: Node = null!;

  /** 音乐音量 */
  musicVolume: number = 0.8;
  /** 音效音量 */
  soundVolume: number = 1;
  /** 所有音频数据的映射 */
  audios: AudioDataMap = {};
  arrSound: AudioData[] = [];

  public init() {
    if (this._persistRootNode) return;

    this._persistRootNode = new Node('audio');

    // 初始化打开所有音频
    this.openAudio();

    // 将全局音频控制节点添加到场景中并声明为常驻节点
    director.getScene()!.addChild(this._persistRootNode);
    director.addPersistRootNode(this._persistRootNode);

    this.musicVolume = this.getAudioSetting(true) ? 0.8 : 0;
    this.soundVolume = this.getAudioSetting(false) ? 1 : 0;
  }

  /** 获取本地存储的音频设置 */
  getAudioSetting(isMusic: boolean) {
    const state = StorageManager.instance.getGlobalData(isMusic ? 'music' : 'sound');
    // 不存在对应设置或者设置了为true时返回true
    return !state || state === 'true' ? true : false;
  }

  /** 设置所有音乐的音量 */
  setMusic(flag: number) {
    this.musicVolume = flag;

    // 从音频映射中找出是音乐的音频设置其音量
    for (let item in this.audios) {
      if (this.audios.hasOwnProperty(item) && this.audios[item].isMusic) {
        let audio = this.audios[item];
        audio.source.volume = this.musicVolume;
      }
    }
  }

  /** 设置所有音效的音量 */
  setSound(flag: number) {
    this.soundVolume = flag;

    // 从音频映射中找出是音效的音频设置其音量
    for (let item in this.audios) {
      if (this.audios.hasOwnProperty(item) && !this.audios[item].isMusic) {
        let audio = this.audios[item];
        audio.source.volume = this.soundVolume;
      }
    }

    for (let idx = 0; idx < this.arrSound.length; idx++) {
      let audio = this.arrSound[idx];
      audio.source.volume = this.soundVolume;
    }
  }

  /** 打开音乐 */
  openMusic() {
    this.setMusic(0.8);
    StorageManager.instance.setGlobalData('music', 'true');
  }

  /** 关闭音乐 */
  closeMusic() {
    this.setMusic(0);
    StorageManager.instance.setGlobalData('music', 'false');
  }

  /** 打开音效 */
  openSound() {
    this.setSound(1);
    StorageManager.instance.setGlobalData('sound', 'true');
  }

  /** 关闭音效 */
  closeSound() {
    this.setSound(0);
    StorageManager.instance.setGlobalData('sound', 'false');
  }

  /** 打开所有音频 */
  openAudio() {
    this.openMusic();
    this.openSound();
  }
}
