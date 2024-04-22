
const { ccclass, property } = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

    @property(cc.Float)
    time = 0.0;

    @property(cc.Integer)
    offsetAngle = 0

    // @property(cc.Float)
    // delay = 0.0;

    // @property({ tooltip: "开启来回旋转" })
    // isReturn: boolean = false;

    private startAngle: number;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        if (!this.startAngle) {
            this.startAngle = this.node.angle;
        }
    }

    start() {
        cc.tween(this.node)
            .by(this.time, { angle: this.offsetAngle })
            .union()
            .repeatForever()
            .start();
    }

    // update (dt) {}
}
