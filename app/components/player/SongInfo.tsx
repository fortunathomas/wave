import type { Song } from "../../types";

type Styles = { readonly [key: string]: string };

interface SongInfoProps {
    song: Song;
    onInfoClick: () => void;
    styles: Styles;
}

export function SongInfo({ song, onInfoClick, styles }: SongInfoProps) {
    return (
        <div className={styles.songInfo}>
            <div className={styles.coverContainer}>
                <img
                    src={song.coverImage || '/images/npnd.png'}
                    alt={song.title}
                    className={styles.coverImage}
                />
            </div>
            <div className={styles.songHeader}>
                <div>
                    <h1 className={styles.songTitle}>{song.title}</h1>
                    <p className={styles.songArtist}>{song.artist}</p>
                </div>
                <button onClick={onInfoClick} className={styles.infoBtn} aria-label="Info">
                    <img src="/ico/info.png" alt="Info" width="24" height="24" />
                </button>
            </div>
        </div>
    );
}