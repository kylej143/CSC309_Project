import React, {useEffect} from "react";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';


export default function Login() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");
    const [errorCode, setErrorCode] = useState("");
    const { push } = useRouter();


    useEffect(() => {
        if (accessToken != "") {
            localStorage.setItem("accessToken", accessToken);
        }
        if (refreshToken != "") {
            localStorage.setItem("refreshToken", refreshToken);
        }

        if (refreshToken && accessToken) {
            push('/');
        }

    }, [accessToken, refreshToken]);

    async function LoginUser() {

        let response = await fetch("/api/user/login", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                    username: username,
                    password: password
            }),
        });
        // get the response json
        let res = await response.json();

        if (!response.ok) {
            setErrorCode(res.error)
        }
        else {
            setRefreshToken(res.refreshToken)
            setAccessToken(res.accessToken)
        }
    }

    return (
        <>
            <Navigation></Navigation>
            <main>
                <div className="flex items-center bg-green-100 px-10 py-10 gap-5 text-green-700 text-2xl ">
                    <div className="flex-1"/>
                    <p>Login</p>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 py-10 gap-5">
                    <div className="flex-1"/>
                    <p>Username</p>
                    <input className="border-2 bg-green-400 border-green-700" onChange={(event) => {
                        setUsername(event.target.value);
                    }} value={username}/>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 py-10 gap-5 ">
                    <div className="flex-1"/>
                    <p>Password</p>
                    <input className="border-2 bg-green-400 border-green-700" onChange={(event) => {
                        setPassword(event.target.value);
                    }} value={password}/>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center text-red-600 bg-green-100 px-10 gap-5 ">
                    <div className="flex-1"/>
                    <p>{errorCode}</p>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 py-10 gap-5 ">
                    <div className="flex-1"/>
                    <button className="border-2 bg-green-400 border-green-700 hover:bg-amber-500"
                            onClick={LoginUser}>Login
                    </button>
                    <div className="flex-1"/>
                </div>
            </main>

        </>
    );


}
