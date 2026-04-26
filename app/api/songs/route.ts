import { NextResponse } from 'next/server';
import songs from '@/data/songs.json';

const BASES = {
    npnd: 'https://ia601905.us.archive.org/28/items/wave-media-npnd_202604',
    albv: 'https://ia601805.us.archive.org/13/items/wave-media-albv_202604',
    ico: 'https://ia903209.us.archive.org/21/items/wave-media-ico',
    images: 'https://ia600909.us.archive.org/1/items/wave-media-images',
};

function buildUrl(filePath: string): string {
    if (!filePath) return '';
    const clean = filePath.startsWith('/') ? filePath.slice(1) : filePath;

    if (clean.startsWith('music/npnd/') || clean.startsWith('canvas/npnd/')) {
        const file = clean.split('/').pop()!;
        return `${BASES.npnd}/${file}`;
    }
    if (clean.startsWith('music/albv/') || clean.startsWith('canvas/albv/')) {
        const file = clean.split('/').pop()!;
        return `${BASES.albv}/${file}`;
    }
    if (clean.startsWith('ico/')) {
        const file = clean.split('/').pop()!;
        return `${BASES.ico}/${file}`;
    }
    if (clean.startsWith('images/')) {
        const file = clean.split('/').pop()!;
        return `${BASES.images}/${file}`;
    }

    return '';
}

export async function GET() {
    if (!songs.length) {
        return NextResponse.json({ success: false, songs: [] });
    }

    const sorted = [...songs].sort((a, b) => a.order - b.order);

    const mapped = sorted.map((song) => ({
        ...song,
        file: buildUrl(song.file),
        coverImage: buildUrl(song.coverImage),
        visualVideo: song.visualVideo ? buildUrl(song.visualVideo) : '',
    }));

    return NextResponse.json({ success: true, songs: mapped });
}