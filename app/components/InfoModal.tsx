import type { Song } from "../types";

type Styles = { readonly [key: string]: string };

interface InfoModalProps {
    song: Song;
    runtimeDuration?: string;
    onClose: () => void;
    styles: Styles;
}

export function InfoModal({ song, runtimeDuration, onClose, styles }: InfoModalProps) {
    return (
        <div className={styles.infoModal}>
            <div className={styles.infoContent}>
                <button onClick={onClose} className={styles.closeBtn}>
                    <img src="/api/media?key=ico%2Fx.png" alt="Close" width="20" height="20" />
                </button>
                <h3>{song.title}</h3>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Titolo</span>
                    <span className={styles.infoValue}>{song.title}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Artista</span>
                    <span className={styles.infoValue}>{song.artist}</span>
                </div>
                {song.producer && (
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Prodotta da</span>
                        <span className={styles.infoValue}>{song.producer}</span>
                    </div>
                )}
                {song.album && (
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Album</span>
                        <span className={styles.infoValue}>{song.album}</span>
                    </div>
                )}
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Durata</span>
                    <span className={styles.infoValue}>{runtimeDuration ?? "--:--"}</span>
                </div>
            </div>
        </div>
    );
}