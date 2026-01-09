"use client"
import React from "react";

export default function MusicaPage() {
    return (
        <div>
            <p style={{color: '#94a3b8', marginBottom: '2rem'}}>fuori presto lov u &lt;3</p>
            <br />
            <audio
                controls
                controlsList="nodownload noplaybackrate"
                id="dieYoung"
                src="/die-young.wav"
                onContextMenu={(e) => e.preventDefault()}
            >Il tuo browser non supporta l'audio
            </audio>
        </div>
    );
}