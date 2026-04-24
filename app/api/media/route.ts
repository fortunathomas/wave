import { existsSync } from 'node:fs';
import { NextRequest, NextResponse } from 'next/server';
import path from 'node:path';
const PUBLIC_DIR = path.join(process.cwd(), 'public');

function normalizeMediaKey(key: string): string {
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    return path.posix.normalize(cleanKey).replace(/^\/+/, '');
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

    const localPath = path.join(PUBLIC_DIR, normalizedKey);
    if (existsSync(localPath)) {
        const localUrl = new URL(`/${normalizedKey}`, request.url);
        return NextResponse.redirect(localUrl);
    }

    return NextResponse.json({ success: false, error: 'Media not found' }, { status: 404 });
}