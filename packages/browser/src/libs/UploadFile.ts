import { sha256 } from 'js-sha256'
import { UploadFile, series, extname, DefaultFileName, TextType, M, BASE64_REGEXP, Types as BaseTypes } from 'dudup'
import { convertBase64ToBlob } from '../share/file'
import Storage from './Storage'
import * as Types from '../types'

export default class BrowserUploadFile extends UploadFile implements BaseTypes.FileInterface {
  /** 存储类 */
  private storage: Storage

  /**
   * 源文件转化成的 Blob 对象
   * @description
   * 将文件(File), 文件列表(Array[<File, File...>]), base64(String) 文件数据转换成 Blob 基础文件对象
   */
  public content: Blob

  /** 文件哈希值 */
  public get hash(): string {
    const { type, size } = this.content
    return sha256(this.filename + type + size)
  }

  /** 文件大小 */
  public get size(): number {
    return this.content ? this.content.size : NaN
  }

  /** 文件后缀名 */
  public get extname(): string {
    return extname(this.filename) || (this.origin instanceof File ? extname(this.origin.name) : '')
  }

  constructor(file: Types.FileOrigin, options: BaseTypes.FileOptions = {}) {
    super(file, options)

    if (Storage.Supported === true) {
      this.storage = new Storage()
    }
  }

  private async _open(file: Types.FileOrigin = this.origin, options: BaseTypes.FileOptions = this.settings): Promise<void> {
    if (file instanceof File) {
      this.filename = options.filename || file.name || DefaultFileName
      this.mimeType = options.mimeType || file.type || TextType
      this.content = new Blob([file], { type: this.mimeType })
      this.state.status = 'ready'
      return
    }

    if (file instanceof Blob) {
      this.filename = options.filename || DefaultFileName
      this.mimeType = options.mimeType || TextType
      this.content = file
      this.state.status = 'ready'
      return
    }

    if (typeof file === 'string' && BASE64_REGEXP.test(file)) {
      this.content = convertBase64ToBlob(file)
      this.filename = options.filename || DefaultFileName
      this.mimeType = options.mimeType || this.content.type || TextType
      this.state.status = 'ready'
      return
    }

    const content = Array.isArray(file) ? file : [file]
    this.filename = options.filename || DefaultFileName
    this.mimeType = options.mimeType || TextType
    this.content = new Blob(content, { type: this.mimeType })
    this.state.status = 'ready'
  }

  /**
   * 打开文件
   * @param file 文件/文件内容
   * @param options 配置
   */
  public async open(file: Types.FileOrigin = this.origin, options: BaseTypes.FileOptions = this.settings, reOpen: boolean = false) {
    if (reOpen === true || this.state.status === 'idle') {
      await this._open(file, options)

      const { cache } = this.settings
      cache === true && (await this.loadCache())
    }
  }

  /**
   * 分片文件
   * @param beginPos 开始位置, 默认为 0, 位置必须大于 0, 且不能大于或等于结束位置
   * @param endPos 结束位置, 必须大于开始位置
   * @param mimeType 类型, 默认为文件的类型
   * @description
   * 将文件切割成 Blob 文件段，开始位置与结束位置不能小于 0 并不能大于文件大小，
   * 开始位置不能大于结束位置
   */
  public async slice(beginPos: number, endPos: number, mimeType: string = this.mimeType): Promise<Blob> {
    this.checkSliceParams(beginPos, endPos)
    return this.content.slice(beginPos, endPos, mimeType)
  }

  /**
   * 读取内容
   * @param options 配置
   */
  public async read(options: BaseTypes.FileReadOptions = {}): Promise<void> {
    const chunkSize = options.chunkSize || M
    const onload = options.onload
    const tasks: Array<() => Promise<void>> = []

    let offset = options.offset || 0
    const size = chunkSize

    while (offset < this.content.size) {
      const begin = offset
      const end = offset + size

      const task = (): Promise<void> =>
        new Promise(
          async (resolve, reject): Promise<void> => {
            const chunk = await this.slice(begin, end)
            const reader = new FileReader()

            if (typeof onload === 'function') {
              reader.onload = (event) => {
                const data = event.target.result
                options.onload(data, offset, size)
              }
            }

            reader.onerror = (error) => {
              reject(error)
            }

            reader.onloadend = () => {
              resolve()
            }

            reader.readAsArrayBuffer(chunk)
          }
        )

      tasks.push(task)
      offset += chunkSize
    }

    await series(tasks)
  }

  /**
   * 生成内容哈希值
   * @returns 哈希值
   */
  public async genContentHash(): Promise<string> {
    const hash = sha256.create()
    const onload = (data: string | ArrayBuffer) => hash.update(data)

    await this.read({ onload })
    return hash.hex()
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

  /**
   * 销毁
   */
  public destory(): void {
    super.destory()
    this.content = undefined
  }
}
