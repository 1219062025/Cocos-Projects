function adInit() {
  if (window['mraid']) {
    //marid
    if (window['mraid'].getState() === 'loading') {
      window['mraid'].addEventListener('ready', onSdkReady);
    } else {
      onSdkReady();
    }
  } else {
    showMyAd();
  }
  // declaration();
  draw_ads();

  console.log('Ad init!');
}

function onSdkReady() {
  window['mraid'].addEventListener('viewableChange', viewableChangeHandler);
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
  // <!-- // <!== // <!== // <!== // declaration(); //添加这里会报错 ==> ==> ==> -->
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
  console.log('link to Applovin!');
  var ua = window.navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) {
    // window["mraid"].open(APPLE_URL);
    window['mraid'].open();
  } else {
    // window["mraid"].open(GOOGLE_URL);
    window['mraid'].open();
  }
}

function draw_ads() {
  let _LoadingHtml =
    '<img src="data:image/png;base64,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" style="position: absolute; width: 8vh; right: 3%; bottom: 1%; z-index: 99999"></img>';
  document.write(_LoadingHtml);
}
// function draw_close_button() {
// 	// var _LoadingHtml = ' style="position: absolute; width: 8vh; right: 3%; bottom: 1%; z-index: 99999"></img>';
// 	let _LoadingHtml = '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADkAAAA5CAYAAACMGIOFAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkI3MkM5M0VBMDE4RTExRUQ5NkYzOTk3MzNGNTVENTc4IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkI3MkM5M0VCMDE4RTExRUQ5NkYzOTk3MzNGNTVENTc4Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6QjcyQzkzRTgwMThFMTFFRDk2RjM5OTczM0Y1NUQ1NzgiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6QjcyQzkzRTkwMThFMTFFRDk2RjM5OTczM0Y1NUQ1NzgiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7vOe+nAAAEzElEQVR42uybTWwVVRTHX59IG7GlkBgt7aImYKkUKLGSkBANbGBBMQH5EELRHZCiW6MLEhNqDCsqbNsQjYbEQEuJ0fSF8iELyw5KLSUBpFGibF6B8lGU5/8mZ5LJyZl7582c+0qFk/wWb2buuef/3tx59557pqxQKGQ8WA1YBZaAN0ADeAVUgxfBY5AHt8EVMAouggFwSzuYMkWRC8FO8B5oTOHnN9ALjoARlciMyBRkwQYwWPBjg+Q/mybONALXg8uF0thl6i9RrElu19fBQdBqueYfcAGcAUM07v4EE2AczAazwDwar03gXfA2mGHxexJ8DK77vF13gPGIb/tf0A8+BFUJv/Uqat9P/iQbpzjUb9cXwKGITh+Db8GilOObY/x9Q/4lO0RxqYisAMciOvoFLFUWx1lC/Uh2jOJLJfIlMCA4fwj2gjLPAgPKqL+HQiwDFGcikeZW6BWc/g5aSiSO00L9cztpu3VtDjsFZ5dA7RQJDKilOLh1Fitys+DkIpgzxQID5lA83DbHFVkP8qzxGKh7SgQG1FFcYctT/E6RJ1jD+6D5KRMYYOKaYPGecIlsFW6BPZYn3qfgJhgGqxWDN79GDvwFvgOVlmv3CDGvjxJpJsFD7OLTlr+JfezaB2CNksDrzHe/JQ5z/BS7fgTMkERuEGYyTZZgbgnfYFqhksDAFlraNQkzo62SyF/ZRd2OgEYjgkkq1CbQzGNfc7TvZm0ucJHNgtMFDqdGyCMloTaBxr6I4WOBMKlvDos8wE7mYgbXqiDUJbCjiC8rx9p+FRY5zE62FeE4jVBNgRmKO2zDgch5wgOn2PVgEqHaAoP1KH8A1ZgT29jB8wmfjMUI9SEw4Dzz9UGW0oZhO50wJ9YH3geTwrkK0APWgHpKPdZH+PkSfJYiN8fjX2qUH2fKN6X8M1/n+EXHPP2CAZuYz56MkHHTmKfahPoUaFjGM33m4N/s4KtKnRUjVEtghuIP2x8ZIZByxQ7jCNUUaJjJ/N8xD56ZbKA+UtyGGKL9jih7QrlZTeMPvsqscLBcqbPgKVpruSYbeupqWSX7fDdLGe2wVSsKrI9xbYWy0CpJJL+d6jwLfOJZaA37nDcirwpbcL4EdtDW3qRHoQ3s89WssAe4yKPAz2nTZqNHoTz+Ea25q2suuj/BzGit0tx1m8YqJIlAX0JNwmtSWoWkWU+mEehD6I6o9aSUGegvkUBtoTwzcMCV45lvcTZXUWBcoSsd7ee7cjwZobihy+KwXVlgHKE/ONp2ubJ1UXnXqN3jXR4EuoR+b2nzppD22B43g56LyFxXCrtK+z2uXvK0TozKoOfiZtCDspW4eyFmXH4NfgIfedjMWWFW9eCoI5O/u5i9kIA+1mBimu1q9f3f9yfH4+5PTued5i3PawYiqj9+FJzdmMLqj7eof24/J63+cNXxtJe4jqfdRx1PuCKrN+LP/xxVTPkUuJj6kaxHoyIrbm2dqYFrVBbX6KitO6xZW8dT8K4qyTZHIYNrPdgWo0qyqK2MpPWunWCdo951EJwFl6jG3NS73gN3KKP2MtW7mhr1xeAdsDxGvesn4FqpyrOnTeXyM1GD/ky8TaApkid4V9NYa6BxV03jsIrG5T16N2Q09F7IKR/vhfwnwADQeb7h7Fu8PQAAAABJRU5ErkJggg==" style="position: absolute; width: 5vh; right: 3%; top: 1%; z-index: 99999"></img>'
// 	document.write(_LoadingHtml);
// }

function declaration() {
  var _LoadingHtml = `<div class="guaranteed"><div class="text">Result is not guaranteed.Amount paid to you is subject to rules in the app.</div></div><style>.guaranteed { pointer-events: none;width: 100%; height: 6%; background-color: black; background-size: 100% 100%; position: absolute; bottom: 0; opacity:0.4; z-index: 9999;} .guaranteed .text { pointer-events: none;font-size: 4vw; color: white; text-align: center; } @media all and (orientation : landscape) { .guaranteed .text {   pointer-events: none;font-size: 2vw;   color: white;   text-align: center; }}</style>`;
  document.write(_LoadingHtml);
}

// draw_ads();

adInit();
