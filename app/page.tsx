"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./components/Home.module.css";
import type { Song } from "./types";
import { AlbumGallery, HomeHero } from "./components";

type AlbumCard = {
    album: string;
    coverImage: string;
    trackCount: number;
    artist: string;
    firstTrack: string;
};

export default function HomePage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchSongs() {
            try {
                const res = await fetch("/api/songs");
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`);
                }

                const data = await res.json();
                if (data.success && data.songs.length > 0) {
                    setSongs(data.songs);
                } else {
                    setError("Nessun album disponibile al momento.");
                }
            } catch {
                setError("Impossibile caricare gli album. Controlla la connessione.");
            } finally {
                setLoading(false);
            }
        }

        fetchSongs();
    }, []);

    const albums = useMemo<AlbumCard[]>(() => {
        const grouped = new Map<string, Song[]>();

        for (const song of songs) {
            if (!song.album) continue;
            const current = grouped.get(song.album) ?? [];
            current.push(song);
            grouped.set(song.album, current);
        }

        return Array.from(grouped.entries())
            .map(([album, albumSongs]) => ({
                album,
                coverImage: albumSongs[0]?.coverImage || "/images/npnd.png",
                trackCount: albumSongs.length,
                artist: albumSongs[0]?.artist || "Various artists",
                firstTrack: albumSongs[0]?.title || "",
            }))
            .sort((a, b) => a.album.localeCompare(b.album));
    }, [songs]);

    return (
        <main className={styles.shell}>
            <div className={styles.aurora} />
            <div className={styles.gridGlow} />

            <HomeHero styles={styles} />
            <AlbumGallery albums={albums} loading={loading} error={error} styles={styles} />
            <footer className={styles.footer}>
                <span>wave / tho</span>
                <span>© 2026</span>
            </footer>
        </main>
    );
}