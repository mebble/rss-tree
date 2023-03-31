import 'dotenv/config'
import type { Handler } from '@netlify/functions'

import { match } from 'ts-pattern'
import { fetchPosts } from './upstream'
import { feed } from './feed'
import { headerKeyETag, headerKeyIfNoneMatch, successResponse } from '../../common/http'
import { blanked } from '../../common/util'

export const handler: Handler = async (event, _context) => {
    const response = await fetchPosts(blanked(process.env.BYTES_HOST), blanked(event.headers[headerKeyIfNoneMatch]));

    // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
    return match(response)
        .with({ kind: 'success' }, res => {
            const xml = feed(res.data)
            return successResponse(200, xml, { [headerKeyETag]: `"${res.cacheKey}"` })
        })
        .with({ kind: 'cached' }, { kind: 'error' }, res => {
            return { statusCode: res.statusCode }
        })
        .otherwise(_res => {
            return { statusCode: 500 }
        })
}
