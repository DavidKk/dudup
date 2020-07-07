import { UploadFile, DefaultFileName, TextType, extname, sha256, BASE64_REGEXP, Types as BaseTypes } from 'dudup'
import Storage from '../libs/Storage'
import { readFile, encryptFile, existsFile } from '../share/file'
import * as Types from '../types'

export default class WeixinUploadFile extends UploadFile implements BaseTypes.FileInterface {
  /** 存储类 */
  private storage: Storage

  /** 文件路径 */
  public filepath: string

  /** 文件后缀名 */
  public get extname(): string {
    return extname(this.filepath)
  }

  /** 文件大小 */
  public get size(): number {
    return 0
  }

  /** 文件哈希值 */
  public get hash(): string {
    const { type, size } = this.content
    return sha256(this.filename + type + size)
  }

  constructor(file: Types.FileOrigin, options: BaseTypes.FileOptions = {}) {
    super(file, options)

    if (Storage.Supported === true) {
      this.storage = new Storage()
    }
  }

  private async _open(file: Types.FileOrigin = this.origin, options: BaseTypes.FileOptions = this.settings): Promise<void> {
    if (typeof file === 'string') {
      // 传入BASE64文件内容
      if (BASE64_REGEXP.test(file)) {
        this.filename = options.filename || DefaultFileName
        this.mimeType = options.mimeType || TextType
        this.content = wx.base64ToArrayBuffer(file)
        this.state.status = 'ready'
        return
      }

      // 传入文件路径
      if (this.isPath(file)) {
        this.filepath = file

        if (await existsFile(this.filepath)) {
          this.filename = options.filename || this.basename(this.filepath) || DefaultFileName
          this.mimeType = options.mimeType || TextType
          this.content = await readFile(this.filepath)
          this.state.status = 'ready'
          return
        }
      }
    }

    // 其他类型
    this.filename = options.filename || DefaultFileName
    this.mimeType = options.mimeType || TextType
    this.content = typeof file === 'string' ? Buffer.from(file) : Buffer.from(file)
    this.state.status = 'ready'
  }

  /**
   * 打开文件
   * @param file 文件/文件内容
   * @param options 配置
   */
  public async open(file: Types.FileOrigin = this.origin, options: BaseTypes.FileOptions = this.settings, reOpen: boolean = false): Promise<void> {
    if (reOpen === true || this.state.status === 'idle') {
      await this._open(file, options)

      const { cache } = this.settings
      cache === true && (await this.loadCache())
    }
  }

  /**
   * 生成内容哈希值
   * @returns 哈希值
   */
  public async genContentHash(): Promise<string> {
    return encryptFile(this.filepath)
  }

  /**
   * 分片文件
   * @param beginPos 开始位置, 默认为 0, 位置必须大于 0, 且不能大于或等于结束位置
   * @param endPos 结束位置, 必须大于开始位置
   */
  public slice(beginPos: number, endPos: number): Promise<ArrayBuffer> {
    return readFile(this.filepath, { position: beginPos, length: endPos - beginPos })
  }

  /**
   * 存储缓存
   * @param token 令牌
   */
  public async saveCache(token: string = this.hash): Promise<boolean> {
    if (!Storage.Supported) {
      return false
    }

    const source = await this.export('json')
    await this.storage.set(token, source)

    return true
  }

  /**
   * 读取缓存
   * @param token 令牌
   */
  public async loadCache(token: string = this.hash): Promise<boolean> {
    if (!Storage.Supported) {
      return false
    }

    const source = (await this.storage.get(token)) || null
    if (!(source && this.import(source))) {
      await this.clearCache(token)
      return false
    }

    this.state.status = 'ready'
    return true
  }

  /**
   * 清除缓存
   * @param token 令牌
   */
  public async clearCache(token: string = this.hash): Promise<boolean> {
    if (!Storage.Supported) {
      return false
    }

    await this.storage.del(token)
    return true
  }

  public basename(file: string): string {
    return file.split('/').pop()
  }

  /**
   * 判断是否为一个路径
   * @param filepath 路径
   */
  public isPath(filepath: string): boolean {
    return /^(\w:\\\\|\/|https?:\/\/)/.test(filepath)
  }
}
