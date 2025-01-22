// @ts-nocheck
function adInit() {
  gameStart(); //开始游戏
}

function gameLoad() {
  console.log('game ready!');
}

function gameStart() {
  window.boot();
  console.log('game start!');
}

function gameCompleted() {
  console.log('game over!');
}

function gameClose() {
  console.log('game close!');
}

function linkToStore() {
  console.log('link to FaceBook!');
  FbPlayableAd && FbPlayableAd.onCTAClick();
}

adInit();
