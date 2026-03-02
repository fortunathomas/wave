import React from 'react';
import type { Song } from '../types';

type Styles = { readonly [key: string]: string };

// ─── Playlist ────────────────────────────────────────────────────────────────

interface PlaylistProps {
    songs: Song[];
    currentSongIndex: number;
    isPlaying: boolean;
    onSongChange: (index: number) => void;
    styles: Styles;
}

export function Playlist({ songs, currentSongIndex, isPlaying, onSongChange, styles }: PlaylistProps) {
    return (
        <div className={styles.playlistContainer}>
            <div className={styles.playlistHeader}>
                <h3>SWAG TAKES</h3>
                <span className={styles.trackCount}>{songs.length} tracks</span>
            </div>
            <div className={styles.playlistScroll}>
                {songs.map((song, index) => (
                    <div
                        key={song._id}
                        onClick={() => onSongChange(index)}
                        className={`${styles.playlistItem} ${index === currentSongIndex ? styles.active : ''}`}
                    >
                        <div className={styles.trackNumber}>{index + 1}</div>
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

// ─── SongInfo ─────────────────────────────────────────────────────────────────

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
                    src={song.coverImage || '/images/swagtakes.png'}
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

// ─── InfoModal ────────────────────────────────────────────────────────────────

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

// ─── ProgressBar ──────────────────────────────────────────────────────────────

interface ProgressBarProps {
    currentTime: number;
    duration: number;
    onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    formatTime: (time: number) => string;
    styles: Styles;
}

export function ProgressBar({ currentTime, duration, onSeek, formatTime, styles }: ProgressBarProps) {
    return (
        <div className={styles.progressContainer}>
            <div className={styles.progressWrapper}>
                <div
                    className={styles.progressFill}
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                />
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={onSeek}
                    disabled={!duration}
                    className={styles.progressBar}
                />
            </div>
            <div className={styles.timeDisplay}>
                <span>{formatTime(currentTime)}</span>
                <span>{duration ? formatTime(duration) : '--:--'}</span>
            </div>
        </div>
    );
}

// ─── Controls ─────────────────────────────────────────────────────────────────

interface ControlsProps {
    isPlaying: boolean;
    canGoPrev: boolean;
    canGoNext: boolean;
    onPrev: () => void;
    onPlay: () => void;
    onNext: () => void;
    styles: Styles;
}

export function Controls({ isPlaying, canGoPrev, canGoNext, onPrev, onPlay, onNext, styles }: ControlsProps) {
    return (
        <div className={styles.controls}>
            <button onClick={onPrev} disabled={!canGoPrev} className={`${styles.controlBtn} ${styles.secondary}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 20L9 12l10-8v16zm-9-8V4H8v16h2V12z"/>
                </svg>
            </button>

            <button onClick={onPlay} className={`${styles.controlBtn} ${styles.primary}`}>
                {isPlaying ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1"/>
                        <rect x="14" y="4" width="4" height="16" rx="1"/>
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z"/>
                    </svg>
                )}
            </button>

            <button onClick={onNext} disabled={!canGoNext} className={`${styles.controlBtn} ${styles.secondary}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 4l10 8-10 8V4zm10 8v8h2V4h-2v8z"/>
                </svg>
            </button>
        </div>
    );
}

// ─── VolumeControl ────────────────────────────────────────────────────────────

interface VolumeControlProps {
    volume: number;
    onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onToggleMute: () => void;
    styles: Styles;
}

export function VolumeControl({ volume, onVolumeChange, onToggleMute, styles }: VolumeControlProps) {
    return (
        <div className={styles.volumeContainer}>
            <div className={styles.volumeIcon} onClick={onToggleMute}>
                {volume === 0 ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <line x1="23" y1="9" x2="17" y2="15"></line>
                        <line x1="17" y1="9" x2="23" y2="15"></line>
                    </svg>
                ) : volume < 0.5 ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                )}
            </div>
            <div className={styles.volumeSliderWrapper}>
                <div className={styles.volumeFill} style={{ width: `${volume * 100}%` }} />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={onVolumeChange}
                    className={styles.volumeSlider}
                />
            </div>
            <span className={styles.volumePercent}>{Math.round(volume * 100)}%</span>
        </div>
    );
}
