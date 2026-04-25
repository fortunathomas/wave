import { existsSync } from 'node:fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

const B2_PUBLIC_BASE_URL =
    process.env.B2_PUBLIC_BASE_URL ||
    process.env.BACKBLAZE_B2_PUBLIC_BASE_URL ||
    process.env.NEXT_PUBLIC_B2_BASE_URL ||
    process.env.B2_BASE_URL ||
    '';

const B2_DOWNLOAD_URL = process.env.B2_DOWNLOAD_URL || '';
const B2_BUCKET_NAME = process.env.B2_BUCKET_NAME || process.env.BACKBLAZE_B2_BUCKET || '';
const B2_BUCKET_ID = process.env.B2_BUCKET_ID || process.env.BACKBLAZE_B2_BUCKET_ID || '';
const B2_APPLICATION_KEY_ID = process.env.B2_APPLICATION_KEY_ID || process.env.B2_KEY_ID || process.env.BACKBLAZE_B2_KEY_ID || '';
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY || process.env.B2_KEY || process.env.B2_APP_KEY || process.env.BACKBLAZE_B2_APPLICATION_KEY || '';

type B2AuthCache = {
    apiUrl: string;
    authorizationToken: string;
    downloadUrl: string;
    expiresAt: number;
};

let b2AuthCache: B2AuthCache | null = null;

function normalizeMediaKey(key: string): string {
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    return path.posix.normalize(cleanKey).replace(/^\/+/, '');
}

function buildB2Url(key: string): string {
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');

    if (B2_PUBLIC_BASE_URL) {
        return `${B2_PUBLIC_BASE_URL.replace(/\/+$/, '')}/${encodedKey}`;
    }

    if (B2_DOWNLOAD_URL && B2_BUCKET_NAME) {
        return `${B2_DOWNLOAD_URL.replace(/\/+$/, '')}/file/${encodeURIComponent(B2_BUCKET_NAME)}/${encodedKey}`;
    }

    return '';
}

function hasB2PrivateConfig(): boolean {
    return Boolean(B2_APPLICATION_KEY_ID && B2_APPLICATION_KEY && B2_BUCKET_ID);
}

async function authorizeB2(): Promise<B2AuthCache> {
    const now = Date.now();
    if (b2AuthCache && b2AuthCache.expiresAt > now + 60_000) {
        return b2AuthCache;
    }

    const basic = Buffer.from(`${B2_APPLICATION_KEY_ID}:${B2_APPLICATION_KEY}`).toString('base64');
    const response = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
        method: 'GET',
        headers: {
            Authorization: `Basic ${basic}`,
        },
    });

    if (!response.ok) {
        throw new Error(`B2 authorize failed: HTTP ${response.status}`);
    }

    const data = await response.json() as {
        apiUrl: string;
        authorizationToken: string;
        downloadUrl: string;
    };

    b2AuthCache = {
        apiUrl: data.apiUrl,
        authorizationToken: data.authorizationToken,
        downloadUrl: data.downloadUrl,
        // Authorization tokens are short-lived. Refresh proactively.
        expiresAt: now + 23 * 60 * 60 * 1000,
    };

    return b2AuthCache;
}

async function getDownloadAuthorization(fileKey: string): Promise<string> {
    const auth = await authorizeB2();
    const response = await fetch(`${auth.apiUrl}/b2api/v2/b2_get_download_authorization`, {
        method: 'POST',
        headers: {
            Authorization: auth.authorizationToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            bucketId: B2_BUCKET_ID,
            fileNamePrefix: fileKey,
            validDurationInSeconds: 3600,
        }),
    });

    if (!response.ok) {
        throw new Error(`B2 download auth failed: HTTP ${response.status}`);
    }

    const data = await response.json() as { authorizationToken: string };
    return data.authorizationToken;
}

function createNotFoundResponse() {
    return NextResponse.json({ success: false, error: 'Media not found' }, { status: 404 });
}

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get('key');

    if (!key) {
        return NextResponse.json({ success: false, error: 'Missing media key' }, { status: 400 });
    }

    const normalizedKey = normalizeMediaKey(key);
    if (!normalizedKey || normalizedKey.includes('..')) {
        return NextResponse.json({ success: false, error: 'Invalid media key' }, { status: 400 });
    }

    if (/^https?:\/\//i.test(normalizedKey)) {
        return NextResponse.redirect(normalizedKey);
    }

    const localPath = path.join(PUBLIC_DIR, normalizedKey);
    if (existsSync(localPath)) {
        const localUrl = new URL(`/${normalizedKey}`, request.url);
        return NextResponse.redirect(localUrl);
    }

    const b2Url = buildB2Url(normalizedKey);
    if (!b2Url) {
        return createNotFoundResponse();
    }

    try {
        if (hasB2PrivateConfig()) {
            const downloadAuthorization = await getDownloadAuthorization(normalizedKey);
            const privateResponse = await fetch(b2Url, {
                method: 'GET',
                headers: {
                    Authorization: downloadAuthorization,
                    ...(request.headers.get('range') ? { Range: request.headers.get('range') as string } : {}),
                },
            });

            if (!privateResponse.ok && privateResponse.status !== 206) {
                if (privateResponse.status === 401 || privateResponse.status === 404) {
                    return createNotFoundResponse();
                }
                return NextResponse.json({ success: false, error: 'B2 fetch failed' }, { status: privateResponse.status });
            }

            const headers = new Headers();
            const forwardedHeaders = ['content-type', 'content-length', 'accept-ranges', 'content-range', 'cache-control', 'etag', 'last-modified'];
            for (const headerName of forwardedHeaders) {
                const headerValue = privateResponse.headers.get(headerName);
                if (headerValue) {
                    headers.set(headerName, headerValue);
                }
            }

            return new NextResponse(privateResponse.body, {
                status: privateResponse.status,
                headers,
            });
        }

        return NextResponse.redirect(b2Url);
    } catch {
        return NextResponse.json({ success: false, error: 'Unable to load media from B2' }, { status: 502 });
    }
}