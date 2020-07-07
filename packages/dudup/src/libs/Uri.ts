import Url, { URLPart } from 'url-parse'
import pick from '../share/pick'
import objectAssignDeep from '../share/objectAssignDeep'
import * as Types from '../types'

export default class URI extends Url {
  /**
   * 获取元数据
   * @param uri 路由
   * @returns 路由数据
   */
  static pick(
    uri: Url,
    props: Array<Exclude<URLPart, 'slashes'>> = ['auth', 'hash', 'host', 'hostname', 'href', 'origin', 'password', 'pathname', 'port', 'protocol', 'query', 'username']
  ): Types.URIMetadata {
    return pick(uri, props)
  }

  /**
   * 元数据
   * @returns 路由数据
   */
  public get source(): Types.URIMetadata {
    return URI.pick(this)
  }

  constructor(location: string = '') {
    super(location, true)
  }

  /**
   * 扩展数据
   * @returns 自身
   */
  public extend(uri: string | Url | Types.URIMetadata): this {
    if (typeof uri === 'string') {
      uri = new Url(uri, true)
      return this.extend(uri)
    }

    if (uri instanceof Url) {
      const metadata = URI.pick(uri)
      return this.extend(metadata)
    }

    const extension: Types.URIMetadata = objectAssignDeep({}, this.source, uri)
    Object.keys(extension).forEach((name: URLPart) => this.set(name, extension[name]))

    return this
  }
}

export type URIPart = URLPart
