/**
 * 顺序执行
 * @param queue 队列
 * @returns 队列中所有执行的结果
 * @description
 * 与 `waterfall` 不同, 队列中每个元素都无有任何关系
 */
const series = async <R, F extends (...args: any) => Promise<R>>(queue: F[]): Promise<R[]> => {
  queue = Array.prototype.slice.call(queue)

  if (queue.length === 0) {
    return Promise.resolve(null)
  }

  if (queue.length === 1) {
    return Promise.all(queue.map((func) => func()))
  }

  const results: R[] = []
  const reducer = async (left: F | Promise<R>, right: F): Promise<R> => {
    const response = await (typeof left === 'function' ? left() : left)
    results.push(response)
    return right()
  }

  const result = await Array.prototype.reduce.call(queue, reducer)
  return results.concat(result)
}

export default series
