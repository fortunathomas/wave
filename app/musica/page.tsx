"use client"
import React, { useRef, useState, useEffect } from "react";
import styles from './MusicPlayer.module.css';

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
    const audioRef = useRef<HTMLAudioElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1); // Volume da 0 a 1
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);

    // State per playlist
    const [songs, setSongs] = useState<Song[]>([]);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [loading, setLoading] = useState(true);

    // Fetch canzoni dal database
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

    // Reload audio quando cambia canzone
    useEffect(() => {
        if (audioRef.current && songs.length > 0) {
            audioRef.current.load();
            setCurrentTime(0);
            setDuration(0);

            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            }
        }
    }, [currentSongIndex, songs]);

    useEffect(() => {
        const setupAudio = () => {
            if (!audioRef.current || audioContextRef.current) return;

            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                const audioContext = new AudioContextClass();
                const analyser = audioContext.createAnalyser();
                const source = audioContext.createMediaElementSource(audioRef.current);

                source.connect(analyser);
                analyser.connect(audioContext.destination);
                analyser.fftSize = 256;

                audioContextRef.current = audioContext;
                analyserRef.current = analyser;
            } catch (error) {
                console.error('Audio setup error:', error);
            }
        };

        if (audioRef.current && !audioContextRef.current) {
            setupAudio();
        }
    }, [currentSongIndex, songs]);

    const togglePlay = async () => {
        if (!audioRef.current || !audioContextRef.current) return;

        try {
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            if (isPlaying) {
                audioRef.current.pause();
                if (videoRef.current) videoRef.current.pause();
                setIsPlaying(false);
            } else {
                await audioRef.current.play();
                if (videoRef.current) videoRef.current.play();
                setIsPlaying(true);
            }
        } catch (error) {
            console.error('Errore play audio:', error);
            setIsPlaying(false);
            if (audioRef.current) {
                audioRef.current.load();
            }
        }
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value);
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };

    // Imposta il volume quando l'audio viene caricato
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume, currentSongIndex]);

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

    const currentSong = songs[currentSongIndex];

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner}></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (songs.length === 0) {
        return (
            <div className={styles.errorContainer}>
                <p>Nessuna canzone disponibile</p>
            </div>
        );
    }

    return (
        <div className={styles.pageContainer}>
            {/* Video background blurrato */}
            <video
                ref={videoRef}
                className={styles.videoBackground}
                src={currentSong?.visualVideo || '/canvas/swagtakes.mp4'}
                autoPlay
                loop
                muted
                playsInline
                key={currentSongIndex} // Forza reload quando cambia canzone
            />

            {/* Overlay scuro */}
            <div className={styles.overlay}></div>

            {/* Player glassmorphism */}
            <div className={styles.playerContainer}>
                {/* Lista canzoni */}
                <div className={styles.playlistContainer}>
                    <div className={styles.playlistHeader}>
                        <h3>SWAG TAKES</h3>
                        <span className={styles.trackCount}>{songs.length} tracks</span>
                    </div>
                    <div className={styles.playlistScroll}>
                        {songs.map((song, index) => (
                            <div
                                key={song._id}
                                onClick={() => handleSongChange(index)}
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

                {/* Info canzone */}
                <div className={styles.songInfo}>
                    {/* Cover Image */}
                    <div className={styles.coverContainer}>
                        <img
                            src={currentSong.coverImage || '/images/swagtakes.png'}
                            alt={currentSong.title}
                            className={styles.coverImage}
                        />
                    </div>

                    <h1 className={styles.songTitle}>{currentSong.title}</h1>
                    <p className={styles.songArtist}>{currentSong.artist}</p>
                    {currentSong.producer && (
                        <p className={styles.songProducer}>prod. {currentSong.producer}</p>
                    )}
                    {currentSong.album && (
                        <p className={styles.songAlbum}>{currentSong.album}</p>
                    )}
                </div>

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
                    onEnded={() => {
                        setIsPlaying(false);
                        if (currentSongIndex < songs.length - 1) {
                            setTimeout(() => {
                                setCurrentSongIndex(currentSongIndex + 1);
                                setIsPlaying(true);
                            }, 500);
                        }
                    }}
                />

                {/* Progress bar */}
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
                            onChange={handleSeek}
                            disabled={!duration}
                            className={styles.progressBar}
                        />
                    </div>
                    <div className={styles.timeDisplay}>
                        <span>{formatTime(currentTime)}</span>
                        <span>{duration ? formatTime(duration) : '--:--'}</span>
                    </div>
                </div>

                {/* Controlli */}
                <div className={styles.controls}>
                    <button
                        onClick={prevSong}
                        disabled={currentSongIndex === 0}
                        className={`${styles.controlBtn} ${styles.secondary}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M19 20L9 12l10-8v16zm-9-8V4H8v16h2V12z"/>
                        </svg>
                    </button>

                    <button
                        onClick={togglePlay}
                        disabled={!duration}
                        className={`${styles.controlBtn} ${styles.primary}`}
                    >
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

                    <button
                        onClick={nextSong}
                        disabled={currentSongIndex === songs.length - 1}
                        className={`${styles.controlBtn} ${styles.secondary}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 4l10 8-10 8V4zm10 8v8h2V4h-2v8z"/>
                        </svg>
                    </button>
                </div>

                {/* Volume Control */}
                <div className={styles.volumeContainer}>
                    <div
                        className={styles.volumeIcon}
                        onClick={() => {
                            if (volume > 0) {
                                setVolume(0);
                                if (audioRef.current) audioRef.current.volume = 0;
                            } else {
                                setVolume(1);
                                if (audioRef.current) audioRef.current.volume = 1;
                            }
                        }}
                    >
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
                        <div
                            className={styles.volumeFill}
                            style={{ width: `${volume * 100}%` }}
                        />
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={volume}
                            onChange={handleVolumeChange}
                            className={styles.volumeSlider}
                        />
                    </div>
                    <span className={styles.volumePercent}>{Math.round(volume * 100)}%</span>
                </div>

                {/* Track counter */}
                <div className={styles.trackCounter}>
                    Track {currentSongIndex + 1} of {songs.length}
                </div>
            </div>
        </div>
    );
}