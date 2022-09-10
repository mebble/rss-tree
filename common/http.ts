import { HandlerResponse } from '@netlify/functions'

export const headerKeyModifiedSince = 'if-modified-since';
export const headerKeyLastModified = 'last-modified';
export const headerKeyContentType = 'content-type';

export function failureResponse(statusCode: number, body: string): HandlerResponse {
    return {
        statusCode,
        headers: {
            [headerKeyContentType]: 'text/plain'
        },
        body,
    }
}

export function successResponse(statusCode: number, body: string, headers: Record<string, string>): HandlerResponse {
    return {
        statusCode,
        headers: {
            [headerKeyContentType]: 'application/rss+xml',
            ...headers
        },
        body,
    }
}

export function cachedResponse(statusCode: number, headers: Record<string, string>): HandlerResponse {
    return {
        statusCode,
        headers,
    }
}
