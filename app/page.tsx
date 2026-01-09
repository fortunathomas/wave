"use client"
import React from "react";
import "./globals.css";

const passwordCorretta = "Glockyddo";

export default function Home() {
    function passwordCheck() {
        const passwordInput = document.getElementById("password") as HTMLInputElement;
        const password = passwordInput.value;

        if (!password) {
            alert("Inserisci la password");
            return;
        } else if (password === passwordCorretta) {
            window.location.href = "/musica/layout.tsx";
        } else {
            alert("Password errata akhi");
        }
    }

    return (
        <div>
            <form id={"Form"} onSubmit={(e) => {
                e.preventDefault();
                passwordCheck();
            }}>
                <label htmlFor={"password"}>Password</label>
                <input type="password" id="password" name="password" />
                <button type="submit">Login</button>
            </form>
        </div>
    );
}