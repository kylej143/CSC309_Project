import React from "react";
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


    async function LoginUser() {

        let response = await fetch("/api/user/register", {
            method: "POST",
            headers: {'Content-Type': 'application/json'},
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
            setErrorCode(res.message)
            setReturnC(true)
        }
    }

    return (
        <>
            <Navigation></Navigation>
            <main>
                <div className="flex items-center bg-green-100 px-10 py-10 gap-5 text-green-700 text-2xl ">
                    <div className="flex-1"/>
                    <p>Register</p>
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
                    <input className="border-2 bg-green-400 border-green-700" onChange={(event) => {
                        setEmail(event.target.value);
                    }} value={email}/>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 py-3 gap-5 ">
                    <div className="flex-1"/>
                    <p>Avatar</p>
                    <input className="border-2 bg-green-400 border-green-700" onChange={(event) => {
                        setAvatar(event.target.value);
                    }} value={avatar}/>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 py-3 gap-5 ">
                    <div className="flex-1"/>
                    <p>Phone Number (XXX XXXX XXXX)</p>
                    <input className="border-2 bg-green-400 border-green-700" onChange={(event) => {
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
                            onClick={LoginUser}>Register
                    </button>
                    {returnC ? <Link className="border-2 bg-green-400 border-green-700 hover:bg-amber-500"
                                     href="/login">Login</Link> : null}
                    <div className="flex-1"/>
                </div>
            </main>

        </>
    );


}
