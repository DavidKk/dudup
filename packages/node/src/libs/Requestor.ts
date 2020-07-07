import http, { ClientRequest } from 'http'
import mime from 'mime-types'
import { Requestor, pick, Types as BaseTypes } from 'dudup'
import BufferReadStream from './BufferReadStream'
import * as Types from '../types'

export default class NodeRequestor extends Requestor implements BaseTypes.Requestor {
  public request: ClientRequest

  /**
   * 发送请求
   * @param data 请求数据
   * @param options 请求配置
   */
  public send(data?: Types.RequestData, options?: BaseTypes.RequestOptions): Promise<any>
  /**
   * 发送请求
   * @param method 请求方式
   * @param url 请求地址
   * @param data 请求数据
   * @param options 请求配置
   */
  public send(method: string, url: string, data?: Types.RequestData, options?: BaseTypes.RequestOptions): Promise<any>
  public send(...args: any[]): Promise<any> {
    const method: Types.RequestData = args[0]
    const url: BaseTypes.RequestOptions = args[1]

    if (!(typeof method === 'string' && typeof url === 'string')) {
      const data: Types.RequestData = args[0]
      const options: BaseTypes.RequestOptions = args[1]
      const url = this.url
      return this.send(this.method, url, data, options)
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

      const { host, port, href } = this.uri
      const contentLength = this.body ? Buffer.byteLength(this.body) : 0

      this.setHeaders({
        Host: host,
        'Content-Length': contentLength,
      })

      let results = Buffer.from('')
      let responseInfo: BaseTypes.Optional<Pick<http.IncomingMessage, 'statusCode' | 'statusMessage' | 'headers' | 'method'>> = {}

      const onError = (error: Error) => {
        if (this.aborted === true || this.errorFlag === true) {
          return
        }

        this.errorFlag = true

        reject(error)
        this.destroy()
      }

      const onMessage = (chunk: string | Buffer) => {
        if (this.errorFlag === true || this.aborted === true) {
          return
        }

        chunk = chunk instanceof Buffer ? chunk : Buffer.from(chunk)
        results = Buffer.concat([results, chunk])
      }

      const onComplete = () => {
        if (this.errorFlag === true) {
          return
        }

        if (this.aborted === true) {
          reject(new Error('Ajax reqeust has been canceled'))
          return
        }

        const { statusCode: status } = responseInfo
        if (200 <= status && status < 400) {
          const { responseType } = this

          let response = null
          switch (responseType) {
            case 'json': {
              try {
                const responseText = results.toString()
                response = JSON.parse(responseText)
              } catch (error) {
                const rejection = error
                rejection.response = response
                reject(error)
                this.destroy()
                return
              }

              break
            }
          }

          resolve(response)
        } else {
          const error = new Error('Request Error') as any
          error.message = results.toString()
          reject(error)
        }
      }

      const params: http.RequestOptions = {
        host: host,
        port: port || 80,
        path: href,
        method: method,
        headers: this.headers,
      }

      const callback = (response: http.IncomingMessage): void => {
        responseInfo = pick(response, ['statusCode', 'statusMessage', 'headers', 'method'])
        response.once('error', onError)
        response.once('end', onComplete)
        response.on('data', onMessage)
      }

      this.request = http.request(params, callback)
      if (this.body instanceof Buffer) {
        const reader = new BufferReadStream(this.body)
        if (typeof this.uploadProgress === 'function') {
          const onProgress = (data: Types.ReadStreamProgressData) => {
            if (this.aborted === true || this.errorFlag === true) {
              return
            }

            const { loaded, total } = data
            const uploadProgressEvent: BaseTypes.RequestProgressEvent = { loaded, total }
            this.uploadProgress.call(this.request, uploadProgressEvent)
          }

          reader.on('progress', onProgress)
        }

        reader.once('end', () => this.request.end())
        reader.pipe(this.request)
      } else {
        this.body && this.request.write(this.body)
        this.request.end()
      }
    })
  }

  /**
   * 取消
   */
  public async cancel(): Promise<void> {
    this.aborted = true
    this.request && this.request.abort()
  }

  /**
   * 设置请求头部
   * @param header 头部
   * @description
   * `header` 可以为请求内容类型, 例如 `json` 则会
   * 自动添加 `Content-Type: appliaction/json;charset=utf-8`;
   * 具体可以参考 `Types.RequestDataType`
   */
  public setHeaders(...headers: Array<string | BaseTypes.RequestHeaders>): this {
    headers.forEach((header) => {
      if (typeof header === 'string') {
        header = mime.contentType(header) || ''
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

    return this
  }

  /**
   * 销毁
   */
  public destroy(): void {
    super.destroy()
    this.cancel()
    this.request = undefined
  }
}
