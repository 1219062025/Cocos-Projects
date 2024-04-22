import CounterI18nLabel from './i18n/CounterI18nLabel';
import ENDCARD from './endCard';
import i18nMgr from './i18n/i18nMgr';
import { Language } from './i18n/i18nType';
import CounterProgressBar from './CounterProgressBar';
import EventManager from './EventManager';
import { DotsEnum } from './DotsEnum';

const { ccclass, property } = cc._decorator;

export enum CountryMoneyCount {
  en = 500 / 5,
  id = 50000 / 5,
  in = 10000 / 5,
  pt = 500 / 5,
  ru = 5000 / 5,
  fil = 50000 / 5,
  tr = 1000 / 5
}

@ccclass
export default class EffectCtrlProgressBarTop extends cc.Component {
  @property(CounterI18nLabel)
  CounterLabel: CounterI18nLabel = null;

  @property(ENDCARD)
  EndCard: ENDCARD = null;

  @property(cc.Node)
  ProgressBarRotateLight: cc.Node = null;

  @property(CounterProgressBar)
  progressBar: CounterProgressBar = null;

  onLoad() {
    EventManager.on(DotsEnum.DestoryDotsEvent, this.ProgressBarAdd, this);
  }

  start() {}

  public addMoneyCount() {
    let curlan = Language[i18nMgr.ins.getLanguage()];
    let num = CountryMoneyCount[curlan];
    this.CounterLabel.by(num);
  }

  public showEndCard() {
    this.EndCard.node.active = true;
  }

  private ProgressBarAdd() {
    cc.log('ProgressBarAdd');
    let time = 0.5;
    this.progressBar.by(1 / 5, time, () => {
      if (this.progressBar.progress >= 0.99) {
        this.ProgressBarRotateLight.active = true;
      }
    });
  }
}
