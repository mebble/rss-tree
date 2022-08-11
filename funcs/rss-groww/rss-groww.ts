import 'dotenv/config'
import { Handler, HandlerResponse } from '@netlify/functions'
import fetch from 'node-fetch'
import type { Response } from 'node-fetch'
import { DailyDigest, feed } from './feed'

export const handler: Handler = async (event, context) => {
  let res: Response
  try {
    res = await fetch(`${process.env.GROWW_HOST}/api/v1/dailydigests?_limit=10&_start=0`)
  } catch {
    return buildResponse(500, `Upstream error`)
  }

  if (!res.ok) {
    return buildResponse(400, `Bad request`)
  }

  if (!res.headers.get('content-type')?.includes('json')) {
    return buildResponse(404, `Daily digest not found`)
  }

  const data = await res.json()

  let xml
  try {
    xml = feed(data as DailyDigest[])
  } catch {
    return buildResponse(500, `Server error`)
  }

  return buildResponse(200, xml)
}

function buildResponse(statusCode: number, body: string): HandlerResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/rss+xml'
    },
    body,
  }
}
