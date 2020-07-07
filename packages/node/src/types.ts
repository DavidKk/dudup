// Read Stream
// --------------

/** Stream 读取进程 */
export interface ReadStreamProgressData {
  loaded: number
  total: number
}

// File
// --------------

/** 文件原型 */
export type FileOrigin = Buffer | ArrayBuffer | string

/** 配置文件内容 */
export interface ConfigContent {
  bucket?: string
  accessKey?: string
  accessSecret?: string
}

// Requestor
// --------------

/** 请求数据 */
export type RequestData = Buffer | ArrayBuffer | string

/** 请求方式 */
export type UploadMethods = 'OPTIONS' | 'HEAD' | 'GET' | 'POST' | 'PUT' | 'DELETE' | 'TRACE' | 'CONNECT'
