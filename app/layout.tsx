import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Unlock",
    description: "tho",
    icons: {
        icon: 'public/favicon.ico',
    }
};

export default function RootLayout({children,}: Readonly<{ children: React.ReactNode; }>) {
    return (
      <html lang="en">
        <head>
            <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
            {children}
        </body>
      </html>
    );
}
