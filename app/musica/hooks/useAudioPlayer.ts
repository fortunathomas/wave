import { useRef, useState, useEffect, useCallback } from 'react';
import type { Song } from '../types';

export function useAudioPlayer(songs: Song[], currentSongIndex: number) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    // Tracks whether we *want* to play — survives across async song changes
    const shouldPlayRef = useRef(false);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Load volume from localStorage on init
    const [volume, setVolume] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('playerVolume');
            return saved !== null ? parseFloat(saved) : 1;
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
            const source = audioContext.createMediaElementSource(audioRef.current);
            source.connect(analyser);
            analyser.connect(audioContext.destination);
            analyser.fftSize = 256;
            audioContextRef.current = audioContext;
            analyserRef.current = analyser;
        } catch (error) {
            console.error('Audio context setup error:', error);
        }
    }, [songs]);

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
    }, []);

    // Song change: reset state, reload audio, play when ready if shouldPlay is true
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || songs.length === 0) return;

        setCurrentTime(0);
        setDuration(0);

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
        if (audioRef.current) {
            audioRef.current.volume = volume;
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

export function useVideoPlayer(currentSongIndex: number) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const nextVideoRef = useRef<HTMLVideoElement>(null);
    const isReversingRef = useRef(false);

    // Preload next video
    useEffect(() => {
        if (nextVideoRef.current) {
            nextVideoRef.current.load();
        }
    }, [currentSongIndex]);

    // Fade out → load new → fade in on song change
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.style.opacity = '0';

        const timer = setTimeout(() => {
            isReversingRef.current = false;
            video.load();
            video.play().catch(console.error);

            video.addEventListener('canplay', () => {
                video.style.opacity = '1';
            }, { once: true });
        }, 300);

        return () => clearTimeout(timer);
    }, [currentSongIndex]);

    // Reverse loop at end of video
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let animationFrameId: number;

        const reversePlay = () => {
            if (!video) return;
            if (video.currentTime <= 0.03) {
                isReversingRef.current = false;
                video.currentTime = 0;
                video.play().catch(console.error);
            } else {
                video.currentTime = Math.max(0, video.currentTime - 0.033);
                animationFrameId = requestAnimationFrame(reversePlay);
            }
        };

        const handleTimeUpdate = () => {
            if (!isReversingRef.current && video.currentTime >= video.duration - 0.03) {
                isReversingRef.current = true;
                video.pause();
                animationFrameId = requestAnimationFrame(reversePlay);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [currentSongIndex]);

    return { videoRef, nextVideoRef };
}
