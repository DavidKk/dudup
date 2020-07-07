import fs from 'fs-extra'
import path from 'path'
import crypto from 'crypto'
import { UploadFile, extname, DefaultFileName, BASE64_REGEXP, TextType, Types as BaseTypes } from 'dudup'
import MimeTypes from 'mime-types'
import { convertBase64ToBuffer, sha1 } from '../share/file'
import * as Types from '../types'

export default class NodeUploadFile extends UploadFile implements BaseTypes.FileInterface {
  /** 文件路径 */
  public filepath: string

  /** 内容 */
  public content: Buffer

  /** 文件大小 */
  public get size(): number {
    const stat = fs.lstatSync(this.filepath)
    return stat.size
  }

  /** 文件后缀名 */
  public get extname(): string {
    return extname(this.filename)
  }

  /** 哈希 */
  public get hash(): string {
    const hash = crypto.createHash('sha256')
    hash.update(this.filename + this.mimeType + this.size)
    return hash.digest('hex')
  }

  private async _open(file: Types.FileOrigin = this.origin, options: BaseTypes.FileOptions = this.settings): Promise<void> {
    if (typeof file === 'string') {
      // 传入BASE64文件内容
      if (BASE64_REGEXP.test(file)) {
        this.filename = options.filename || DefaultFileName
        this.mimeType = options.mimeType || TextType
        this.content = convertBase64ToBuffer(file)
        this.state.status = 'ready'
        return
      }

      // 传入文件路径
      if (this.isPath(file)) {
        this.filepath = file

        if (fs.existsSync(this.filepath)) {
          this.filename = options.filename || path.basename(this.filepath) || DefaultFileName
          this.mimeType = options.mimeType || MimeTypes.lookup(this.filename) || TextType
          this.content = await fs.readFile(this.filepath)
          this.state.status = 'ready'
          return
        }
      }
    }

    // 其他类型
    this.filename = options.filename || DefaultFileName
    this.mimeType = options.mimeType || MimeTypes.lookup(this.filename) || TextType
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
    }
  }

  /**
   * 分片文件
   * @param beginPos 开始位置, 默认为 0, 位置必须大于 0, 且不能大于或等于结束位置
   * @param endPos 结束位置, 必须大于开始位置
   */
  public slice(beginPos: number, endPos: number): Promise<Buffer> {
    if (this.filepath.length) {
      return new Promise((resolve, reject) => {
        fs.open(this.filepath, 'r', (error, fd) => {
          const closeFd = () => {
            fs.close(fd, () => {
              /** nothing todo... */
            })
          }

          if (error) {
            reject(error)
            closeFd()
            return
          }

          const size = endPos - beginPos
          const offset = endPos - beginPos
          const position = beginPos
          fs.read(fd, Buffer.alloc(size), 0, offset, position, (error, _bytes, buffer) => {
            if (error) {
              reject(error)
              closeFd()
              return
            }

            resolve(buffer)
            closeFd()
          })
        })
      })
    }

    const content = this.content.slice(beginPos, endPos)
    return Promise.resolve(content)
  }

  /**
   * 生成内容哈希值
   * @returns 哈希值
   */
  public async genContentHash(): Promise<string> {
    if (typeof this.filepath === 'string') {
      return sha1(this.filepath)
    }

    const hash = crypto.createHash('sha256')
    hash.update(this.content)
    return hash.digest('hex')
  }

  /**
   * 保存缓存
   * @param token 令牌
   * @returns 是否成功
   */
  public async saveCache(): Promise<boolean> {
    return true
  }

  /**
   * 读取缓存
   * @param token 令牌
   * @returns 是否成功
   */
  public async loadCache(): Promise<boolean> {
    return true
  }

  /**
   * 清除缓存
   * @param token 令牌
   * @returns 是否成功
   */
  public async clearCache(): Promise<boolean> {
    return true
  }

  public destory(): void {
    super.destory()

    this.filepath = undefined
  }
}
