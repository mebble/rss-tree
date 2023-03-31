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

export const handler: Handler = async (event, _context) => {
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
