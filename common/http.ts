import type { HandlerResponse } from '@netlify/functions';

export const headerKeyModifiedSince = 'if-modified-since';
export const headerKeyLastModified = 'last-modified';
export const headerKeyContentType = 'content-type';
export const headerKeyIfNoneMatch = 'if-none-match';
export const headerKeyETag = 'etag';

export function failureResponse(statusCode: number, body: string): HandlerResponse {
    return {
        statusCode,
        headers: {
            [headerKeyContentType]: 'text/plain'
        },
        body,
    }
}

export function successResponse(statusCode: number, body: string, headers?: Record<string, string>): HandlerResponse {
    return {
        statusCode,
        headers: {
            [headerKeyContentType]: 'application/rss+xml',
            ...headers
        },
        body,
    }
}
