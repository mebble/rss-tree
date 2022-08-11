import 'dotenv/config'
import { Handler, HandlerResponse } from '@netlify/functions'
import fetch from 'node-fetch'
import type { Response } from 'node-fetch'

export const handler: Handler = async (event, context) => {
  let res: Response
  try {
    res = await fetch(`${process.env.GROWW_HOST}/wp-json/wp/v2/daily-digest?page=1&per_page=5`)
  } catch {
    return buildResponse(500, {
      message: `Upstream error`,
    })
  }

  if (!res.ok) {
    return buildResponse(400, {
      message: `Bad request`,
    })
  }

  if (!res.headers.get('content-type')?.includes('json')) {
    return buildResponse(404, {
      message: `Daily digest not found`,
    })
  }

  const data = await res.json()

  return buildResponse(200, data)
}

function buildResponse(statusCode: number, data: any): HandlerResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      success: statusCode >= 200 && statusCode < 400,
      data,
    })
  }
}
