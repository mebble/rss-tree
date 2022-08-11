import 'dotenv/config'
import { Handler } from '@netlify/functions'
import fetch from 'node-fetch'
import type { Response } from 'node-fetch'

export const handler: Handler = async (event, context) => {
  let res: Response
  try {
    res = await fetch(`${process.env.GROWW_HOST}/wp-json/wp/v2/daily-digest?page=1&per_page=5`)
  } catch {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: `Upstream error`,
      }),
    }
  }

  if (!res.ok) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Bad request`,
      }),
    }
  }

  if (!res.headers.get('content-type')?.includes('json')) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: `Daily digest not found`,
      }),
    }
  }

  const data = await res.json()

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: data,
    }),
  }
}
