"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import styles from "../../musica/style/MusicPlayer.module.css";
import { useAudioPlayer, useVideoPlayer } from "../../musica/hooks/useAudioPlayer";
import type { Song } from "../../types";
import { Playlist } from "./Playlist";
import { SongInfo } from "./SongInfo";
import { InfoModal } from "./InfoModal";
import { ProgressBar } from "./ProgressBar";
import { Controls } from "./Controls";
import { VolumeControl } from "./VolumeControl";
import { BackToHome } from "./BackToHome";

type PlayerClientProps = {
    initialAlbum?: string;
};

export function PlayerClient({ initialAlbum }: PlayerClientProps) {
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const initialAlbumApplied = useRef(false);
    const selectedAlbum = initialAlbum ?? "all";

    const visibleTracks = useMemo(() => {
        const trackEntries = songs.map((song, index) => ({ song, index }));

        if (selectedAlbum === "all") {
            return trackEntries.map((entry, displayIndex) => ({ ...entry, displayIndex }));
        }

        return trackEntries
            .filter(({ song }) => song.album === selectedAlbum)
            .map((entry, displayIndex) => ({ ...entry, displayIndex }));
    }, [songs, selectedAlbum]);

    const currentVisibleIndex = useMemo(() => {
        return visibleTracks.findIndex(({ index }) => index === currentSongIndex);
    }, [visibleTracks, currentSongIndex]);

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
                    setError("Nessuna canzone trovata nel database.");
                }
            } catch {
                setError("Impossibile caricare le canzoni. Controlla la connessione.");
            } finally {
                setLoading(false);
            }
        }

        fetchSongs();
    }, []);

    useEffect(() => {
        if (loading || initialAlbumApplied.current) return;
        if (!initialAlbum || initialAlbum === "all") return;
        if (!songs.some((song) => song.album === initialAlbum)) return;

        initialAlbumApplied.current = true;

        const firstAlbumTrackIndex = songs.findIndex((song) => song.album === initialAlbum);
        if (firstAlbumTrackIndex >= 0) {
            setShouldPlay(false);
            if (audioRef.current) audioRef.current.pause();
            setCurrentSongIndex(firstAlbumTrackIndex);
        }
    }, [audioRef, initialAlbum, loading, songs, setShouldPlay]);

    const formatTime = (time: number) => {
        if (!time || Number.isNaN(time)) return "0:00";
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const handleSongChange = useCallback(
        (index: number) => {
            setShouldPlay(false);
            if (audioRef.current) audioRef.current.pause();
            setCurrentSongIndex(index);
        },
        [setShouldPlay, audioRef],
    );

    const nextSong = useCallback(() => {
        if (visibleTracks.length === 0) return;

        const nextVisibleIndex = currentVisibleIndex >= 0 ? currentVisibleIndex + 1 : 0;
        if (nextVisibleIndex < visibleTracks.length) {
            setCurrentSongIndex(visibleTracks[nextVisibleIndex].index);
        }
    }, [currentVisibleIndex, visibleTracks]);

    const prevSong = useCallback(() => {
        if (visibleTracks.length === 0) return;

        const previousVisibleIndex = currentVisibleIndex >= 0 ? currentVisibleIndex - 1 : 0;
        if (previousVisibleIndex >= 0) {
            setCurrentSongIndex(visibleTracks[previousVisibleIndex].index);
        }
    }, [currentVisibleIndex, visibleTracks]);

    const handleAutoNext = useCallback(() => {
        const nextVisibleIndex = currentVisibleIndex >= 0 ? currentVisibleIndex + 1 : 0;

        if (nextVisibleIndex < visibleTracks.length) {
            setShouldPlay(true);
            setCurrentSongIndex(visibleTracks[nextVisibleIndex].index);
        }
    }, [currentVisibleIndex, visibleTracks, setShouldPlay]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.code === "Space") {
                e.preventDefault();
                togglePlay();
            } else if (e.code === "ArrowRight") {
                e.preventDefault();
                nextSong();
            } else if (e.code === "ArrowLeft") {
                e.preventDefault();
                prevSong();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
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
            <video
                ref={videoRef}
                className={styles.videoBackground}
                src={currentSong.visualVideo || "/canvas/npnd/avatar.mp4"}
                autoPlay
                muted
                playsInline
                preload="auto"
                key={currentSongIndex}
            />

            {currentSongIndex < songs.length - 1 && (
                <video
                    ref={nextVideoRef}
                    style={{ display: "none" }}
                    src={songs[currentSongIndex + 1]?.visualVideo}
                    preload="auto"
                    muted
                />
            )}

            <div className={styles.overlay}></div>

            <div className={styles.playerContainer}>
                <div className={styles.playerTopBar}>
                    <BackToHome />
                </div>

                <Playlist
                    tracks={visibleTracks}
                    currentSongIndex={currentSongIndex}
                    isPlaying={isPlaying}
                    onSongChange={handleSongChange}
                    selectedAlbum={selectedAlbum}
                    styles={styles}
                />

                <SongInfo song={currentSong} onInfoClick={() => setShowInfo((prev) => !prev)} styles={styles} />

                {showInfo && <InfoModal song={currentSong} onClose={() => setShowInfo(false)} styles={styles} />}

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
                    canGoPrev={currentVisibleIndex > 0}
                    canGoNext={currentVisibleIndex >= 0 ? currentVisibleIndex < visibleTracks.length - 1 : visibleTracks.length > 0}
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