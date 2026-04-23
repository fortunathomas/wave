import Link from "next/link";

type Styles = { readonly [key: string]: string };

export type AlbumCard = {
    album: string;
    coverImage: string;
    trackCount: number;
    artist: string;
    firstTrack: string;
};

type AlbumGalleryProps = {
    albums: AlbumCard[];
    loading: boolean;
    error: string | null;
    styles: Styles;
};

export function AlbumGallery({ albums, loading, error, styles }: AlbumGalleryProps) {
    const catalogBackground = "/images/default.png";

    return (
        <section className={styles.albumSection} aria-label="Album disponibili">
            <div className={styles.sectionHeader}>
                <h2>Album disponibili</h2>
                <span>{albums.length ? `${albums.length} selezioni pronte` : "Catalogo in caricamento"}</span>
            </div>

            {loading && <div className={styles.stateBox}>Caricamento album in corso...</div>}

            {error && !loading && <div className={styles.stateBox}>{error}</div>}

            {!loading && !error && (
                <div className={styles.albumGrid}>
                    <Link
                        href="/player"
                        className={`${styles.albumCard} ${styles.catalogCard}`}
                        style={{ backgroundImage: `linear-gradient(180deg, rgba(7,10,20,0.22), rgba(7,10,20,0.88)), url(${catalogBackground})` }}
                    >
                        <div className={styles.catalogHeader}>
                            <div className={styles.catalogBadge}>Tutti i brani</div>
                            <h3>Tutti gli album</h3>
                        </div>
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
    );
}