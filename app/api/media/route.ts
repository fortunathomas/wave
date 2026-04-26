import { NextRequest, NextResponse } from 'next/server';

const BASES = {
    ico: 'https://ia903209.us.archive.org/21/items/wave-media-ico',
    images: 'https://ia600909.us.archive.org/1/items/wave-media-images',
};

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get('key');
    if (!key) return NextResponse.json({ success: false, error: 'Missing key' }, { status: 400 });

    const clean = key.startsWith('/') ? key.slice(1) : key;
    if (!clean || clean.includes('..')) {
        return NextResponse.json({ success: false, error: 'Invalid key' }, { status: 400 });
    }

    const file = clean.split('/').pop()!;

    if (clean.startsWith('ico/')) {
        return NextResponse.redirect(`${BASES.ico}/${file}`);
    }
    if (clean.startsWith('images/')) {
        return NextResponse.redirect(`${BASES.images}/${file}`);
    }

    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
}