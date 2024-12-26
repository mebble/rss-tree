export type Post = {
    slug: string,
    title: string,
    description: string,
    date: string,
    featuredImage: string,
    content: string,
}

export type Config = {
    BYTES_FEED_TITLE: string,
    BYTES_FEED_URL: string,
    BYTES_SITE_URL: string,
    BYTES_IMG_URL: string,
    BYTES_FEED_ITEM_BASE_URL: string,
    BYTES_HOST: string,
}
