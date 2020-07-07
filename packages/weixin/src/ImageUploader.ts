import { Types as DudupTypes } from 'dudup'
import { readFile, existsFile } from './share/file'

export type UploadParams = {
  hostname: string
  bucketname: string
  filename?: string
  token?: string
}

export type UploadOptions = {
  mimeType?: string
  tokenGetter?: DudupTypes.TokenGetter
}

export default class ImageUploader {
  static MimeTypes = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    jpg: 'image/jpg',
    gif: 'image/gif',
    apng: 'image/apng',
    svg: 'image/svg+xml',
  }

  /**
   * 上传图片
   * @param file 图片路径
   * @param params 上传参数
   * @param options 上传配置
   */
  public async upload(file: string, params: UploadParams, options: UploadOptions = {}): Promise<{ filename: string; bucketname: string }> {
    return new Promise(async (resolve, reject) => {
      const { hostname, bucketname, filename } = params
      params.filename = typeof filename === 'string' && filename.length > 0 ? filename : await this.giveFileAName(file)

      const url = `https://${bucketname}.${hostname}/${params.filename}`
      const { content } = await this.open(file)

      if (typeof options.tokenGetter === 'function') {
        const token = await options.tokenGetter(file, params, options)
        if (typeof token === 'string') {
          params.token = token
        } else if (typeof token === 'object') {
          params.token = token.token
        }
      }

      const headers = {
        'Content-Type': this.mimeType(params.filename, options.mimeType),
        Authorization: params.token,
      }

      const onSuccess = (response: WXRequestResponse) => {
        const data = { filename: params.filename, bucketname }
        response.statusCode === 200 ? resolve(data) : reject(response)
      }

      const onError = (error: Error) => {
        reject(error)
      }

      const requestOptions: WXRequestOptions = {
        method: 'PUT',
        url: url,
        header: headers,
        data: content,
        success: onSuccess,
        fail: onError,
      }

      wx.request(requestOptions)
    })
  }

  /**
   * 获取图片内容
   * @param file 图片路径
   */
  public async open(file: string): Promise<{ content: ArrayBuffer }> {
    if (!(await existsFile(file))) {
      throw new Error(`File ${file} is not exists`)
    }

    const content = await readFile(file)
    return { content }
  }

  /**
   * 获取文件类型
   * @param filename 文件路径
   */
  public mimeType(filename: string, defaultMimeType: string = ''): string {
    const extname = this.extname(filename)
    return ImageUploader.MimeTypes[extname] || defaultMimeType
  }

  /**
   * 随机命名
   * @param filename 默认名称
   */
  public async giveFileAName(filename?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      wx.getFileInfo({
        filePath: filename,
        digestAlgorithm: 'sha1',
        success: ({ digest }) => {
          const extname = this.extname(filename)
          resolve(`${digest}.${extname}`)
        },
        fail: reject,
      })
    })
  }

  /**
   * 获取文件后缀
   * @param filename 文件名
   */
  public extname(filename: string): string {
    return filename.split('.').pop()
  }
}
