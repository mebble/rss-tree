import 'dotenv/config'
import type { Handler } from '@netlify/functions'

import { fetchDigests } from './upstream'
import { feed } from './feed'
import {
    headerKeyModifiedSince, headerKeyLastModified,
    successResponse, failureResponse,
} from '../../common/http';
import { blanked } from '../../common/util';

export const handler: Handler = async (event, _context) => {
    const response = await fetchDigests(blanked(process.env.GROWW_HOST), blanked(event.headers[headerKeyModifiedSince]))

    switch (response.kind) {
        case 'success':
            const xml = feed(response.data)
            return successResponse(200, xml,  { [headerKeyLastModified]: response.cacheKey })
        case 'cached':
            return { statusCode: response.statusCode }
        case 'error':
            switch (response.statusCode) {
                case 404:
                    return failureResponse(404, `Daily digest not found`)
                default:
                    return failureResponse(400, `rsstree bad request`)
            }
        default:
            return failureResponse(500, `rsstree server error`)
    }
}
