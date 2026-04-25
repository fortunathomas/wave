import { NextRequest, NextResponse } from 'next/server';

const B2_KEY_ID = process.env.B2_KEY_ID!;
const B2_APPLICATION_KEY = process.env.B2_APPLICATION_KEY!;
const B2_BUCKET_ID = process.env.B2_BUCKET_ID!;

let tokenCache: {
    downloadUrl: string;
    authorizationToken: string;
    bucketName: string;
    expiresAt: number;
} | null = null;

async function getDownloadToken() {
    const now = Date.now();
    if (tokenCache && now < tokenCache.expiresAt) return tokenCache;

    const credentials = Buffer.from(`${B2_KEY_ID}:${B2_APPLICATION_KEY}`).toString('base64');
    const authRes = await fetch('https://api.backblazeb2.com/b2api/v3/b2_authorize_account', {
        headers: { Authorization: `Basic ${credentials}` },
    });
    const auth = await authRes.json();
    if (!authRes.ok) throw new Error(`B2 auth failed: ${authRes.status}`);

    const apiUrl: string = auth.apiInfo.storageApi.apiUrl;
    const downloadUrl: string = auth.apiInfo.storageApi.downloadUrl;
    const authorizationToken: string = auth.authorizationToken;

    const bucketsRes = await fetch(
        `${apiUrl}/b2api/v3/b2_list_buckets?accountId=${auth.accountId}&bucketId=${B2_BUCKET_ID}`,
        { headers: { Authorization: authorizationToken } }
    );
    const bucketsData = await bucketsRes.json();
    if (!bucketsRes.ok) throw new Error(`B2 list buckets failed: ${bucketsRes.status}`);
    const bucketName: string = bucketsData.buckets[0].bucketName;

    const tokenRes = await fetch(`${apiUrl}/b2api/v3/b2_get_download_authorization`, {
        method: 'POST',
        headers: {
            Authorization: authorizationToken,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            bucketId: B2_BUCKET_ID,
            fileNamePrefix: '',
            validDurationInSeconds: 86400,
        }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(`B2 download auth failed: ${tokenRes.status}`);

    tokenCache = {
        downloadUrl,
        bucketName,
        authorizationToken: tokenData.authorizationToken,
        expiresAt: now + 1000 * 60 * 60 * 23,
    };

    return tokenCache;
}

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get('key');

    if (!key) {
        return NextResponse.json({ success: false, error: 'Missing key' }, { status: 400 });
    }

    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    if (!cleanKey || cleanKey.includes('..')) {
        return NextResponse.json({ success: false, error: 'Invalid key' }, { status: 400 });
    }

    try {
        const token = await getDownloadToken();
        const url = `${token.downloadUrl}/file/${token.bucketName}/${cleanKey}?Authorization=${token.authorizationToken}`;
        return NextResponse.redirect(url);
    } catch (err) {
        console.error('B2 media error:', err);
        return NextResponse.json({ success: false, error: 'Failed to load media' }, { status: 500 });
    }
}