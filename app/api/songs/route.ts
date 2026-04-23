import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import songs from '@/data/songs.json';

const s3 = new S3Client({
    endpoint: 'https://s3.us-west-004.backblazeb2.com',
    region: 'us-west-004',
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

const BUCKET = process.env.B2_BUCKET_NAME!;
const EXPIRES_IN = 3600; // 1 ora

async function signUrl(key: string): Promise<string> {
    if (!key) return '';
    // Rimuove lo slash iniziale se presente
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: cleanKey });
    return getSignedUrl(s3, command, { expiresIn: EXPIRES_IN });
}

export async function GET() {
    if (!songs.length) {
        return NextResponse.json({ success: false, songs: [] });
    }

    const sorted = [...songs].sort((a, b) => a.order - b.order);

    const signed = await Promise.all(
        sorted.map(async (song) => ({
            ...song,
            file: await signUrl(song.file),
            coverImage: song.coverImage ? await signUrl(song.coverImage) : '',
            visualVideo: song.visualVideo ? await signUrl(song.visualVideo) : '',
        }))
    );

    return NextResponse.json({ success: true, songs: signed });
}