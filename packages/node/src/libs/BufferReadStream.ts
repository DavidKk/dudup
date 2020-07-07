import { Readable, ReadableOptions } from 'stream'
import * as Types from '../types'

export default class BufferReadStream extends Readable {
  public content: Buffer | ArrayBuffer
  public offset: number

  public get size(): number {
    return this.content.byteLength
  }

  constructor(buffer: Buffer | ArrayBuffer, options?: ReadableOptions) {
    super(options)

    this.content = buffer
    this.offset = 0
  }

  public _read(size: number): void {
    for (let i = 0; i < size; i += this.readableHighWaterMark) {
      const start = this.offset + i
      const end = start + this.readableHighWaterMark
      const chunk = this.content.slice(start, end)
      this.push(chunk)
    }

    if (this.offset >= this.size) {
      this.push(null)
    }

    const event: Types.ReadStreamProgressData = {
      loaded: this.offset,
      total: this.size,
    }

    this.emit('progress', event)

    this.offset += size
  }

  public destroy() {
    super.destroy()

    this.content = undefined
    this.offset = undefined
  }
}
