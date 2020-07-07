import fs from 'fs-extra'
import crypto from 'crypto'

/**
 * 将 base64 转化成 Blob
 * @param base64Data base64 内容
 * @param contentType 内容类型
 * @todo 迁移到浏览器端
 */
export const convertBase64ToBuffer = (base64Data: string): Buffer => {
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return Buffer.from(byteArray)
}

/**
 * sha1 加密
 * @param file 文件路径
 */
export const sha1 = (file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha1')
    const stream = fs.createReadStream(file)

    stream.once('error', (error) => reject(error))
    stream.once('end', () => resolve(hash.digest('hex')))
    stream.on('data', (chunk) => hash.update(chunk))
  })
}
