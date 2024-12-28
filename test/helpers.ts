import {expect} from 'vitest'

export function assertHtmlContent(expectedHtml: string, rssFeedXml: string) {
    const normalizedFeed = rssFeedXml.replace(/\s+/g, '')
    const normalizedExpected = expectedHtml.replace(/\s+/g, '')
    expect(normalizedFeed).toContain(normalizedExpected)
}
