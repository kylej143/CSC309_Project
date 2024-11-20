import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import Navigation from '@/components/Navigation';

export default function Blogs() {

    const [originalTags, setOriginalTags] = useState<{ id: number, tag: string }[]>([]); // original tags
    const [tags, setTags] = useState<{ id: number, tag: string }[]>([]); // tags that are showing
    const [selectedTags, setSelectedTags] = useState<{ id: number, tag: string }[]>([]); // tags that are selected
    const [tagFilter, setTagFilter] = useState("");

    const [titleCreate, setTitleCreate] = useState("");
    const [contentCreate, setContentCreate] = useState("");

    const [newTagField, setNewTagField] = useState("");
    const [newTagID, setNewTagID] = useState(-1);

    const router = useRouter();

    // const [successMessage, setSuccessMessage] = useState("");

    // check if the user is logged in 
    function checkLoggedIn() {
        const loggedIn = localStorage.getItem("accessToken");
        if (!loggedIn) {
            router.push(`/login`);
        }
    }
    // create blog post
    const createBlog = async (ev: React.FormEvent) => {
        ev.preventDefault();
        const loggedIn = localStorage.getItem("accessToken");

        // theoretically should not have to encounter login error, since checkLogggedIn is executed earlier
        if (loggedIn) {
            const stringTags: string[] = selectedTags.map((t) => t.tag);
            const response = await fetch('/api/user/blogs',
                {
                    method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${loggedIn}` },
                    body: JSON.stringify({
                        title: titleCreate,
                        content: contentCreate,
                        tags: stringTags
                    }),
                }
            );

            if (response.ok) {
                alert("successfully saved");
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
            && !(selectedTags.includes(t)))
        );
        setTags(selectedTags.concat(searchResponse));
    };

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

    function addTags(tagArray: { id: number, tag: string }[], newTag: { id: number, tag: string }) {
        tagArray.push(newTag);
        return tagArray;
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
        }
    }

    useEffect(() => {
        checkLoggedIn();
        fetchTags();
    }, []);

    useEffect(() => {
        filterTags();
    }, [tagFilter]);

    return (
        <div>
            <Navigation></Navigation>
            <div className="p-4">
                <h1 className="blogSearchTitle">Create Blog</h1>

                {/* create blog post */}
                <div>
                    <form onSubmit={createBlog}>
                        <div>
                            <label htmlFor="blogTitleCreate">Title:</label>
                            <br></br>
                            <input type="text"
                                id="blogTitleCreate"
                                className="blogSearch w-full"
                                value={titleCreate}
                                onChange={(e) => (setTitleCreate(e.target.value))} />
                        </div>
                        <div>
                            <label htmlFor="blogContentCreate">Content:</label>
                            <br></br>
                            <textarea
                                id="blogContentCreate"
                                className="blogSearch w-full"
                                value={contentCreate}
                                onChange={(e) => (setContentCreate(e.target.value))} />
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
                                            onChange={updateSelectedTags} />
                                        <label htmlFor={getID(t.id)}>{t.tag}</label> <br></br>
                                    </div>
                                ))}
                                <div id="newTagItem" className="tagItem flex flex-row gap-2">
                                    <input type="text" placeholder="new tag (enter to submit)"
                                        value={newTagField}
                                        onKeyDown={addNewTag}
                                        onChange={(e) => (setNewTagField(e.target.value))}>
                                    </input>
                                </div>
                            </div>
                        </div>

                        <button className="bg-pink-300 mt-2" type="submit" >Create Blog</button>
                    </form>
                </div>

            </div>
        </div>

    )
}