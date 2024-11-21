import InstanceBase from "./common/InstanceBase";
import ResourceManager from "./ResourceManager";

/** 全局音频管理 */
class AudioManager extends InstanceBase {
  /** 已缓存的音频片段 */
  private _audioClipMap = new Map<string, cc.AudioClip>();

  /** 音乐 音频组件 */
  private _musicSource: cc.AudioSource = null;
  /** 音效 音频组件池 */
  private _soundSourcePool: cc.AudioSource[] = [];

  /** 音乐 音量 */
  private _musicVolume: number = 1;
  /** 音效 音量 */
  private _soundVolume: number = 1;

  /** 音频组件挂载的根节点，同时将其声明为常驻节点，避免场景切换出错 */
  private _persistRootNode: cc.Node = null;

  constructor() {
    super();
  }

  init() {
    if (this._persistRootNode) return;

    this._persistRootNode = new cc.Node("audio");
    this._musicSource = this._persistRootNode.addComponent(cc.AudioSource);

    cc.Canvas.instance.node.addChild(this._persistRootNode);

    // 声明为常驻节点
    // cc.game.addPersistRootNode(this._persistRootNode);
  }

  /** 加载一个音频 */
  public loadAudio(path: string): Promise<cc.AudioClip> {
    return new Promise<cc.AudioClip>((resolve, reject) => {
      // 如果已经存在缓存
      if (this._audioClipMap.has(path)) {
        resolve(this._audioClipMap.get(path)!);
        return;
      }

      ResourceManager.loadRes<cc.AudioClip>(path, cc.AudioClip, (err, clip) => {
        if (err) {
          reject(err);
        } else {
          this._audioClipMap.set(path, clip);
          resolve(clip);
        }
      });
    });
  }

  /** 播放音乐 */
  public playMusic(path: string, loop: boolean = true) {
    this.loadAudio(path).then((clip) => {
      if (this._musicSource.isPlaying) {
        this._musicSource.stop();
      }
      this._musicSource.clip = clip;
      this._musicSource.loop = loop;
      this._musicSource.volume = this._musicVolume;
      this._musicSource.play();
    });
  }

  /** 播放音效 */
  public playSound(path: string, loop: boolean = false): void {
    this.loadAudio(path).then((clip) => {
      const audioSource = this._getSoundAudioSource();
      if (audioSource) {
        audioSource.clip = clip;
        audioSource.loop = loop;
        audioSource.volume = this._soundVolume;
        audioSource.play();
      }
    });
  }

  /**  获取一个控制音效的 AudioSource（对象池机制） */
  private _getSoundAudioSource(): cc.AudioSource | null {
    // 获取当前处于空闲状态的AudioSource
    for (let i = 0; i < this._soundSourcePool.length; i++) {
      const audioSource = this._soundSourcePool[i];
      if (!audioSource.isPlaying) {
        return audioSource;
      }
    }

    // 如果没有空闲状态的AudioSource并且已存在的AudioSource数量未超出上限的话就新建AudioSource（同时挂载到常驻节点上）
    if (this._soundSourcePool.length < 10) {
      const newAudioSource = this._persistRootNode.addComponent(cc.AudioSource);
      this._soundSourcePool.push(newAudioSource);
      return newAudioSource;
    }

    return null;
  }

  /** 暂停音乐 */
  public pauseMusic() {
    if (this._musicSource.isPlaying) {
      this._musicSource.pause();
    }
  }

  /** 恢复音乐 */
  public resumeMusic() {
    if (!this._musicSource.isPlaying) {
      this._musicSource.resume();
    }
  }

  /** 停止音乐 */
  public stopMusic() {
    this._musicSource.stop();
  }

  /** 停止所有音效 */
  public stopSound() {
    for (const audioSource of this._soundSourcePool) {
      audioSource.stop();
    }
  }

  /** 设置音乐音量 */
  public setMusicVolume(volume: number) {
    this._musicVolume = volume;
    if (this._musicSource.isPlaying) {
      this._musicSource.volume = this._musicVolume;
    }
  }

  /** 设置音效音量 */
  public setSoundVolume(volume: number): void {
    this._soundVolume = volume;
    for (const audioSource of this._soundSourcePool) {
      if (audioSource.isPlaying) {
        audioSource.volume = this._soundVolume;
      }
    }
  }
}

export default AudioManager.instance();
