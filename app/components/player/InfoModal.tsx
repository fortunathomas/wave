import type { Song } from "../../types";

type Styles = { readonly [key: string]: string };

interface InfoModalProps {
    song: Song;
    onClose: () => void;
    styles: Styles;
}

export function InfoModal({ song, onClose, styles }: InfoModalProps) {
    return (
        <div className={styles.infoModal}>
            <div className={styles.infoContent}>
                <button onClick={onClose} className={styles.closeBtn}>
                    <img src="/ico/x.png" alt="Close" width="20" height="20" />
                </button>
                <h3>Track Info</h3>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Title</span>
                    <span className={styles.infoValue}>{song.title}</span>
                </div>
                <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Artist</span>
                    <span className={styles.infoValue}>{song.artist}</span>
                </div>
                {song.producer && (
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Producer</span>
                        <span className={styles.infoValue}>{song.producer}</span>
                    </div>
                )}
                {song.album && (
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Album</span>
                        <span className={styles.infoValue}>{song.album}</span>
                    </div>
                )}
                {song.duration && (
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Duration</span>
                        <span className={styles.infoValue}>{song.duration}</span>
                    </div>
                )}
            </div>
        </div>
    );
}