import { parse } from 'node-html-parser'

type NextData<T> = {
    props: {
        pageProps: T,
    },
    buildId: string,
}

export const parseNextData = <T>(html: string) => {
    const root = parse(html)
    const nextDom = root.querySelector('#__NEXT_DATA__')
    if (!nextDom) {
        return null
    }

    const nextData = JSON.parse(nextDom.textContent) as NextData<T>
    return nextData;
};
