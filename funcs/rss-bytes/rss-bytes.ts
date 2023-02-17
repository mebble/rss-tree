import 'dotenv/config'
import type { Handler } from '@netlify/functions'

import { fetchPosts } from './upstream'
import { feed } from './feed'
import { successResponse } from '../../common/http'

export const handler: Handler = async (event, context) => {
    const response = await fetchPosts('https://bytes.dev/archives');

    // https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions
    switch (response.kind) {
        case 'success':
            const xml = feed(response.data)
            return successResponse(200, xml)
        case 'error':
            return {
                statusCode: response.statusCode
            }
        default:
            return {
                statusCode: 500
            }
    }
}
