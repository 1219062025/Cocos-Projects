function adInit() {
  console.log('game init!');
  declaration();
  window.boot();
  gameLoad();
}

function gameLoad() {
  console.log('game load!');
  window.gameReady && window.gameReady();
  gameStart();
}

function gameCompleted() {
  console.log('game end!');
  window.gameEnd && window.gameEnd();
}

function gameStart() {
  console.log('game start!');
}

function gameClose() {
  console.log('game close!');
}

function linkToStore() {
  console.log('link to Mintegral!');
  window.install && window.install();
  gameCompleted();
  gameClose();
}

// function declaration() {
//   var _LoadingHtml = `<div class="guaranteed"><div class="text">Result is not guaranteed. Amount paid to you is subject to rules in the app.</div></div><style>.guaranteed { pointer-events: none;width: 100%; height: 6%; background-color: black; background-size: 100% 100%; position: absolute; bottom: 0; opacity:0.4; z-index: 9999;} .guaranteed .text { pointer-events: none;font-size: 4vw; color: white; text-align: center; } @media all and (orientation : landscape) { .guaranteed .text {   pointer-events: none;font-size: 2vw;   color: white;   text-align: center; }}</style>`;
//   document.write(_LoadingHtml);
// }
function declaration() {
  var _LoadingHtml = `<div class="guaranteed"><div class="text">*The creative promotion scene needs to reach a certain level or trigger the corresponding module to appear*</div></div><style>.guaranteed { pointer-events: none;width: 100%; height: 6%; background-color: black; background-size: 100% 100%; position: absolute; bottom: 0; opacity:0.4; z-index: 9999;} .guaranteed .text { pointer-events: none;font-size: 4vw; color: white; text-align: center; } @media all and (orientation : landscape) { .guaranteed .text {   pointer-events: none;font-size: 2vw;   color: white;   text-align: center; }}</style>`;
  document.write(_LoadingHtml);
}

adInit();
