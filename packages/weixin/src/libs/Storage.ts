import { StorageSettings, objectAssignDeep, Types as BaseTypings } from 'dudup'

export default class WeiXinStorage {
  static readonly Supported: boolean = wx.canIUse('setStorage')
  static readonly DefaultSettings: BaseTypings.StorageOptions = StorageSettings
  public settings: BaseTypings.StorageOptions

  constructor(options: BaseTypings.StorageOptions = {}) {
    if (!WeiXinStorage.Supported) {
      throw new Error('WXStorage is not supported')
    }

    this.settings = objectAssignDeep({}, StorageSettings, options)
  }

  /**
   * 设置本地缓存
   * @param name 名称
   * @param value 需要存储的值
   */
  public set(name: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const { prefix } = this.settings
      const key = `${prefix}@${name}`
      wx.setStorage({ key, data, success: resolve, fail: reject })
    })
  }

  /**
   * 获取本地缓存
   * @param name 名称
   */
  public get(name: string): Promise<any> {
    return new Promise((resolve) => {
      const { prefix } = this.settings
      const key = `${prefix}@${name}`
      wx.getStorage({ key, success: resolve, fail: () => resolve(null) })
    })
  }

  /**
   * 删除本地缓存
   * @param {string} name 名称
   */
  public async del(name: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const { prefix } = this.settings
      const key = `${prefix}@${name}`
      wx.removeStorage({ key, success: resolve, fail: reject })
    })
  }
}
