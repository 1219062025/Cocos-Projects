gi.Event.on('initTriggerOffCb', () => {
  if (gi.getLevel() !== 8) return;
});

/** 拖动男人到窗外 */
export function man(options: gi.TriggerOffCbOptions) {
  options.nodes[1].active = true;

  (cc.tween(options.nodes[0]) as cc.Tween)
    .delay(0.3)
    .to(0.5, { position: cc.v2(options.nodes[0].x - options.nodes[0].width, 0) })
    .call(() => {
      options.nodes[0].destroy();
    })
    .start();
}

/** 把钱给男人 */
export function mistress(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = false;
  options.nodes[1].active = true;

  (cc.tween(options.nodes[1]) as cc.Tween)
    .call(() => {})
    .to(1, { scaleY: 0.98 })
    .to(1, { scaleY: 1 })
    .union()
    .repeatForever()
    .start();
}
