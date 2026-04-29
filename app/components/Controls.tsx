import type { Styles } from "./types";

interface ControlsProps {
    isPlaying: boolean;
    canGoPrev: boolean;
    canGoNext: boolean;
    onPrev: () => void;
    onPlay: () => void;
    onNext: () => void;
    styles: Styles;
}

export function Controls({ isPlaying, canGoPrev, canGoNext, onPrev, onPlay, onNext, styles }: ControlsProps) {
    return (
        <div className={styles.controls}>
            <button onClick={onPrev} disabled={!canGoPrev} className={`${styles.controlBtn} ${styles.secondary}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 20L9 12l10-8v16zm-9-8V4H8v16h2V12z"/>
                </svg>
            </button>

            <button onClick={onPlay} className={`${styles.controlBtn} ${styles.primary}`}>
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

            <button onClick={onNext} disabled={!canGoNext} className={`${styles.controlBtn} ${styles.secondary}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 4l10 8-10 8V4zm10 8v8h2V4h-2v8z"/>
                </svg>
            </button>
        </div>
    );
}