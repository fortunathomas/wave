import Link from "next/link";

type Styles = { readonly [key: string]: string };

type HomeHeroProps = {
    styles: Styles;
};

export function HomeHero({ styles }: HomeHeroProps) {
    return (
        <section className={styles.hero}>
            
            <h1>wave </h1>
            <p className={styles.lead}>
                La tua musica, sempre con te.
            </p>
        </section>
    );
}