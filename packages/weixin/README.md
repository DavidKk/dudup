# 微信小程序端上传基类

## 安装

```bash
# NPM
$ npm i dudup-weixin
# YARN
$ yarn add dudup-weixin
```

## 使用

```Typescript
import { Types } from 'dudup'
import { WeixinRequestor, WeixinUploadFile } from 'dudup-weixin'
import MySender from './MySender'

/**
 * (!) 注意: 这里的 MySender 指的是继承 dudup/libs/Sender
 */
export default class Uploader extends MySender {
  constructor(options?: Types.SenderOptions) {
    super(WeixinRequestor, WeixinUploadFile, options)
  }
}
```

## 注意

因为继承需要重写的函数比较多, 建议使用 `Typescript` 进行拓展, 否则容易错漏.
