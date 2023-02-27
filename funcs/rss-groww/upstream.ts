import type { Response } from 'node-fetch'
import type { UpstreamResponse } from "../../common/types";
import type { DailyDigest } from "./types";

import fetch from 'node-fetch'
import { headerKeyContentType, headerKeyLastModified, headerKeyModifiedSince } from '../../common/http';
import { blanked } from '../../common/util';

export const fetchDigests = async (baseUrl: string, lastModified: string): Promise<UpstreamResponse<DailyDigest[]>> => {
    let res: Response
    try {
        res = await fetch(`${baseUrl}/api/v1/dailydigests?_limit=5&_start=0`, {
            headers: { [headerKeyModifiedSince]: lastModified }
        })
    } catch {
        return { kind: 'exception' }
    }

    if (res.status === 304) {
        return { kind: 'cached', statusCode: res.status }
    }

    if (!res.ok) {
        return { kind: 'error', statusCode: res.status }
    }

    if (!res.headers.get(headerKeyContentType)?.includes('json')) {
        return { kind: 'error', statusCode: 404 }
    }

    let data: DailyDigest[]
    try {
        data = await res.json() as DailyDigest[]
    } catch {
        return { kind: 'exception' }
    }

    return {
        kind: 'success',
        data,
        cacheKey: blanked(res.headers.get(headerKeyLastModified))
    }
}
