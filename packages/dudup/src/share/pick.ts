/**
 * 获取对象指定属性
 * @param object 对象
 * @param keys 属性集合
 */
const pick = <T extends { [key: string]: any }, K extends keyof T>(object: T, keys: K[]): Pick<T, K> => {
  return keys.reduce((obj, key: any) => {
    if (object && object.hasOwnProperty(key)) {
      obj[key] = object[key]
    }

    return obj
  }, {}) as any
}

export default pick
