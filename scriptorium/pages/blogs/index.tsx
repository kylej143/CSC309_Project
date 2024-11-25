import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import Navigation from '@/components/Navigation';

export interface Blog {
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

export const defaultBlog: Blog = {
    id: 0,
    title: "", content: "",
    flags: 0, up: 0, down: 0, hide: false, userID: 0,
    user: { id: 0, username: "", avatar: 0 },
    tags: [],
    templates: [],
    BlogReport: []
}

export function addTags(tagArray: { id: number, tag: string }[], newTag: { id: number, tag: string }) {
    return tagArray.concat([newTag]);
}

export function removeTags(tagArray: { id: number, tag: string }[], removeTagID: number) {
    return tagArray.filter((t) => t.id != removeTagID);
}

export function getID(id: number) {
    return `tag${id}`;
}

export function checkTagInArray(tagArray: { id: number, tag: string }[], checkTag: { id: number, tag: string }) {
    for (const t of tagArray) {
        if (t.id === checkTag.id && t.tag === checkTag.tag) {
            return true;
        }
    }
    return false;
}

export default function Blogs() {

    const [blogs, setBlogs] = useState([]);

    // title and content
    const [titleSearch, setTitleSearch] = useState("");
    const [contentSearch, setContentSearch] = useState("");

    // tags
    const [originalTags, setOriginalTags] = useState<{ id: number, tag: string }[]>([]); // original tags
    const [tags, setTags] = useState<{ id: number, tag: string }[]>([]); // tags that are showing
    const [selectedTags, setSelectedTags] = useState<{ id: number, tag: string }[]>([]); // tags that are selected 
    const [tagFilter, setTagFilter] = useState("");

    // search
    const [goSearch, setGoSearch] = useState<boolean>(false);

    const router = useRouter();

    // get blogs from api
    const fetchBlogs = async () => {
        const searchRequest = new URLSearchParams()
        if (titleSearch !== "") {
            searchRequest.append("title", titleSearch);
        }
        if (contentSearch !== "") {
            searchRequest.append("content", contentSearch);
        }
        if (selectedTags.length !== 0) {
            selectedTags.map((t) => (
                searchRequest.append("tags", t.tag)
            ));
        }
        const loggedIn = localStorage.getItem("accessToken");
        const response = await fetch(`/api/user/blogs/?${searchRequest.toString()}`,
            {
                method: "GET", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` }
            });
        const data = await response.json();
        setBlogs(data);
    };

    // get tags from api
    const fetchTags = async () => {
        const response = await fetch(`/api/user/blogs/tags`);
        const data = await response.json();
        setOriginalTags(data);
        setTags(data)
    }

    // filter through tags with search bar
    const filterTags = () => {
        const searchResponse = originalTags.filter((t) =>
        ((t.tag).toLowerCase().includes(tagFilter.toLowerCase())
            && !(checkTagInArray(selectedTags, t)))
        );
        setTags(selectedTags.concat(searchResponse));
    };

    // updating the tags that are checked or unchecked
    const updateSelectedTags = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tagID = Number((e.target.id).replace("tag", ""));

        if (e.target.checked) {
            const tagToModify = tags.filter((t) => t.id == tagID)[0];
            setSelectedTags(addTags(selectedTags, tagToModify));
        }
        else {
            setSelectedTags(removeTags(selectedTags, tagID));
        }
    }

    // search function
    const userSearch = (ev: React.FormEvent) => {
        ev.preventDefault();
        setGoSearch(!goSearch);
    }

    useEffect(() => {
        fetchBlogs();
    }, [goSearch]);

    useEffect(() => {
        fetchTags();
    }, []);

    useEffect(() => {
        filterTags();
    }, [tagFilter]);

    return (
        <div>
            <Navigation></Navigation>
            <div className="p-4">
                <h1 className="blogSearchTitle">Blogs</h1>

                {/* search */}
                <div>
                    <form onSubmit={userSearch}>
                        <div>
                            <input type="text"
                                id="blogTitleSearch"
                                className="blogSearch"
                                value={titleSearch}
                                placeholder="Search by title"
                                onChange={(e) => (setTitleSearch(e.target.value))} />
                        </div>
                        <div>
                            <input type="text"
                                id="blogExplanationSearch"
                                className="blogSearch"
                                value={contentSearch}
                                placeholder="Search by blog content"
                                onChange={(e) => (setContentSearch(e.target.value))} />
                        </div>

                        <div className="border-2 p-4 bg-gray-100">
                            <input type="text"
                                id="tagFilter"
                                className="blogSearch mb-2"
                                value={tagFilter}
                                placeholder="Find tags"
                                onChange={(e) => (setTagFilter(e.target.value))} />
                            <div className="flex flex-row gap-2 flex-wrap">
                                {tags.map((t) => (
                                    <div key={t.id} className="tagItem flex flex-row gap-2">
                                        <input type="checkbox" id={getID(t.id)}
                                            onChange={updateSelectedTags} />
                                        <label htmlFor={getID(t.id)}>{t.tag}</label> <br></br>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button className="bg-pink-300" type="submit" >Search</button>
                    </form>
                </div>

                <h1 className="text-pink-700 font-bold mb-2">{blogs.length} blogs found </h1>
                <div className="blogList grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 col-span-2 gap-4">
                    {blogs.map((blog: {
                        id: number; title: string; content: string; userID: number;
                        user: { id: number; username: string; avatar: number }; tags: { id: number; tag: string }[]
                    }) => (
                        <div key={blog.id} className="blogItem" onClick={(e) => router.push(`/blogs/${blog.id}`)}>
                            <p className="blogItemTitle">{blog.title}</p>
                            <p className="blogItemContent">{blog.content}</p>
                            <div className="blogTags flex flex-row gap-2">
                                <p className="font-bold">Tags:</p>
                                {blog.tags.map((t) => (
                                    <p className="text-neutral-500">{t.tag}</p>
                                ))}
                            </div>
                            <div className="flex flex-row">
                                <div className="flex flex-row gap-2 items-center border-2 p-1 rounded-md bg-gray-200">
                                    <div className="bg-gray-400 p-1 rounded-md">{blog.user.avatar}</div>
                                    <div>{blog.user.username}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    )
}