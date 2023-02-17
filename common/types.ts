export type UpstreamResponse<T> =
    | { kind: 'success'; data: T }
    | { kind: 'cached'; statusCode: number }
    | { kind: 'error'; statusCode: number }
    | { kind: 'exception' }
