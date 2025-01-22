// @ts-nocheck
function adInit() {
  gameStart();
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
  window['parent'].postMessage('complete', '*');
}

function gameClose() {
  console.log('game close!');
}

function linkToStore() {
  console.log('link to Vungle!');
  window['parent'].postMessage('download', '*');
}

adInit();
