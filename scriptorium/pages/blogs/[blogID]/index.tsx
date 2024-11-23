import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import Navigation from '@/components/Navigation';

export default function BlogPost() {

    interface Blog {
        id: number;
        title: string;
        content: string;
        flags: number;
        up: number;
        down: number;
        hide: boolean;
        userID: number;
        user: { id: number; username: string; avatar: number };
        tags: { id: number; tag: string }[];
        templates: [];
        BlogReport: [];
    }

    const defaultBlog: Blog = {
        id: 0,
        title: "", content: "",
        flags: 0, up: 0, down: 0, hide: false, userID: 0,
        user: { id: 0, username: "", avatar: 0 },
        tags: [],
        templates: [],
        BlogReport: []
    }

    const router = useRouter();
    const { blogID } = router.query;
    const numID = Number(blogID);
    const [blog, setBlog] = useState<Blog>(defaultBlog);
    const [username, setUsername] = useState<String>("");
    const [authorMatch, setAuthorMatch] = useState(false);

    const fetchBlog = async () => {
        await fetch(`/api/user/blogs/${numID}`, {
            method: "GET"
        })
            .then((response) => response.json())
            .then((b: Blog) => setBlog(b));
    };

    const fetchVisitor = async () => {
        const loggedIn = localStorage.getItem("accessToken");
        if (loggedIn) {
            await fetch(`/api/user/protected_test`, {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` }
            })
                .then((response) => response.json())
                .then((visitor: { username: String, name: String, email: String, avatar: Number, phoneNumber: Number }) =>
                    setUsername(visitor.username));
        }
    }

    function checkAuthorMatch() {
        if (blog.user.username === username && blog.id !== 0 && username !== "") {
            setAuthorMatch(true);
        }
        else {
            setAuthorMatch(false);
        }
    }

    // delete blog post
    const deleteBlog = async () => {
        const loggedIn = localStorage.getItem("accessToken");

        // theoretically should not have to encounter login error, since otherwise the button won't be visible
        if (loggedIn) {
            const response = await fetch(`/api/user/blogs/${numID}`,
                { method: "DELETE", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` } }
            );

            if (response.ok) {
                alert("Successfully deleted");
                router.push(`/blogs`);
            }
            else {
                const data = await response.json();
                alert(data.error);
            }
        }
        else {
            alert("please log in");
        }

    };

    function AuthorButtons(props: { show: boolean }) {
        if (props.show === true) {
            return (
                <div className="flex flex-row gap-2 mb-4">
                    <button className="bg-sky-300 border-2 rounded-md p-2"
                        onClick={(e) => router.push(`/blogs/${blogID}/edit-blog`)}>Edit Blog</button>
                    <button className="bg-red-400 border-2 rounded-md p-2"
                        onClick={deleteDialog}>Delete Blog</button>
                </div>
            )
        }
        else {
            return <div></div>
        }
    }

    const deleteDialog = async () => {
        if (confirm('Are you sure you want to delete this blog?')) {
            await deleteBlog();
        }
    }

    useEffect(() => {
        if (!blogID) {
            return;
        }
        fetchBlog();
        fetchVisitor();
    }, [blogID]);

    useEffect(() => {
        checkAuthorMatch();
    }, [username, blog]);

    return (
        <div className="h-screen flex flex-col">
            <Navigation></Navigation>
            <div className="p-4">
                <AuthorButtons show={authorMatch}></AuthorButtons>
                <div className="blogSearchTitle">
                    {blog.title}
                </div>
                <div className="flex flex-row">
                    <div className="flex flex-row gap-2 items-center border-2 p-1 rounded-md bg-gray-200">
                        <div className="bg-gray-400 p-1 rounded-md">{blog.user.avatar}</div>
                        <div>{blog.user.username}</div>
                    </div>
                </div>

                <div className="flex flex-row gap-2 flex-wrap mt-2">
                    {blog.tags.map((t) => (
                        <div key={t.id} className="tagItem flex flex-row gap-2">
                            {t.tag}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 bg-green-100 flex-1">{blog.content}</div>
        </div>
    );
}