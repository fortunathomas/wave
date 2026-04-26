import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "wave",
    description: "wave è un’applicazione web progettata per consentire l’ascolto di musica direttamente dal browser.",
    manifest: "/manifest.webmanifest",
    icons: {
        icon: '/favicon.ico',
        apple: '/images/logo.png',
    },
    appleWebApp: {
        capable: true,
        title: "wave",
        statusBarStyle: "black-translucent",
    },
};

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    return (
       <html lang="en" data-scroll-behavior="smooth">
        <head>
            <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
            {children}
        </body>
      </html>
    );
}
