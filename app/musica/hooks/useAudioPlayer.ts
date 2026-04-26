import { useRef, useState, useEffect, useCallback } from 'react';
import type { Song } from '../../types';

export function useAudioPlayer(songs: Song[], currentSongIndex: number) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const isIOSRef = useRef(false);
    const shouldPlayRef = useRef(false);
    const volumeRef = useRef(1);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const [volume, setVolume] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('playerVolume');
            if (saved !== null) {
                const parsed = parseFloat(saved);
                if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
                    volumeRef.current = parsed;
                    return parsed;
                }
            }
        }
        return 1;
    });

    useEffect(() => {
        if (typeof navigator === 'undefined') return;
        const ua = navigator.userAgent || '';
        isIOSRef.current = /iPad|iPhone|iPod/.test(ua) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => { shouldPlayRef.current = false; setIsPlaying(false); };
        const onError = () => { shouldPlayRef.current = false; setIsPlaying(false); };

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
    }, [songs.length]);

    useEffect(() => {
        setIsPlaying(false);
    }, [currentSongIndex]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || songs.length === 0) return;

        setCurrentTime(0);
        setDuration(0);
        audio.pause();
        audio.volume = volumeRef.current;

        const onCanPlay = () => {
            audio.volume = volumeRef.current;
            if (shouldPlayRef.current) {
                audio.play().catch((err) => {
                    console.error('Autoplay error:', err);
                    shouldPlayRef.current = false;
                });
            }
        };

        audio.addEventListener('canplay', onCanPlay, { once: true });
        audio.load();

        return () => {
            audio.removeEventListener('canplay', onCanPlay);
        };
    }, [currentSongIndex, songs]);

    useEffect(() => {
        volumeRef.current = volume;
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
        localStorage.setItem('playerVolume', String(volume));
    }, [volume]);

    const togglePlay = useCallback(async () => {
        const audio = audioRef.current;
        if (!audio) return;
        try {
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

    const safePlay = useCallback(async (video: HTMLVideoElement) => {
        try {
            await video.play();
        } catch (error) {
            if (!(error instanceof DOMException)) return;
            if (error.name === 'AbortError' || error.name === 'NotAllowedError') return;
            if (typeof error.message === 'string' && error.message.toLowerCase().includes('interrupted')) return;
        }
    }, []);

    useEffect(() => {
        if (nextVideoRef.current) {
            nextVideoRef.current.load();
        }
    }, [currentSongIndex]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.style.opacity = '0';

        const timer = setTimeout(() => {
            isReversingRef.current = false;
            video.load();
            void safePlay(video);
            video.addEventListener('canplay', () => {
                video.style.opacity = '1';
            }, { once: true });
        }, 300);

        return () => clearTimeout(timer);
    }, [currentSongIndex, safePlay]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        let animationFrameId: number;

        const reversePlay = () => {
            if (!video) return;
            if (video.currentTime <= 0.03) {
                isReversingRef.current = false;
                video.currentTime = 0;
                void safePlay(video);
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
    }, [currentSongIndex, safePlay]);

    return { videoRef, nextVideoRef };
}