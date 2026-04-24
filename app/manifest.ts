import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "wave",
        short_name: "wave",
        description: "Riproduci la tua musica dal browser.",
        start_url: "/",
        display: "standalone",
        background_color: "#0b0e14",
        theme_color: "#0b0e14",
        icons: [
            {
                src: "/images/logo.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any maskable",
            },
        ],
    };
}
