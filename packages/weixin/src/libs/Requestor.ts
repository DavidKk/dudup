import { Requestor, Types as BaseTypes } from 'dudup'

export default class WeixinRequestor extends Requestor implements BaseTypes.Requestor {
  /**
   * 发送请求
   * @param data 请求数据
   * @param options 请求配置
   */
  public async send(data?: BaseTypes.RequestData, options?: BaseTypes.RequestOptions): Promise<any>
  /**
   * 发送请求
   * @param method 请求方式
   * @param url 请求地址
   * @param data 请求数据
   * @param options 请求配置
   */
  public async send(method: string, url: string, data?: BaseTypes.RequestData, options?: BaseTypes.RequestOptions): Promise<any>
  public async send(...args: any[]): Promise<any> {
    const method: BaseTypes.RequestData = args[0]
    const url: BaseTypes.RequestOptions = args[1]

    if (!(typeof method === 'string' && typeof url === 'string')) {
      const data: BaseTypes.RequestData = args[0]
      const options: BaseTypes.RequestOptions = args[1]
      return this.send(this.method, this.url, data, options)
    }

    if (url !== this.url) {
      this.uri.extend(url)
    }

    return new Promise((resolve, reject) => {
      const data: BaseTypes.RequestData = args[2]
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

      const onError = (error: Error): void => {
        if (this.aborted === true || this.errorFlag === true) {
          return
        }

        this.errorFlag = true
        reject(error)
      }

      const onSuccess = (response: WXRequestResponse): void => {
        if (this.errorFlag === true || this.aborted === true) {
          return
        }

        response.statusCode === 200 ? resolve(response.data) : reject(response)
      }

      const onComplete = (): void => {
        this.destroy()
      }

      const { dataType, responseType } = this
      const requestOptions: WXRequestOptions = {
        url: this.url,
        method: this.method.toUpperCase(),
        header: this.headers,
        data: this.body,
        dataType: dataType,
        /**
         * 经测试, JSON 为默认,
         * 若为 json 则为空字符串,
         * 并不需要填
         */
        responseType: responseType === 'json' ? '' : responseType,
        success: onSuccess,
        fail: onError,
        complete: onComplete,
      }

      wx.request(requestOptions)
    })
  }

  /**
   * 撤销请求
   * @description
   * 微信小程序AJAX请求无法撤销请求
   */
  public async cancel(): Promise<void> {
    // can not cancel.
  }
}
