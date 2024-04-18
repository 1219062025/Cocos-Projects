
const { ccclass, property } = cc._decorator;

@ccclass
export default class repeatScale extends cc.Component {

    @property(cc.Float)
    scaleTime = 1.0

    @property({ type: cc.Float, visible() { return this.isBy } })
    byScale = 0.1

    @property({ type: cc.Float, visible() { return this.isTo } })
    toMax = 1.1

    @property({ type: cc.Float, visible() { return this.isTo } })
    toMin = 1

    @property({ visible() { return !this.isTo }, tooltip: '先加后减' })
    isBy = false;

    @property({ visible() { return !this.isBy } })
    isTo: boolean = false;

    @property()
    isRepeatForever: boolean = true;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start() {
        if (!this.isRepeatForever) {
            if (this.isBy) {
                cc.tween(this.node)
                    .by(this.scaleTime, { scale: this.byScale })
                    .by(this.scaleTime, { scale: -this.byScale })
                    .union()
                    // .repeatForever()
                    .start()
                return
            } else if (this.isTo) {
                cc.tween(this.node)
                .to(this.scaleTime, { scale: this.toMax })
                .to(this.scaleTime, { scale: this.toMin })
                    .union()
                    // .repeatForever()
                    .start()
                return
            }
        }
        if (this.isBy) {
            cc.tween(this.node)
                .by(this.scaleTime, { scale: this.byScale })
                .by(this.scaleTime, { scale: -this.byScale })
                .union()
                .repeatForever()
                .start()
            return
        } else if (this.isTo) {
            cc.tween(this.node)
                .to(this.scaleTime, { scale: this.toMax })
                .to(this.scaleTime, { scale: this.toMin })
                .union()
                .repeatForever()
                .start()
            return
        }
    }

    // update (dt) {}
}
