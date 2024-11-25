import React, {useEffect, useState} from "react";
import Navigation from '../../components/Navigation';
import Link from "next/link";


export default function Register() {

    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState(0);


    function GetUser() {
        fetch("/api/user/protected_test", {
            method: "POST",
            headers: {Authorization: ('Bearer ' + String(localStorage.getItem("accessToken")))},
        }).then(r => r.json()).then(
            (res : {username: String, name: String, email: String, avatar: Number, phoneNumber: Number}) => {
                setUsername(String(res.username))
                setName(String(res.name))
                setEmail(String(res.email))
                setAvatar(Number(res.avatar))
                setPhoneNumber(Number(res.phoneNumber))
            })
    }

    useEffect(() => {
        GetUser()
    }, []);


    return (
        <>
            <Navigation></Navigation>
            <main>
                <div className="flex items-center bg-green-100 px-10 py-10 gap-5 text-green-700 text-2xl ">
                    <div className="flex-1"/>
                    <p>View My Profile</p>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 gap-5 ">
                    <div className="flex-1"/>
                    <p>Username: {username}</p>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 gap-5 ">
                    <div className="flex-1"/>
                    <p>Name: {name}</p>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 gap-5 ">
                    <div className="flex-1"/>
                    <p>Email: {email}</p>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 gap-5 ">
                    <div className="flex-1"/>
                    <p>Avatar: {String(avatar)}</p>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 px-10 gap-5 ">
                    <div className="flex-1"/>
                    <p>Phone Number: {String(phoneNumber)}</p>
                    <div className="flex-1"/>
                </div>
                <div className="flex items-center bg-green-100 py-2 px-10 gap-5 ">
                    <div className="flex-1"/>
                    <Link className="border-2 bg-green-400 border-green-700 hover:bg-amber-500"
                          href="/edit">Edit</Link>
                    <div className="flex-1"/>
                </div>
            </main>

        </>
    );
}