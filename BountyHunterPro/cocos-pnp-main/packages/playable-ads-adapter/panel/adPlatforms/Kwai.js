// @ts-nocheck
function adInit() {
  console.log('Ad init!');
  window.boot();
  try {
    window.ks_playable_exposurePage();
  } catch (e) {
    console.log(e);
  }
  gameStart(); //开始游戏
}

function gameStart() {
  try {
    window.ks_playable_startPlay();
  } catch (e) {
    console.log(e);
  }
}

function linkToStore() {
  console.log('link to Kwai!');
  try {
    window.ks_playable_openAppStore();
  } catch (e) {
    console.log(e);
  }
}

adInit();
