import React, { useState, useEffect } from "react";
import Navigation from '@/components/Navigation';

export default function Blogs() {

    const [blogs, setBlogs] = useState([]);
    const [titleSearchField, setTitleSearchField] = useState("");
    const [titleSearch, setTitleSearch] = useState("");

    const fetchBlogs = async () => {
        const response = await fetch(`/api/user/blogs`);
        const data = await response.json();
        if (titleSearchField !== "") {
            setBlogs(filterBlogs(data));
        }
        else {
            setBlogs(data);
        }
    };

    const filterBlogs = (foundBlogs: never[]) => {
        const searchResponse = foundBlogs.filter((b: { title: string; }) => (b.title).toLowerCase().includes(titleSearch.toLowerCase()));
        return searchResponse;
    };

    const titleSearchFieldChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setTitleSearchField(e.target.value);
    }

    const userSearch = () => {
        setTitleSearch(titleSearchField);
    }

    const clearSearch = () => {
        setTitleSearchField("");
    }

    useEffect(() => {
        fetchBlogs();
    }, [titleSearch]);

    return (
        <div>
            <Navigation></Navigation>
            <div className="p-4">
                <h1 className="blogSearchTitle">Blogs</h1>

                {/* search */}
                <div className="flex flex-row">
                    <p className="mr-2">Search by title:</p>
                    <input type="text" id="blogTitleSearch" className="blogSearch" value={titleSearchField} onChange={titleSearchFieldChange} />
                </div>
                <div className="flex flex-row">
                    <p className="mr-2">Search by content:</p>
                    {/* <input type="text" id="blogContentSearch" className="blogSearch" value={titleSearchField} onChange={searchFieldChange} /> */}
                </div>
                <div className="flex flex-row gap-2">
                    <button className="bg-pink-300" onClick={userSearch}>Search</button>
                    <button className="bg-slate-200" onClick={clearSearch}>Clear</button>
                </div>


                <h1 className="text-pink-700 font-bold mb-2">{blogs.length} blogs found </h1>
                <div className="blogList grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 col-span-2 gap-4">
                    {blogs.map((blog: { id: number; title: string; content: string; userID: number; tags: { id: number; tag: string }[] }) => (
                        <div key={blog.id} className="blogItem">
                            <p className="blogItemTitle">{blog.title}</p>
                            <p className="blogItemContent">{blog.content}</p>
                            <div className="blogTags flex flex-row gap-2">
                                <p className="font-bold">Tags:</p>
                                {blog.tags.map((t) => (
                                    <p className="text-neutral-500">{t.tag}</p>
                                ))}
                            </div>
                            <p>{blog.userID}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    )
}