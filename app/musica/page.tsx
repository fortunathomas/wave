"use client"
import React, { useState, useEffect } from "react";
import styles from './style/MusicPlayer.module.css';
import { useAudioPlayer, useVideoPlayer } from './hooks/useAudioPlayer';
import {
    Playlist,
    SongInfo,
    InfoModal,
    ProgressBar,
    Controls,
    VolumeControl
} from './components/UIComponents';

interface Song {
    _id: string;
    title: string;
    artist: string;
    producer?: string;
    album?: string;
    coverImage?: string;
    visualVideo?: string;
    file: string;
    duration?: string;
    order: number;
}

export default function MusicaPage() {
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showInfo, setShowInfo] = useState(false);

    // Custom hooks
    const {
        audioRef,
        isPlaying,
        setIsPlaying,
        currentTime,
        setCurrentTime,
        duration,
        setDuration,
        volume,
        togglePlay,
        handleSeek,
        handleVolumeChange,
        toggleMute
    } = useAudioPlayer(songs, currentSongIndex);

    const { videoRef, nextVideoRef } = useVideoPlayer(currentSongIndex);

    // Fetch songs
    useEffect(() => {
        async function fetchSongs() {
            try {
                const res = await fetch('/api/songs');
                const data = await res.json();

                if (data.success && data.songs.length > 0) {
                    setSongs(data.songs);
                } else {
                    console.error('Nessuna canzone trovata');
                }
            } catch (error) {
                console.error('Errore caricamento canzoni:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchSongs();
    }, []);

    // Utility functions
    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleSongChange = (index: number) => {
        setCurrentSongIndex(index);
        setIsPlaying(false);
    };

    const nextSong = () => {
        if (currentSongIndex < songs.length - 1) {
            setCurrentSongIndex(currentSongIndex + 1);
        }
    };

    const prevSong = () => {
        if (currentSongIndex > 0) {
            setCurrentSongIndex(currentSongIndex - 1);
        }
    };

    const handleAutoNext = () => {
        setIsPlaying(false);
        if (currentSongIndex < songs.length - 1) {
            setTimeout(() => {
                setCurrentSongIndex(currentSongIndex + 1);
                setIsPlaying(true);
            }, 500);
        }
    };

    const currentSong = songs[currentSongIndex];

    // Loading state
    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    // Empty state
    if (songs.length === 0) {
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
                src={currentSong?.visualVideo || '/canvas/swagtakes.mp4'}
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

            {/* Player */}
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
                    onInfoClick={() => setShowInfo(!showInfo)}
                    styles={styles}
                />

                {showInfo && (
                    <InfoModal
                        song={currentSong}
                        onClose={() => setShowInfo(false)}
                        styles={styles}
                    />
                )}

                {/* Audio element */}
                <audio
                    ref={audioRef}
                    src={currentSong.file}
                    preload="metadata"
                    onTimeUpdate={() => {
                        if (audioRef.current) {
                            setCurrentTime(audioRef.current.currentTime);
                        }
                    }}
                    onLoadedMetadata={() => {
                        if (audioRef.current) {
                            setDuration(audioRef.current.duration);
                        }
                    }}
                    onCanPlay={() => {
                        if (audioRef.current && !duration) {
                            setDuration(audioRef.current.duration);
                        }
                    }}
                    onDurationChange={() => {
                        if (audioRef.current) {
                            setDuration(audioRef.current.duration);
                        }
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
                    disabled={!duration}
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