export type UpstreamResponse<T> =
    | { kind: 'success'; data: T; cacheKey: string }
    | { kind: 'cached'; statusCode: number }
    | { kind: 'error'; statusCode: number }
    | { kind: 'exception' }
