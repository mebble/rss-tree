import RSS from 'rss'

export type DailyDigest = {
    title: string,
    slug: string,
    date: string,
    introduction: string,
}

export const feed = (digests: DailyDigest[]): string => {
    const rss = new RSS({
        title: 'Groww Digest - Daily',
        feed_url: `${process.env.GROWW_FEED_URL}`,
        site_url: `${process.env.GROWW_SITE_URL}`,
        image_url: `${process.env.GROWW_IMG_URL}`,
    })

    digests.forEach((d, i) => {
        const url = i === 0
            ? process.env.GROWW_FEED_ITEM_BASE_URL as string
            : `${process.env.GROWW_FEED_ITEM_BASE_URL}/${d.slug}`
        rss.item({
            title: d.title,
            description: d.introduction,
            url,
            date: d.date,
            guid: d.slug,
        })
    })

    return rss.xml()
}
