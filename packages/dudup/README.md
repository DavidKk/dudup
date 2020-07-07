# 上传基类

## 安装

```bash
# NPM
$ npm i dudup
# YARN
$ yarn add dudup
```

## 拓展平台

```typescript
import { Sender, Typings } from 'dudup'

export default class CustomSender extends Sender {
  public upload(): Promise<{ file: string }> {
    // something todo...
  }
}
```

## 拓展客户端

一般情况下, 我们只需根据平台继承 `Requestor` 与 `UploadFile` 即可

```typescript
import { Requestor, UploadFile, Typings } from 'dudup'

class CustomRequestor extends Requestor implements Typings.Requestor {
  send(): Promise<any> {
    // something todo...
  }
  cancel(): Promise<void> {
    // something todo...
  }
}

class CustomUploadFile extends UploadFile implements Typings.UploadFile {
  get extname(): string {
    // something todo...
  }
  get size(): number {
    // something todo...
  }
  get hash(): string {
    // something todo...
  }
  public slice(beginPos: number, endPos: number, mimeType?: string): any {
    // something todo...
  }
  public async genContentHash(): Promise<string> {
    // something todo...
  }
  public async saveCache(token?: string): Promise<boolean> {
    // something todo...
    // 如果没有, 返回 true
  }
  public async loadCache(token?: string): Promise<boolean> {
    // something todo...
    // 如果没有, 返回 true
  }
  public async clearCache(token?: string): Promise<boolean> {
    // something todo...
    // 如果没有, 返回 true
  }
}

export default class CustomUploader extends CustomSender {
  constructor(options?: Typings.SenderOptions) {
    super(CustomRequestor, CustomUploadFile, options)
  }
}
```

## 注意

因为继承需要重写的函数比较多, 建议使用 `Typescript` 进行拓展, 否则容易错漏.
