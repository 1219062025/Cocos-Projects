function adInit() {

    (window["dapi"].isReady()) ? onReadyCallback(): window["dapi"].addEventListener("ready",onReadyCallback);
    // declaration();
    window.boot();
}

function onReadyCallback() {
    //无需再监听此事件
    window["dapi"].removeEventListener("ready", onReadyCallback);
    var isAudioEnabled = !!window["dapi"].getAudioVolume();
    if (window["dapi"].isViewable()) {
        adVisiblebindback({
            isViewable: true
        });
    }
    window["dapi"].addEventListener("viewableChange", adVisiblebindback);
    //dapi.addEventListener("adResized", adResizebindback);
    window["dapi"].addEventListener("audioVolumeChange", audioVolumeChangebindback);
}

function adVisiblebindback(event){
    if (event.isViewable) {
        var screenSize = window["dapi"].getScreenSize();
        
    } else {
        //暂停广告
    }
}

function audioVolumeChangebindback(volume){
    var isAudioEnabled = !!volume;
    if (isAudioEnabled) {
        //打开声音 
    } else {
        //关闭声音 
    }
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
    console.log('link to IronSource!');
    window.dapi && window.dapi.openStoreUrl();
}

function declaration() {
    var _LoadingHtml = `<div class="guaranteed"><div class="text">for illustration purposes only</div></div><style>.guaranteed { pointer-events: none;width: 100%; height: 6%; background-color: black; background-size: 100% 100%; position: absolute; bottom: 0; opacity:0.4; z-index: 9999;} .guaranteed .text { pointer-events: none;font-size: 4vw; color: white; text-align: center; } @media all and (orientation : landscape) { .guaranteed .text {   pointer-events: none;font-size: 2vw;   color: white;   text-align: center; }}</style>`;
    document.write(_LoadingHtml);
  }

adInit();