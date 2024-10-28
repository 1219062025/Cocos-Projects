

gi.Event.on('initTriggerOffCb', () => {
  if (gi.getLevel() !== 23) return;
});
/** 油箱漏油 */
export function fuel(options: gi.TriggerOffCbOptions) {
  options.nodes[0].active = true;
  gi.Event.emit('score', 1);
  gi.Event.emit('moderate', 100);
  gi.Event.emit('showTips', '3');
  gi.completedAction('5');
}