import RSS from 'rss'

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
                'content:encoded': { _cdata: p.content }
            }]
        })
    })

    return rss.xml()
}
