import * as Types from '../types'
import findIndex from '../share/findIndex'

export default class Timer {
  public playing: boolean
  public clocks: Types.TimerClock[]
  public duration: number

  constructor(duration: number = 200) {
    this.playing = false
    this.clocks = []
    this.duration = duration
  }

  public play(): void {
    this.playing = true
    this.loopup()
  }

  public stop(): void {
    this.playing = false
  }

  public add(callback: (milliseconds?: number) => void, interval: number): symbol {
    if (interval < 100) {
      throw new Error('interval must over 100ms')
    }

    const time = Date.now()
    const id = Symbol('Timer')
    this.clocks.push({ id, time, interval, callback })

    this.playing === true && this.loopup()
    return id
  }

  public remove(id: symbol): void {
    const index = findIndex(this.clocks, (clock) => clock.id === id)
    this.clocks.splice(index, 1)
  }

  public clean(): void {
    this.clocks.slice(0)
  }

  public tick(): void
  public tick(id: symbol): void
  public tick(id?: symbol): void {
    if (arguments.length === 1) {
      const index = findIndex(this.clocks, (clock) => clock.id === id)
      index !== -1 && this.execTimer(this.clocks[index], true)
    } else {
      this.clocks.forEach((clock) => this.execTimer(clock, true))
    }
  }

  public destroy(): void {
    this.clocks.slice(0)
    this.playing = undefined
    this.clocks = undefined
  }

  private loopup(): void {
    const nextTick = () => {
      if (this.playing !== true || this.clocks.length === 0) {
        return
      }

      this.clocks.forEach((clock) => this.execTimer(clock))
      setTimeout(nextTick, this.duration)
    }

    nextTick()
  }

  private execTimer(clock: Types.TimerClock, reOpen: boolean = false): void {
    const now = Date.now()
    const { time, interval, callback } = clock
    const delta = now - time

    if (delta >= interval || reOpen === true) {
      clock.time += interval
      callback(delta)
    }
  }
}
