import { NextResponse } from 'next/server';
import songs from '@/data/songs.json';

export async function GET() {
    if (!songs.length) {
        return NextResponse.json({ success: false, songs: [] });
    }

    const sorted = [...songs].sort((a, b) => a.order - b.order);

    return NextResponse.json({ success: true, songs: sorted });
}
