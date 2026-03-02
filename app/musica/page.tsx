"use client"
import React, { useState, useEffect, useCallback } from "react";
import styles from './style/MusicPlayer.module.css';
import { useAudioPlayer, useVideoPlayer } from './hooks/useAudioPlayer';
import type { Song } from './types';
import {
    Playlist,
    SongInfo,
    InfoModal,
    ProgressBar,
    Controls,
    VolumeControl
} from './components/UIComponents';

export default function MusicaPage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInfo, setShowInfo] = useState(false);

    const {
        audioRef,
        isPlaying,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        volume,
        togglePlay,
        handleSeek,
        handleVolumeChange,
        toggleMute,
        setShouldPlay,
    } = useAudioPlayer(songs, currentSongIndex);

    const { videoRef, nextVideoRef } = useVideoPlayer(currentSongIndex);

    // Fetch songs
    useEffect(() => {
        async function fetchSongs() {
            try {
                const res = await fetch('/api/songs');
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                if (data.success && data.songs.length > 0) {
                    setSongs(data.songs);
                } else {
                    setError('Nessuna canzone trovata nel database.');
                }
            } catch {
                setError('Impossibile caricare le canzoni. Controlla la connessione.');
            } finally {
                setLoading(false);
            }
        }
        fetchSongs();
    }, []);

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Clicking a song in the playlist: stop current playback, load new song (no autoplay)
    const handleSongChange = useCallback((index: number) => {
        setShouldPlay(false);
        if (audioRef.current) audioRef.current.pause();
        setCurrentSongIndex(index);
    }, [setShouldPlay, audioRef]);

    // Skip buttons: maintain current playback state (if playing, keep playing)
    const nextSong = useCallback(() => {
        setCurrentSongIndex(prev => (prev < songs.length - 1 ? prev + 1 : prev));
    }, [songs.length]);

    const prevSong = useCallback(() => {
        setCurrentSongIndex(prev => (prev > 0 ? prev - 1 : prev));
    }, []);

    // Auto-advance at end of track: always autoplay next
    const handleAutoNext = useCallback(() => {
        if (currentSongIndex < songs.length - 1) {
            setShouldPlay(true);
            setCurrentSongIndex(prev => prev + 1);
        }
    }, [currentSongIndex, songs.length, setShouldPlay]);

    // Keyboard shortcuts: Space = play/pause, ← → = prev/next
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
            else if (e.code === 'ArrowRight') { e.preventDefault(); nextSong(); }
            else if (e.code === 'ArrowLeft') { e.preventDefault(); prevSong(); }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, nextSong, prevSong]);

    const currentSong = songs[currentSongIndex];

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.errorContainer}>
                <p>{error}</p>
            </div>
        );
    }

    if (songs.length === 0 || !currentSong) {
        return (
            <div className={styles.errorContainer}>
                <p>Nessuna canzone disponibile</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Video background */}
            <video
                ref={videoRef}
                className={styles.videoBackground}
                src={currentSong.visualVideo || '/canvas/swagtakes.mp4'}
                autoPlay
                muted
                playsInline
                preload="auto"
                key={currentSongIndex}
            />

            {/* Preload next video (hidden) */}
            {currentSongIndex < songs.length - 1 && (
                <video
                    ref={nextVideoRef}
                    style={{ display: 'none' }}
                    src={songs[currentSongIndex + 1]?.visualVideo}
                    preload="auto"
                    muted
                />
            )}

            <div className={styles.overlay}></div>

            <div className={styles.playerContainer}>
                <Playlist
                    songs={songs}
                    currentSongIndex={currentSongIndex}
                    isPlaying={isPlaying}
                    onSongChange={handleSongChange}
                    styles={styles}
                />

                <SongInfo
                    song={currentSong}
                    onInfoClick={() => setShowInfo(prev => !prev)}
                    styles={styles}
                />

                {showInfo && (
                    <InfoModal
                        song={currentSong}
                        onClose={() => setShowInfo(false)}
                        styles={styles}
                    />
                )}

                {/* Audio element — src driven by currentSong */}
                <audio
                    ref={audioRef}
                    src={currentSong.file}
                    preload="metadata"
                    onTimeUpdate={() => {
                        if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
                    }}
                    onLoadedMetadata={() => {
                        if (audioRef.current) setDuration(audioRef.current.duration);
                    }}
                    onDurationChange={() => {
                        if (audioRef.current) setDuration(audioRef.current.duration);
                    }}
                    onEnded={handleAutoNext}
                />

                <ProgressBar
                    currentTime={currentTime}
                    duration={duration}
                    onSeek={handleSeek}
                    formatTime={formatTime}
                    styles={styles}
                />

                <Controls
                    isPlaying={isPlaying}
                    canGoPrev={currentSongIndex > 0}
                    canGoNext={currentSongIndex < songs.length - 1}
                    onPrev={prevSong}
                    onPlay={togglePlay}
                    onNext={nextSong}
                    styles={styles}
                />

                <VolumeControl
                    volume={volume}
                    onVolumeChange={handleVolumeChange}
                    onToggleMute={toggleMute}
                    styles={styles}
                />
            </div>
        </div>
    );
}
