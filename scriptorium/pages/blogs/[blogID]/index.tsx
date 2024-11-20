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

    const fetchBlog = async () => {
        const data = await fetch(`/api/user/blogs/${numID}`, {
            method: "GET"
        })
            .then((response) => response.json())
            .then((b: Blog) => setBlog(b));

    };

    useEffect(() => {
        if (!blogID) {
            return;
        }
        fetchBlog();
    }, [blogID]);

    return (
        <div className="h-screen flex flex-col">
            <Navigation></Navigation>
            <div className="p-4">
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