/**
 * 将 XML 转为 JSON 的数据格式化
 * @param jsondata
 */
const soapJson = (jsondata: any): any => {
  if (Array.isArray(jsondata)) {
    return jsondata.map((item) => soapJson(item))
  }

  if (typeof jsondata === 'object') {
    if (typeof jsondata.text === 'string') {
      return jsondata.text
    }

    const results = {}
    Object.keys(jsondata).forEach((name) => {
      results[name] = soapJson(jsondata[name])
    })

    return results
  }

  return jsondata
}

export default soapJson
