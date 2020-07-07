function times(length: number): number[]
function times<T>(length: number, callback: (value?: number) => T): T[]
function times(...args: any[]) {
  const length = args[0]
  const numbers = Array.from({ length }, (_, x) => x)
  if (args.length === 1) {
    return numbers
  }

  const callback = args[1]
  if (typeof callback === 'function') {
    return numbers.map(callback)
  }

  return numbers
}

export default times
