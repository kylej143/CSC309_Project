import React, {useEffect} from "react";
import { useState } from 'react';
import Navigation from '../components/Navigation';
import Link from "next/link";


export default function Register() {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [errorCode, setErrorCode] = useState("");
    const [returnC, setReturnC] = useState(false);
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");

    useEffect(() => {
        if (accessToken != "") {
            localStorage.setItem("accessToken", accessToken);
        }
        if (refreshToken != "") {
            localStorage.setItem("refreshToken", refreshToken);
        }

    }, [accessToken, refreshToken]);

    async function LoginUser() {

        let response = await fetch("/api/user/edit", {
            method: "PUT",
            headers: {'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + String(localStorage.getItem("accessToken")),},
            body: JSON.stringify({
                username: username,
                password: password,
                name: name,
                email: email,
                avatar: avatar,
                phoneNumber: phoneNumber,
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
            setReturnC(true)
        }
    }

    return (
        <>
            <Navigation></Navigation>
            <main>
                <div className="flex items-center bg-green-100 px-10 py-10 gap-5 text-green-700 text-2xl ">
                    <div className="flex-1"/>
                    <p>Edit My Profile</p>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 py-3 gap-5">
                    <div className="flex-1"/>
                    <p>Username</p>
                    <input className="border-2 bg-green-400 border-green-700" onChange={(event) => {
                        setUsername(event.target.value);
                    }} value={username}/>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 py-3 gap-5 ">
                    <div className="flex-1"/>
                    <p>Password</p>
                    <input className="border-2 bg-green-400 border-green-700" onChange={(event) => {
                        setPassword(event.target.value);
                    }} value={password}/>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 py-3 gap-5 ">
                    <div className="flex-1"/>
                    <p>Name</p>
                    <input className="border-2 bg-green-400 border-green-700" onChange={(event) => {
                        setName(event.target.value);
                    }} value={name}/>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 py-3 gap-5 ">
                    <div className="flex-1"/>
                    <p>Email</p>
                    <input type="email" className="border-2 bg-green-400 border-green-700" onChange={(event) => {
                        setEmail(event.target.value);
                    }} value={email}/>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 py-3 gap-5 ">
                    <div className="flex-1"/>
                    <p>Avatar</p>
                    <div id="grid" className="grid p-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div onClick={() => setAvatar("1")}
                            className={(avatar === "1") ? "card bg-lime-300 border-2 rounded-lg shadow-lg p-4 hover:bg-lime-400" : "card bg-white border-2 rounded-lg shadow-lg p-4 hover:bg-slate-200"}>
                            <img className="size-20" src="/avatars/avatar1.png"
                                 alt="1"></img>
                        </div>
                        <div onClick={() => setAvatar("2")}
                            className={(avatar === "2") ? "card bg-lime-300 border-2 rounded-lg shadow-lg p-4 hover:bg-lime-400" : "card bg-white border-2 rounded-lg shadow-lg p-4 hover:bg-slate-200"}>
                            <img className="size-20" src="/avatars/avatar2.png"
                                 alt="2"></img>
                        </div>
                        <div onClick={() => setAvatar("3")}
                            className={(avatar === "3") ? "card bg-lime-300 border-2 rounded-lg shadow-lg p-4 hover:bg-lime-400" : "card bg-white border-2 rounded-lg shadow-lg p-4 hover:bg-slate-200"}>
                            <img className="size-20" src="/avatars/avatar3.png"
                                 alt="3"></img>
                        </div>
                        <div onClick={() => setAvatar("4")}
                            className={(avatar === "4") ? "card bg-lime-300 border-2 rounded-lg shadow-lg p-4 hover:bg-lime-400" : "card bg-white border-2 rounded-lg shadow-lg p-4 hover:bg-slate-200"}>
                            <img className="size-20" src="/avatars/avatar4.png"
                                 alt="4"></img>
                        </div>
                        <div onClick={() => setAvatar("5")}
                            className={(avatar === "5") ? "card bg-lime-300 border-2 rounded-lg shadow-lg p-4 hover:bg-lime-400" : "card bg-white border-2 rounded-lg shadow-lg p-4 hover:bg-slate-200"}>
                            <img className="size-20" src="/avatars/avatar5.png"
                                 alt="5"></img>
                        </div>
                    </div>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 py-3 gap-5 ">
                    <div className="flex-1"/>
                    <p>Phone Number (XXX XXXX XXXX)</p>
                    <input placeholder=" (optional)" type="tel"
                           className="placeholder-black border-2 bg-green-400 border-green-700"
                           onChange={(event) => {
                               setPhoneNumber(event.target.value);
                           }} value={phoneNumber}/>
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
                            onClick={LoginUser}>Edit
                    </button>
                    {returnC ? <Link className="border-2 bg-green-400 border-green-700 hover:bg-amber-500"
                                     href="/user">Return to Profile</Link> : null}
                    <div className="flex-1"/>
                </div>
            </main>

        </>
    );


}
