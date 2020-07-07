import converXMLToJson from './converXMLToJson'
import soapJson from './soapJson'

/**
 * 将 XML 转成可用 JSON 格式
 * @param XML
 */
const soapReponseXMLToJSON = (xml: Element): any => {
  const json = converXMLToJson(xml)
  return soapJson(json)
}

export default soapReponseXMLToJSON
