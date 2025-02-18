import * as i18n from '../../../extensions/i18n/assets/LanguageData';
import { _decorator, Component, JsonAsset, Node, randomRange } from 'cc';
import { ResourceUtil } from './resourceUtil';
import { Constant } from './constant';
const { ccclass, property } = _decorator;

@ccclass('Util')
export class Util {
  /**
   * 数据解密
   * @param {String} str
   */
  public static decrypt(b64Data: string) {
    let n: number = 6;
    if (b64Data.length % 2 === 0) {
      n = 7;
    }

    let decodeData = '';
    for (var idx = 0; idx < b64Data.length - n; idx += 2) {
      decodeData += b64Data[idx + 1];
      decodeData += b64Data[idx];
    }

    decodeData += b64Data.slice(b64Data.length - n + 1);

    decodeData = this._base64Decode(decodeData);

    return decodeData;
  }

  /**
   * 数据加密
   * @param {String} str
   */
  public static encrypt(str: string) {
    let b64Data = this._base64encode(str);

    let n: number = 6;
    if (b64Data.length % 2 === 0) {
      n = 7;
    }

    let encodeData: string = '';

    for (let idx = 0; idx < (b64Data.length - n + 1) / 2; idx++) {
      encodeData += b64Data[2 * idx + 1];
      encodeData += b64Data[2 * idx];
    }

    encodeData += b64Data.slice(b64Data.length - n + 1);

    return encodeData;
  }

  /**
   * base64加密
   * @param {string}input
   * @returns
   */
  private static _base64encode(input: string) {
    let keyStr: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output: string = '',
      chr1: number,
      chr2: number,
      chr3: number,
      enc1: number,
      enc2: number,
      enc3: number,
      enc4: number,
      i: number = 0;
    input = this._utf8Encode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
  }

  /**
   * utf-8 加密
   * @param string
   * @returns
   */
  private static _utf8Encode(string: string) {
    string = string.replace(/\r\n/g, '\n');
    let utftext: string = '';
    for (let n: number = 0; n < string.length; n++) {
      let c: number = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }

  /**
   * utf-8解密
   * @param utftext
   * @returns
   */
  private static _utf8Decode(utftext: string) {
    let string = '';
    let i: number = 0;
    let c: number = 0;
    let c1: number = 0;
    let c2: number = 0;
    let c3: number = 0;
    while (i < utftext.length) {
      c = utftext.charCodeAt(i);
      if (c < 128) {
        string += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
        i += 3;
      }
    }
    return string;
  }
  /**
   * base64解密
   * @param {string}input 解密字符串
   * @returns
   */
  private static _base64Decode(input: string) {
    let keyStr: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output: string = '';
    let chr1: number;
    let chr2: number;
    let chr3: number;
    let enc1: number;
    let enc2: number;
    let enc3: number;
    let enc4: number;
    let i: number = 0;
    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    while (i < input.length) {
      enc1 = keyStr.indexOf(input.charAt(i++));
      enc2 = keyStr.indexOf(input.charAt(i++));
      enc3 = keyStr.indexOf(input.charAt(i++));
      enc4 = keyStr.indexOf(input.charAt(i++));
      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;
      output = output + String.fromCharCode(chr1);
      if (enc3 != 64) {
        output = output + String.fromCharCode(chr2);
      }
      if (enc4 != 64) {
        output = output + String.fromCharCode(chr3);
      }
    }
    output = this._utf8Decode(output);
    return output;
  }

  /**
   * 随机名字
   * @param staticId
   */
  public static async randomName(staticId: number) {
    let names = ((await ResourceUtil.loadResPromise('jsons/names', JsonAsset)) as JsonAsset).json;

    if (i18n._language === Constant.I18_LANGUAGE.CHINESE) {
      let lastName: string = '';

      const firsnames = names.firstnames;
      const boyNames = names.boyNames;
      const girlNames = names.girlNames;

      if (staticId == null) {
        lastName = boyNames[Math.floor(randomRange(0, 1) * boyNames.length)];
      } else {
        lastName = girlNames[Math.floor(randomRange(0, 1) * girlNames.length)];
      }

      const firstName = firsnames[Math.floor(randomRange(0, 1) * firsnames.length)];
      const playerName = firstName + lastName;
      return playerName;
    } else {
      const enNames = names.enNames;
      return enNames[Math.floor(randomRange(0, 1) * enNames.length)];
    }
  }
}
