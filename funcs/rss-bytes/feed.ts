import RSS from 'rss'
import { parse } from 'node-html-parser'

import { Post } from './types'

export const feed = (posts: Post[]): string => {
    const rss = new RSS({
        title: `${process.env.BYTES_FEED_TITLE}`,
        feed_url: `${process.env.BYTES_FEED_URL}`,
        site_url: `${process.env.BYTES_SITE_URL}`,
        image_url: `${process.env.BYTES_IMG_URL}`,
    })

    posts.forEach(p => {
        rss.item({
            title: p.title,
            description: p.description,
            url: `${process.env.BYTES_FEED_ITEM_BASE_URL}/${p.slug}`,
            date: p.date,
            guid: p.slug,
            custom_elements: [{
                'content:encoded': { _cdata: renderContent(p.content) }
            }]
        })
    })

    return rss.xml()
}

function renderContent(content: string) {
    const root = parse(content)
    const bytesImg = root.querySelector('img[alt="Bytes"]')
    const headSeparator = root.querySelector('hr')
    const articleBanner = root.querySelector('.bg-alt')

    if (bytesImg && headSeparator && articleBanner) {
        bytesImg.parentNode.remove()
        headSeparator.insertAdjacentHTML('beforebegin', articleBanner.outerHTML)
        articleBanner.remove()
    }
    return root.toString()
}
