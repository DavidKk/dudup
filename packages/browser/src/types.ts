// File
// --------------

export type FileOrigin = File | Blob | BlobPart | BlobPart[]

// Web Requestor
// --------------

export type RequestData = FormData | File | Blob | string
export type RequestDataType = 'formdata' | 'json' | 'blob'
