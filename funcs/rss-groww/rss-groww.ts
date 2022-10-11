import 'dotenv/config'
import type { Handler } from '@netlify/functions'
import type { Response } from 'node-fetch'
import fetch from 'node-fetch'

import { DailyDigest, feed } from './feed'
import {
  headerKeyContentType, lastModifiedHeader,
  successResponse, failureResponse, cachedResponse, modifiedSinceHeader,
} from '../../common/http';

export const handler: Handler = async (event, context) => {
  let res: Response
  try {
    res = await fetch(`${process.env.GROWW_HOST}/api/v1/dailydigests?_limit=5&_start=0`, {
      headers: modifiedSinceHeader(event)
    })
  } catch {
    return failureResponse(500, `rsstree upstream error`)
  }

  if (res.status === 304) {
    return cachedResponse(304, lastModifiedHeader(res));
  }

  if (!res.ok) {
    return failureResponse(400, `rsstree bad request`)
  }

  if (!res.headers.get(headerKeyContentType)?.includes('json')) {
    return failureResponse(404, `Daily digest not found`)
  }

  let data: DailyDigest[]
  try {
    data = await res.json() as DailyDigest[]
  } catch {
    return failureResponse(500, `rsstree server error`)
  }

  const xml = feed(data)

  return successResponse(200, xml, lastModifiedHeader(res))
}
