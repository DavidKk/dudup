import Url, { URLPart } from 'url-parse'

// Utilities
// -----------

export type Optional<T> = { [key in keyof T]?: T[key] }

// Timer
// -----------

/** 定时器时钟接口 */
export type TimerClock = {
  /** 唯一ID */
  id: symbol
  /** 时间 */
  time: number
  /** 间隔执行 */
  interval: number
  /** 间隔回调 */
  callback: (milliseconds?: number) => void
}

// Storage
// -----------

/** 本地存储配置接口 */
export type StorageOptions = {
  /** 前缀 */
  prefix?: string
}

// URI
// --------------

/** 地址数据 */
export type URIMetadata = {
  [name in keyof Pick<Url, Exclude<URLPart, 'slashes'>>]?: Url[name]
}

// File
// --------------

/** 文件导出类型 */
export type FileExportType = 'json' | 'object'

/** 文件类初始化配置 */
export type FileOptions = {
  /** 文件名 */
  filename?: string
  /** 文件类型 */
  mimeType?: string
  /** 分片大小 */
  chunkSize?: number
  /** 块中片数 */
  chunkInBlock?: number
  /** 缓存 */
  cache?: boolean
  /** 过期事件 */
  expired?: number
}

/** 文件状态信息 */
export type FileState = {
  /** 状态 */
  status: string
}

/** 文件扩展信息 */
export type FileExtra = {
  [key: string]: any
}

/** 文件分片信息 */
export type FileChunkState = {
  /** 分片起始位置 */
  beginPos: number
  /** 分片末位置 */
  endPos: number
  /** 分片状态 */
  status: string
}

/** 文件资源信息 */
export type FileSource =
  | string
  | {
      /** 哈希值 */
      hash: string
      /** 状态 */
      state: FileState
      /** 分片集合 */
      chunks: FileChunkState[]
      /** 过期时间 */
      expired: number
      /** 额外信息 */
      extra: FileExtra
    }

/** 文件读取配置接口 */
export type FileReadOptions = {
  /** 加载回调 */
  onload?: (data?: string | ArrayBuffer, offset?: number, size?: number) => void
  /** 偏移位置 */
  offset?: number
  /** 分片大小 */
  chunkSize?: number
}

export type FileResolveResult<C> = {
  filename: string
  mimeType: string
  content: C
}

export interface FileInterface {
  /** 后缀名 */
  readonly extname: string
  /** 文件大小 */
  readonly size: number
  /** 文件哈希值 */
  readonly hash: string
  /** 原始内容 */
  origin: unknown
  /** 用于上传的内容 */
  content: any
  /** 文件名 */
  filename: string
  /** 文件类型 */
  mimeType: string
  /** 上传信息 */
  state: FileState
  /** 分片上传信息 */
  chunks: FileChunkState[]
  /** 上传信息额外内容 */
  extra: FileExtra
  /** 打开文件 */
  open(file?: unknown, options?: FileOptions, reOpen?: boolean): Promise<void>
  /** 分片文件 */
  slice(beginPos: number, endPos: number, mimeType?: string): any
  /** 获取文件内容哈希 */
  genContentHash(): Promise<string>
  /** 保存缓存 */
  saveCache(token?: string): Promise<boolean>
  /** 读取缓存 */
  loadCache(token?: string): Promise<boolean>
  /** 清除缓存 */
  clearCache(token?: string): Promise<boolean>
}

/** 文件类接口 */
export interface FileConstructor<T extends FileInterface> {
  new (file: any, options?: FileOptions): T
}

// Requestor
// --------------

export type RequestMethod = string
export type RequestParams = { [name: string]: any }
export type RequestData = any
export type RequestDataType = string
export type RequestResponseType = 'json' | 'xml' | 'arraybuffer'
export type RequestHeaders = { [name: string]: string | number }

export type RequestProgressEvent = {
  loaded: number
  total: number
  duration?: number
  speed?: number
  speedDescription?: string
}

export type RequestProgressHandler = (event: RequestProgressEvent) => void

export type RequestOptions = {
  withCredentials?: boolean
  method?: RequestMethod
  params?: RequestParams
  headers?: RequestHeaders
  uploadProgress?: RequestProgressHandler
  dataType?: RequestDataType
  responseType?: RequestResponseType
  killToken?: symbol | string
}

export interface Requestor {
  send(data?: RequestData, options?: RequestOptions): Promise<any>
  send(method?: RequestMethod, url?: string, data?: RequestData, options?: RequestOptions): Promise<any>
  cancel(): Promise<void>
}

export interface RequestorConstructor<T extends Requestor> {
  new (method: RequestMethod, url: string, data?: RequestData, options?: RequestOptions): T
}

export interface InterceptorInterface<T> {
  use(interceptor: (data: T) => Promise<T>): void
  intercepte(data: T): Promise<T>
}

// Token
// ---------------

/** 上传令牌 */
export type UploadToken = string

export type TokenGetterResponse =
  | UploadToken
  | {
      /** 上传令牌 */
      token: UploadToken
      /** TOKEN 过期时间, 单位(毫秒) */
      expire: number
    }

export type TokenGetter = (...args: any[]) => Promise<TokenGetterResponse>

// Sender
// --------------
export type SenderFilenameHashType = 'contenthash' | 'hash' | 'random'

/** 上传选项 */
export type SenderOptions = RequestOptions & {
  /** 是否使用HTTPS */
  useHttps?: boolean
  /** 自动生成上传文件名的时候使用哈希还是内容哈希 */
  hashType?: SenderFilenameHashType
  /** 是否缓存 */
  cache?: boolean
  /** 强制覆盖 */
  override?: boolean
  /** 最大连接数 */
  maxConnect?: number
  /** 块大小(如果没有分块, 则直接采用分片代替) */
  blockSize?: number
  /** 分片大小 */
  chunkSize?: number
  /** 最大文件大小 */
  maxFileSize?: number
  /** 最大任务数 */
  maxTasks?: number
  /** 进度回调 */
  uploadProgress?: RequestProgressHandler
  /** 获取 Token 方法 */
  tokenGetter?: TokenGetter
  /** Token 生成器 */
  tokenGenerator?: TokenGetter
  /** 分块上传大小 */
  multipartUploadSize?: number
  /** 重命名 */
  rename?: (filename: string, originFilename: string | null) => Promise<string>
}

export type SenderSerializeParams = {
  useHttps: boolean
  host: string
  path?: string
  query?: any
}

export type SenderUploadParams = {
  /** 仓库名称 */
  bucketname: string
  /** 文件名称 */
  filename?: string
  /** 鉴权令牌 */
  token?: string
}

export type SenderUploadOptions = SenderOptions & {
  host?: string
  /** token 过期时间 */
  tokenPrefix?: string
}

export type SenderProgressRelativeDatas = {
  requestor?: Requestor
  loaded?: number
  total?: number
  size?: number
  beginOffset?: number
  endOffset?: number
}

export type SenderGiveFileNameOptions = {
  hashType?: SenderFilenameHashType
}

export interface SenderInterceptors {
  request: InterceptorInterface<[FileInterface, SenderUploadParams, SenderUploadOptions]>
}
