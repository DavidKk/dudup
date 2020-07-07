# NodeJS 端上传基类

## 安装

```bash
# NPM
$ npm i dudup-node
# YARN
$ yarn add dudup-node
```

## 使用

```Typescript
import { Types } from 'dudup'
import { NodeRequestor, NodeUploadFile } from 'dudup-node'
import MySender from './MySender'

/**
 * (!) 注意: 这里的 MySender 指的是继承 dudup/libs/Sender
 */
export default class CustomUploader extends MySender {
  constructor(options?: Types.SenderOptions) {
    super(NodeRequestor, NodeUploadFile, options)
  }
}
```

## 注意

因为继承需要重写的函数比较多, 建议使用 `Typescript` 进行拓展, 否则容易错漏.
