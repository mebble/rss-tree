import 'dotenv/config'
import type { Handler } from '@netlify/functions'

import { fetchDigests } from './upstream'
import { feed } from './feed'
import {
    headerKeyModifiedSince, headerKeyLastModified,
    successResponse, failureResponse,
} from '../../common/http';
import { blanked } from '../../common/util';
import { match } from 'ts-pattern';
import { pino } from 'pino'

const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    base: { func: "rss-groww" },
})

export const handler: Handler = async (event, _context) => {
    const config = getConfig(process.env)
    logger.debug({ config }, "using config")

    const response = await fetchDigests(blanked(process.env.GROWW_HOST), blanked(event.headers[headerKeyModifiedSince]))

    return match(response)
        .with({ kind: 'success' }, res => {
            const xml = feed(res.data)
            return successResponse(200, xml,  { [headerKeyLastModified]: res.cacheKey })
        })
        .with({ kind: 'cached' }, res => {
            return { statusCode: res.statusCode }
        })
        .with({ kind: 'error', statusCode: 404 }, _res => failureResponse(404, `Daily digest not found`))
        .with({ kind: 'error' }, _res => failureResponse(400, `rsstree bad request`))
        .otherwise(_res => failureResponse(500, `rsstree server error`))
}

function getConfig(env: any) {
    const {
        GROWW_HOST,
        GROWW_FEED_TITLE,
        GROWW_FEED_ITEM_BASE_URL,
        GROWW_FEED_URL,
        GROWW_SITE_URL,
        GROWW_IMG_URL,
    } = env
    return {
        GROWW_HOST,
        GROWW_FEED_TITLE,
        GROWW_FEED_ITEM_BASE_URL,
        GROWW_FEED_URL,
        GROWW_SITE_URL,
        GROWW_IMG_URL,
    }
}
