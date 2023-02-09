import fetch from 'node-fetch'
import { parse } from 'node-html-parser'

import type { BytesData } from './types'

export const fetchPosts = async (url): Promise<BytesData> => {
    let res = await fetch(url)
    const body = await res.text()
    const root = parse(body)
    const nextDom = root.querySelector('#__NEXT_DATA__')
    if (!nextDom) {
        throw new Error('fail')
    }

    try {
        const nextData = JSON.parse(nextDom.textContent)
        return {
            buildId: nextData.buildId,
            posts: nextData.props.pageProps.posts,
            featuredPost: nextData.props.pageProps.featuredPost,
        }
    } catch (error) {
        throw new Error('fail')
    }
}
