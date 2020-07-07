import { TextType } from 'dudup'

/**
 * 将 base64 转化成 Blob
 * @param base64Data base64 内容
 * @param contentType 内容类型
 * @todo 迁移到浏览器端
 */
export const convertBase64ToBlob = (base64Data: string, contentType: string = TextType): Blob => {
  const byteCharacters = atob(base64Data)
  const byteNumbers = new Array(byteCharacters.length)
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: contentType })
}
