import * as configType from './config';

/** 全局类型 */
const gt: Record<string, Record<string, string | number>> = {};

function setEnum(obj) {
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && key !== 'default') {
      gt[key] = Enum(obj[key]);
    }
  }
}

/** 生成枚举 */
function Enum(obj: Record<string, string | number>) {
  if ('__enums__' in obj) {
    return obj;
  }
  value(obj, '__enums__', null, true, undefined);

  let lastIndex = -1;
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    let val = obj[key];

    if (val === -1) {
      val = ++lastIndex;
      obj[key] = val;
    } else {
      if (typeof val === 'number') {
        lastIndex = val;
      } else if (typeof val === 'string' && Number.isInteger(parseFloat(key))) {
        continue;
      }
    }
    const reverseKey = '' + val;
    if (key !== reverseKey) {
      value(obj, reverseKey, key);
    }
  }
  return obj;
}

/** 设置值 */
function value(obj: object, prop: string, value: any, writable?: boolean, enumerable?: boolean) {
  const tmpValueDesc = {
    value: undefined,
    enumerable: false,
    writable: false,
    configurable: true
  };
  tmpValueDesc.value = value;
  tmpValueDesc.writable = writable;
  tmpValueDesc.enumerable = enumerable;
  Object.defineProperty(obj, prop, tmpValueDesc);
  tmpValueDesc.value = undefined;
}

setEnum(configType);

export default gt;
