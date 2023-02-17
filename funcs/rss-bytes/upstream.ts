import type { Response } from 'node-fetch'
import type { UpstreamResponse } from '../../common/types'
import type { Post } from './types'

import fetch from 'node-fetch'
import { parse } from 'node-html-parser'

export const fetchPosts = async (url): Promise<UpstreamResponse<Post[]>> => {
    let res: Response
    try {
        res = await fetch(url)
    } catch {
        return { kind: 'exception' }
    }

    if (!res.ok) {
        return { kind: 'error', statusCode: res.status }
    }

    const body = await res.text()
    const root = parse(body)
    const nextDom = root.querySelector('#__NEXT_DATA__')
    if (!nextDom) {
        return { kind: 'exception' }
    }

    const nextData = JSON.parse(nextDom.textContent)
    const { featuredPost, posts } = nextData.props.pageProps
    const buildId = nextData.buildId
    const allPosts = [featuredPost, ...posts.slice(0, 5)] as Post[]

    try {
        const postsWithContent = await Promise.all(allPosts.map(p => fetchPost(buildId, p)))
        return {
            kind: 'success',
            data: postsWithContent
        }
    } catch (error) {
        return { kind: 'exception' }
    }
}

async function fetchPost(buildId: string, post: Post): Promise<Post> {
    return fetch(`https://bytes.dev/_next/data/${buildId}/archives/${post.slug}.json?slug=${post.slug}`)
        .then(res => res.json())
        .then((nextData: any) => {
            const { content, data: { description } } = nextData.pageProps.post
            return {
                ...post,
                description,
                content,
            }
        })
}
