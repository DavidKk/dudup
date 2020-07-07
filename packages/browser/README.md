# 浏览器端上传基类

## 安装

```bash
# NPM
$ npm i dudup-browser
# YARN
$ yarn add dudup-browser
```

## 使用

```Typescript
import { Types } from 'dudup'
import { BrowserRequestor, BrowserUploadFile } from 'dudup-browser'
import MySender from './MySender'

/**
 * (!) 注意: 这里的 MySender 指的是继承 dudup/libs/Sender
 */

export default class CustomUploader extends MySender {
  constructor(options?: Types.SenderOptions) {
    super(BrowserRequestor, BrowserUploadFile, options)
  }
}
```

## 注意

因为继承需要重写的函数比较多, 建议使用 `Typescript` 进行拓展, 否则容易错漏.
