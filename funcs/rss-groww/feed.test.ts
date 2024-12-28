import { describe, expect, it } from "vitest"
import { feed } from "./feed"
import { Config, DailyDigest } from "./types"
import { assertHtmlContent } from '../../test/helpers'

describe('Groww RSS Feed Generator', () => {
    const config: Config = {
        GROWW_FEED_TITLE: 'Market Updates',
        GROWW_FEED_URL: "https://example.com/feed",
        GROWW_SITE_URL: "https://example.com",
        GROWW_IMG_URL: "https://example.com/image.png",
        GROWW_FEED_ITEM_BASE_URL: "https://example.com/digest",
        GROWW_HOST: "don't care"
    }

    const digest: DailyDigest = {
        title: "Market Update - Jan 1",
        introduction: "Today\'s market summary",
        slug: "slug-1",
        date: "2024-01-01",
        is_indian_market_open: true,
        sensex: { value: 60_000, change_type: "up", perc_change: 1.5 },
        nifty: { value: 18_000, change_type: "down", perc_change: 1.5 },
        top_gainers: "HDFC, TCS",
        top_losers: "Infosys, Wipro",
        news: [
            {
                title: "Market News",
                description: "Important market update"
            }
        ]
    }

    describe("feed", () => {
        it("should add correct values to RSS item fields", () => {
            const digests = [digest]
            const result = feed(config, digests)
            expect(result).toContain("<link>https://example.com/digest/slug-1</link>")
            expect(result).toContain('<guid isPermaLink="false">slug-1</guid>')
        })

        it("should return correct HTML content", () => {
            const digests = [digest]
            const result = feed(config, digests)
            const expectedHtml = `
                <content:encoded>
                    <![CDATA[Today's market summary
                        <h2>Sensex</h2>
                        <p>
                            60000<br/>
                            <span style="color: #339966;">▲ 1.5%</span>
                        </p>
                        <h2>Nifty</h2>
                        <p>
                            18000<br/>
                            <span style="color: #993300;">▼ 1.5%</span>
                        </p>
                        <h2>Top Gainers</h2>
                        HDFC, TCS
                        <h2>Top Losers</h2>
                        Infosys, Wipro
                        <h2>Market News</h2>
                        Important market update]]>
                </content:encoded>`;
            assertHtmlContent(expectedHtml, result)
        })

        it("should return correct HTML content when market is closed", () => {
            const digests: DailyDigest[] = [{
                ...digest,
                is_indian_market_open: false,
            }]
            const result = feed(config, digests)
            expect(result).not.toContain('Sensex')
            expect(result).not.toContain('Nifty')
            expect(result).not.toContain('Top Gainers')
            expect(result).not.toContain('Top Losers')
            expect(result).toContain('Market News') // News should still be present
        })
    })
})
