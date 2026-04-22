import { useRef, useState, useEffect, useCallback } from 'react';
import type { RefObject } from 'react';
import type { Song } from '../types';

export function useAudioPlayer(songs: Song[], currentSongIndex: number) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // Tracks whether we *want* to play — survives across async song changes
    const shouldPlayRef = useRef(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Load volume from localStorage on init
    const [volume, setVolume] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('playerVolume');
            if (saved !== null) {
                const parsed = parseFloat(saved);
                if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
                    return parsed;
                }
            }
        }
        return 1;
    });

    // Setup Web Audio API context (once, when songs are available)
    useEffect(() => {
        if (!audioRef.current || audioContextRef.current || songs.length === 0) return;
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            const analyser = audioContext.createAnalyser();
            const gainNode = audioContext.createGain();
            const source = audioContext.createMediaElementSource(audioRef.current);
            source.connect(gainNode);
            gainNode.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 256;
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
            gainNodeRef.current = gainNode;
            // Apply saved volume to the gainNode when it's created
            gainNode.gain.value = volume;
        } catch (error) {
            console.error('Audio context setup error:', error);
        }
    }, [songs, volume]);

    // Sync isPlaying with native audio element events — this is the source of truth
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => {
            shouldPlayRef.current = false;
            setIsPlaying(false);
        };
        const onError = () => {
            shouldPlayRef.current = false;
            setIsPlaying(false);
        };

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('ended', onEnded);
        audio.addEventListener('error', onError);

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('ended', onEnded);
            audio.removeEventListener('error', onError);
        };
    }, [songs.length]); // re-run when songs load so audioRef.current is in the DOM

    // Reset playing state when song changes
    useEffect(() => {
        setIsPlaying(false);
        shouldPlayRef.current = false;
    }, [currentSongIndex]);

    // Song change: reset state, reload audio, play when ready if shouldPlay is true
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || songs.length === 0) return;

        setCurrentTime(0);
        setDuration(0);
        audio.pause();

        const onCanPlay = () => {
            if (shouldPlayRef.current) {
                audio.play().catch((err) => {
                    console.error('Autoplay error:', err);
                    shouldPlayRef.current = false;
                });
            }
        };

        // Add listener before load() to avoid missing the event
        audio.addEventListener('canplay', onCanPlay, { once: true });
        audio.load();

        return () => {
            audio.removeEventListener('canplay', onCanPlay);
        };
    }, [currentSongIndex, songs]);

    // Apply volume and persist to localStorage
    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = volume;
        }
        localStorage.setItem('playerVolume', String(volume));
    }, [volume]);

    const togglePlay = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return;
        try {
            if (audioContextRef.current?.state === 'suspended') {
                await audioContextRef.current.resume();
            }
            if (audio.paused) {
                shouldPlayRef.current = true;
                await audio.play();
            } else {
                shouldPlayRef.current = false;
                audio.pause();
            }
        } catch (error) {
            console.error('Play/pause error:', error);
            shouldPlayRef.current = false;
        }
    }, []);

    const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, []);

    const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setVolume(parseFloat(e.target.value));
    }, []);

    const toggleMute = useCallback(() => {
        setVolume(prev => (prev > 0 ? 0 : 1));
    }, []);

    const setShouldPlay = useCallback((val: boolean) => {
        shouldPlayRef.current = val;
    }, []);

    return {
        audioRef,
        analyserRef,
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
    };
}

export function useVideoPlayer(
    currentSongIndex: number,
    audioRef: RefObject<HTMLAudioElement | null>,
    videoOffsetSec = 0
) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const nextVideoRef = useRef<HTMLVideoElement>(null);

    // Preload next video
    useEffect(() => {
        if (nextVideoRef.current) {
            nextVideoRef.current.load();
        }
    }, [currentSongIndex]);

    // Song change: reload current video and align to the current audio position
    useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video) return;

        const alignToAudio = () => {
            const now = audio?.currentTime ?? 0;
            if (Math.abs(video.currentTime - now) > 0.2) {
                video.currentTime = now;
            }
        };

        const onCanPlay = () => {
            alignToAudio();
            if (audio && !audio.paused) {
                video.play().catch(console.error);
            } else {
                video.pause();
            }
        };

        video.addEventListener('canplay', onCanPlay, { once: true });
        video.load();

        return () => {
            video.removeEventListener('canplay', onCanPlay);
        };
    }, [currentSongIndex, audioRef]);

    // Keep video transport synced to audio transport (play/pause/seek/clock drift)
    useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video || !audio) return;

        const getTargetTime = () => Math.max(0, audio.currentTime + videoOffsetSec);
        let rafId: number | null = null;

        const syncTime = () => {
            const target = getTargetTime();
            if (Math.abs(video.currentTime - target) > 0.06) {
                video.currentTime = target;
            }
        };

        const runTightSync = () => {
            syncTime();
            if (!audio.paused && !audio.ended) {
                rafId = requestAnimationFrame(runTightSync);
            }
        };

        const onPlay = () => {
            syncTime();
            video.play().catch(console.error);
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(runTightSync);
        };

        const onPause = () => {
            video.pause();
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };

        const onSeek = () => {
            syncTime();
        };

        const onRateChange = () => {
            video.playbackRate = audio.playbackRate;
        };

        const onTimeUpdate = () => {
            syncTime();
        };

        const onEnded = () => {
            video.pause();
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        };

        onRateChange();
        syncTime();

        audio.addEventListener('play', onPlay);
        audio.addEventListener('pause', onPause);
        audio.addEventListener('seeking', onSeek);
        audio.addEventListener('seeked', onSeek);
        audio.addEventListener('ratechange', onRateChange);
        audio.addEventListener('timeupdate', onTimeUpdate);
        audio.addEventListener('ended', onEnded);

        if (!audio.paused) {
            rafId = requestAnimationFrame(runTightSync);
        }

        return () => {
            audio.removeEventListener('play', onPlay);
            audio.removeEventListener('pause', onPause);
            audio.removeEventListener('seeking', onSeek);
            audio.removeEventListener('seeked', onSeek);
            audio.removeEventListener('ratechange', onRateChange);
            audio.removeEventListener('timeupdate', onTimeUpdate);
            audio.removeEventListener('ended', onEnded);
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
        };
    }, [audioRef, currentSongIndex, videoOffsetSec]);

    return { videoRef, nextVideoRef };
}
