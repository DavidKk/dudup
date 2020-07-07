const fs = wx.getFileSystemManager()

/**
 * 读取文件
 * @param file 文件路径
 * @param options 配置
 */
export const readFile = (file: string, options: Omit<WXFileSystemManagerReadFileOptions, 'filePath' | 'success' | 'fail'> = {}): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    fs.readFile({
      ...options,
      filePath: file,
      success: (response) => resolve(response.data),
      fail: reject,
    })
  })
}

/**
 * 文件是否存在
 * @param file 文件路径
 * @param options 配置
 */
export const existsFile = (file: string, options: Omit<WXFileSystemManagerAccessOptions, 'path' | 'success' | 'fail'> = {}) => {
  return new Promise((resolve, reject) => {
    fs.access({
      ...options,
      path: file,
      success: resolve,
      fail: reject,
    })
  })
}

/**
 * 获取文件信息
 * @param file 文件路径
 * @param options 配置
 */
export const getFileInfo = (file: string, options: Omit<WXFileSystemManagerGetFileInfoOptions, 'filePath'> = {}): Promise<{ size: number }> => {
  return new Promise((resolve, reject) => {
    fs.getFileInfo({
      ...options,
      filePath: file,
      success: (response) => resolve(response),
      fail: reject,
    })
  })
}

/**
 * 加密文件
 * @param file 文件路径
 */
export const encryptFile = async (file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    wx.getFileInfo({
      filePath: file,
      digestAlgorithm: 'sha1',
      success: ({ digest }) => resolve(digest),
      fail: reject,
    })
  })
}
