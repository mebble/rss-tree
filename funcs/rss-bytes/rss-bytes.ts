import 'dotenv/config'
import type { Handler } from '@netlify/functions'

import { match } from 'ts-pattern'
import { fetchPosts } from './upstream'
import { feed } from './feed'
import { headerKeyETag, headerKeyIfNoneMatch, successResponse } from '../../common/http'
import { blanked } from '../../common/util'
import { Config } from './types'
import { pino } from 'pino'

const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    base: { func: "rss-bytes" },
})

export const handler: Handler = async (event, _context) => {
    const config = getConfig(process.env)
    logger.debug({ config }, "using config")

    const response = await fetchPosts(blanked(config.BYTES_HOST), blanked(event.headers[headerKeyIfNoneMatch]));

    // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
    return match(response)
        .with({ kind: 'success' }, res => {
            const xml = feed(config, res.data)
            return successResponse(200, xml, { [headerKeyETag]: `"${res.cacheKey}"` })
        })
        .with({ kind: 'cached' }, { kind: 'error' }, res => {
            return { statusCode: res.statusCode }
        })
        .otherwise(_res => {
            return { statusCode: 500 }
        })
}

function getConfig(env: any): Config {
    const {
        BYTES_FEED_TITLE,
        BYTES_FEED_URL,
        BYTES_SITE_URL,
        BYTES_IMG_URL,
        BYTES_FEED_ITEM_BASE_URL,
        BYTES_HOST,
    } = env
    return {
        BYTES_FEED_TITLE,
        BYTES_FEED_URL,
        BYTES_SITE_URL,
        BYTES_IMG_URL,
        BYTES_FEED_ITEM_BASE_URL,
        BYTES_HOST,
    }
}
