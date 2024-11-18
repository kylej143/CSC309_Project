import Link from "next/link";
import {useEffect, useState} from "react";
import React from "react";


export default function Navigation() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        setIsLoggedIn(Boolean(localStorage.getItem("accessToken")));
    }, []);

    return (
        <>
            <nav className="flex flex-row bg-green-400 font-bold text-black px-5 py-3 gap-2 flex-wrap">
                <Link href="/">Home</Link>
                <Link href="/code_templates">Code Template</Link>
                <div className="flex-1"/>
                {isLoggedIn? null : <Link href="/register">Register</Link>}
                {isLoggedIn? <Link href="/user">Profile</Link> : null}
                {isLoggedIn? <Link onClick={() => localStorage.clear()} href="/login">Logout</Link> : <Link href="/login">Login</Link>}
            </nav>
        </>
    );
}
