import { M, G, TextType } from './file'
import * as Types from '../types'

/** 默认文件名 */
export const DefaultFileName: string = 'unknown'

/**
 * Requestor 通用配置
 * 主要给 `libs/Requestor` 使用
 */
export const RequestorSettings: Types.RequestOptions = {
  /** 上传内容头部信息 */
  headers: {
    Accept: 'application/json, text/plain, */*',
  },
  /** 提交数据类型 */
  dataType: 'json',
  /** 返回数据类型 */
  responseType: 'json',
  /** 是否开启跨域传递 COOKIE */
  withCredentials: false,
}

/**
 * 本地存储配置
 * 主要给 `libs/Storage` 使用
 */
export const StorageSettings: Types.StorageOptions = {
  /** 存储前缀 */
  prefix: 'dudup',
}

/**
 * 文件配置
 * 主要给 `libs/UploadFile` 及其派生类
 */
export const UploadFileSettings: Types.FileOptions = {
  /** 文件名 */
  filename: '',
  /** 文件类型 */
  mimeType: TextType,
  /** 分片大小 */
  chunkSize: 4 * M,
  /**
   * 每一块中分片数量
   * @description
   * 如果没有分片, 则该值并没有任何作用
   */
  chunkInBlock: 1,
  /** 文件上传信息是否缓存 */
  cache: true,
  /** 缓存过期时间 */
  expired: 1000 * 60 * 60 * 24,
}

/**
 * Sender 通用配置
 * 主要给 `libs/Sender` 使用
 */
export const SenderSettings: Types.SenderOptions = {
  /** 是否使用 https */
  useHttps: true,
  /** 哈希方式 */
  hashType: 'contenthash',
  /** 缓存 */
  cache: true,
  /**
   * 强制覆盖
   * @description
   * 会将配置 `cache` 设置成 `false`
   * 会将配置 `hashType` 设置成 `random`
   */
  override: false,
  /** 最大连接数 */
  maxConnect: 4,
  /**
   * 分块最大大小
   * @description
   * 如果没有分片, 则该值将被忽略
   */
  blockSize: 4 * M,
  /**
   * 分片大小
   * @description
   * 如果没有分片, 则该值表示每一块大小
   */
  chunkSize: 1 * M,
  /** 最大文件大小 */
  maxFileSize: 1 * G,
  /**
   * 最大任务数量
   * @description
   * 可设置成无限(Infinity)
   */
  maxTasks: 2e3,
  /**
   * 使用分块上传的大小
   * @description
   * 自动上传会根据该值进行判断使用上传方式
   */
  multipartUploadSize: 4 * M,
}
