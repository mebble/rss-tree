import 'dotenv/config'
import type { Handler } from '@netlify/functions'

import { fetchPosts } from './upstream'
import { feed } from './feed'
import { successResponse } from '../../common/http'

export const handler: Handler = async (event, context) => {
    const res = await fetchPosts('https://bytes.dev/archives');

    const xml = feed(res)

    return successResponse(200, xml)
}
