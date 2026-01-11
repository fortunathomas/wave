"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./globals.css";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        if (!password) {
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password })
            });

            const data = await res.json();

            if (res.ok) {
                router.push("/musica");
            } else {
                alert(data.error || "Password errata");
            }
        } catch (error) {
            console.error("Errore:", error);
            alert("Errore di connessione");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <form onSubmit={handleLogin}>
                <label htmlFor="password">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    disabled={loading}
                    placeholder="••••••••"
                    autoFocus
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Checking..." : "Login"}
                </button>
            </form>
        </div>
    );
}