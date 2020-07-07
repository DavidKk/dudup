/**
 * 转化 xml 为 JSON
 * @param XML
 */
const converXMLToJson = (xml: Element): any => {
  const results = {}

  // Element
  if (xml.nodeType === 1) {
    if (xml.attributes.length > 0) {
      results['@attributes'] = {}

      for (let i = 0; i < xml.attributes.length; i++) {
        const attribute = xml.attributes.item(i)
        const { nodeName, nodeValue } = attribute
        results['@attributes'][nodeName] = nodeValue
      }
    }
    // Text
  } else if (xml.nodeType == 3) {
    const str = xml.nodeValue.trim()
    if (str.length) {
      return str
    }
  }

  if (xml.hasChildNodes()) {
    for (let i = 0; i < xml.childNodes.length; i++) {
      const item = xml.childNodes.item(i)
      const index = item.nodeName.indexOf(':') + 1
      const nodeName = item.nodeName.substring(index).replace('#', '')

      if (typeof results[nodeName] === 'undefined') {
        const out = converXMLToJson(item as Element)
        if (Object.keys(out).length) {
          results[nodeName] = out
        }
      } else {
        const out = converXMLToJson(item as Element)
        if (Object.keys(out).length === 0) {
          continue
        }

        if (Array.isArray(results[nodeName])) {
          results[nodeName].push(out)
        } else {
          results[nodeName] = [results[nodeName], out]
        }
      }
    }
  }

  return results
}

export default converXMLToJson
