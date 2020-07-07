/**
 * 取消/撤销方法类
 * @description
 * 主要用于标记异步方法, 并使其能够可以取消
 */
export default class Killer {
  private uuid: number
  private killers: Map<symbol | string, Function>

  constructor() {
    this.uuid = 0
    this.killers = new Map()
  }

  /** 生成一个唯一的令牌 */
  public genToken(): symbol | string {
    const token: string = (++this.uuid).toString(36)
    if (typeof Symbol === 'function') {
      return Symbol(token)
    }

    return token
  }

  /**
   * 标记方法
   * @param method 取消的方法
   * @returns 执行令牌
   */
  public sign(method: Function): symbol | string
  /**
   * 标记方法
   * @param token 标记令牌
   * @param method 取消的方法
   * @returns 执行令牌
   */
  public sign<T extends symbol | string>(token: T, method: Function): T
  public sign(...args: any[]): symbol | string {
    if (args.length === 1) {
      const token = this.genToken()
      const method: Function = args[0]
      return this.sign(token, method)
    }

    const token: symbol | string = args[0]
    const method: Function = args[1]

    if (!token) {
      throw new TypeError('Killing token is invalid')
    }

    if (this.has(token) === true) {
      throw new Error(`Killing token has been used: ${String(token)}`)
    }

    if (typeof method !== 'function') {
      throw new Error('Method is not a function.')
    }

    this.killers.set(token, method)
    return token
  }

  /**
   * 撤销/取消方法
   * @param token 唯一令牌
   */
  public kill(token: symbol | string): void {
    if (this.has(token)) {
      this.get(token)()
      this.del(token)
    }
  }

  /**
   * 获取撤销方法
   * @param token 唯一令牌
   */
  public get(token: symbol | string): Function {
    return this.killers.get(token)
  }

  /**
   * 判断令牌已经被使用
   * @param token 唯一令牌
   */
  public has(token: symbol | string): boolean {
    return this.killers.has(token)
  }

  /**
   * 删除撤销方法
   * @param token 唯一令牌
   */
  public del(token: symbol | string): void {
    this.killers.delete(token)
  }
}
