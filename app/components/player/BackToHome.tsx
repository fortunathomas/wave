import Link from "next/link";

import styles from "../../musica/style/MusicPlayer.module.css";

export function BackToHome() {
    return (
        <Link href="/" className={styles.backButton}>
            ← Indietro
        </Link>
    );
}