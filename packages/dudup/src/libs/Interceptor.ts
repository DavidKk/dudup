import waterfall from '../share/waterfall'
import * as Types from '../types'

export default class Interceptor<T> implements Types.InterceptorInterface<T> {
  private interceptors: Array<(data: T) => Promise<T>>

  constructor() {
    this.interceptors = []
  }

  public use(interceptor: (data: T) => Promise<T>) {
    this.interceptors.push(interceptor)
  }

  public async intercepte(data: T): Promise<T> {
    if (this.interceptors.length === 0) {
      return data
    }

    return await waterfall(this.interceptors, data)
  }
}
