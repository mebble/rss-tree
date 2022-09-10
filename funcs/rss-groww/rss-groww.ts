import 'dotenv/config'
import { Handler, HandlerResponse } from '@netlify/functions'
import fetch from 'node-fetch'
import type { Response } from 'node-fetch'
import { DailyDigest, feed } from './feed'

const headerKeyModifiedSince = 'if-modified-since';
const headerKeyLastModified = 'last-modified';
const headerKeyContentType = 'content-type';

export const handler: Handler = async (event, context) => {
  let res: Response
  try {
    res = await fetch(`${process.env.GROWW_HOST}/api/v1/dailydigests?_limit=5&_start=0`, {
      headers: {
        [headerKeyModifiedSince]: event.headers[headerKeyModifiedSince] ?? ''
      }
    })
  } catch {
    return failureResponse(500, `Upstream error`)
  }

  if (res.status === 304) {
    return cachedResponse(304, {
      [headerKeyLastModified]: res.headers.get(headerKeyLastModified) ?? ''
    });
  }

  if (!res.ok) {
    return failureResponse(400, `Bad request`)
  }

  if (!res.headers.get(headerKeyContentType)?.includes('json')) {
    return failureResponse(404, `Daily digest not found`)
  }

  let data: DailyDigest[]
  try {
    data = await res.json() as DailyDigest[]
  } catch {
    return failureResponse(500, `Server error`)
  }

  const xml = feed(data)

  return successResponse(200, xml, {
    [headerKeyLastModified]: res.headers.get(headerKeyLastModified) ?? '',
  })
}

function failureResponse(statusCode: number, body: string): HandlerResponse {
  return {
    statusCode,
    headers: {
      [headerKeyContentType]: 'text/plain'
    },
    body,
  }
}

function successResponse(statusCode: number, body: string, headers: Record<string, string>): HandlerResponse {
  return {
    statusCode,
    headers: {
      [headerKeyContentType]: 'application/rss+xml',
      ...headers
    },
    body,
  }
}

function cachedResponse(statusCode: number, headers: Record<string, string>): HandlerResponse {
  return {
    statusCode,
    headers,
  }
}
