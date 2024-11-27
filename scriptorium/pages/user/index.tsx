import React, { useEffect, useState } from "react";
import Navigation from '../../components/Navigation';
import Link from "next/link";
import { Blog } from '@/pages/blogs/index';
import { useRouter } from 'next/router'


export default function Register() {

    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState(0);
    const [phoneNumber, setPhoneNumber] = useState(0);

    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [blogPage, setBlogPage] = useState(1);

    const router = useRouter();


    function GetUser() {
        fetch("/api/user/protected_test", {
            method: "POST",
            headers: { Authorization: ('Bearer ' + String(localStorage.getItem("accessToken"))) },
        }).then(r => r.json()).then(
            (res: { username: String, name: String, email: String, avatar: Number, phoneNumber: Number }) => {
                setUsername(String(res.username))
                setName(String(res.name))
                setEmail(String(res.email))
                setAvatar(Number(res.avatar))
                setPhoneNumber(Number(res.phoneNumber))
            })
    }

    async function GetUserBlogs() {
        if (username === "") {
            return;
        }
        const searchRequest = new URLSearchParams();
        searchRequest.append("username", username);
        searchRequest.append("page", blogPage.toString());
        const response = fetch(`/api/user/blogs/?${searchRequest.toString()}`,
            {
                method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${String(localStorage.getItem("accessToken"))}` }
            })
            .then((r) => r.json())
            .then((res: Blog[]) => {
                setBlogs(res);
            })
    }

    useEffect(() => {
        GetUser();
    }, []);

    useEffect(() => {
        GetUserBlogs()
    }, [username, blogPage])


    return (
        <>
            <Navigation></Navigation>
            <div className="bg-green-100 h-screen">
                <div className="">
                    <main>
                        <div className="flex items-center bg-green-100 px-10 py-10 gap-5 text-green-700 text-2xl ">
                            <div className="flex-1" />
                            <p>View My Profile</p>
                            <div className="flex-1" />
                        </div>
                        <div className="flex items-center bg-green-100 px-10 gap-5 ">
                            <div className="flex-1" />
                            <p>Username: {username}</p>
                            <div className="flex-1" />
                        </div>
                        <div className="flex items-center bg-green-100 px-10 gap-5 ">
                            <div className="flex-1" />
                            <p>Name: {name}</p>
                            <div className="flex-1" />
                        </div>
                        <div className="flex items-center bg-green-100 px-10 gap-5 ">
                            <div className="flex-1" />
                            <p>Email: {email}</p>
                            <div className="flex-1" />
                        </div>
                        <div className="flex items-center bg-green-100 px-10 gap-5 ">
                            <div className="flex-1" />
                            <p>Avatar: {String(avatar)}</p>
                            <div className="flex-1" />
                        </div>
                        <div className="flex items-center bg-green-100 px-10 gap-5 ">
                            <div className="flex-1" />
                            <p>Phone Number: {String(phoneNumber)}</p>
                            <div className="flex-1" />
                        </div>
                        <div className="flex items-center bg-green-100 py-2 px-10 gap-5 ">
                            <div className="flex-1" />
                            <Link className="border-2 bg-green-400 border-green-700 hover:bg-amber-500"
                                href="/edit">Edit</Link>
                            <div className="flex-1" />
                        </div>
                    </main>
                </div>
                <div className="bg-green-100">
                    <div className="flex items-center bg-green-100 px-10 pt-10 pb-2 gap-5 text-green-700 text-2xl ">
                        <div className="flex-1" />
                        <p>Blogs</p>
                        <div className="flex-1" />
                    </div>
                    <div className="flex flex-row justify-center items-center gap-4 mt-4">
                        <button className="bg-orange-300 p-2 rounded-md"
                            onClick={() => setBlogPage(Math.max(blogPage - 1, 1))}>
                            Prev
                        </button>
                        <div>{blogPage}</div>
                        <button className="bg-orange-300 p-2 rounded-md"
                            onClick={() => setBlogPage(blogPage + 1)}>
                            Next
                        </button>
                    </div>
                    <div className="text-orange-700 font-bold mb-2 mt-2 flex flex-row justify-center">
                        {blogs.length === 0 ? "0 blogs found" : ""}
                    </div>
                    <div className="blogList grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 col-span-2 gap-4 p-8">
                        {blogs.map((blog) => (
                            <div key={blog.id} className="blogItem border-green-500 bg-white" onClick={(e) => router.push(`/blogs/${blog.id}`)}>

                                <div className="flex flex-row w-full bg-gray-100">
                                    <div>
                                        <p className="blogItemTitle">{blog.title}</p>
                                        <p className="blogItemContent">{blog.content.length > 75 ? `${blog.content.substring(0, 70)} [...]` : `${blog.content}`}</p>
                                    </div>
                                    <div className="flex-1"></div>
                                    <div className="items-center flex flex-row">
                                        <div>
                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" className="fill-black">
                                                <path d="M440-160v-487L216-423l-56-57 320-320 320 320-56 57-224-224v487h-80Z" />
                                            </svg>

                                            <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" className="fill-black">
                                                <path d="M440-800v487L216-537l-56 57 320 320 320-320-56-57-224 224v-487h-80Z" />
                                            </svg>
                                        </div>
                                        <div className="text-lg p-2">{blog.up - blog.down}</div>
                                    </div>

                                </div>


                                <div className="blogTags flex flex-row gap-2">
                                    <p className="font-bold">Tags:</p>
                                    {blog.tags.map((t) => (
                                        <p className="text-neutral-500">{t.tag}</p>
                                    ))}
                                </div>

                                <div>
                                    <p className="font-bold">Code Templates:</p>
                                    {blog.templates.map((t) => (
                                        <p className="text-neutral-500">{`${t.id}: ${t.title}`}</p>
                                    ))}
                                </div>

                            </div>
                        ))}
                    </div>

                </div>
            </div>

        </>
    );
}