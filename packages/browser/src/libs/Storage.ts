import { StorageSettings, objectAssignDeep, Types as BaseTypings } from 'dudup'

export default class BrowserStorage {
  static readonly Supported: boolean = typeof localStorage !== 'undefined'
  static readonly DefaultSettings: BaseTypings.StorageOptions = StorageSettings
  public settings: BaseTypings.StorageOptions

  constructor(options: BaseTypings.StorageOptions = {}) {
    if (!BrowserStorage.Supported) {
      throw new Error('LocalStorage is not supported')
    }

    this.settings = objectAssignDeep({}, StorageSettings, options)
  }

  /**
   * 设置本地缓存
   * @param name 名称
   * @param value 需要存储的值
   * @description
   * 存储的值会进行 JSON.stringify，因此请确保传入值没有循环引用
   */
  public async set(name: string, value: any): Promise<void> {
    if (typeof value !== 'string') {
      value = JSON.stringify(value)
    }

    const { prefix } = this.settings
    localStorage.setItem(`${prefix}@${name}`, value)
  }

  /**
   * 获取本地缓存
   * @param name 名称
   */
  public async get(name: string): Promise<any> {
    const { prefix } = this.settings
    const source = localStorage.getItem(`${prefix}@${name}`)

    if (typeof source === 'string' && source) {
      try {
        return JSON.parse(source)
      } catch (error) {
        // nothing to do...
      }
    }

    return null
  }

  /**
   * 删除本地缓存
   * @param name 名称
   */
  public async del(name: string): Promise<void> {
    const { prefix } = this.settings
    localStorage.removeItem(`${prefix}@${name}`)
  }
}
