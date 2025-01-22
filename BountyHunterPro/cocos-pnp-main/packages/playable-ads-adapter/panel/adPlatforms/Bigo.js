// @ts-nocheck
function adInit() {
  gameLoad();
  console.log('Ad init!');
}

function linkToStore() {
  window.BGY_MRAID && window.BGY_MRAID.open();
  console.log('link to store!');
}

function gameCompleted() {
  window.BGY_MRAID && window.BGY_MRAID.gameEnd();
  console.log('game over!');
}

function gameLoad() {
  window.BGY_MRAID && window.BGY_MRAID.gameReady();
  // you should excute window.boot() in adInit() , but i dont know why,i suspect is lib/main.js,spend time to read it
  window.boot();
  console.log('game ready!');
}

function gameStart() {
  console.log('game start!');
}

adInit();
