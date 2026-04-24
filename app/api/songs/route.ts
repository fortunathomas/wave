import { NextResponse } from 'next/server';
import { existsSync } from 'node:fs';
import path from 'node:path';
import songs from '@/data/songs.json';

const PUBLIC_DIR = path.join(process.cwd(), 'public');

function normalizeMediaKey(key: string): string {
    const cleanKey = key.startsWith('/') ? key.slice(1) : key;
    return path.posix.normalize(cleanKey).replace(/^\/+/, '');
}

function buildMediaUrl(key: string): string {
    if (!key) return '';

    const cleanKey = normalizeMediaKey(key);

    // Guard against path traversal and invalid keys.
    if (!cleanKey || cleanKey.includes('..')) {
        return '';
    }

    const localPath = path.join(PUBLIC_DIR, cleanKey);
    if (existsSync(localPath)) {
        return `/${cleanKey}`;
    }

    return `/api/media?key=${encodeURIComponent(cleanKey)}`;
}

export async function GET() {
    if (!songs.length) {
        return NextResponse.json({ success: false, songs: [] });
    }

    const sorted = [...songs].sort((a, b) => a.order - b.order);

    const signed = sorted.map((song) => ({
        ...song,
        file: buildMediaUrl(song.file),
        coverImage: song.coverImage ? buildMediaUrl(song.coverImage) : '',
        visualVideo: song.visualVideo ? buildMediaUrl(song.visualVideo) : '',
    }));

    return NextResponse.json({ success: true, songs: signed });
}