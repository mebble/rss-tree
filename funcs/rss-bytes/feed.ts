import RSS from 'rss'

import { BytesData } from './types'

export const feed = (data: BytesData): string => {
    const rss = new RSS({
        title: `${process.env.BYTES_FEED_TITLE}`,
        feed_url: `${process.env.BYTES_FEED_URL}`,
        site_url: `${process.env.BYTES_SITE_URL}`,
        image_url: `${process.env.BYTES_IMG_URL}`,
    })

    const posts = [data.featuredPost, ...data.posts];

    posts.forEach(p => {
        rss.item({
            title: p.title,
            description: p.title,
            url: `${process.env.BYTES_FEED_ITEM_BASE_URL}/${p.slug}`,
            date: p.date,
            guid: p.slug,
        })
    })

    return rss.xml()
}
