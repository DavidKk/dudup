import UploadFile from './UploadFile'
import Requestor from './Requestor'
import Killer from './Killer'
import Interceptor from './Interceptor'
import sha256 from '../share/sha256'
import guid from '../share/guid'
import sizeStringify from '../share/sizeStringify'
import objectAssignDeep from '../share/objectAssignDeep'
import { SenderSettings } from '../constants/conf'
import * as Types from '../types'

/**
 * 发送者类
 * @description
 * 主要用于统一管理请求类(Requestor)
 */
export default class Sender {
  static readonly DefaultSettings: Types.SenderOptions = SenderSettings
  public EngineClass: Types.RequestorConstructor<Requestor>
  public FileClass: Types.FileConstructor<UploadFile>
  public killer: Killer
  public token: Types.UploadToken
  public tokenExpire: number
  public settings: Types.SenderOptions
  public interceptors: Types.SenderInterceptors

  constructor(EngineClass: Types.RequestorConstructor<Requestor>, FileClass: Types.FileConstructor<UploadFile>, options?: Types.SenderOptions) {
    this.EngineClass = EngineClass
    this.FileClass = FileClass
    this.killer = new Killer()
    this.token = ''
    this.tokenExpire = 0
    this.settings = objectAssignDeep({}, SenderSettings, options)
    this.interceptors = {
      request: new Interceptor(),
    }
  }

  /**
   * 创建并发送GET请求
   * @param url 请求地址
   * @param data 请求内容将会自动转化成 query
   * @param options 选项
   * @param requestor 请求类实例
   */
  public get(url: string, data?: Types.RequestData, options?: Types.RequestOptions, requestor?: Requestor): Promise<any> {
    return this.request('GET', url, data, options, requestor)
  }

  /**
   * 创建并发送POST请求
   * @param url 请求地址
   * @param data 请求内容
   * @param options 选项
   * @param requestor 请求类实例
   */
  public post(url: string, data?: Types.RequestData, options: Types.RequestOptions = {}, requestor?: Requestor): Promise<any> {
    return this.request('POST', url, data, options, requestor)
  }

  /**
   * 创建并发送PUT请求
   * @param url 请求地址
   * @param data 请求内容
   * @param options 选项
   * @param requestor 请求类实例
   */
  public put(url: string, data?: Types.RequestData, options: Types.RequestOptions = {}, requestor?: Requestor): Promise<any> {
    return this.request('PUT', url, data, options, requestor)
  }

  /**
   * 创建并发送请求
   * @param method 请求方式
   * @param url 请求地址
   * @param data 请求内容
   * @param options 选项
   * @param requestor 请求类实例
   */
  public async request(method: string, url: string, data?: Types.RequestData, options: Types.RequestOptions = {}, requestor: Requestor = this.createRequestor()): Promise<any> {
    options.killToken && this.killer.sign(options.killToken, requestor.cancel.bind(requestor))

    try {
      const response = await requestor.send(method, url, data, options)
      options.killToken && this.killer.del(options.killToken)
      return response
    } catch (error) {
      options.killToken && this.killer.del(options.killToken)
      return Promise.reject(error)
    }
  }

  /**
   * 创建请求类
   * @param method 请求方式
   * @param url 请求地址
   * @param data 请求内容
   * @param options 选项
   * @returns 请求的实例
   */
  public createRequestor(method: string = 'POST', url: string = '', data?: Types.RequestData, options?: Types.RequestOptions): Requestor {
    const EngineClass = this.EngineClass
    return new EngineClass(method, url, data, options)
  }

  /**
   * 检查配置是否合法
   * @param options 配置
   * @returns 若果错误则直接返回错误, 否则返回 true
   */
  public checkOptions(options: Types.SenderOptions): TypeError | Error | true {
    const { maxConnect } = options
    if (!(Number.isInteger(maxConnect) && maxConnect > 0)) {
      return new TypeError('Options.maxConnect is invalid or not a integer')
    }

    const { blockSize: perBlockSize, chunkSize: perChunkSize } = options
    if (!Number.isInteger(perBlockSize)) {
      return new TypeError('Block size is not a integer')
    }

    if (!Number.isInteger(perChunkSize)) {
      return new TypeError('Chunk size is not a integer')
    }

    if (perBlockSize < perChunkSize) {
      return new Error('Chunk size must less than block size')
    }

    const { maxFileSize } = options
    if (!Number.isInteger(maxFileSize)) {
      return new TypeError('MaxFileSize is not a integer')
    }

    return true
  }

