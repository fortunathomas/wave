"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [password, setPassword] = useState("");
    const router = useRouter();

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password })
        });

        if (res.ok) {
            router.push("/musica");
        } else {
            alert("Password errata");
        }
    }

    return (
        <form onSubmit={handleLogin}>
            <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            <button>Login</button>
        </form>
    );
}
