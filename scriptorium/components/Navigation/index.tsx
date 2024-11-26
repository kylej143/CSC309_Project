import Link from "next/link";
import { useEffect, useState } from "react";
import React from "react";


export default function Navigation() {

    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [a, aa] = useState(false);

    useEffect(() => {
        const admin = async () => {const t = localStorage.getItem("accessToken");
            if(t){setIsLoggedIn(true);
                try{
                    const r = await fetch("/api/admin/protected_test", {method: "GET", headers: {Authorization: `Bearer ${t}`}});
                    if(r.ok){
                        const userV = await r.json();
                        aa(userV[0]); 
                    }else{
                        aa(false); 
                    }
                }catch{
                    aa(false); 
                }
            }else{
                setIsLoggedIn(false);
                aa(false);
                return;
            }}; admin();}, []);

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
                {a ? <Link href ="/sort">Sort by report</Link>:null}
                {isLoggedIn ? <Link onClick={() => localStorage.clear()} href="/login">Logout</Link> : <Link href="/login">Login</Link>}
            </nav>
        </>
    );
}
