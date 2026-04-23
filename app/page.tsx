"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./musica/style/Home.module.css";
import type { Song } from "./musica/types";

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

            <section className={styles.hero}>
                <p className={styles.kicker}>wave / album selector</p>
                <h1>Scegli l’album, poi lascia che il player faccia il resto.</h1>
                <p className={styles.lead}>
                    Seleziona un album per avviare subito il player dalla prima traccia, oppure entra nel catalogo completo.
                </p>

                <div className={styles.actions}>
                    <Link href="/player" className={styles.primaryAction}>
                        Apri il player
                    </Link>
                    <span className={styles.secondaryAction}>Scegli un album qui sotto</span>
                </div>
            </section>

            <section className={styles.albumSection} aria-label="Album disponibili">
                <div className={styles.sectionHeader}>
                    <h2>Album disponibili</h2>
                    <span>{albums.length ? `${albums.length} selezioni pronte` : "Catalogo in caricamento"}</span>
                </div>

                {loading && <div className={styles.stateBox}>Caricamento album in corso...</div>}

                {error && !loading && <div className={styles.stateBox}>{error}</div>}

                {!loading && !error && (
                    <div className={styles.albumGrid}>
                        <Link href="/player" className={`${styles.albumCard} ${styles.catalogCard}`}>
                            <div className={styles.catalogBadge}>Tutti i brani</div>
                            <h3>Tutti gli album</h3>
                            <p>Entra direttamente nel player con l’intero catalogo.</p>
                        </Link>

                        {albums.map((album) => (
                            <Link
                                key={album.album}
                                href={`/player?album=${encodeURIComponent(album.album)}`}
                                className={styles.albumCard}
                            >
                                <div
                                    className={styles.cover}
                                    style={{ backgroundImage: `linear-gradient(180deg, rgba(7,10,20,0.08), rgba(7,10,20,0.78)), url(${album.coverImage})` }}
                                />
                                <div className={styles.cardContent}>
                                    <div className={styles.cardMeta}>
                                        <span>{album.trackCount} brani</span>
                                        <span>{album.artist}</span>
                                    </div>
                                    <h3>{album.album}</h3>
                                    <p>{album.firstTrack}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}