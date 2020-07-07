import find from '../share/find'
import objectAssignDeep from '../share/objectAssignDeep'
import { UploadFileSettings } from '../constants/conf'
import * as Types from '../types'

export default abstract class UploadFile implements Types.FileInterface {
  abstract readonly extname: string
  abstract readonly size: number
  abstract readonly hash: string
  abstract open(file?: unknown, options?: Types.FileOptions, reOpen?: boolean): Promise<void>
  abstract slice(beginPos: number, endPos: number, mimeType?: string): any
  abstract genContentHash(): Promise<string>
  abstract saveCache(token?: string): Promise<boolean>
  abstract loadCache(token?: string): Promise<boolean>
  abstract clearCache(token?: string): Promise<boolean>

  /** 默认配置 */
  static readonly DefaultSettings: Types.FileOptions = UploadFileSettings

  /** 配置 */
  public settings: Types.FileOptions

  /** 源文件 */
  public origin: any

  /** 内容 */
  public content: any

  /** 文件名 */
  public filename: string

  /** 文件类型 */
  public mimeType: string

  /** 上传信息 */
  public state: Types.FileState

  /** 分片上传信息 */
  public chunks: Types.FileChunkState[]

  /**
   * 上传信息额外内容
   * @description
   * 主要用户派生类数据存储
   */
  public extra: Types.FileExtra

  constructor(file: unknown, options: Types.FileOptions = {}) {
    this.settings = objectAssignDeep({}, UploadFile.DefaultSettings, options)
    this.origin = file
    this.chunks = []
    this.extra = {}
    this.state = { status: 'idle' }
  }

  /**
   * 保存分片信息
   * @param beginPos 开始位置, 默认为 0, 位置必须大于 0, 且不能大于或等于结束位置
   * @param endPos 结束位置, 必须大于开始位置
   */
  public setChunkState(beginPos: number, endPos: number, param: Types.Optional<Omit<Types.FileChunkState, 'beginPos' | 'endPos'>> = {}): void {
    this.checkSliceParams(beginPos, endPos)

    const chunk = this.getChunkState(beginPos, endPos)
    if (chunk) {
      Object.assign(chunk, param)
      return
    }

    const state: Types.FileChunkState = Object.assign({ beginPos, endPos, status: '' }, param)
    this.chunks.push(state)
  }

  /**
   * 获取分片信息
   * @param beginPos 开始位置, 默认为 0, 位置必须大于 0, 且不能大于或等于结束位置
   * @param endPos 结束位置, 必须大于开始位置
   */
  public getChunkState(beginPos: number, endPos: number): Types.FileChunkState {
    this.checkSliceParams(beginPos, endPos)

    const state = find(this.chunks, (chunk) => chunk.beginPos === beginPos && chunk.endPos === endPos)
    return state || null
  }

  /**
   * 获取分片是否上传
   * @param beginPos 起始位置
   * @param endPos 结束位置
   */
  public isUploaded(): boolean
  public isUploaded(beginPos: number, endPos: number): boolean
  public isUploaded(...args: [number?, number?]): boolean {
    if (args.length === 2) {
      const [beginPos, endPos] = args
      const state = this.getChunkState(beginPos, endPos)
      return state ? state.status === 'uplaoded' : false
    }

    return this.state.status === 'uploaded'
  }

  /**
   * 导入文件信息
   * @param source 上传状态信息数据
   */
  public async import(source: Types.FileSource): Promise<boolean> {
    if (typeof source !== 'object') {
      const data = JSON.parse(source)
      return this.import(data)
    }

    if (this.checkSource(source) === false) {
      return false
    }

    this.chunks.splice(0)
    this.chunks = this.chunks.concat(source.chunks)

    this.state = source.state
    this.extra = source.extra

    return true
  }

  /**
   * 导出文件信息
   * @param type 类型
   */
  public async export(type: Types.FileExportType = 'object'): Promise<Types.FileSource> {
    if (type === 'json') {
      const result = await this.export()
      return JSON.stringify(result)
    }

    const hash = this.hash
    const state = this.state
    const chunks = this.chunks
    const extra = this.extra
    const expired = Date.now() + this.settings.expired

    return { hash, state, chunks, extra, expired }
  }

  /**
   * 检测分片信息是否正确
   * @param chunk 分片信息
   */
  public checkChunkState(chunk: Types.FileChunkState): boolean {
    return Number.isInteger(chunk.beginPos) && Number.isInteger(chunk.endPos) && typeof chunk.status === 'string'
  }

  /**
   * 检测文件信息是否正确
   * @param source 文件信息
   * @description
   * 主要用于检测导入的数据是否正确
   */
  public checkSource(source: Exclude<Types.FileSource, string>): boolean {
    if (this.hash !== source.hash) {
      return false
    }

    if (source.expired < Date.now()) {
      return false
    }

    if (!(Array.isArray(source.chunks) && typeof source.state === 'object' && source.state !== null && typeof source.extra === 'object' && source.extra !== null)) {
      return false
    }

    for (let i = 0; i < source.chunks.length; i++) {
      const chunk = source.chunks[i]
      if (this.checkChunkState(chunk) === false) {
        return false
      }
    }

    return true
  }

  /**
   * 判断范围是否合法
   * @param beginPos 起始位置
   * @param endPos 结束位置
   */
  public checkSliceParams(beginPos: number, endPos: number): boolean {
    if (!Number.isInteger(beginPos)) {
      throw new TypeError('Begin position is not a integer')
    }

    if (!Number.isInteger(endPos)) {
      throw new TypeError('End position is not a integer')
    }

    if (!(beginPos < endPos)) {
      throw new Error('End position must over begin position')
    }

    return true
  }

  /**
   * 判断是否为一个路径
   * @param filepath 路径
   */
  protected isPath(filepath: string): boolean {
    return /^(\w:\\\\|\/)/.test(filepath)
  }

  /**
   * 销毁
   */
  public destory(): void {
    this.settings = undefined
    this.origin = undefined
    this.content = undefined
    this.filename = undefined
    this.mimeType = undefined
    this.chunks = undefined
    this.destory = Function.prototype as any
  }
}