  /**
   * 检查文件大小是否合法
   * @param upFile 文件
   * @param maxSize 最大大小
   * @param maxSize 最小大小
   * @returns 若果错误则直接返回错误, 否则返回 true
   */
  public checkFileSize(upFile: UploadFile, maxSize: number = Infinity, minSize = 0): TypeError | Error | true {
    if (upFile.size > maxSize) {
      return new Error(`File size must less than ${sizeStringify(maxSize)}`)
    }

    if (upFile.size < minSize) {
      return new Error(`File size must less than ${sizeStringify(minSize)}`)
    }

    return true
  }

  /**
   * 获取上传令牌
   * @param getter 令牌获取方法
   * @description
   * 若本身保存的令牌还没有过期则直接使用该令牌;
   */
  public fetchToken(getter: Types.TokenGetter): (...extras: any[]) => Promise<Types.UploadToken>
  /**
   * 获取上传令牌
   * @param token 令牌
   * @param getter 令牌获取方法
   * @description
   * 若本身保存的令牌还没有过期则直接使用该令牌;
   * 如果令牌符合条件则优先使用传入令牌,
   * 否则则通过 getter 方式获取新令牌
   */
  public fetchToken(token: string, getter: Types.TokenGetter): (...extras: any[]) => Promise<Types.UploadToken>
  public fetchToken(...args: any[]): (...extras: any[]) => Promise<Types.UploadToken> {
    return async (...extras: any) => {
      if (this.tokenExpire > Date.now() && typeof this.token === 'string' && this.token.length > 0) {
        return this.token
      }

      if (args.length === 1) {
        const getter: Types.TokenGetter = args[0]
        if (typeof getter === 'function') {
          const response = await getter(...extras)
          if (typeof response === 'string') {
            this.token = response
            return this.token
          }

          if (typeof response === 'object') {
            this.token = response.token
            this.tokenExpire = response.expire * 1
            return this.token
          }

          return Promise.reject('Token is invalid')
        }

        return undefined
      }

      const token: string = args[0]
      const getter: Types.TokenGetter = args[1]

      if (typeof token === 'string' && token.length > 0) {
        this.token = token
        return this.token
      }

      return this.fetchToken(getter)(...extras)
    }
  }

  /**
   * 给文件取名
   * @param file 上传文件名
   * @description
   * 因为上传容易覆盖文件名, 因此可以通过内容(contenthash)作为文件名称.
   */
  public async giveFileName(file: UploadFile, options?: Types.SenderGiveFileNameOptions): Promise<string>
  /**
   * 给文件取名
   * @param filename 优先文件名
   * @param file 上传文件名
   * @description
   * 若果 filename 合法则优先使用 filename, 否则自动生成一个哈希文件名.
   * 因为上传容易覆盖文件名, 因此可以通过内容(contenthash)作为文件名称.
   */
  public async giveFileName(filename: string, file: UploadFile, options?: Types.SenderGiveFileNameOptions): Promise<string>
  public async giveFileName<T extends UploadFile | string, F extends UploadFile | Types.SenderGiveFileNameOptions>(
    ...args: [T?, F?, Types.SenderGiveFileNameOptions?]
  ): Promise<string> {
    if (args[0] instanceof this.FileClass) {
      const file = args[0] as UploadFile
      const options = (args[1] || {}) as Types.SenderGiveFileNameOptions

      if (options.hashType === 'contenthash') {
        const filename = await file.genContentHash()
        return filename + file.extname
      }

      if (options.hashType === 'random') {
        const filename = sha256(file.hash + Date.now() + guid())
        return filename + file.extname
      }

      return file.hash + file.extname
    }

    if (typeof args[0] === 'string') {
      const filename = args[0] as string
      if (filename.length > 0) {
        return filename
      }
    }

    /**
     * 这里要注意下 args[0] 为非字符串的情况
     * 这里判断 args[1] 是否为文件类来过滤这种情况
     */

    if (args[1] instanceof this.FileClass) {
      const file = args[1] as UploadFile
      const options = (args[2] || {}) as Types.SenderGiveFileNameOptions
      return this.giveFileName(file, options)
    }

    return sha256(Date.now() + guid())
  }

  /**
   * 取消事务
   * @param token 取消令牌
   */
  public kill(token: symbol | string): void {
    this.killer.kill(token)
  }

  /**
   * 销毁
   */
  public destroy(): void {
    this.EngineClass = undefined
    this.FileClass = undefined
    this.killer = undefined
    this.token = undefined
    this.tokenExpire = undefined
    this.settings = undefined
  }
}
