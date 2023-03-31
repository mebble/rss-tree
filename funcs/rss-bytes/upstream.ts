import type { Response } from 'node-fetch'
import type { UpstreamResponse } from '../../common/types'
import type { Post } from './types'

import fetch from 'node-fetch'
import md5 from 'md5'
import { headerKeyETag, headerKeyIfNoneMatch } from '../../common/http'
import { blanked } from '../../common/util'
import { parseNextData } from '../../common/parse'

const eTagSeparator = ':::'

type NextProps = {
    posts: Post[],
    featuredPost: Post
}

export const fetchPosts = async (baseUrl: string, etag: string): Promise<UpstreamResponse<Post[]>> => {
    const [rootHash, postsHash] = splitETag(etag);

    let res: Response
    try {
        res = await fetch(`${baseUrl}/archives`, { headers: { [headerKeyIfNoneMatch]: hashToETag(rootHash) } })
    } catch {
        return { kind: 'exception' }
    }

    if (res.status === 304) {
        return { kind: 'cached', statusCode: res.status }
    }

    if (!res.ok) {
        return { kind: 'error', statusCode: res.status }
    }

    const nextData = parseNextData<NextProps>(await res.text())
    if (!nextData) {
        return { kind: 'exception' }
    }

    const { featuredPost, posts } = nextData.props.pageProps
    const buildId = nextData.buildId
    const allPosts = [featuredPost, ...posts.slice(0, 5)]

    let postsWithETags: [Post, string][];
    try {
        postsWithETags = await Promise.all(allPosts.map(p => fetchPost(baseUrl, buildId, p)))
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

function fetchPost(baseUrl: string, buildId: string, post: Post): Promise<[Post, string]> {
    return fetch(`${baseUrl}/_next/data/${buildId}/archives/${post.slug}.json?slug=${post.slug}`)
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
