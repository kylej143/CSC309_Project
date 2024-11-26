import Link from "next/link";
import { useEffect, useState } from "react";
import React from "react";


export default function Navigation() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const t = localStorage.getItem("accessToken");
        const a = localStorage.getItem("isAdmin");
        setIsLoggedIn(Boolean(t));
        setIsAdmin(a === "true");
    }, []);

    return (
        <>
            <nav className="flex flex-row bg-green-400 font-bold text-black px-5 py-3 gap-2 flex-wrap">
                <Link href="/">Home</Link>
                <Link href="/code_templates">Code Template</Link>
                <Link href="/blogs">Blogs</Link>
                <div className="flex-1" />
                <Link href="/run">Start Coding!</Link>
                {isLoggedIn ? <Link href="/blogs/create-blog" >Create Blog</Link> : null}
                {isLoggedIn ? null : <Link href="/register">Register</Link>}
                {isLoggedIn ? <Link href="/user">Profile</Link> : null}
                {isAdmin ? <Link href ="/sort">Sort by report</Link>:null}
                {isLoggedIn ? <Link onClick={() => localStorage.clear()} href="/login">Logout</Link> : <Link href="/login">Login</Link>}
            </nav>
        </>
    );
}
