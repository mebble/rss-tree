import RSS from 'rss'

export type DailyDigest = {
    title: {
        rendered: string
    },
    date_gmt: string,
    modified_gmt: string,
    slug: string,
    digest_content: {
        intro: string,
    }
}

export const feed = (digests: DailyDigest[]): string => {
    const rss = new RSS({
        title: 'Groww Digest - Daily',
        feed_url: `${process.env.GROWW_FEED_URL}`,
        site_url: `${process.env.GROWW_SITE_URL}`,
        image_url: `${process.env.GROWW_IMG_URL}`,
    })

    digests.forEach(d => {
        rss.item({
            title: d.title.rendered,
            description: d.digest_content.intro,
            url: `${process.env.GROWW_FEED_ITEM_BASE_URL}/${d.slug}`,
            date: d.date_gmt,
            guid: d.slug,
        })
    })

    return rss.xml()
}
