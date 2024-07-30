import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
import { App } from '../../App';
const { ccclass, property } = _decorator;

/** 音乐管理器。音乐是长音乐，对比音效来说同一时间只能存在一个音乐 */
@ccclass('AudioMusic')
export class AudioMusic extends AudioSource {
  /** 播放完一次音乐后的回调函数 */
  public onComplete: Function = null;

  /** 当前播放的音乐的url */
  private _url: string = '';
  /** 当前音乐的播放进度 */
  private _progress: number = 0;
  /** 是否存在音乐在播放中 */
  private _isPlaying: boolean = false;

  /** 当前播放进度，进度百分比(0~1) */
  public get progress() {
    this._progress = this.currentTime / this.duration;
    return this._progress;
  }
  public set progress(value: number) {
    this.progress = value;
    this.currentTime = value * this.duration;
  }

  /** 加载音乐 */
  public load(url: string, callback?: Function) {
    App.resMgr.loadRes(url, (res: AudioClip) => {
      /** 音乐片段资源 */
      const audioclip = res;

      // 如果存在播放中的音乐需要停止掉，并且释放掉。
      if (this._isPlaying) {
        this.stop();
        App.resMgr.releaseRes(this._url);
      }

      // 播放音乐
      this.clip = audioclip;
      this.currentTime = 0;
      this.loop = true;
      this.play();

      callback && callback();

      this._url = url;
    });
  }

  // 每帧检测当前音乐是否已经播放完成了并作出对应的处理。
  update(dt: number) {
    if (this.currentTime > 0) {
      this._isPlaying = true;
    }

    // 如果自控的_isPlaying还是true时，cc内部的playing却为false，意味着音乐播放完了，此时调用回调
    if (this._isPlaying && this.playing === false) {
      this._isPlaying = false;
      this.onComplete && this.onComplete();
    }
  }

  /** 释放资源 */
  release() {
    if (this._url) {
      App.resMgr.releaseRes(this._url);
      this._url = '';
    }
  }
}
