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
    templates: { id: number, title: string, explanation: string, code: string, private: boolean, forkID: number, userID: number }[];
    BlogReport: { id: number, reason: string }[];
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
    const [sb, ss] = useState<number | null>(null);
    const [rm, sm] = useState(false);
    const [rr, sr] = useState("");

    const op = (blogId: number) => { ss(blogId); sm(true); };
    const cl = () => { ss(null); sr(""); sm(false); };

    const [blogs, setBlogs] = useState<Blog[]>([]);

    // title and content
    const [titleSearch, setTitleSearch] = useState("");
    const [contentSearch, setContentSearch] = useState("");

    // tags
    const [originalTags, setOriginalTags] = useState<{ id: number, tag: string }[]>([]); // original tags
    const [tags, setTags] = useState<{ id: number, tag: string }[]>([]); // tags that are showing
    const [selectedTags, setSelectedTags] = useState<{ id: number, tag: string }[]>([]); // tags that are selected 
    const [tagFilter, setTagFilter] = useState("");

    // code templates
    const [codeTemplates, setCodeTemplates] = useState<{ id: number, link: string }[]>([]);
    const [codeTemplateField, setCodeTemplateField] = useState<string>("");
    const [newCodeTemplateID, setNewCodeTemplateID] = useState(-1);
    const [newTemplateError, setNewTemplateError] = useState("");

    // sort
    const [sortMethod, setSortMethod] = useState("valued");

    // page
    const [page, setPage] = useState(1);

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
        if (codeTemplates.length !== 0) {
            codeTemplates.map((c) => (
                searchRequest.append("templates", c.id.toString())
            ));
        }
        searchRequest.append("sort", sortMethod);
        searchRequest.append("page", page.toString());
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

    const report = async () => {
        const li = localStorage.getItem("accessToken");
        try {
            const r = await fetch(`/api/user/blog_report`, {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${li}` },
                body: JSON.stringify({ blogID: sb, reason: rr })
            });

            if (r.ok) {
                alert("You successfully reported the blog.");
                cl();
            } else {
                alert("error");
            }
        } catch (error) {
            alert("error");
        }
    };

    function addCodeTemplates(templateArray: { id: number, link: string }[], newTemplate: { id: number, link: string }) {
        return templateArray.concat([newTemplate]);
    }

    // add a new codetemplate to the blog
    const addNewCodeTemplate = (e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.key === 'Enter') {
            e.preventDefault();
            const trimCodeTemplates = /.*code_templates\//
            const templateNum = Number(codeTemplateField.replace(trimCodeTemplates, ""));
            if (isNaN(templateNum)) {
                setNewTemplateError("Invalid link format");
                setCodeTemplateField("");
            }
            else {
                setNewCodeTemplateID(newCodeTemplateID - 1);
                const templateToAdd = {
                    id: templateNum,
                    link: codeTemplateField,
                }
                setCodeTemplates(addCodeTemplates(codeTemplates, templateToAdd));
                setCodeTemplateField("");
                setNewTemplateError("");
            }

        }
    }

    useEffect(() => {
        fetchBlogs();
    }, [goSearch, page]);

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

                        <div className="border-2 p-4 bg-gray-100 ">
                            <div className=" gap-2 flex-wrap">
                                {codeTemplates.map((c) => (
                                    <div key={`template${c}`} className="flatItem flex flex-row gap-2">
                                        <div>{c.link}</div>
                                    </div>
                                ))}
                            </div>
                            <input type="text"
                                id="newCodeTemplateItem"
                                className="blogSearch mb-2 w-full"
                                value={codeTemplateField}
                                placeholder="Search for a code template by link, and enter"
                                onKeyDown={addNewCodeTemplate}
                                onChange={(e) => (setCodeTemplateField(e.target.value))}>
                            </input>
                            <div className="text-red-600">{newTemplateError}</div>
                        </div>

                        <div className="flex flex-row">
                            <div>Sort by:</div>
                            <div className="ml-2">
                                <select id="sort-filter" onChange={(e) => setSortMethod(e.target.value)}>
                                    <option>valued</option>
                                    <option>recent</option>
                                    <option>controversial</option>
                                </select>
                            </div>

                        </div>

                        <button className="bg-pink-300 p-1 mt-4" type="submit" >Search</button>

                    </form>
                </div>

                <h1 className="text-pink-700 font-bold mb-2 flex flex-row justify-center">{`${blogs.length === 0 ? "0 blogs found" : ""}`}</h1>
                <div className="blogList grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 col-span-2 gap-4">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="blogItem" onClick={(e) => router.push(`/blogs/${blog.id}`)}>

                            <div className="flex flex-row w-full bg-green-100">
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

                            <div className="flex flex-row">
                                <div className="flex flex-row gap-2 items-center userItem"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/user/${blog.user.username}`);
                                    }}>
                                    <img src={`/avatars/avatar${blog.user.avatar}.png`} alt={`${blog.user.avatar}`} />
                                    <div>{blog.user.username}</div>
                                </div>
                            </div>

                            <div className="flex flex-row gap-2 items-center mt-2">
                                <button
                                    className="bg-pink-600 text-white p-1 rounded-md"
                                    onClick={(e) => { e.stopPropagation(); op(blog.id); }}>
                                    report
                                </button>
                                <div className="p-1 rounded-md text-orange-600">{blog.hide === true ? "hidden" : ""}</div>
                            </div>

                        </div>
                    ))}
                </div>
                <div className="flex flex-row justify-center items-center gap-4 mt-4">
                    <button className="bg-orange-300 p-2 rounded-md"
                        onClick={() => setPage(Math.max(page - 1, 1))}>
                        Prev
                    </button>
                    <div>{page}</div>
                    <button className="bg-orange-300 p-2 rounded-md"
                        onClick={() => setPage(page + 1)}>
                        Next
                    </button>
                </div>
            </div>
            {rm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center">
                    <div className="bg-green p-6 w-full max-w-lg">
                        <h2 className="text-xl font-bold mb-4">report the blog</h2>
                        <textarea
                            className="border w-full mb-2 p-2"
                            placeholder="reason"
                            value={rr}
                            onChange={(e) => sr(e.target.value)}>
                        </textarea>
                        <div className="flex justify-end">
                            <button
                                className="bg-pink text-white px-4 py-2 mr-l"
                                onClick={cl}>
                                cancel
                            </button>
                            <button
                                className="bg-pink text-white px-4 py-2 mr-l"
                                onClick={report}>
                                report
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
