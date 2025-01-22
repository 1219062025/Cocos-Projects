// @ts-nocheck
function adInit() {
  window._gdtUnSdk =
    window.GDTUnSdk &&
    new window.GDTUnSdk({
      type: 'playable', // String - 类型：互动（试玩）广告
      onSuccess: function (res) {
        // Function：转化按钮成功回调方法
        console.log(res);
      },
      onError: function (res) {
        // Function：实例化异常回调方法
        console.log(res);
      }
    });

  gameStart();
}

function gameLoad() {
  console.log('game load!');
}

function gameStart() {
  window.boot();
  console.log('game start!');
}

function gameCompleted() {
  console.log('game over!');
  //window['parent'].postMessage('complete', '*');
}

function gameClose() {
  console.log('game close!');
}

function linkToStore() {
  console.log('link to GDT!');
  window._gdtUnSdk.playAble.onClick();
}

adInit();
