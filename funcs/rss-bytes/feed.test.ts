import { describe, expect, it } from "vitest"
import { feed } from "./feed"
import { Config, Post } from "./types"

describe("RSS Feed Generator", () => {
    const config: Config = {
        BYTES_FEED_TITLE: "Test Feed",
        BYTES_FEED_URL: "https://test.com/feed",
        BYTES_SITE_URL: "https://test.com",
        BYTES_IMG_URL: "https://test.com/image.png",
        BYTES_FEED_ITEM_BASE_URL: "https://test.com/posts",
        BYTES_HOST: "don't care",
    }

    const posts: Post[] = [{
        title: "Test Post",
        description: "Test Description",
        slug: "test-post",
        date: "2023-01-01",
        content: `<html>
            <head></head>
            <body>
                <div class="to-be-removed">
                    <img alt="Bytes">
                </div>
                <p>Welcome to Bytes</p>
                <hr>
                <div class="bg-alt">Banner</div>
                Content
            </body>
            </html>`,
        featuredImage: "don't care",
    }]

    describe("feed", () => {
        it("should add correct RSS items", () => {
            const result = feed(config, posts)
            expect(result).toContain("<link>https://test.com/posts/test-post</link>")
            expect(result).toContain('<guid isPermaLink="false">test-post</guid>')
        })

        it("should return correct HTML content", () => {
            const result = feed(config, posts)
            const expectedHtml = `
                <content:encoded>
                    <![CDATA[<html>
                        <head></head>
                        <body>
                            <p>Welcome to Bytes</p>
                            <div class="bg-alt">Banner</div>
                            <hr>
                            Content
                        </body>
                        </html>]]>
                </content:encoded>`;
            assertHtmlContent(expectedHtml, result)
        })
    })
})

function assertHtmlContent(expectedHtml: string, rssFeedXml: string) {
    const normalizedFeed = rssFeedXml.replace(/\s+/g, '')
    const normalizedExpected = expectedHtml.replace(/\s+/g, '')
    expect(normalizedFeed).toContain(normalizedExpected)
}

