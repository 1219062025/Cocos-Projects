/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2023-11-30 11:43:02
 * @LastEditors: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @LastEditTime: 2023-11-30 17:42:41
 * @FilePath: \Dots\assets\scripts\EffectCtrl.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import CounterI18nLabel from './i18n/CounterI18nLabel';
import i18nMgr from './i18n/i18nMgr';
import { Language } from './i18n/i18nType';
import ENDCARD from '../endCard';

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
export default class EffectCtrl extends cc.Component {
  @property(CounterI18nLabel)
  CounterLabel: CounterI18nLabel = null;

  @property(ENDCARD)
  EndCard: ENDCARD = null;

  start() {}

  public addMoneyCount() {
    let curlan = Language[i18nMgr.ins.getLanguage()];
    let num = CountryMoneyCount[curlan];
    this.CounterLabel.by(num);
  }

  public showEndCard() {
    this.EndCard.node.active = true;
  }
}
