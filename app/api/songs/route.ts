import { NextResponse } from 'next/server';
import songs from '@/data/songs.json';

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
    if (!authRes.ok) throw new Error(`B2 auth failed: ${authRes.status} - ${JSON.stringify(auth)}`);

    const apiUrl: string = auth.apiInfo.storageApi.apiUrl;
    const downloadUrl: string = auth.apiInfo.storageApi.downloadUrl;
    const authorizationToken: string = auth.authorizationToken;

    const bucketsRes = await fetch(
        `${apiUrl}/b2api/v3/b2_list_buckets?accountId=${auth.accountId}&bucketId=${B2_BUCKET_ID}`,
        { headers: { Authorization: authorizationToken } }
    );
    const bucketsData = await bucketsRes.json();
    if (!bucketsRes.ok) throw new Error(`B2 list buckets failed: ${bucketsRes.status} - ${JSON.stringify(bucketsData)}`);
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
    if (!tokenRes.ok) throw new Error(`B2 download auth failed: ${tokenRes.status} - ${JSON.stringify(tokenData)}`);

    tokenCache = {
        downloadUrl,
        bucketName,
        authorizationToken: tokenData.authorizationToken,
        expiresAt: now + 1000 * 60 * 60 * 23,
    };

    return tokenCache;
}

function buildSignedUrl(filePath: string, token: NonNullable<typeof tokenCache>): string {
    if (!filePath) return '';
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    return `${token.downloadUrl}/file/${token.bucketName}/${cleanPath}?Authorization=${token.authorizationToken}`;
}

export async function GET() {
    if (!songs.length) {
        return NextResponse.json({ success: false, songs: [] });
    }

    try {
        const token = await getDownloadToken();
        const sorted = [...songs].sort((a, b) => a.order - b.order);

        const signed = sorted.map((song) => ({
            ...song,
            file: buildSignedUrl(song.file, token),
            coverImage: buildSignedUrl(song.coverImage, token),
            visualVideo: song.visualVideo ? buildSignedUrl(song.visualVideo, token) : '',
        }));

        return NextResponse.json({ success: true, songs: signed });
    } catch (err) {
        console.error('B2 error:', err);
        return NextResponse.json({ success: false, error: 'Errore nel caricare i file' }, { status: 500 });
    }
}