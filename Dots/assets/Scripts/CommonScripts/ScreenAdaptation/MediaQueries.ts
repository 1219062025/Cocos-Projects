import EventManager from '../EventManager';
import ScreenManager from './ScreenManager';

const { ccclass, property } = cc._decorator;

enum FeatureType {
  Orientation,
  MinWidth,
  MinHeight,
  MaxWidth,
  MaxHeight
}

enum Orientation {
  portrait,
  landscape
}

@ccclass
export default class MediaQueries extends cc.Component {
  @property({
    type: [cc.Enum(FeatureType)],
    tooltip: 'Orientation: 设备方向\nMinWidth: 屏幕宽度大于等于时\nMinHeight: 屏幕高度大于等于时\nMaxWidth: 屏幕宽度小于等于时\nMaxHeight: 屏幕高度小于等于时'
  })
  features: number[] = [];

  @property({
    type: [cc.Enum(Orientation)],
    displayName: 'orientation',
    tooltip: '设备方向为该值时触发。\nportrait：竖向\nlandscape：横向',
    visible() {
      return this.hasFeature(FeatureType.MinWidth);
    }
  })
  orientation: number = 0;

  @property({
    type: cc.Integer,
    displayName: 'min-width',
    tooltip: '屏幕宽度>=该值时触发',
    min: 0,
    max: cc.view.getCanvasSize().width,
    visible() {
      return this.hasFeature(FeatureType.MinWidth);
    }
  })
  MinWidth: number = 0;

  @property({
    type: cc.Integer,
    displayName: 'min-height',
    tooltip: '屏幕高度>=该值时触发',
    min: 0,
    max: cc.view.getCanvasSize().height,
    visible() {
      return this.hasFeature(FeatureType.MinHeight);
    }
  })
  MinHeight: number = 0;

  @property({
    type: cc.Integer,
    displayName: 'max-width',
    tooltip: '屏幕宽度<=该值时触发',
    min: 0,
    max: cc.view.getCanvasSize().width,
    visible() {
      return this.hasFeature(FeatureType.MaxWidth);
    }
  })
  MaxWidth: number = 0;

  @property({
    type: cc.Integer,
    displayName: 'max-height',
    tooltip: '屏幕高度<=该值时触发',
    min: 0,
    max: cc.view.getCanvasSize().height,
    visible() {
      return this.hasFeature(FeatureType.MaxHeight);
    }
  })
  MaxHeight: number = 0;

  /** 媒体查询id */
  mid: number = Infinity;

  onLoad() {
    this.Init();
  }

  Init() {
    this.mid = Math.floor(Math.random() * (1000000 - 99999) + 99999);
    ScreenManager.ins.add(this);
  }

  Inquire() {
    console.log(this.mid);
  }

  hasFeature(Feature: number) {
    return this.features.indexOf(Feature) !== -1;
  }
}
