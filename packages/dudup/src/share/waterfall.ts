/**
 * 顺序执行
 * @param queue 队列
 * @returns 返回队列中最后一个结果
 * @description
 * 与 `series` 不同, 队列中每个元素跟前一个元素都有关系
 * 每个异步函数执行都会获得前一个函数的结果
 */
const waterfall = async <R, F extends (data?: R) => Promise<R>>(queue: F[], data?: R): Promise<R> => {
  queue = Array.prototype.slice.call(queue)

  if (queue.length === 0) {
    return Promise.resolve(null)
  }

  if (queue.length === 1) {
    const [func] = queue
    return func(data)
  }

  let result: R = undefined
  const reducer = async (left: F | Promise<R>, right: F): Promise<R> => {
    result = await (typeof left === 'function' ? left(data) : left)
    return right(result)
  }

  return await Array.prototype.reduce.call(queue, reducer)
}

export default waterfall
