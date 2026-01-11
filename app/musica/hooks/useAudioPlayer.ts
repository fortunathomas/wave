// hooks/useAudioPlayer.ts
import { useRef, useState, useEffect } from 'react';

export function useAudioPlayer(songs: any[], currentSongIndex: number) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);

    // Setup audio context
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
            console.error('Audio setup error:', error);
        }
    }, [songs]);

    // Reset quando cambia canzone
    useEffect(() => {
        if (!audioRef.current || songs.length === 0) return;

        audioRef.current.load();
        setCurrentTime(0);
        setDuration(0);

        if (isPlaying) {
            audioRef.current.play().catch(console.error);
        }
    }, [currentSongIndex, songs]);

    // Mantieni volume
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume, currentSongIndex]);

    const togglePlay = async () => {
        if (!audioRef.current || !audioContextRef.current) return;

        try {
            if (audioContextRef.current.state === 'suspended') {
                await audioContextRef.current.resume();
            }

            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                await audioRef.current.play();
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

    const toggleMute = () => {
        if (volume > 0) {
            setVolume(0);
            if (audioRef.current) audioRef.current.volume = 0;
        } else {
            setVolume(1);
            if (audioRef.current) audioRef.current.volume = 1;
        }
    };

    return {
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
    };
}

export function useVideoPlayer(currentSongIndex: number) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const nextVideoRef = useRef<HTMLVideoElement>(null);
    const isReversingRef = useRef(false);

    // Preload del video successivo
    useEffect(() => {
        if (nextVideoRef.current) {
            nextVideoRef.current.load();
        }
    }, [currentSongIndex]);

    // Reset quando cambia canzone con fade
    useEffect(() => {
        if (!videoRef.current) return;

        const video = videoRef.current;

        // Fade out
        video.style.opacity = '0';

        setTimeout(() => {
            isReversingRef.current = false;
            video.load();
            video.play().catch(console.error);

            // Fade in quando è pronto
            video.addEventListener('canplay', () => {
                video.style.opacity = '1';
            }, { once: true });
        }, 300);

    }, [currentSongIndex]);

    // Reverse loop
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
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [currentSongIndex]);

    return { videoRef, nextVideoRef };
}