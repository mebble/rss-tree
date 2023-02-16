import fetch from 'node-fetch'
import { parse } from 'node-html-parser'

import type { Post } from './types'

export const fetchPosts = async (url): Promise<Post[]> => {
    let res = await fetch(url)
    const body = await res.text()
    const root = parse(body)
    const nextDom = root.querySelector('#__NEXT_DATA__')
    if (!nextDom) {
        throw new Error('fail')
    }

    try {
        const nextData = JSON.parse(nextDom.textContent)
        const { featuredPost, posts } = nextData.props.pageProps
        const buildId = nextData.buildId
        const allPosts = [featuredPost, ...posts.slice(0, 5)] as Post[]
        const postsWithContent = await Promise.all(allPosts.map(p => fetchPost(buildId, p)))
        return postsWithContent
    } catch (error) {
        throw new Error('fail')
    }
}

async function fetchPost(buildId: string, post: Post): Promise<Post> {
    return fetch(`https://bytes.dev/_next/data/${buildId}/archives/${post.slug}.json?slug=${post.slug}`)
        .then(res => res.json())
        .then((nextData: any) => {
            const { content, data: { description } } = nextData.pageProps.post
            const root = parse(content)
            const bytesImg = root.querySelector('img[alt="Bytes"]')
            const articleBanner = root.querySelector('.bg-alt')
            if (bytesImg && articleBanner) {
                bytesImg.replaceWith(articleBanner.clone())
                articleBanner.remove()
            }
            return {
                ...post,
                description,
                content: root.toString(),
            }
        })
}
