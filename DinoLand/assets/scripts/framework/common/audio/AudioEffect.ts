import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
import { App } from '../../App';
const { ccclass, property } = _decorator;

/** 音效管理器。音效是短音乐，对比音乐来说会在同时有多个音效在播放的情况 */
@ccclass('AudioEffect')
export class AudioEffect extends AudioSource {
  private _effects: Map<string, AudioClip> = new Map([]);

  /** 播放音效 */
  public load(url: string, callback?: Function) {
    App.resMgr.loadRes(url, (res: AudioClip) => {
      /** 音效片段资源 */
      const audioClip = res;

      // 保存此次播放的音效资源信息，方便后续释放资源
      this._effects.set(url, audioClip);

      // 调用playOneShot接口播放音效，一次性播放，无法中途暂停或者停止
      this.playOneShot(audioClip, this.volume);
      callback && callback();
    });
  }

  /** 释放所有音效资源 */
  public release() {
    for (const key in this._effects) {
      App.resMgr.releaseRes(key);
    }
    this._effects.clear();
  }
}
