function adInit() {

    if (window["mraid"]) {
        //marid
        if (window["mraid"].getState() === 'loading') {
            window["mraid"].addEventListener('ready', onSdkReady);
        } else {
            onSdkReady();
        }
    } else {
        showMyAd();
    }

    console.log('Ad init!');
}

function onSdkReady() {
    window["mraid"].addEventListener('viewableChange', viewableChangeHandler);
    if (window['mraid'].isViewable()) {
        showMyAd();
    }
}

function showMyAd() {
    gameStart();
}

function viewableChangeHandler(viewable) {
    if (viewable) {
        showMyAd();
    } else {
        //pasue
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
    console.log('link to Unity!');
    // console.log(GOOGLE_URL)
    var ua = window.navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) {
        window['mraid'].open(APPLE_URL);
    } else {
        window['mraid'].open(GOOGLE_URL);
    }
}

adInit();