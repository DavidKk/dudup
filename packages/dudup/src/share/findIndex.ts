/**
 * 查找元素并返回该元素下标
 * @param collection 数据集合
 * @param callback 操作回调
 */
function findIndex(collection: any[], callback: (value: any, index: number) => boolean): number {
  if (!Array.isArray(collection)) {
    return -1
  }

  for (let i = 0; i < collection.length; i++) {
    const item = collection[i]
    if (callback(item, i) === true) {
      return i
    }
  }

  return -1
}

export default findIndex
