export default class Spy<T extends (...args: any[]) => any> {
  private transaction: T
  private prevParams: Parameters<T>
  private prevResult: ReturnType<T>
  private paramsWathers: Array<(params: Parameters<T>, prevParams: Parameters<T>) => void>
  private returnWathers: Array<(result: ReturnType<T>, prevResult: ReturnType<T>) => void>

  constructor(transaction: T) {
    this.transaction = transaction
    this.prevParams = null
    this.prevResult = null
    this.paramsWathers = []
    this.returnWathers = []
  }

  public watch(type: 'params', callback: (params: Parameters<T>, prevParams: Parameters<T>) => void): this
  public watch(type: 'return', callback: (result: ReturnType<T>, prevResult: ReturnType<T>) => void): this
  public watch(type: string, callback: (...args: any[]) => void): this {
    switch (type) {
      case 'params': {
        this.paramsWathers.push(callback)
        break
      }
      case 'return': {
        this.returnWathers.push(callback)
        break
      }
    }

    return this
  }

  public hack(): (...args: Parameters<T>) => ReturnType<T> {
    const fake = (target: any = null) => (...args: Parameters<T>): ReturnType<T> => {
      this.paramsWathers.forEach((callback) => callback(args, this.prevParams))

      const results = Function.prototype.apply.call(this.transaction, target, args)
      this.returnWathers.forEach((callback) => callback(results, this.prevResult))

      this.prevParams = args
      this.prevResult = results

      return results
    }

    return function spy(...args: Parameters<T>): ReturnType<T> {
      return fake(this)(...args)
    }
  }

  public destroy(): void {
    this.paramsWathers.splice(0)
    this.returnWathers.splice(0)

    this.transaction = undefined
    this.prevParams = undefined
    this.prevResult = undefined
    this.paramsWathers = undefined
    this.returnWathers = undefined
  }
}
