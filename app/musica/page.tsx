"use client"
import React, { useRef, useState, useEffect } from "react";

export default function MusicaPage() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [canvasSize, setCanvasSize] = useState({ width: 1920, height: 1080 });
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    // @ts-ignore
    const animationRef = useRef<number>();

    // Setup canvas size
    useEffect(() => {
        const updateSize = () => {
            setCanvasSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        updateSize(); // set iniziale
        window.addEventListener('resize', updateSize);

        return () => window.removeEventListener('resize', updateSize);
    }, []);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, []);

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

        if (audioRef.current) {
            audioRef.current.addEventListener('loadedmetadata', setupAudio);
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!canvasRef.current || !isPlaying) {
            if (canvasRef.current) {
                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    const gradient = ctx.createLinearGradient(0, 0, 0, canvasRef.current.height);
                    gradient.addColorStop(0, '#0f172a');
                    gradient.addColorStop(1, '#1e293b');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                }
            }
            return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const analyser = analyserRef.current;
        if (!analyser) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!isPlaying) return;

            animationRef.current = requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            // Background gradiente base
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            gradient.addColorStop(0, '#0f172a');
            gradient.addColorStop(1, '#1e293b');
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Audio reactive value
            const bass = dataArray.slice(0, 5).reduce((a, b) => a + b, 0) / 5 / 255;

            // Glow centrale molto subtle
            const glowSize = 300 + bass * 100;
            const glowGradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, glowSize
            );
            glowGradient.addColorStop(0, `rgba(59, 130, 246, ${0.1 * bass})`);
            glowGradient.addColorStop(1, 'rgba(59, 130, 246, 0)');

            ctx.fillStyle = glowGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // TANTE bars - tipo equalizer
            const barCount = 512;
            const barWidth = canvas.width / barCount;

            for (let i = 0; i < barCount; i++) {
                const dataIndex = Math.floor((i / barCount) * bufferLength);
                const value = dataArray[dataIndex] / 255;
                const barHeight = value * 200;

                const x = i * barWidth;
                const y = canvas.height - barHeight;

                // Gradient per ogni bar
                const barGradient = ctx.createLinearGradient(x, y, x, canvas.height);
                barGradient.addColorStop(0, `rgba(96, 165, 250, ${0.3 + value * 0.4})`);
                barGradient.addColorStop(1, `rgba(59, 130, 246, ${0.15 + value * 0.2})`);

                ctx.fillStyle = barGradient;
                ctx.fillRect(x, y, barWidth - 1, barHeight);
            }
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying]);

    const togglePlay = async () => {
        if (!audioRef.current || !audioContextRef.current) return;

        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            await audioRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const time = parseFloat(e.target.value);
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const formatTime = (time: number) => {
        if (!time || isNaN(time)) return '0:00';
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: 'clamp(1rem, 3vw, 2rem)',
            position: 'fixed',
            top: 0,
            left: 0,
            overflow: 'hidden'
        }}>
            {/* Canvas background audio reactive */}
            <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    opacity: 0.5
                }}
            />

            <div style={{
                background: 'rgba(30, 41, 59, 0.9)',
                padding: '3rem 4rem',
                borderRadius: '24px',
                border: '1px solid rgba(96, 165, 250, 0.3)',
                width: '550px',
                maxWidth: '90vw',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Titolo */}
                <div style={{
                    textAlign: 'center',
                    marginBottom: '3rem'
                }}>
                    <p style={{ color: '#94a3b8', fontSize: '1.1rem' }}>
                        &lt;3
                    </p>
                </div>

                {/* Audio */}
                <audio
                    ref={audioRef}
                    src="/audio.wav"
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
                    onEnded={() => setIsPlaying(false)}
                />

                {/* Progress bar */}
                <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    step="0.1"
                    value={currentTime}
                    onChange={handleSeek}
                    disabled={!duration}
                    style={{
                        width: '100%',
                        marginBottom: '1rem',
                        accentColor: '#3b82f6',
                        cursor: duration ? 'pointer' : 'not-allowed',
                        height: '6px',
                        opacity: duration ? 1 : 0.5
                    }}
                />

                {/* Time */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    color: '#94a3b8',
                    fontSize: '0.95rem',
                    marginBottom: '2rem'
                }}>
                    <span>{formatTime(currentTime)}</span>
                    <span>{duration ? formatTime(duration) : 'Loading...'}</span>
                </div>

                {/* Play button */}
                <button
                    onClick={togglePlay}
                    disabled={!duration}
                    style={{
                        width: '100%',
                        padding: '1.2rem',
                        borderRadius: '16px',
                        border: 'none',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        color: 'white',
                        fontSize: '1.2rem',
                        fontWeight: '600',
                        cursor: duration ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)',
                        opacity: duration ? 1 : 0.5
                    }}
                    onMouseEnter={(e) => {
                        if (duration) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.5)';
                        }
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.4)';
                    }}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>
            </div>
        </div>
    );
}