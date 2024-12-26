export type ChangeStat = {
    value: number,
    change_type: 'up' | 'down',
    perc_change: number,
}

export type NewsItem = {
    title: string,
    description: string,
}

export type DigestContent = {
    introduction: string,
    is_indian_market_open: boolean,
    sensex: ChangeStat,
    nifty: ChangeStat,
    top_gainers: string,
    top_losers: string,
    news: NewsItem[],
}

export type DailyDigest = DigestContent & {
    title: string,
    slug: string,
    date: string,
}

export type Config = {
    GROWW_HOST: string,
    GROWW_FEED_TITLE: string,
    GROWW_FEED_ITEM_BASE_URL: string,
    GROWW_FEED_URL: string,
    GROWW_SITE_URL: string,
    GROWW_IMG_URL: string,
}
