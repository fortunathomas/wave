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
    initialMode?: string;
};

function shuffleIndices(indices: number[]) {
    const shuffled = [...indices];

    for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
}

export function PlayerClient({ initialAlbum, initialMode }: PlayerClientProps) {
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [hasVideoError, setHasVideoError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInfo, setShowInfo] = useState(false);
    const initialTrackApplied = useRef(false);
    const isShuffleMode = initialMode === "shuffle";
    const selectedAlbum = initialAlbum ?? "all";

    const baseTrackIndices = useMemo(() => {
        if (selectedAlbum === "all") {
            return songs.map((_, index) => index);
        }

        return songs
            .map((song, index) => ({ song, index }))
            .filter(({ song }) => song.album === selectedAlbum)
            .map(({ index }) => index);
    }, [songs, selectedAlbum]);

    const orderedTrackIndices = useMemo(() => {
        return isShuffleMode ? shuffleIndices(baseTrackIndices) : baseTrackIndices;
    }, [baseTrackIndices, isShuffleMode]);

    const visibleTracks = useMemo(() => {
        return orderedTrackIndices.map((index, displayIndex) => ({
            song: songs[index],
            index,
            displayIndex,
        }));
    }, [orderedTrackIndices, songs]);

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
                    setError("Nessuna canzone trovata nel database");
                }
            } catch {
                setError("Impossibile caricare le canzoni. Controlla la connessione");
            } finally {
                setLoading(false);
            }
        }

        fetchSongs();
    }, []);

    useEffect(() => {
        setHasVideoError(false);
    }, [currentSongIndex]);

    useEffect(() => {
        if (loading || initialTrackApplied.current) return;
        if (orderedTrackIndices.length === 0) return;

        initialTrackApplied.current = true;
        setShouldPlay(false);
        if (audioRef.current) audioRef.current.pause();
        setCurrentSongIndex(orderedTrackIndices[0]);
    }, [audioRef, loading, orderedTrackIndices, setShouldPlay]);

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
    const videoSource = currentSong?.visualVideo?.trim() || "";
    const fallbackImageSource = currentSong?.coverImage?.trim() || "/images/logo.png";
    const nextTrack = currentVisibleIndex >= 0 && currentVisibleIndex < visibleTracks.length - 1
        ? visibleTracks[currentVisibleIndex + 1]
        : undefined;

    const syncVideoWithAudio = useCallback(async () => {
        const video = videoRef.current;
        const audio = audioRef.current;

        if (!video || !audio || !videoSource || hasVideoError) return;

        if (audio.paused) {
            video.pause();
            return;
        }

        if (Number.isFinite(video.duration) && video.duration > 0 && Number.isFinite(audio.currentTime)) {
            const syncedTime = audio.currentTime % video.duration;
            if (Math.abs(video.currentTime - syncedTime) > 0.35) {
                video.currentTime = syncedTime;
            }
        }

        try {
            await video.play();
        } catch (error) {
            if (!(error instanceof DOMException)) return;

            if (error.name === "AbortError" || error.name === "NotAllowedError") {
                return;
            }

            if (typeof error.message === "string" && error.message.toLowerCase().includes("interrupted")) {
                return;
            }
        }
    }, [audioRef, hasVideoError, videoRef, videoSource]);

    useEffect(() => {
        void syncVideoWithAudio();
    }, [isPlaying, currentSongIndex, syncVideoWithAudio]);

    useEffect(() => {
        // On track change (skip/next/prev/select), retry sync a few times while media metadata settles.
        const retryDelays = [0, 220, 650];
        const timers = retryDelays.map((delay) => window.setTimeout(() => {
            void syncVideoWithAudio();
        }, delay));

        return () => {
            timers.forEach((timer) => window.clearTimeout(timer));
        };
    }, [currentSongIndex, syncVideoWithAudio]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleAudioSync = () => {
            void syncVideoWithAudio();
        };

        const events: Array<keyof HTMLMediaElementEventMap> = [
            "play",
            "pause",
            "seeking",
            "seeked",
            "ratechange",
            "loadedmetadata",
            "canplay",
            "timeupdate",
        ];

        events.forEach((eventName) => {
            audio.addEventListener(eventName, handleAudioSync);
        });

        return () => {
            events.forEach((eventName) => {
                audio.removeEventListener(eventName, handleAudioSync);
            });
        };
    }, [audioRef, syncVideoWithAudio]);

    useEffect(() => {
        const handleFocus = () => {
            void syncVideoWithAudio();
        };

        const handleVisibilityChange = () => {
            if (!document.hidden) {
                void syncVideoWithAudio();
            }
        };

        window.addEventListener("focus", handleFocus);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [syncVideoWithAudio]);

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Caricamento...</p>
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
            {videoSource && !hasVideoError ? (
                <video
                    ref={videoRef}
                    className={styles.videoBackground}
                    src={videoSource}
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    key={currentSongIndex}
                    onError={() => setHasVideoError(true)}
                    onLoadedMetadata={() => {
                        void syncVideoWithAudio();
                    }}
                    onCanPlay={() => {
                        void syncVideoWithAudio();
                    }}
                />
            ) : (
                <img
                    className={styles.videoBackground}
                    src={fallbackImageSource}
                    alt=""
                    aria-hidden="true"
                />
            )}

            {nextTrack?.song.visualVideo && (
                <video
                    ref={nextVideoRef}
                    style={{ display: "none" }}
                    src={nextTrack.song.visualVideo}
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
                    selectedAlbum={isShuffleMode ? "shuffle" : selectedAlbum}
                    styles={styles}
                />

                <SongInfo song={currentSong} onInfoClick={() => setShowInfo((prev) => !prev)} styles={styles} />

                {showInfo && (
                    <InfoModal
                        song={currentSong}
                        runtimeDuration={duration ? formatTime(duration) : undefined}
                        onClose={() => setShowInfo(false)}
                        styles={styles}
                    />
                )}

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