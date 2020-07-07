import { K, M, G } from '../constants/file'

/**
 * 将大小转成可描述大小
 * @param size 大小
 * @returns 大小
 */
const sizeStringify = (size: number): string => {
  if (size > G) {
    return `${(size / G).toFixed(2)}Gb`
  }

  if (size > M) {
    return `${(size / M).toFixed(2)}Mb`
  }

  if (size > K) {
    return `${(size / K).toFixed(2)}Kb`
  }

  return `${size.toFixed(2)}Byte`
}

export default sizeStringify
