function adInit(){
    if (window.playableSDK && window.playableSDK.isViewable) {
        //@ts-ignore
        window.playableSDK.isViewable().then(function(viewable){
            if(viewable){
                //页面可见
            }else{
                //页面隐藏
            }
        });
    }
    addEvent();
    gameStart();
}

function addEvent(){
    if(window.playableSDK){
        window.playableSDK.addEventListener('visibilityChange',onVisibilityChange);
    }
}

function removeEvent(){
    if(window.playableSDK){
        window.playableSDK.removeEventListener('visibilityChange',onVisibilityChange);
    }
}

function onVisibilityChange(state){
    if (state.viewable) {
        // 页面可见
    } else {
        // 页面不可见
    }
}

function gameLoad(){
    console.log('game Load!');
    window.playableSDK && window.playableSDK.sendEvent('loadMainScene');
}

function gameStart(){
    window.boot();
    console.log('game start!');
}

function gameCompleted(){
    console.log('game over!');
    window.playableSDK && window.playableSDK.sendEvent('finishPlayPlayable');
}

function gameClose(){
    console.log('game close!');
}

function linkToStore(){
    console.log('link to Panglin!');
    window.playableSDK && window.playableSDK.openAppStore();
}

adInit();

