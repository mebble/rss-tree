import type { Response } from 'node-fetch'
import type { UpstreamResponse } from '../../common/types'
import type { Post } from './types'

import fetch from 'node-fetch'
import md5 from 'md5'
import { parse } from 'node-html-parser'
import { headerKeyETag, headerKeyIfNoneMatch } from '../../common/http'
import { blanked } from '../../common/util'

const eTagSeparator = ':::'

export const fetchPosts = async (url: string, etag: string): Promise<UpstreamResponse<Post[]>> => {
    const [rootHash, postsHash] = splitETag(etag);

    let res: Response
    try {
        res = await fetch(url, { headers: { [headerKeyIfNoneMatch]: hashToETag(rootHash) } })
    } catch {
        return { kind: 'exception' }
    }

    if (res.status === 304) {
        return { kind: 'cached', statusCode: res.status }
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

    let postsWithETags: [Post, string][];
    try {
        postsWithETags = await Promise.all(allPosts.map(p => fetchPost(buildId, p)))
    } catch (error) {
        return { kind: 'exception' }
    }

    const postsHashRes = md5(postsWithETags.map(([_, etag]) => etag).join(''))
    if (postsHashRes === postsHash) {
        return { kind: 'cached', statusCode: 304 }
    }

    const rootETagRes = blanked(res.headers.get(headerKeyETag))
    const newRootHash = eTagToHash(rootETagRes)
    return {
        kind: 'success',
        data: postsWithETags.map(([post, _]) => post),
        cacheKey: newRootHash + eTagSeparator + postsHashRes
    }
}

function fetchPost(buildId: string, post: Post): Promise<[Post, string]> {
    return fetch(`https://bytes.dev/_next/data/${buildId}/archives/${post.slug}.json?slug=${post.slug}`)
        .then<[any, string]>(async res => [await res.json(), blanked(res.headers.get(headerKeyETag))])
        .then(([nextData, etag]) => {
            const { content, data: { description } } = nextData.pageProps.post
            return [{ ...post, description, content }, etag]
        })
}

function splitETag(etag: string): [string, string] {
    const isValidETag = new RegExp(`^".*${eTagSeparator}.*"$`).test(etag)
    if (isValidETag) {
        const [first, second] = etag.split(eTagSeparator)
        const [rootETag, postsHash] = [first.slice(1), second.slice(0, -1)]
        return [rootETag, postsHash]
    }
    return [etag, '']
}

function eTagToHash(etag: string): string {
    const isWeakETag = /^W\/".*"$/.test(etag)
    if (isWeakETag) {
        return 'W/' + etag.slice(3, -1)
    }

    const isStrongETag = /^".*"$/.test(etag)
    if (isStrongETag) {
        return etag.slice(1, -1)
    }

    return etag
}

function hashToETag(hash: string): string {
    if (hash.startsWith('W/')) {
        return `W/"${hash.slice(2)}"`
    }

    return `"${hash}"`
}
