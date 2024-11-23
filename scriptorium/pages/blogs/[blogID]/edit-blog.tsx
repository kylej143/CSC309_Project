import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import Navigation from '@/components/Navigation';

export default function EditBlog() {

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

    const [originalTags, setOriginalTags] = useState<{ id: number, tag: string }[]>([]); // original tags
    const [tags, setTags] = useState<{ id: number, tag: string }[]>([]); // tags that are showing
    const [selectedTags, setSelectedTags] = useState<{ id: number, tag: string }[]>([]); // tags that are selected
    const [tagFilter, setTagFilter] = useState("");

    const [titleEdit, setTitleEdit] = useState("");
    const [contentEdit, setContentEdit] = useState("");

    const [newTagField, setNewTagField] = useState("");
    const [newTagID, setNewTagID] = useState(-1);

    const router = useRouter();
    const { blogID } = router.query;
    const numID = Number(blogID);
    const [blog, setBlog] = useState<Blog>(defaultBlog);

    // check if the user is logged in 
    function checkLoggedIn() {
        const loggedIn = localStorage.getItem("accessToken");
        if (!loggedIn) {
            router.push(`/login`);
        }

    }

    const fetchBlog = async () => {
        const data = await fetch(`/api/user/blogs/${numID}`, {
            method: "GET"
        })
            .then((response) => response.json())
            .then((b: Blog) => {
                setBlog(b);
                setTitleEdit(b.title);
                setContentEdit(b.content);
                setSelectedTags(b.tags);
            });
    };

    // edit blog post
    const editBlog = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const loggedIn = localStorage.getItem("accessToken");

        // theoretically should not have to encounter login error, since checkLogggedIn is executed earlier
        if (loggedIn) {
            const stringTags: string[] = selectedTags.map((t) => t.tag);
            const response = await fetch(`/api/user/blogs/${numID}`,
                {
                    method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` },
                    body: JSON.stringify({
                        title: titleEdit,
                        content: contentEdit,
                        tags: stringTags
                    }),
                }
            );

            if (response.ok) {
                alert("successfully updated");
                const data = await response.json();
                router.push(`/blogs/${data.id}`);
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

    const updateSelectedTags = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tagID = Number((e.target.id).replace("tag", ""));
        const tagToModify = tags.filter((t) => t.id == tagID)[0];
        if (e.target.checked) {

            if (!checkTagInArray(selectedTags, tagToModify)) {
                setSelectedTags(addTags(selectedTags, tagToModify));
            }
        }
        else {
            setSelectedTags(removeTags(selectedTags, tagID));
        }
    }

    function addTags(tagArray: { id: number, tag: string }[], newTag: { id: number, tag: string }) {
        return tagArray.concat([newTag]);
    }

    function removeTags(tagArray: { id: number, tag: string }[], removeTagID: number) {
        return tagArray.filter((t) => t.id != removeTagID);
    }

    function getID(id: number) {
        return `tag${id}`;
    }

    // add a new tag to the list of visible tags
    const addNewTag = (e: React.KeyboardEvent<HTMLInputElement>) => {

        if (e.key === 'Enter') {
            e.preventDefault();
            const tagToAdd = {
                id: newTagID,
                tag: newTagField
            }
            setNewTagID(newTagID - 1);
            setNewTagField("");
            setTags(addTags(tags, tagToAdd));
            setSelectedTags(addTags(selectedTags, tagToAdd));
        }
    }

    function checkTagInArray(tagArray: { id: number, tag: string }[], checkTag: { id: number, tag: string }) {
        for (const t of tagArray) {
            if (t.id === checkTag.id && t.tag === checkTag.tag) {
                return true;
            }
        }
        return false;
    }

    useEffect(() => {
        checkLoggedIn();
        if (!blogID) {
            return;
        }
        fetchBlog();
        fetchTags();
    }, [numID]);

    useEffect(() => {
        filterTags();
    }, [tagFilter]);


    return (
        <div>
            <Navigation></Navigation>
            <div className="p-4">
                <h1 className="blogSearchTitle">Edit Blog</h1>

                {/* edit blog post */}
                <div>
                    <form onSubmit={editBlog}>
                        <div>
                            <label htmlFor="blogTitleEdit">Title:</label>
                            <br></br>
                            <input type="text"
                                id="blogTitleEdit"
                                className="blogSearch w-full"
                                value={titleEdit}
                                onChange={(e) => (setTitleEdit(e.target.value))} />
                        </div>
                        <div>
                            <label htmlFor="blogContentCreate">Content:</label>
                            <br></br>
                            <textarea
                                id="blogContentEdit"
                                className="blogSearch w-full"
                                value={contentEdit}
                                onChange={(e) => (setContentEdit(e.target.value))} />
                        </div>

                        <div>Tags:</div>
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
                                            onChange={updateSelectedTags} checked={checkTagInArray(selectedTags, t)} />
                                        <label htmlFor={getID(t.id)}>{t.tag}</label> <br></br>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-row gap-2 mt-2">
                                <div id="newTagItem" className="tagItem">
                                    <input type="text" placeholder="new tag (enter to submit)"
                                        value={newTagField}
                                        onKeyDown={addNewTag}
                                        onChange={(e) => (setNewTagField(e.target.value))}>
                                    </input>
                                </div>

                            </div>
                            {/* <div>
                                {selectedTags.map((t) => (
                                    <div>
                                        <div>{t.id}</div>
                                        <div>{t.tag}</div>
                                    </div>
                                ))}
                            </div> */}
                        </div>

                        <button className="bg-pink-300 mt-2" type="submit" >Edit Blog</button>
                    </form>
                </div>

            </div>
        </div>

    )
}