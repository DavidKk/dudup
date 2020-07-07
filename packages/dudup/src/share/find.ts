/**
 * 查找元素并返回该元素
 * @param collection 数据集合
 * @param callback 操作回调
 */
function find<T>(collection: T[], callback: (value: T, index: number) => boolean): T {
  if (!Array.isArray(collection)) {
    return
  }

  for (let i = 0; i < collection.length; i++) {
    const item = collection[i]
    if (callback(item, i) === true) {
      return item
    }
  }

  return
}

export default find
