import { Requestor, soapReponseXMLToJSON, Types as BaseTypes } from 'dudup'
import * as Types from '../types'

export default class BrowserRequestor extends Requestor implements BaseTypes.Requestor {
  public xhr: XMLHttpRequest

  constructor(method = 'POST', url = '', data?: Types.RequestData, options?: BaseTypes.RequestOptions) {
    super(method, url, data, options)
    this.xhr = new XMLHttpRequest()
  }

  /**
   * 发送请求
   * @param data 请求数据
   * @param options 请求配置
   */
  public async send(data?: Types.RequestData, options?: BaseTypes.RequestOptions): Promise<any>
  /**
   * 发送请求
   * @param method 请求方式
   * @param url 请求地址
   * @param data 请求数据
   * @param options 请求配置
   */
  public async send(method: string, url: string, data?: Types.RequestData, options?: BaseTypes.RequestOptions): Promise<any>
  public async send(...args: any[]): Promise<any> {
    const method: Types.RequestData = args[0]
    const url: BaseTypes.RequestOptions = args[1]

    if (!(typeof method === 'string' && typeof url === 'string')) {
      const data: Types.RequestData = args[0]
      const options: BaseTypes.RequestOptions = args[1]
      return this.send(this.method, this.url, data, options)
    }

    if (url !== this.url) {
      this.uri.extend(url)
    }

    return new Promise((resolve, reject) => {
      const data: Types.RequestData = args[2]
      const options: BaseTypes.RequestOptions = args[3]

      this.configure(options)

      this.method = method
      if (data) {
        if (this.method === 'GET') {
          this.params = data as any
          this.body = null
        } else {
          this.body = data
        }
      }

      const onError = (event: ProgressEvent): void => {
        if (this.aborted === true || this.errorFlag === true) {
          return
        }

        this.errorFlag = true

        const error = event as any
        error.message = 'network error'

        reject(error)
        this.destroy()
      }

      const onReadyStateChanged = (): void => {
        if (this.errorFlag === true) {
          return
        }

        if (this.aborted === true) {
          reject(new Error('Ajax reqeust has been canceled'))
          return
        }

        const { responseType } = this
        const { readyState, status, responseText, responseXML } = this.xhr

        if (readyState === 4) {
          let response = null
          switch (responseType) {
            case 'xml': {
              response = soapReponseXMLToJSON(responseXML.documentElement)
              break
            }

            case 'json': {
              try {
                response = JSON.parse(responseText)
              } catch (error) {
                const rejection = error
                rejection.xhr = this.xhr
                rejection.response = response

                reject(error)

                this.destroy()
                return
              }

              break
            }
          }

          if (200 <= status && status < 400) {
            resolve(response)
          } else {
            const error = new Error('request error') as any
            error.message = responseText
            reject(error)
          }

          this.destroy()
        }
      }

      if (typeof this.uploadProgress === 'function') {
        const onProgress = (event: ProgressEvent): void => {
          if (this.aborted === true || this.errorFlag === true) {
            return
          }

          if (event.type === 'error') {
            this.errorFlag = true

            const error = event as any
            error.message = 'network error'

            reject(error)
            this.destroy()
            return
          }

          if (event.lengthComputable) {
            const { loaded, total } = event
            const progressEvent: BaseTypes.RequestProgressEvent = { loaded, total }
            this.uploadProgress.call(this.xhr, progressEvent)
          }
        }

        this.xhr.upload.addEventListener('progress', onProgress, false)
      }

      this.xhr.onerror = onError
      this.xhr.onreadystatechange = onReadyStateChanged
      this.xhr.withCredentials = this.withCredentials

      const requestUrl = this.url
      this.xhr.open(method, requestUrl, true)

      Object.keys(this.headers).forEach((name) => {
        const value = this.headers[name]
        this.xhr.setRequestHeader(name, value + '')
      })

      this.xhr.send(this.body as any)
    })
  }

  /** 撤销请求 */
  public async cancel(): Promise<void> {
    this.aborted = true

    if (this.xhr) {
      this.xhr.readyState !== 4 && this.xhr.abort()
    }
  }

  /** 转化成JSON */
  public convertJSON(data: FormData): string {
    if (data instanceof FormData) {
      const object = {}
      data.forEach((value, key) => {
        if (!object.hasOwnProperty(key)) {
          object[key] = value
          return
        }

        if (!Array.isArray(object[key])) {
          object[key] = [object[key]]
        }

        object[key].push(value)
      })

      return JSON.stringify(object)
    }

    return super.convertJSON(data)
  }

  /** 销毁 */
  public destroy(): void {
    super.destroy()

    this.cancel()

    this.xhr.onerror = null
    this.xhr.onreadystatechange = null
    this.xhr = undefined
  }
}
