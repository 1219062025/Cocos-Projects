export function gift(options: gi.SubscriptionOptions) {
  gi.Swipe.once(options.target, { direction: gi.Swipe.Direction.UP }, () => {
    options.target.active = false;
    options.nodes[0].active = true;
    options.nodes[1].active = true;
  });
}
