import { NextRequest, NextResponse } from 'next/server';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
    endpoint: 'https://s3.us-west-004.backblazeb2.com',
    region: 'us-west-004',
    credentials: {
        accessKeyId: process.env.B2_KEY_ID!,
        secretAccessKey: process.env.B2_APPLICATION_KEY!,
    },
});

const BUCKET = process.env.B2_BUCKET_NAME!;
const EXPIRES_IN = 3600;

async function signUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({ Bucket: BUCKET, Key: key });
    return getSignedUrl(s3, command, { expiresIn: EXPIRES_IN });
}

function pickForwardHeaders(request: NextRequest) {
    const headers = new Headers();
    const range = request.headers.get('range');

    if (range) {
        headers.set('range', range);
    }

    return headers;
}

function pickResponseHeaders(upstream: Response) {
    const headers = new Headers();
    const allowedHeaders = [
        'accept-ranges',
        'cache-control',
        'content-disposition',
        'content-length',
        'content-range',
        'content-type',
        'etag',
        'last-modified',
    ];

    for (const headerName of allowedHeaders) {
        const headerValue = upstream.headers.get(headerName);
        if (headerValue) {
            headers.set(headerName, headerValue);
        }
    }

    return headers;
}

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get('key');

    if (!key) {
        return NextResponse.json({ success: false, error: 'Missing media key' }, { status: 400 });
    }

    const signedUrl = await signUrl(key);
    const upstream = await fetch(signedUrl, {
        headers: pickForwardHeaders(request),
    });

    if (!upstream.body) {
        return new NextResponse('Unable to stream media', { status: upstream.status });
    }

    return new NextResponse(upstream.body, {
        status: upstream.status,
        headers: pickResponseHeaders(upstream),
    });
}