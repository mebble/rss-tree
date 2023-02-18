import type { HandlerResponse } from '@netlify/functions';
import type { Event } from '@netlify/functions/dist/function/event'
import type { Response } from 'node-fetch';
import { blanked } from './util';

export const headerKeyModifiedSince = 'if-modified-since';
export const headerKeyLastModified = 'last-modified';
export const headerKeyContentType = 'content-type';
export const headerKeyIfNoneMatch = 'if-none-match';
export const headerKeyETag = 'etag';

export function lastModifiedHeader(res: Response) {
    return {
        [headerKeyLastModified]: blanked(res.headers.get(headerKeyLastModified)),
    }
}

export function modifiedSinceHeader(event: Event) {
    return {
        [headerKeyModifiedSince]: blanked(event.headers[headerKeyModifiedSince])
      }
}

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

export function cachedResponse(statusCode: number, headers: Record<string, string>): HandlerResponse {
    return {
        statusCode,
        headers,
    }
}
