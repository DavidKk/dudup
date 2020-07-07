import URI from './Uri'
import pick from '../share/pick'
import objectAssignDeep from '../share/objectAssignDeep'
import { RequestorSettings } from '../constants/conf'
import * as Types from '../types'

/**
 * 请求基类
 * @description
 * 为多种平台提供统一基础方法的基类;
 * 主要用于被继承与扩展;
 * 此类仅表示一次请求, 请求完毕(包含取消)后自动销毁;
 */
export default abstract class Requestor implements Types.Requestor {
  abstract send(data?: Types.RequestData, options?: Types.RequestOptions): Promise<any>
  abstract send(method?: string, url?: string, data?: Types.RequestData, options?: Types.RequestOptions): Promise<any>
  abstract cancel(): Promise<void>

  static readonly DefaultSettings: Types.RequestOptions = RequestorSettings
  static readonly OptionalProps: Array<keyof Types.RequestOptions> = ['withCredentials', 'method', 'params', 'headers', 'uploadProgress', 'dataType', 'responseType', 'killToken']

  public _method: string
  public _body: Types.RequestData

  public uri: URI = null
  public headers: Types.RequestHeaders = {}
  public dataType: Types.RequestDataType = 'json'
  public responseType: Types.RequestResponseType = 'json'
  public withCredentials: boolean = false
  public uploadProgress: Types.RequestProgressHandler = null
  public killToken: symbol | string = null
  public errorFlag: boolean = false
  public aborted: boolean = false

  public get url(): string {
    if (this.uri) {
      return this.uri.toString()
    }

    return ''
  }

  public get method(): string {
    if (typeof this._method === 'string') {
      return this._method.toUpperCase()
    }

    return ''
  }

  public set method(method: string) {
    if (typeof method === 'string') {
      this._method = method.toUpperCase()
    }
  }

  public get params(): Types.RequestParams {
    return this.uri.query
  }

  public set params(params: Types.RequestParams) {
    if (typeof params === 'object' && params !== null) {
      this.uri.extend({ query: params })
    }
  }

  public get body(): Types.RequestData {
    return this._body
  }

  public set body(body: Types.RequestData) {
    this._body = this.dataType === 'json' ? this.convertJSON(body) : body
  }

  constructor(method: string = 'POST', url: string = '', data: Types.RequestData = null, options: Types.RequestOptions = {}) {
    this.configure(options)

    this.uri = new URI(url)
    this.method = method
    this.body = data
  }

  /** 更改配置 */
  public configure(options: Types.RequestOptions): this {
    const finallyOptions = pick(options, Requestor.OptionalProps)
    objectAssignDeep(this, finallyOptions)
    return this
  }

  /**
   * 设置请求头
   *
   * @description
   * `header` 可以为请求内容类型, 例如 `json` 则会
   * 自动添加 `Content-Type: appliaction/json;charset=utf-8`;
   * 具体可以参考 `Types.RequestDataType`
   */
  public setHeaders(...headers: Array<string | Types.RequestHeaders>): void {
    headers.forEach((header) => {
      if (typeof header === 'string') {
        header = this.convertDataTypeToContentType(header)
      }

      if (typeof header === 'object') {
        Object.keys(header).forEach((name) => {
          const value = header[name]
          if (value) {
            this.headers[name] = value
          }
        })
      }
    })
  }

  /** 转化成JSON */
  public convertJSON(data: any): string {
    try {
      return JSON.stringify(data)
    } catch (error) {
      return '{}'
    }
  }

  /** 转化 Data Type 成 Content Type */
  public convertDataTypeToContentType(dataType: string): string {
    switch (dataType.toLowerCase()) {
      case 'json':
        return 'appliaction/json;charset=utf-8'
      case 'formdata':
        return 'application/x-www-form-urlencoded;charset=utf-8'
    }
  }

  /** 销毁 */
  public destroy(): void {
    this.method = undefined
    this.headers = undefined
    this.body = undefined
    this.dataType = undefined
    this.responseType = undefined
    this.withCredentials = undefined
    this.uploadProgress = undefined
    this.killToken = undefined
    this.errorFlag = undefined
    this.aborted = undefined
  }
}
