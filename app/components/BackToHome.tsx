import Link from "next/link";

import styles from "../player/styles/MusicPlayer.module.css";

export function BackToHome() {
    return (
        <Link href="/" className={styles.backButton}>
            ← Indietro
        </Link>
    );
}