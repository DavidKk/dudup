import Timer from './Timer'
import Spy from './Spy'
import sizeStringify from '../share/sizeStringify'
import * as Types from '../types'

/**
 * 请求进度处理类
 */
export default class RequestorProgress {
  /** 定时器 */
  public timer: Timer
  /** spy 集合 */
  public spies: Spy<Types.RequestProgressHandler>[]
  /** 状态 */
  public state: { [key: string]: any }
  /** 各分片的已上传大小 */
  public loaded: number[]
  /** 各分片的总上传大小 */
  public total: number[]

  constructor() {
    this.timer = new Timer()
    this.spies = []
    this.loaded = []
    this.total = []
    this.state = {}
  }

  /**
   * 接受已完成的数据
   * @param loaded 已上传大小
   * @param total 总上传大小
   */
  public remember(loaded: number, total: number): void {
    this.spies.push(null)
    this.loaded.push(loaded)
    this.total.push(total)
  }

  /**
   * 监听数据变化
   * @param handle 回调
   * @param interval 执行时间
   */
  public watch(handle: (event: Types.RequestProgressEvent) => void, interval: number = 1e3): void {
    const tick = (milliseconds: number) => {
      const { loaded: lstsize = 0 } = this.state
      const loaded: number = this.loaded.length > 0 ? this.loaded.reduce((prev, curr) => prev + curr) : 0
      const total: number = this.total.length > 0 ? this.total.reduce((prev, curr) => prev + curr) : 0

      const deltaSize = loaded - lstsize
      const speed = (deltaSize / milliseconds) * 1000
      const progressEvent: Types.RequestProgressEvent = {
        loaded: loaded,
        total: total,
        duration: milliseconds,
        speed: speed,
        speedDescription: `${sizeStringify(speed)}/s`,
      }

      this.state = { loaded, total }
      handle(progressEvent)
    }

    this.timer.add(tick, interval)
    this.timer.play()
  }

  /**
   * 创建一个 spy
   */
  public spy(): (event: Types.RequestProgressEvent) => void {
    const index = this.spies.length
    const spy = new Spy((event: Types.RequestProgressEvent) => {
      const { loaded, total } = event
      this.loaded[index] = loaded
      this.total[index] = total
    })

    this.spies.push(spy)
    return spy.hack()
  }

  /**
   * 销毁对象
   */
  public destroy(): void {
    this.spy = Function.prototype as any
    this.watch = Function.prototype as any
    this.destroy = Function.prototype as any

    this.timer.destroy()
    this.spies.forEach((spy) => spy && spy.destroy())

    this.spies.splice(0)
    this.loaded.splice(0)
    this.total.splice(0)

    this.timer = undefined
    this.spies = undefined
    this.state = undefined
    this.loaded = undefined
    this.total = undefined
  }
}
