// @ts-nocheck
function adInit() {
  console.log('Ad init!');

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
  console.log('link to AdWords!');
  window.ExitApi && window.ExitApi.exit();
}

adInit();
