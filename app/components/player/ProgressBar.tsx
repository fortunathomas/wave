import React from "react";

type Styles = { readonly [key: string]: string };

interface ProgressBarProps {
    currentTime: number;
    duration: number;
    onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    formatTime: (time: number) => string;
    styles: Styles;
}

export function ProgressBar({ currentTime, duration, onSeek, formatTime, styles }: ProgressBarProps) {
    return (
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
                    onChange={onSeek}
                    disabled={!duration}
                    className={styles.progressBar}
                />
            </div>
            <div className={styles.timeDisplay}>
                <span>{formatTime(currentTime)}</span>
                <span>{duration ? formatTime(duration) : '--:--'}</span>
            </div>
        </div>
    );
}