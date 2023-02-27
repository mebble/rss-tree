import type { ChangeStat, DailyDigest, DigestContent } from './types'
import RSS from 'rss'

export const feed = (digests: DailyDigest[]): string => {
    const rss = new RSS({
        title: `${process.env.GROWW_FEED_TITLE}`,
        feed_url: `${process.env.GROWW_FEED_URL}`,
        site_url: `${process.env.GROWW_SITE_URL}`,
        image_url: `${process.env.GROWW_IMG_URL}`,
    })

    digests.forEach(d => {
        rss.item({
            title: d.title,
            description: d.introduction,
            url: `${process.env.GROWW_FEED_ITEM_BASE_URL}/${d.slug}`,
            date: d.date,
            guid: d.slug,
            custom_elements: [{
                'content:encoded': { _cdata: renderContentHtml(d) }
            }]
        })
    })

    return rss.xml()
}

function renderContentHtml(content: DigestContent): string {
    let html = content.introduction;

    if (content.is_indian_market_open) {
        html += withH2('Sensex', renderChangeHtml(content.sensex))
        html += withH2('Nifty', renderChangeHtml(content.nifty))
        html += withH2('Top Gainers', content.top_gainers)
        html += withH2('Top Losers', content.top_losers)
    }

    content.news.forEach(newsItem => {
        html += withH2(newsItem.title, newsItem.description)
    })

    return html
}

function withH2(heading: string, html: string) {
    return `<h2>${heading}</h2>${html}`
}

function renderChangeHtml(change: ChangeStat): string {
    const [changeColor, changeSymbol] = change.change_type == 'up'
        ? ['#339966', '▲']
        : ['#993300', '▼']
    return `<p>
        ${change.value}<br/>
        <span style="color: ${changeColor};">${changeSymbol} ${change.perc_change}%</span>
    </p>`
}
