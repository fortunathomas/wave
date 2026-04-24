import { NextResponse } from 'next/server';
import songs from '@/data/songs.json';

function buildMediaUrl(key: string): string {
    if (!key) return '';

    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    return `/api/media?key=${encodeURIComponent(cleanKey)}`;
}

export async function GET() {
    if (!songs.length) {
        return NextResponse.json({ success: false, songs: [] });
    }

    const sorted = [...songs].sort((a, b) => a.order - b.order);

    const signed = await Promise.all(
        sorted.map(async (song) => ({
            ...song,
            file: buildMediaUrl(song.file),
            coverImage: song.coverImage ? buildMediaUrl(song.coverImage) : '',
            visualVideo: song.visualVideo ? buildMediaUrl(song.visualVideo) : '',
        }))
    );

    return NextResponse.json({ success: true, songs: signed });
}