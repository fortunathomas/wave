import React from "react";
import type { Song } from "../../types";

type Styles = { readonly [key: string]: string };

interface PlaylistProps {
    tracks: Array<{ song: Song; index: number; displayIndex: number }>;
    currentSongIndex: number;
    isPlaying: boolean;
    onSongChange: (index: number) => void;
    selectedAlbum: string;
    styles: Styles;
}

export function Playlist({
    tracks,
    currentSongIndex,
    isPlaying,
    onSongChange,
    selectedAlbum,
    styles,
}: PlaylistProps) {
    return (
        <div className={styles.playlistContainer}>
            <div className={styles.playlistHeader}>
                <div className={styles.playlistHeaderText}>
                    <h3>{selectedAlbum === 'all' ? 'TUTTI GLI ALBUM' : selectedAlbum.toUpperCase()}</h3>
                    <span className={styles.trackCount}>{tracks.length} tracks</span>
                </div>
            </div>
            <div className={styles.playlistScroll}>
                {tracks.map(({ song, index, displayIndex }) => (
                    <div
                        key={song._id}
                        onClick={() => onSongChange(index)}
                        className={`${styles.playlistItem} ${index === currentSongIndex ? styles.active : ''}`}
                    >
                        <div className={styles.trackNumber}>{displayIndex + 1}</div>
                        <div className={styles.trackInfo}>
                            <div className={styles.trackTitle}>{song.title}</div>
                            <div className={styles.trackArtist}>{song.artist}</div>
                        </div>
                        {index === currentSongIndex && isPlaying && (
                            <div className={styles.playingIndicator}>
                                <div className={styles.bar}></div>
                                <div className={styles.bar}></div>
                                <div className={styles.bar}></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}