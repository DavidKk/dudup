declare type WXRequestResponse = {
  cookies: string[]
  data: any
  errMsg: string
  header: { [name: string]: string }
  statusCode: number
}

declare type WXRequestOptions = {
  /** 开发者服务器接口地址 */
  url: string
  /** 请求的参数 */
  data?: string | Record<string, any> | ArrayBuffer
  /**
   * 设置请求的 header,
   * header 中不能设置 Referer
   */
  header?: { [name: string]: string | number }
  /**
   * 请求内容类型
   * 默认为 application/json
   */
  'content-type'?: string
  /**
   * 请求方法
   * 默认位 GET
   */
  method?: string
  /** 返回的数据格式 */
  dataType?: string
  /** 响应的数据类型 */
  responseType?: string
  /**
   * 接口调用成功的回调函数
   * statusCode 与 header 在官方文档上是有该值
   * 但是在测试过程中并没有找到这两个值, 因此最好
   * 使用 response 获取这两个值
   */
  success?: (response?: WXRequestResponse, statusCode?: number, header?: { [name: string]: string }) => void
  /** 接口调用失败的回调函数 */
  fail?: Function
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: Function
}

declare type WXSetStorageOptions = {
  /** 本地缓存中指定的 */
  key: string
  /** 需要存储的内容。只支持原生类型、Date、及能够通过 JSON.stringify 序列化的对象 */
  data: any
  /** 接口调用成功的回调函数 */
  success?: () => any
  /** 接口调用失败的回调函数 */
  fail?: (error: any) => any
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => any
}

declare type WXGetStorageOptions = {
  /** 本地缓存中指定的 */
  key: string
  /** 接口调用成功的回调函数 */
  success?: () => any
  /** 接口调用失败的回调函数 */
  fail?: (error: any) => any
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => any
}

declare type WXRemoveStorageOptions = {
  /** 本地缓存中指定的 */
  key: string
  /** 接口调用成功的回调函数 */
  success?: () => any
  /** 接口调用失败的回调函数 */
  fail?: (error: any) => any
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => any
}

declare type WXGetFileInfoOptions = {
  /** 本地文件路径 (本地路径) */
  filePath: string
  /** 计算文件摘要的算法 */
  digestAlgorithm?: 'md5' | 'sha1'
  /** 接口调用成功的回调函数 */
  success?: (response: { size: number; digest: string }) => void
  /** 接口调用失败的回调函数 */
  fail?: (error: { errMsg: string }) => void
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void
}

declare type WXChooseImageOptions = {
  /** 最多可以选择的图片张数 */
  count?: number
  /** 所选的图片的尺寸 */
  sizeType?: ('original' | 'compressed')[]
  /** 选择图片的来源 */
  sourceType?: ('album' | 'camera')[]
  /** 接口调用成功的回调函数 */
  success?: (response: {
    /** 图片的本地临时文件路径列表 (本地路径)	*/
    tempFilePaths: string[]
    /** 图片的本地临时文件列表 */
    tempFiles: Array<{
      /** 本地临时文件路径 (本地路径) */
      path: string
      /** 本地临时文件大小，单位 B */
      size: number
    }>
  }) => void
  /** 接口调用失败的回调函数 */
  fail?: (error: { errMsg: string }) => void
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void
}

declare type WXFileSystemManagerReadFileOptions = {
  /** 要读取的文件的路径 (本地路径)	 */
  filePath: string
  /** 指定读取文件的字符编码, 如果不传 encoding, 则以 ArrayBuffer 格式读取文件的二进制内容 */
  encoding?: string
  /**
   * 从文件指定位置开始读, 如果不指定, 则从文件头开始读
   * 读取的范围应该是左闭右开区间 [position, position+length)
   * 有效范围: [0, fileLength - 1]
   * 单位：byte
   */
  position?: number
  /**
   * 指定文件的长度, 如果不指定, 则读到文件末尾
   * 有效范围：[1, fileLength]
   * 单位：byte
   */
  length?: number
  /** 接口调用成功的回调函数 */
  success?: (response: { data: ArrayBuffer; errMsg: string }) => void
  /** 接口调用失败的回调函数 */
  fail?: () => void
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void
}

declare type WXFileSystemManagerAccessOptions = {
  /** 要判断是否存在的文件/目录路径 (本地路径) */
  path: string
  /** 接口调用成功的回调函数 */
  success?: () => void
  /** 接口调用失败的回调函数 */
  fail?: () => void
  /** 接口调用结束的回调函数（调用成功、失败都会执行） */
  complete?: () => void
}

declare type WXFileSystemManagerGetFileInfoOptions = {
  /** 要读取的文件路径 (本地路径) */
  filePath: string
  /** 接口调用成功的回调函数 */
  success?: (response: { size: number }) => void
  /** 接口调用失败的回调函数 */
  fail?: (error: { errMsg: string }) => void
  /** 接口调用结束的回调函数（调用成功、失败都会执行）*/
  complete?: () => void
}

declare type WXFileSystemManager = {
  /** 判断文件/目录是否存在 */
  access: (options: WXFileSystemManagerAccessOptions) => void
  /** 读取本地文件内容 */
  readFile: (options: WXFileSystemManagerReadFileOptions) => void
  /** 获取该小程序下的 本地临时文件 或 本地缓存文件 信息 */
  getFileInfo: (options: WXFileSystemManagerGetFileInfoOptions) => void
}

declare interface WX {
  request: (options: WXRequestOptions) => void
  getFileSystemManager: () => WXFileSystemManager
  base64ToArrayBuffer: (base64: string) => ArrayBuffer
  /**
   * 将数据存储在本地缓存中指定的 key 中。
   * 会覆盖掉原来该 key 对应的内容。
   * 除非用户主动删除或因存储空间原因被系统清理，否则数据都一直可用。
   * 单个 key 允许存储的最大数据长度为 1MB，所有数据存储上限为 10MB。
   */
  setStorage: (options: WXSetStorageOptions) => void
  /** 从本地缓存中异步获取指定 key 的内容 */
  getStorage: (options: WXGetStorageOptions) => void
  /** 从本地缓存中移除指定 key */
  removeStorage: (options: WXRemoveStorageOptions) => void
  /** 获取文件信息 */
  getFileInfo: (options: WXGetFileInfoOptions) => void
  /** 从本地相册选择图片或使用相机拍照 */
  chooseImage: (options: WXChooseImageOptions) => void
  /** 判断小程序的API，回调，参数，组件等是否在当前版本可用 */
  canIUse: (schema: string) => boolean
}

declare let wx: WX
